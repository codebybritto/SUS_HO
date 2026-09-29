import {
  User,
  Unit,
  Procedure,
  Doctor,
  Patient,
  AuditLog,
  SystemSettings,
  Municipality,
  PatientProcedureItem,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'micrologos_users_rj_v7',
  UNITS: 'micrologos_units_rj_v6',
  MUNICIPALITIES: 'micrologos_municipalities_rj_v6',
  PROCEDURES: 'micrologos_procedures_rj_v6',
  DOCTORS: 'micrologos_doctors_rj_v6',
  REAL_PATIENTS: 'micrologos_real_patients_v6',
  REAL_AUDIT_LOGS: 'micrologos_real_audit_logs_v6',
  SETTINGS: 'micrologos_settings_rj_v6',
  CURRENT_USER: 'micrologos_current_user_rj_v6',
  ACTIVE_UNIT: 'micrologos_active_unit_rj_v6',
  CUSTOM_LOGO: 'micrologos_custom_logo_v6',
};

// Limpeza automática de artefatos de demonstração legados do navegador
try {
  localStorage.removeItem('micrologos_is_demo_mode_v6');
  localStorage.removeItem('micrologos_demo_patients_v6');
  localStorage.removeItem('micrologos_demo_audit_logs_v6');
  localStorage.removeItem('micrologos_database_mode_v4');
} catch {}

export const DEFAULT_SETTINGS: SystemSettings = {
  maxContactAttempts: 3,
  autoAguardandoMicrologosOnFailedContacts: true,
  absencesThresholdForAguardandoMicrologos: 2,
  autoAguardandoMicrologosOnAbsences: true,
  allowStatusOverwriteWithoutEvolution: false,
  defaultEyeSideRequired: true,
  colorTheme: 'blue-orange',
};

// Municipalities strictly from Rio de Janeiro (RJ)
export const INITIAL_MUNICIPALITIES: Municipality[] = [
  { id: 'mun-buzios', name: 'Armação dos Búzios', state: 'RJ', active: true },
  { id: 'mun-spa', name: 'São Pedro da Aldeia', state: 'RJ', active: true },
  { id: 'mun-arraial', name: 'Arraial do Cabo', state: 'RJ', active: true },
  { id: 'mun-sjm', name: 'São João de Meriti', state: 'RJ', active: true },
  { id: 'mun-mage', name: 'Magé', state: 'RJ', active: true },
  { id: 'mun-1', name: 'Rio de Janeiro', state: 'RJ', active: true },
  { id: 'mun-2', name: 'Niterói', state: 'RJ', active: true },
  { id: 'mun-3', name: 'São Gonçalo', state: 'RJ', active: true },
  { id: 'mun-4', name: 'Duque de Caxias', state: 'RJ', active: true },
  { id: 'mun-5', name: 'Nova Iguaçu', state: 'RJ', active: true },
  { id: 'mun-6', name: 'Belford Roxo', state: 'RJ', active: true },
  { id: 'mun-11', name: 'Itaboraí', state: 'RJ', active: true },
  { id: 'mun-12', name: 'Cabo Frio', state: 'RJ', active: true },
  { id: 'mun-14', name: 'Maricá', state: 'RJ', active: true },
];

// Healthcare Units in Rio de Janeiro (RJ) - Unidades Reais Oficiais
export const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit-lagos',
    name: 'Unidade Lagos',
    code: 'POLO-LAGOS',
    cnes: '0000001',
    city: 'São Pedro da Aldeia',
    state: 'RJ',
    active: true,
    phone: '(22) 2621-1000',
    address: 'Região dos Lagos - RJ',
    managerName: 'Gerência Regional Lagos',
    municipalities: ['Armação dos Búzios', 'São Pedro da Aldeia', 'Arraial do Cabo'],
  },
  {
    id: 'unit-sjm',
    name: 'Unidade São João de Meriti',
    code: 'POLO-SJM',
    cnes: '0000002',
    city: 'São João de Meriti',
    state: 'RJ',
    active: true,
    phone: '(21) 2756-1000',
    address: 'São João de Meriti - RJ',
    managerName: 'Gerência Regional SJM',
    municipalities: ['São João de Meriti'],
  },
  {
    id: 'unit-mage',
    name: 'Unidade Magé',
    code: 'POLO-MAGE',
    cnes: '0000003',
    city: 'Magé',
    state: 'RJ',
    active: true,
    phone: '(21) 2633-1000',
    address: 'Magé - RJ',
    managerName: 'Gerência Regional Magé',
    municipalities: ['Magé'],
  },
];

export const INITIAL_PROCEDURES: Procedure[] = [
  {
    id: 'proc-1',
    name: 'Facectomia com Implante de LIO (Catarata)',
    codeSigtap: '04.05.05.011-9',
    unitIds: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
    active: true,
    description: 'Cirurgia de catarata com implante de lente intraocular dobrável.',
    requiresEyeSide: true,
  },
  {
    id: 'proc-2',
    name: 'Vitrectomia Posterior Via Pars Plana',
    codeSigtap: '04.05.05.037-2',
    unitIds: ['unit-1', 'unit-2'],
    active: true,
    description: 'Cirurgia vítreo-retiniana para descolamento de retina ou retinopatia diabética.',
    requiresEyeSide: true,
  },
  {
    id: 'proc-3',
    name: 'Injeção Intravítrea de Antiangiogênico (Anti-VEGF)',
    codeSigtap: '03.03.05.022-4',
    unitIds: ['unit-1', 'unit-4'],
    active: true,
    description: 'Aplicação ocular especializada para controle de DMRI e edema macular.',
    requiresEyeSide: true,
  },
  {
    id: 'proc-4',
    name: 'Capsulotomia a YAG Laser',
    codeSigtap: '04.05.05.006-2',
    unitIds: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
    active: true,
    description: 'Procedimento ambulatorial a laser para opacificação de cápsula posterior pós-catarata.',
    requiresEyeSide: true,
  },
  {
    id: 'proc-5',
    name: 'Iridotomia a Laser (Glaucoma de Ângulo Estreito)',
    codeSigtap: '04.05.05.021-6',
    unitIds: ['unit-2', 'unit-3'],
    active: true,
    description: 'Abertura preventiva a laser para alívio de pressão intraocular em glaucoma.',
    requiresEyeSide: true,
  },
  {
    id: 'proc-6',
    name: 'Mapeamento de Retina com Fotocoagulação a Laser',
    codeSigtap: '02.11.06.012-7',
    unitIds: ['unit-1', 'unit-2', 'unit-3'],
    active: true,
    description: 'Tratamento profilático e terapêutico para roturas de retina periféricas.',
    requiresEyeSide: true,
  },
];

// Doctors registered in CRM/RJ
export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1-fabio-de-paula-lopes',
    name: 'Fabio de Paula Lopes',
    crm: '521057812',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-2-stefano-pinto-de-lim',
    name: 'Stefano Pinto de Lima Zvaig',
    crm: '52748480',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-3-vitor-sart-rio-costa',
    name: 'Vitor Sartório Costa',
    crm: '521225634',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-4-erica-magalhaes-dos-',
    name: 'Erica Magalhaes dos Santos',
    crm: '52963623',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-5-renato-pinheiro-hila',
    name: 'Renato Pinheiro Hilario de Souza',
    crm: '52916897',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-6-gustavo-andrade-lope',
    name: 'Gustavo Andrade Lopes',
    crm: '5201070010',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-7-jos--carlos-vieira-r',
    name: 'José Carlos Vieira Romeiro',
    crm: '52236746',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-8-guilherme-vieira-rom',
    name: 'Guilherme Vieira Romeiro',
    crm: '521057553',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-9-vict-ria-vieira-rome',
    name: 'Victória Vieira Romeiro',
    crm: '521138197',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-10-joao-lucas-mota-avel',
    name: 'Joao Lucas Mota Avelino',
    crm: '5201230204',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-11-laura-brito-fiszer-p',
    name: 'Laura Brito Fiszer Poly Ferreira',
    crm: '10010',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-12-kenedy-de-almeida-al',
    name: 'Kenedy de Almeida Alves',
    crm: '521213962',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm', 'unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-13-miri--bertoloto-de-a',
    name: 'Miriã Bertoloto de Andrade',
    crm: '52016845',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm', 'unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-14-marco-aurelio-alves-',
    name: 'Marco Aurelio Alves Ferreira Filho',
    crm: '5201105930',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm', 'unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-15-karen-de-souza-horta',
    name: 'Karen de Souza Horta',
    crm: '521043390',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos', 'unit-sjm', 'unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-16-danielle-de-souza-co',
    name: 'Danielle de Souza Cortez Godfroy',
    crm: '52649830',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-17-fernanda-roessler-se',
    name: 'Fernanda Roessler Sebastiao',
    crm: '52660493',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-18-fernando-gomez-rodri',
    name: 'Fernando Gomez Rodriguez',
    crm: '52926400',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-19-gabriela-fassini-vil',
    name: 'Gabriela Fassini Vilas Boas Chagas',
    crm: '52779270',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-20-renata-monteiro-viei',
    name: 'Renata Monteiro Vieira',
    crm: '52650919',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-21-risla-de-oliveira-go',
    name: 'Risla de Oliveira Gomes',
    crm: '52650943',
    stateCrm: 'RJ',
    unitIds: ['unit-sjm'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-22-laila-denise-oliveir',
    name: 'Laila Denise Oliveira de Andrade Kelm',
    crm: '5201170783',
    stateCrm: 'RJ',
    unitIds: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-23-wilson-vial-filho',
    name: 'Wilson Vial Filho',
    crm: '52957330',
    stateCrm: 'RJ',
    unitIds: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-24-ana-cristina-pinheir',
    name: 'Ana Cristina Pinheiro Leão',
    crm: '521005340',
    stateCrm: 'RJ',
    unitIds: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-25-lais-bogado-hage-cha',
    name: 'Lais Bogado Hage Chahine Olsen',
    crm: '521142135',
    stateCrm: 'RJ',
    unitIds: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-26-paloma-pereira-dutra',
    name: 'Paloma Pereira Dutra de Almeida',
    crm: '521164864',
    stateCrm: 'RJ',
    unitIds: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-27-thayane-azeredo-sil',
    name: 'Thayane Azeredo Silva',
    crm: '521041096',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
  {
    id: 'doc-28-leticia-paola-kolln',
    name: 'Leticia Paola Kolln',
    crm: '5201174509',
    stateCrm: 'RJ',
    unitIds: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: '',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administrador do Sistema',
    login: 'admin',
    role: 'admin',
    active: true,
    unitIds: ['unit-lagos', 'unit-sjm', 'unit-mage'],
    permissions: {
      view_patients: true,
      create_patients: true,
      edit_patients: true,
      delete_patients: true,
      edit_after_creation: true,
      record_evolution: true,
      record_contact_attempt: true,
      change_patient_status: true,
      manage_procedures: true,
      manage_doctors: true,
      manage_municipalities: true,
      view_timeline: true,
      view_logs: true,
      view_reports: true,
      export_reports: true,
      manage_users: true,
      manage_units: true,
      manage_settings: true,
    },
    email: 'admin@gestao.saude.rj.gov.br',
    createdAt: '2026-09-28T13:41:00.000Z',
  },
];

export const DEMO_USER: User = null as any;

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const storageService = {
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUnits(): Unit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNITS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (u: any) => u.active !== false && !['unit-1', 'unit-2', 'unit-3', 'unit-4'].includes(u.id)
          );
          if (filtered.length > 0) return filtered;
        }
      }
      return INITIAL_UNITS;
    } catch {
      return INITIAL_UNITS;
    }
  },

  saveUnits(units: Unit[]): void {
    const cleanUnits = units.filter(
      (u) => u.active !== false && !['unit-1', 'unit-2', 'unit-3', 'unit-4'].includes(u.id)
    );
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(cleanUnits));
  },

  getMunicipalities(): Municipality[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MUNICIPALITIES);
      return data ? JSON.parse(data) : INITIAL_MUNICIPALITIES;
    } catch {
      return INITIAL_MUNICIPALITIES;
    }
  },

  saveMunicipalities(municipalities: Municipality[]): void {
    localStorage.setItem(STORAGE_KEYS.MUNICIPALITIES, JSON.stringify(municipalities));
  },

  getProcedures(): Procedure[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      return data ? JSON.parse(data) : INITIAL_PROCEDURES;
    } catch {
      return INITIAL_PROCEDURES;
    }
  },

  saveProcedures(procedures: Procedure[]): void {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
  },

  getDoctors(): Doctor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // If cached data contains old mock doctors, discard and return INITIAL_DOCTORS
          const hasOldMock = parsed.some((d: any) => ['doc-1', 'doc-2', 'doc-3', 'doc-4'].includes(d.id));
          if (!hasOldMock && parsed.length > 0) {
            return parsed;
          }
        }
      }
      return INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  },

  saveDoctors(doctors: Doctor[]): void {
    const clean = doctors.filter((d) => !['doc-1', 'doc-2', 'doc-3', 'doc-4'].includes(d.id));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(clean));
  },

  getRealPatients(): Patient[] {
    // Dados reais são consultados estritamente do Supabase (Fonte Oficial)
    try {
      localStorage.removeItem(STORAGE_KEYS.REAL_PATIENTS);
    } catch {}
    return [];
  },

  saveRealPatients(_patients: Patient[]): void {
    // Pacientes reais NÃO são gravados no localStorage por conformidade de segurança e privacidade clínica
    try {
      localStorage.removeItem(STORAGE_KEYS.REAL_PATIENTS);
    } catch {}
  },

  getDemoPatients(): Patient[] {
    return [];
  },

  saveDemoPatients(_patients: Patient[]): void {},

  getPatients(): Patient[] {
    return this.getRealPatients();
  },

  getInitialDemoPatients(): Patient[] {
    return [];
  },

  savePatients(patients: Patient[]): void {
    this.saveRealPatients(patients);
  },

  getRealAuditLogs(): AuditLog[] {
    // Logs reais são auditados no servidor via Supabase
    try {
      localStorage.removeItem(STORAGE_KEYS.REAL_AUDIT_LOGS);
    } catch {}
    return [];
  },

  saveRealAuditLogs(_logs: AuditLog[]): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.REAL_AUDIT_LOGS);
    } catch {}
  },

  getDemoAuditLogs(): AuditLog[] {
    return [];
  },

  saveDemoAuditLogs(_logs: AuditLog[]): void {},

  getAuditLogs(): AuditLog[] {
    return this.getRealAuditLogs();
  },

  saveAuditLogs(logs: AuditLog[]): void {
    this.saveRealAuditLogs(logs);
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    if (logs.length > 2000) logs.pop();
    this.saveAuditLogs(logs);
  },

  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const customLogo = localStorage.getItem(STORAGE_KEYS.CUSTOM_LOGO);
      const base = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
      if (customLogo) {
        base.customLogoUrl = customLogo;
      }
      return base;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: SystemSettings): void {
    if (settings.customLogoUrl) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, settings.customLogoUrl);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCustomLogo(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_LOGO);
    } catch {
      return null;
    }
  },

  saveCustomLogo(dataUrl: string): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, dataUrl);
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getActiveUnitId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_UNIT);
    } catch {
      return null;
    }
  },

  setActiveUnitId(unitId: string | null): void {
    if (unitId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_UNIT, unitId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_UNIT);
    }
  },

  resetAllToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.UNITS);
    localStorage.removeItem(STORAGE_KEYS.MUNICIPALITIES);
    localStorage.removeItem(STORAGE_KEYS.PROCEDURES);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.REAL_PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.REAL_AUDIT_LOGS);
    localStorage.removeItem('micrologos_demo_patients_v6');
    localStorage.removeItem('micrologos_demo_audit_logs_v6');
    localStorage.removeItem('micrologos_is_demo_mode_v6');
    localStorage.removeItem('micrologos_database_mode_v4');
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_UNIT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // keep custom logo if uploaded
  },
};
