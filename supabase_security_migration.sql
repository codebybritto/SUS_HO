-- =========================================================================
-- MIGRAÇÃO DE SEGURANÇA ESTRUTURAL E RLS - SUPABASE SQL EDITOR
-- Execute este script no SQL Editor do painel Supabase para ativar:
-- 1. Profiles e vínculo com auth.users
-- 2. Remoção de senha de system_users
-- 3. Fim de USING(true) e ativação de RLS estrito (usuário, perfil, unidade)
-- 4. Bloqueio de DELETE/UPDATE indevidos
-- 5. Trigger de auditoria server-side com identificação por JWT (auth.uid())
-- =========================================================================

-- 1. TABELA DE PROFILES (VINCULADA DIRETAMENTE AO SUPABASE AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'attendant' CHECK (role IN ('admin', 'supervisor', 'regulator', 'attendant', 'viewer')),
    unit_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REMOVER DEPENDÊNCIAS DE SENHA EM VIEWS E NA TABELA SYSTEM_USERS
DROP VIEW IF EXISTS public.usuarios CASCADE;
DROP VIEW IF EXISTS public.users CASCADE;
ALTER TABLE public.system_users DROP COLUMN IF EXISTS password CASCADE;

-- Recriar as views de compatibilidade sem o campo de senha
CREATE OR REPLACE VIEW public.usuarios AS
SELECT id, name, login, role, active, unit_ids, permissions, email, created_at, last_login_at, must_change_password
FROM public.system_users;

CREATE OR REPLACE VIEW public.users AS
SELECT id, name, login, role, active, unit_ids, permissions, email, created_at, last_login_at, must_change_password
FROM public.system_users;

-- 3. ÍNDICES DE PERFORMANCE E SEGURANÇA
CREATE INDEX IF NOT EXISTS idx_profiles_login ON public.profiles(login);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_patients_unit_id ON public.patients(unit_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(current_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 4. FUNÇÕES DE AUTORIZAÇÃO E SEGURANÇA (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND active = true LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_unit_access(target_unit_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND active = true
      AND (
        role = 'admin'
        OR unit_ids ? target_unit_id
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. TRIGGER DE CRIAÇÃO AUTOMÁTICA DE PERFIL QUANDO USUÁRIO É CRIADO NO AUTH
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, login, email, role, unit_ids, permissions, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'login', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendant'),
    COALESCE((NEW.raw_user_meta_data->>'unit_ids')::jsonb, '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb),
    COALESCE((NEW.raw_user_meta_data->>'permissions')::jsonb, '{}'::jsonb),
    COALESCE((NEW.raw_user_meta_data->>'active')::boolean, true)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    unit_ids = EXCLUDED.unit_ids,
    permissions = EXCLUDED.permissions,
    active = EXCLUDED.active,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 6. TRIGGER SERVER-SIDE DE AUDITORIA COM IDENTIFICAÇÃO JWT
CREATE OR REPLACE FUNCTION public.process_patient_audit()
RETURNS TRIGGER AS $$
DECLARE
  acting_uid TEXT;
  acting_name TEXT;
  action_type TEXT;
  desc_text TEXT;
BEGIN
  acting_uid := COALESCE(auth.uid()::text, 'system');
  
  SELECT name INTO acting_name FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF acting_name IS NULL THEN
    acting_name := COALESCE(auth.jwt()->>'email', 'Usuário Autenticado');
  END IF;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      id, timestamp, user_id, user_name, action,
      entity_type, entity_id, entity_label, unit_id, unit_name,
      previous_values, new_values, description, is_automatic
    ) VALUES (
      'audit-' || gen_random_uuid()::text,
      NOW()::text,
      acting_uid,
      acting_name,
      'CADASTRO',
      'patient',
      NEW.id,
      NEW.name,
      NEW.unit_id,
      NEW.unit_name,
      NULL,
      to_jsonb(NEW),
      'Cadastro de paciente registrado via servidor',
      true
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
      action_type := 'ALTERACAO_STATUS';
      desc_text := 'Status alterado de "' || OLD.current_status || '" para "' || NEW.current_status || '"';
    ELSIF (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted AND NEW.is_deleted = true) THEN
      action_type := 'EXCLUSAO';
      desc_text := 'Exclusão lógica de paciente registrada pelo servidor';
    ELSE
      action_type := 'EDICAO';
      desc_text := 'Atualização cadastral de paciente registrada pelo servidor';
    END IF;

    INSERT INTO public.audit_logs (
      id, timestamp, user_id, user_name, action,
      entity_type, entity_id, entity_label, unit_id, unit_name,
      previous_values, new_values, description, is_automatic
    ) VALUES (
      'audit-' || gen_random_uuid()::text,
      NOW()::text,
      acting_uid,
      acting_name,
      action_type,
      'patient',
      NEW.id,
      NEW.name,
      NEW.unit_id,
      NEW.unit_name,
      to_jsonb(OLD),
      to_jsonb(NEW),
      desc_text,
      true
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      id, timestamp, user_id, user_name, action,
      entity_type, entity_id, entity_label, unit_id, unit_name,
      previous_values, new_values, description, is_automatic
    ) VALUES (
      'audit-' || gen_random_uuid()::text,
      NOW()::text,
      acting_uid,
      acting_name,
      'EXCLUSAO_FISICA',
      'patient',
      OLD.id,
      OLD.name,
      OLD.unit_id,
      OLD.unit_name,
      to_jsonb(OLD),
      NULL,
      'Exclusão física permanente no banco de dados',
      true
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_patients ON public.patients;
CREATE TRIGGER trg_audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.process_patient_audit();

-- 7. ATIVAÇÃO DE RLS E REMOÇÃO DE POLÍTICAS ABERTAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas USING (true) antigas
DROP POLICY IF EXISTS "Public access on municipalities" ON public.municipalities;
DROP POLICY IF EXISTS "Public access on units" ON public.units;
DROP POLICY IF EXISTS "Public access on procedures" ON public.procedures;
DROP POLICY IF EXISTS "Public access on doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public access on system_users" ON public.system_users;
DROP POLICY IF EXISTS "Public access on patients" ON public.patients;
DROP POLICY IF EXISTS "Public access on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public access on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public access on profiles" ON public.profiles;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;

DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update_block" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete_block" ON public.audit_logs;

-- 8. POLÍTICAS RLS ESPECÍFICAS
-- Profiles: Usuário lê o seu; Admin lê e gerencia todos
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin() OR id = auth.uid()) WITH CHECK (public.is_admin() OR (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- Patients: Autorização por unidade e perfil; Deleção física exclusiva de Admin
CREATE POLICY "patients_select_policy" ON public.patients FOR SELECT TO authenticated USING (public.has_unit_access(unit_id) AND (is_deleted = false OR public.is_admin()));
CREATE POLICY "patients_insert_policy" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.has_unit_access(unit_id) AND public.get_user_role() IN ('admin', 'supervisor', 'regulator', 'attendant'));
CREATE POLICY "patients_update_policy" ON public.patients FOR UPDATE TO authenticated USING (public.has_unit_access(unit_id) AND public.get_user_role() IN ('admin', 'supervisor', 'regulator', 'attendant')) WITH CHECK (public.has_unit_access(unit_id));
CREATE POLICY "patients_delete_policy" ON public.patients FOR DELETE TO authenticated USING (public.is_admin());

-- Audit Logs: Somente leitura (Admin geral ou unidades do usuário); Inserção por autenticado/trigger; ALTERAÇÃO E EXCLUSÃO BLOQUEADAS
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin() OR (unit_id IS NOT NULL AND public.has_unit_access(unit_id)));
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_logs_update_block" ON public.audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_logs_delete_block" ON public.audit_logs FOR DELETE TO authenticated USING (false);

-- System Settings
CREATE POLICY "settings_select_policy" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_modify_admin_only" ON public.system_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Auxiliares (Units, Procedures, Doctors, Municipalities)
CREATE POLICY "units_select_policy" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "units_write_policy" ON public.units FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "procedures_select_policy" ON public.procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "procedures_write_policy" ON public.procedures FOR ALL TO authenticated USING (public.is_admin() OR public.get_user_role() = 'supervisor') WITH CHECK (public.is_admin() OR public.get_user_role() = 'supervisor');

CREATE POLICY "doctors_select_policy" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctors_write_policy" ON public.doctors FOR ALL TO authenticated USING (public.is_admin() OR public.get_user_role() = 'supervisor') WITH CHECK (public.is_admin() OR public.get_user_role() = 'supervisor');

CREATE POLICY "municipalities_select_policy" ON public.municipalities FOR SELECT TO authenticated USING (true);
CREATE POLICY "municipalities_write_policy" ON public.municipalities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. VINCULAÇÃO IMEDIATA DO ADMIN IGOR.BRITTO EM PROFILES
DO $$
DECLARE
  admin_auth_id UUID;
BEGIN
  SELECT id INTO admin_auth_id FROM auth.users WHERE email = 'igor.britto@gestao.saude.rj.gov.br' LIMIT 1;
  IF admin_auth_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, login, email, role, unit_ids, permissions, active)
    VALUES (
      admin_auth_id,
      'Igor Britto',
      'igor.britto',
      'igor.britto@gestao.saude.rj.gov.br',
      'admin',
      '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb,
      '{"view_patients": true, "create_patients": true, "edit_patients": true, "delete_patients": true, "edit_after_creation": true, "record_evolution": true, "record_contact_attempt": true, "change_patient_status": true, "manage_procedures": true, "manage_doctors": true, "manage_municipalities": true, "view_timeline": true, "view_logs": true, "view_reports": true, "export_reports": true, "manage_users": true, "manage_units": true, "manage_settings": true}'::jsonb,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      active = true,
      unit_ids = '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb;
  END IF;
END $$;
