-- =========================================================================
-- ESQUEMA COMPLETO DE SEGURANÇA ESTRUTURAL E RLS DO SUPABASE (POSTGRESQL)
-- SISTEMA DE GESTÃO E CONTROLE DE PACIENTES - REGULAÇÃO AMBULATORIAL RJ
-- =========================================================================

-- 1. TABELA DE MUNICÍPIOS (RJ)
CREATE TABLE IF NOT EXISTS public.municipalities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'RJ',
    active BOOLEAN NOT NULL DEFAULT true
);

-- 2. TABELA DE UNIDADES DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    cnes TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'RJ',
    active BOOLEAN NOT NULL DEFAULT true,
    phone TEXT,
    address TEXT,
    manager_name TEXT,
    municipalities JSONB DEFAULT '[]'::jsonb
);

-- 3. TABELA DE PROCEDIMENTOS
CREATE TABLE IF NOT EXISTS public.procedures (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code_sigtap TEXT,
    unit_ids JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    requires_eye_side BOOLEAN DEFAULT true
);

-- 4. TABELA DE MÉDICOS
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    crm TEXT NOT NULL,
    state_crm TEXT NOT NULL DEFAULT 'RJ',
    unit_ids JSONB DEFAULT '[]'::jsonb,
    specialty TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    phone TEXT
);

-- 5. TABELA DE PROFILES (VINCULADA DIRETAMENTE AO SUPABASE AUTH)
-- Substitui armazenamento de senhas próprias. Senhas ficam protegidas em auth.users (bcrypt).
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

-- 5.1 COMPATIBILIDADE SYSTEM_USERS (SEM SENHA)
CREATE TABLE IF NOT EXISTS public.system_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'attendant',
    active BOOLEAN NOT NULL DEFAULT true,
    unit_ids JSONB DEFAULT '[]'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT NOW()::text,
    last_login_at TEXT,
    must_change_password BOOLEAN NOT NULL DEFAULT false
);
-- Remove password column se ainda existir e dependências em views
DROP VIEW IF EXISTS public.usuarios CASCADE;
DROP VIEW IF EXISTS public.users CASCADE;
ALTER TABLE public.system_users DROP COLUMN IF EXISTS password CASCADE;

-- Recria views de compatibilidade sem o campo de senha
CREATE OR REPLACE VIEW public.usuarios AS
SELECT id, name, login, role, active, unit_ids, permissions, email, created_at, last_login_at, must_change_password
FROM public.system_users;

CREATE OR REPLACE VIEW public.users AS
SELECT id, name, login, role, active, unit_ids, permissions, email, created_at, last_login_at, must_change_password
FROM public.system_users;

-- 6. TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    procedures JSONB DEFAULT '[]'::jsonb,
    requested_procedure_id TEXT,
    requested_procedure_name TEXT,
    eye_side TEXT DEFAULT 'AO',
    requested_date TEXT NOT NULL,
    requesting_doctor_id TEXT,
    requesting_doctor_name TEXT,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_simulation BOOLEAN NOT NULL DEFAULT false,
    city TEXT NOT NULL,
    has_followup BOOLEAN NOT NULL DEFAULT false,
    followup_date TEXT,
    notes TEXT,
    unit_id TEXT NOT NULL,
    unit_name TEXT,
    current_status TEXT NOT NULL DEFAULT 'Aguardando Contato',
    previous_status TEXT,
    total_absences INTEGER NOT NULL DEFAULT 0,
    absences JSONB DEFAULT '[]'::jsonb,
    contact_attempts JSONB DEFAULT '[]'::jsonb,
    evolutions JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TEXT,
    deleted_by TEXT,
    deletion_reason TEXT,
    created_at TEXT NOT NULL DEFAULT NOW()::text,
    created_by_user_id TEXT,
    created_by_user_name TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::text,
    updated_by_user_id TEXT,
    updated_by_user_name TEXT
);

-- 7. TABELA DE LOGS DE AUDITORIA (SERVER-SIDE & CLIENT-SIDE)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL DEFAULT NOW()::text,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_label TEXT,
    unit_id TEXT,
    unit_name TEXT,
    previous_values JSONB,
    new_values JSONB,
    description TEXT NOT NULL,
    is_automatic BOOLEAN NOT NULL DEFAULT false
);

-- 8. TABELA DE CONFIGURAÇÕES GERAIS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL
);

-- =========================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_login ON public.profiles(login);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_patients_unit_id ON public.patients(unit_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(current_status);
CREATE INDEX IF NOT EXISTS idx_patients_city ON public.patients(city);
CREATE INDEX IF NOT EXISTS idx_patients_is_deleted ON public.patients(is_deleted);
CREATE INDEX IF NOT EXISTS idx_patients_is_simulation ON public.patients(is_simulation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_unit_id ON public.audit_logs(unit_id);

-- =========================================================================
-- FUNÇÕES DE AUTORIZAÇÃO E SEGURANÇA (SECURITY DEFINER)
-- =========================================================================

-- Retorna true se o usuário autenticado for Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Retorna o perfil/role do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND active = true LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Retorna true se o usuário tiver acesso à unidade especificada (ou for admin)
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

-- =========================================================================
-- TRIGGER DE SINCRONIZAÇÃO AUTOMÁTICA AUTH.USERS -> PROFILES
-- =========================================================================
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

-- =========================================================================
-- TRIGGER SERVER-SIDE DE AUDITORIA EM TEMPO REAL (PATIENTS)
-- Registra alterações críticas e dados identificados pelo JWT (auth.uid())
-- =========================================================================
CREATE OR REPLACE FUNCTION public.process_patient_audit()
RETURNS TRIGGER AS $$
DECLARE
  acting_uid TEXT;
  acting_name TEXT;
  acting_unit TEXT;
  acting_unit_name TEXT;
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
      'Cadastro de paciente realizado via servidor',
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

-- =========================================================================
-- CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS) RIGOROSA
-- REMOVE POLÍTICAS ANTIGAS ABERTAS E APLICA AUTORIZAÇÃO POR USUÁRIO, PERFIL E UNIDADE
-- =========================================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- 1. LIMPEZA TOTAL DE POLÍTICAS INSEGURAS ANTERIORES (USING true / WITH CHECK true)
DROP POLICY IF EXISTS "Public access on municipalities" ON public.municipalities;
DROP POLICY IF EXISTS "Public access on units" ON public.units;
DROP POLICY IF EXISTS "Public access on procedures" ON public.procedures;
DROP POLICY IF EXISTS "Public access on doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public access on system_users" ON public.system_users;
DROP POLICY IF EXISTS "Public access on patients" ON public.patients;
DROP POLICY IF EXISTS "Public access on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public access on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public access on profiles" ON public.profiles;

-- Limpa possíveis políticas anteriores
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

-- 2. POLÍTICAS DE PROFILES
-- Usuário lê seu próprio perfil; Admin lê todos
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

-- Somente Admin pode criar perfis diretamente
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin altera qualquer perfil; Usuário altera apenas seu próprio nome (sem alterar role ou permissions)
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin() OR id = auth.uid())
WITH CHECK (
  public.is_admin() OR (
    id = auth.uid() 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND permissions = (SELECT permissions FROM public.profiles WHERE id = auth.uid())
    AND unit_ids = (SELECT unit_ids FROM public.profiles WHERE id = auth.uid())
  )
);

-- Somente Admin pode deletar perfis
CREATE POLICY "profiles_delete_policy"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- 3. POLÍTICAS DE PACIENTES (PATIENTS)
-- Leitura restrita à unidade do usuário e bloqueia visualização de deletados para não-admin
CREATE POLICY "patients_select_policy"
ON public.patients FOR SELECT
TO authenticated
USING (
  public.has_unit_access(unit_id)
  AND (is_deleted = false OR public.is_admin())
);

-- Criação restrita à unidade autorizada e perfis operacionais
CREATE POLICY "patients_insert_policy"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (
  public.has_unit_access(unit_id)
  AND public.get_user_role() IN ('admin', 'supervisor', 'regulator', 'attendant')
);

-- Atualização restrita à unidade autorizada e perfis autorizados (bloqueia viewers)
CREATE POLICY "patients_update_policy"
ON public.patients FOR UPDATE
TO authenticated
USING (
  public.has_unit_access(unit_id)
  AND public.get_user_role() IN ('admin', 'supervisor', 'regulator', 'attendant')
)
WITH CHECK (
  public.has_unit_access(unit_id)
);

-- Exclusão física: EXCLUSIVA de Administrador (bloqueia atendentes, supervisores e reguladores)
CREATE POLICY "patients_delete_policy"
ON public.patients FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- 4. POLÍTICAS DE AUDITORIA (AUDIT_LOGS)
-- Leitura: Admin lê tudo; Supervisor/Regulador lê apenas suas unidades
CREATE POLICY "audit_logs_select_policy"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  public.is_admin() 
  OR (unit_id IS NOT NULL AND public.has_unit_access(unit_id))
);

-- Inserção: Permitida para usuários autenticados e triggers
CREATE POLICY "audit_logs_insert_policy"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Alteração: ESTRITAMENTE BLOQUEADA (Integridade e Imutabilidade dos Logs de Auditoria)
CREATE POLICY "audit_logs_update_block"
ON public.audit_logs FOR UPDATE
TO authenticated
USING (false);

-- Exclusão: ESTRITAMENTE BLOQUEADA
CREATE POLICY "audit_logs_delete_block"
ON public.audit_logs FOR DELETE
TO authenticated
USING (false);

-- 5. POLÍTICAS DE CONFIGURAÇÕES (SYSTEM_SETTINGS)
CREATE POLICY "settings_select_policy"
ON public.system_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "settings_modify_admin_only"
ON public.system_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. POLÍTICAS DE CADASTROS AUXILIARES (UNITS, PROCEDURES, DOCTORS, MUNICIPALITIES)
CREATE POLICY "units_select_policy" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "units_write_policy" ON public.units FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "procedures_select_policy" ON public.procedures FOR SELECT TO authenticated USING (true);
CREATE POLICY "procedures_write_policy" ON public.procedures FOR ALL TO authenticated USING (public.is_admin() OR public.get_user_role() = 'supervisor') WITH CHECK (public.is_admin() OR public.get_user_role() = 'supervisor');

CREATE POLICY "doctors_select_policy" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctors_write_policy" ON public.doctors FOR ALL TO authenticated USING (public.is_admin() OR public.get_user_role() = 'supervisor') WITH CHECK (public.is_admin() OR public.get_user_role() = 'supervisor');

CREATE POLICY "municipalities_select_policy" ON public.municipalities FOR SELECT TO authenticated USING (true);
CREATE POLICY "municipalities_write_policy" ON public.municipalities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- SINCRONIZAÇÃO INICIAL DO USUÁRIO ADMIN IGOR.BRITTO EM PROFILES
-- =========================================================================
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
