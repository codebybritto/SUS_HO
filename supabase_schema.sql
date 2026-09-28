-- =========================================================================
-- ESQUEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL)
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

-- 5. TABELA DE USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS public.system_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'attendant',
    active BOOLEAN NOT NULL DEFAULT true,
    unit_ids JSONB DEFAULT '[]'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT NOW()::text,
    last_login_at TEXT,
    must_change_password BOOLEAN NOT NULL DEFAULT false
);

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

-- 7. TABELA DE LOGS DE AUDITORIA
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
CREATE INDEX IF NOT EXISTS idx_patients_unit_id ON public.patients(unit_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(current_status);
CREATE INDEX IF NOT EXISTS idx_patients_city ON public.patients(city);
CREATE INDEX IF NOT EXISTS idx_patients_is_deleted ON public.patients(is_deleted);
CREATE INDEX IF NOT EXISTS idx_patients_is_simulation ON public.patients(is_simulation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =========================================================================
-- CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Permite leitura e gravação da aplicação web com a chave pública anon
-- =========================================================================
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (anon key)
DROP POLICY IF EXISTS "Public access on municipalities" ON public.municipalities;
CREATE POLICY "Public access on municipalities" ON public.municipalities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on units" ON public.units;
CREATE POLICY "Public access on units" ON public.units FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on procedures" ON public.procedures;
CREATE POLICY "Public access on procedures" ON public.procedures FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on doctors" ON public.doctors;
CREATE POLICY "Public access on doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on system_users" ON public.system_users;
CREATE POLICY "Public access on system_users" ON public.system_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on patients" ON public.patients;
CREATE POLICY "Public access on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on audit_logs" ON public.audit_logs;
CREATE POLICY "Public access on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on system_settings" ON public.system_settings;
CREATE POLICY "Public access on system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- CARGA INICIAL DE DADOS PADRÃO (ESTADO DO RIO DE JANEIRO)
-- =========================================================================

-- Municípios
INSERT INTO public.municipalities (id, name, state, active) VALUES
('mun-1', 'Rio de Janeiro', 'RJ', true),
('mun-2', 'Niterói', 'RJ', true),
('mun-3', 'São Gonçalo', 'RJ', true),
('mun-4', 'Duque de Caxias', 'RJ', true),
('mun-5', 'Nova Iguaçu', 'RJ', true),
('mun-6', 'Belford Roxo', 'RJ', true),
('mun-7', 'São João de Meriti', 'RJ', true),
('mun-8', 'Petrópolis', 'RJ', true),
('mun-9', 'Volta Redonda', 'RJ', true),
('mun-10', 'Magé', 'RJ', true),
('mun-11', 'Itaboraí', 'RJ', true),
('mun-12', 'Cabo Frio', 'RJ', true),
('mun-13', 'Angra dos Reis', 'RJ', true),
('mun-14', 'Maricá', 'RJ', true),
('mun-15', 'Campos dos Goytacazes', 'RJ', true)
ON CONFLICT (id) DO NOTHING;

-- Unidades de Atendimento (RJ)
INSERT INTO public.units (id, name, code, cnes, city, state, active, phone, address, manager_name, municipalities) VALUES
('unit-1', 'Hospital Municipal Souza Aguiar — CEO Oftalmologia', 'HMSA-CENTRO', '2269772', 'Rio de Janeiro', 'RJ', true, '(21) 3111-2600', 'Praça da República, 111 - Centro', 'Dr. Renato Silveira', '["Rio de Janeiro", "Duque de Caxias", "São João de Meriti", "Belford Roxo"]'::jsonb),
('unit-2', 'Hospital Estadual Alberto Torres — Polo Oftalmo', 'HEAT-SG', '2270609', 'São Gonçalo', 'RJ', true, '(21) 2701-8500', 'Rua Osvaldo Cruz, s/n - Colubandê', 'Enfª. Laura Pires', '["São Gonçalo", "Itaboraí", "Magé", "Maricá"]'::jsonb),
('unit-3', 'Policlínica Regional Dr. Sérgio Arouca', 'PRSA-NIT', '2273458', 'Niterói', 'RJ', true, '(21) 2711-3040', 'Av. Ary Parreiras, 105 - Vital Brazil', 'Mariana Costa', '["Niterói", "São Gonçalo", "Maricá"]'::jsonb),
('unit-4', 'Hospital Municipal Lourenço Jorge — CEO Oftalmo', 'HMLJ-BARRA', '2296249', 'Rio de Janeiro', 'RJ', true, '(21) 3111-4600', 'Av. Ayrton Senna, 2000 - Barra da Tijuca', 'Dr. Marcelo Fonseca', '["Rio de Janeiro", "Nova Iguaçu", "Belford Roxo"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Procedimentos Oftalmológicos
INSERT INTO public.procedures (id, name, code_sigtap, unit_ids, active, description, requires_eye_side) VALUES
('proc-1', 'Facoemulsificação c/ Implante de LIO Dobrável', '04.05.05.011-9', '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb, true, 'Cirurgia moderna de catarata ambulatorial', true),
('proc-2', 'Injeção Intravítrea de Antiangiogênico (Anti-VEGF)', '03.03.05.007-8', '["unit-1", "unit-2", "unit-4"]'::jsonb, true, 'Tratamento de retinopatia e DMRI', true),
('proc-3', 'Capsulotomia a YAG Laser', '04.05.05.008-9', '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb, true, 'Limpeza pós-catarata (opacidade capsular)', true),
('proc-4', 'Iridotomia a Laser', '04.05.05.014-3', '["unit-1", "unit-2", "unit-3"]'::jsonb, true, 'Prevenção e tratamento de glaucoma de ângulo fechado', true),
('proc-5', 'Vitrectomia Posterior Via Pars Plana', '04.05.05.037-2', '["unit-1", "unit-2", "unit-4"]'::jsonb, true, 'Cirurgia vítreo-retiniana de alta complexidade', true),
('proc-6', 'Panfotocoagulação Retiniana a Laser', '04.05.05.023-2', '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb, true, 'Tratamento profilático a laser em retina diabética', true),
('proc-7', 'Mapeamento de Retina Especializado', '02.11.06.012-7', '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb, true, 'Exame de fundo de olho sob midríase completa', true),
('proc-8', 'Tomografia de Coerência Óptica (OCT)', '02.11.06.026-7', '["unit-1", "unit-2", "unit-4"]'::jsonb, true, 'Varredura tomográfica retiniana e de nervo óptico', true)
ON CONFLICT (id) DO NOTHING;

-- Médicos
INSERT INTO public.doctors (id, name, crm, state_crm, unit_ids, specialty, active, phone) VALUES
('doc-1', 'Dr. Renato Silveira', '52.78451-2', 'RJ', '["unit-1", "unit-4"]'::jsonb, 'Catarata e Segmento Anterior', true, '(21) 98765-4321'),
('doc-2', 'Dra. Vanessa Guimarães', '52.83419-5', 'RJ', '["unit-1", "unit-2"]'::jsonb, 'Retina Clínica e Cirúrgica', true, '(21) 98888-1234'),
('doc-3', 'Dr. Marcos Paulo Alcantara', '52.65120-1', 'RJ', '["unit-2", "unit-3"]'::jsonb, 'Glaucoma e Laser', true, '(21) 99123-4567'),
('doc-4', 'Dra. Helena Bittencourt', '52.92301-8', 'RJ', '["unit-1", "unit-3"]'::jsonb, 'Córnea e Doenças Externas', true, '(21) 97654-3210')
ON CONFLICT (id) DO NOTHING;

-- Usuários Padrão do Sistema
INSERT INTO public.system_users (id, name, login, password, role, active, unit_ids, permissions, email, created_at) VALUES
('user-admin', 'Dr. Renato Silveira (Coordenação Geral RJ)', 'admin', '123', 'admin', true, '["unit-1", "unit-2", "unit-3", "unit-4"]'::jsonb, '{"view_patients": true, "create_patients": true, "edit_patients": true, "delete_patients": true, "edit_after_creation": true, "record_evolution": true, "record_contact_attempt": true, "change_patient_status": true, "manage_procedures": true, "manage_doctors": true, "manage_municipalities": true, "view_timeline": true, "view_logs": true, "view_reports": true, "export_reports": true, "manage_users": true, "manage_units": true, "manage_settings": true}'::jsonb, 'admin@gestao.saude.rj.gov.br', NOW()::text),
('user-attendant-1', 'Patrícia Lemos (Atendente Regulação RJ)', 'patricia', '123', 'attendant', true, '["unit-1", "unit-4"]'::jsonb, '{"view_patients": true, "create_patients": true, "edit_patients": true, "delete_patients": false, "edit_after_creation": true, "record_evolution": true, "record_contact_attempt": true, "change_patient_status": true, "manage_procedures": false, "manage_doctors": false, "manage_municipalities": false, "view_timeline": true, "view_logs": false, "view_reports": true, "export_reports": true, "manage_users": false, "manage_units": false, "manage_settings": false}'::jsonb, 'patricia.lemos@gestao.saude.rj.gov.br', NOW()::text),
('user-attendant-2', 'Carlos Eduardo (Atendente Polo São Gonçalo)', 'carlos', '123', 'attendant', true, '["unit-2"]'::jsonb, '{"view_patients": true, "create_patients": true, "edit_patients": true, "delete_patients": false, "edit_after_creation": false, "record_evolution": true, "record_contact_attempt": true, "change_patient_status": true, "manage_procedures": false, "manage_doctors": false, "manage_municipalities": false, "view_timeline": true, "view_logs": false, "view_reports": true, "export_reports": true, "manage_users": false, "manage_units": false, "manage_settings": false}'::jsonb, 'carlos.eduardo@gestao.saude.rj.gov.br', NOW()::text)
ON CONFLICT (id) DO NOTHING;

-- Configurações Globais
INSERT INTO public.system_settings (id, settings) VALUES
('global', '{"maxContactAttempts": 3, "autoAguardandoMicrologosOnFailedContacts": true, "absencesThresholdForAguardandoMicrologos": 2, "autoAguardandoMicrologosOnAbsences": true, "allowStatusOverwriteWithoutEvolution": false, "defaultEyeSideRequired": true, "colorTheme": "blue-orange"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
