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
  DEMO_PATIENTS: 'micrologos_demo_patients_v6',
  REAL_AUDIT_LOGS: 'micrologos_real_audit_logs_v6',
  DEMO_AUDIT_LOGS: 'micrologos_demo_audit_logs_v6',
  SETTINGS: 'micrologos_settings_rj_v6',
  CURRENT_USER: 'micrologos_current_user_rj_v6',
  ACTIVE_UNIT: 'micrologos_active_unit_rj_v6',
  CUSTOM_LOGO: 'micrologos_custom_logo_v6',
};

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

export const DEMO_USER: User = {
  id: 'user-demo',
  name: 'Operador de Demonstração (Simulado)',
  login: 'demo',
  role: 'supervisor',
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
    manage_procedures: false,
    manage_doctors: false,
    manage_municipalities: false,
    view_timeline: true,
    view_logs: true,
    view_reports: true,
    export_reports: true,
    manage_users: false,
    manage_units: false,
    manage_settings: false,
  },
  email: 'demonstracao@gestao.saude.rj.gov.br',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Realistic Patient cases in Rio de Janeiro (RJ)
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Maria do Carmo Santos',
    birthDate: '1958-04-12',
    procedures: [
      {
        id: 'pitem-1',
        procedureId: 'proc-1',
        procedureName: 'Facectomia com Implante de LIO (Catarata)',
        codeSigtap: '04.05.05.011-9',
        eyeSide: 'AO',
        dateRequested: '2026-09-02',
      },
    ],
    requestedProcedureId: 'proc-1',
    requestedProcedureName: 'Facectomia com Implante de LIO (Catarata)',
    requestedDate: '2026-09-02',
    requestingDoctorId: 'doc-1',
    requestingDoctorName: 'Dr. Marcelo Albuquerque',
    eyeSide: 'AO',
    isUrgent: false,
    city: 'Rio de Janeiro',
    hasFollowup: true,
    followupDate: '2026-10-15',
    notes: 'Encaminhamento via CMS Tijuca. Redução acentuada de acuidade visual em ambos os olhos.',
    unitId: 'unit-1',
    unitName: 'Hospital Municipal Souza Aguiar — CEO Oftalmologia',
    currentStatus: 'Agendado',
    previousStatus: 'Regulado',
    totalAbsences: 0,
    absences: [],
    contactAttempts: [
      {
        id: 'c-101',
        attemptNumber: 1,
        date: '2026-09-10',
        time: '14:20',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        channel: 'Telefone',
        result: 'Contato com Sucesso - Agendamento Confirmado',
        isSuccessful: true,
        notes: 'Contato direto com a paciente. Confirmou comparecimento no Souza Aguiar no dia 15/10/2026 às 07:30.',
        createdAt: '2026-09-10T14:20:00.000Z',
      },
    ],
    evolutions: [
      {
        id: 'evo-101',
        date: '2026-09-05',
        time: '10:00',
        userId: 'user-admin',
        userName: 'Dr. Renato Silveira',
        situation: 'Regulado',
        notes: 'Laudo médico aprovado pela equipe de regulação da capital. Autorizada cirurgia de catarata bilateral.',
        createdAt: '2026-09-05T10:00:00.000Z',
      },
      {
        id: 'evo-102',
        date: '2026-09-10',
        time: '14:25',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        situation: 'Agendado',
        notes: 'Agendamento cirúrgico confirmado no Bloco Oftalmo Souza Aguiar.',
        complementaryInfo: {
          scheduledDate: '2026-10-15',
          scheduledLocation: 'Bloco Cirúrgico 2 - HMSA',
        },
        createdAt: '2026-09-10T14:25:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'tl-101',
        date: '2026-09-02',
        time: '09:15',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Paciente inserida no sistema com encaminhamento para catarata bilateral.',
        createdAt: '2026-09-02T09:15:00.000Z',
      },
      {
        id: 'tl-102',
        date: '2026-09-05',
        time: '10:00',
        userId: 'user-admin',
        userName: 'Dr. Renato Silveira',
        action: 'Evolução Clínica / Regulação',
        eventType: 'status_change',
        previousStatus: 'Aguardando Contato',
        newStatus: 'Regulado',
        description: 'Status alterado para Regulado após validação técnica.',
        createdAt: '2026-09-05T10:00:00.000Z',
      },
      {
        id: 'tl-103',
        date: '2026-09-10',
        time: '14:20',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        action: 'Tentativa de Contato 1',
        eventType: 'contact_attempt',
        description: 'Contato com Sucesso - Agendamento Confirmado via Telefone.',
        createdAt: '2026-09-10T14:20:00.000Z',
      },
      {
        id: 'tl-104',
        date: '2026-09-10',
        time: '14:25',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        action: 'Alteração de Status',
        eventType: 'status_change',
        previousStatus: 'Regulado',
        newStatus: 'Agendado',
        description: 'Agendamento confirmado para 15/10/2026.',
        createdAt: '2026-09-10T14:25:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-09-02T09:15:00.000Z',
    createdByUserId: 'user-attendant-1',
    createdByUserName: 'Patrícia Lemos',
    updatedAt: '2026-09-10T14:25:00.000Z',
    updatedByUserId: 'user-attendant-1',
    updatedByUserName: 'Patrícia Lemos',
  },
  {
    id: 'pat-2',
    name: 'José Benedito de Oliveira',
    birthDate: '1965-11-20',
    procedures: [
      {
        id: 'pitem-2a',
        procedureId: 'proc-2',
        procedureName: 'Vitrectomia Posterior Via Pars Plana',
        codeSigtap: '04.05.05.037-2',
        eyeSide: 'OD',
        dateRequested: '2026-08-15',
      },
      {
        id: 'pitem-2b',
        procedureId: 'proc-6',
        procedureName: 'Mapeamento de Retina com Fotocoagulação a Laser',
        codeSigtap: '02.11.06.012-7',
        eyeSide: 'OD',
        dateRequested: '2026-08-15',
      },
    ],
    requestedProcedureId: 'proc-2',
    requestedProcedureName: 'Vitrectomia Posterior Via Pars Plana, Mapeamento de Retina com Fotocoagulação a Laser',
    requestedDate: '2026-08-15',
    requestingDoctorId: 'doc-2',
    requestingDoctorName: 'Dra. Camila Mendonça',
    eyeSide: 'OD',
    isUrgent: true,
    city: 'São Gonçalo',
    hasFollowup: false,
    notes: 'Descolamento tracional de retina com hemovítreo. Paciente diabético encaminhado pela UPA Alcântara.',
    unitId: 'unit-2',
    unitName: 'Hospital Estadual Alberto Torres — Polo Oftalmo',
    currentStatus: 'Aguardando Micrologos',
    previousStatus: 'Regulado',
    totalAbsences: 2,
    absences: [
      {
        id: 'abs-201',
        absenceNumber: 1,
        date: '2026-08-28',
        scheduledDate: '2026-08-28',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        reason: 'Não compareceu ao HEAT e não atendeu ligação.',
        createdAt: '2026-08-28T17:00:00.000Z',
      },
      {
        id: 'abs-202',
        absenceNumber: 2,
        date: '2026-09-18',
        scheduledDate: '2026-09-18',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        reason: 'Segunda ausência consecutiva registrada. Acionado gatilho automático.',
        createdAt: '2026-09-18T16:45:00.000Z',
      },
    ],
    contactAttempts: [
      {
        id: 'c-201',
        attemptNumber: 1,
        date: '2026-08-20',
        time: '10:15',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        channel: 'Telefone',
        result: 'Contato com Sucesso - Agendamento Confirmado',
        isSuccessful: true,
        notes: 'Agendado para 28/08.',
        createdAt: '2026-08-20T10:15:00.000Z',
      },
      {
        id: 'c-202',
        attemptNumber: 2,
        date: '2026-09-01',
        time: '11:00',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        channel: 'WhatsApp',
        result: 'Contato com Sucesso - Agendamento Confirmado',
        isSuccessful: true,
        notes: 'Reagendado para 18/09.',
        createdAt: '2026-09-01T11:00:00.000Z',
      },
    ],
    evolutions: [
      {
        id: 'evo-201',
        date: '2026-09-18',
        time: '16:45',
        userId: 'system',
        userName: 'Regra Automática',
        situation: 'Aguardando Micrologos',
        notes: 'Paciente atingiu o limite de 2 faltas consecutivas sem justificativa. Condição alterada automaticamente para Aguardando Micrologos.',
        createdAt: '2026-09-18T16:45:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'tl-201',
        date: '2026-08-15',
        time: '08:40',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Inserção com caráter urgente de Vitrectomia em OD.',
        createdAt: '2026-08-15T08:40:00.000Z',
      },
      {
        id: 'tl-202',
        date: '2026-08-28',
        time: '17:00',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        action: 'Registro de 1ª Falta',
        eventType: 'absence',
        description: 'Paciente não compareceu no agendamento do dia 28/08/2026.',
        createdAt: '2026-08-28T17:00:00.000Z',
      },
      {
        id: 'tl-203',
        date: '2026-09-18',
        time: '16:45',
        userId: 'user-attendant-2',
        userName: 'Carlos Eduardo',
        action: 'Registro de 2ª Falta',
        eventType: 'absence',
        description: 'Paciente registrou sua 2ª falta no sistema.',
        createdAt: '2026-09-18T16:45:00.000Z',
      },
      {
        id: 'tl-204',
        date: '2026-09-18',
        time: '16:45',
        userId: 'system',
        userName: 'Regra Automática',
        action: 'Transição Automática de Status',
        eventType: 'automatic_rule',
        previousStatus: 'Agendado',
        newStatus: 'Aguardando Micrologos',
        description: 'Condição alterada para Aguardando Micrologos por atingir limite de 2 faltas.',
        isAutomatic: true,
        createdAt: '2026-09-18T16:45:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-08-15T08:40:00.000Z',
    createdByUserId: 'user-attendant-2',
    createdByUserName: 'Carlos Eduardo',
    updatedAt: '2026-09-18T16:45:00.000Z',
    updatedByUserId: 'user-attendant-2',
    updatedByUserName: 'Carlos Eduardo',
  },
  {
    id: 'pat-3',
    name: 'Sebastião Antunes Ferreira',
    birthDate: '1947-02-18',
    procedures: [
      {
        id: 'pitem-3',
        procedureId: 'proc-3',
        procedureName: 'Injeção Intravítrea de Antiangiogênico (Anti-VEGF)',
        codeSigtap: '03.03.05.022-4',
        eyeSide: 'OE',
        dateRequested: '2026-09-01',
      },
    ],
    requestedProcedureId: 'proc-3',
    requestedProcedureName: 'Injeção Intravítrea de Antiangiogênico (Anti-VEGF)',
    requestedDate: '2026-09-01',
    requestingDoctorId: 'doc-2',
    requestingDoctorName: 'Dra. Camila Mendonça',
    eyeSide: 'OE',
    isUrgent: true,
    city: 'Niterói',
    hasFollowup: false,
    notes: 'Edema macular cistoide encaminhado pela Policlínica Sérgio Arouca.',
    unitId: 'unit-3',
    unitName: 'Policlínica Regional Dr. Sérgio Arouca',
    currentStatus: 'Aguardando Micrologos',
    previousStatus: 'Aguardando Contato',
    totalAbsences: 0,
    absences: [],
    contactAttempts: [
      {
        id: 'c-301',
        attemptNumber: 1,
        date: '2026-09-05',
        time: '09:00',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        channel: 'Telefone',
        result: 'Sem Resposta / Chamou até cair',
        isSuccessful: false,
        notes: 'Primeira tentativa às 09:00. Chamou até caixa postal.',
        createdAt: '2026-09-05T09:00:00.000Z',
      },
      {
        id: 'c-302',
        attemptNumber: 2,
        date: '2026-09-08',
        time: '14:30',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        channel: 'Telefone',
        result: 'Ocupado',
        isSuccessful: false,
        notes: 'Segunda tentativa em dia alternado. Linha ocupada reiteradamente.',
        createdAt: '2026-09-08T14:30:00.000Z',
      },
      {
        id: 'c-303',
        attemptNumber: 3,
        date: '2026-09-12',
        time: '11:15',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        channel: 'WhatsApp',
        result: 'Número Inexistente / Errado',
        isSuccessful: false,
        notes: 'Terceira tentativa sem resposta. Mensagem não entregue. Limite de 3 tentativas sem sucesso atingido.',
        createdAt: '2026-09-12T11:15:00.000Z',
      },
    ],
    evolutions: [
      {
        id: 'evo-301',
        date: '2026-09-12',
        time: '11:16',
        userId: 'system',
        userName: 'Regra Automática',
        situation: 'Aguardando Micrologos',
        notes: 'Paciente atingiu 3 tentativas de contato consecutivas sem sucesso. Transição automática de status para Aguardando Micrologos executada.',
        createdAt: '2026-09-12T11:16:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'tl-301',
        date: '2026-09-01',
        time: '14:10',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Paciente inserido no fluxo de Anti-VEGF para OE.',
        createdAt: '2026-09-01T14:10:00.000Z',
      },
      {
        id: 'tl-302',
        date: '2026-09-05',
        time: '09:00',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        action: 'Tentativa de Contato 1',
        eventType: 'contact_attempt',
        description: 'Tentativa 1: Sem Resposta / Chamou até cair.',
        createdAt: '2026-09-05T09:00:00.000Z',
      },
      {
        id: 'tl-303',
        date: '2026-09-08',
        time: '14:30',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        action: 'Tentativa de Contato 2',
        eventType: 'contact_attempt',
        description: 'Tentativa 2: Ocupado.',
        createdAt: '2026-09-08T14:30:00.000Z',
      },
      {
        id: 'tl-304',
        date: '2026-09-12',
        time: '11:15',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        action: 'Tentativa de Contato 3',
        eventType: 'contact_attempt',
        description: 'Tentativa 3: Número Inexistente / Errado.',
        createdAt: '2026-09-12T11:15:00.000Z',
      },
      {
        id: 'tl-305',
        date: '2026-09-12',
        time: '11:16',
        userId: 'system',
        userName: 'Regra Automática',
        action: 'Transição Automática de Status',
        eventType: 'automatic_rule',
        previousStatus: 'Aguardando Contato',
        newStatus: 'Aguardando Micrologos',
        description: 'Condição alterada para Aguardando Micrologos após 3 tentativas de contato infrutíferas.',
        isAutomatic: true,
        createdAt: '2026-09-12T11:16:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-09-01T14:10:00.000Z',
    createdByUserId: 'user-supervisor',
    createdByUserName: 'Mariana Costa',
    updatedAt: '2026-09-12T11:16:00.000Z',
    updatedByUserId: 'user-supervisor',
    updatedByUserName: 'Mariana Costa',
  },
  {
    id: 'pat-4',
    name: 'Ana Paula Nogueira de Lima',
    birthDate: '1982-08-30',
    procedures: [
      {
        id: 'pitem-4',
        procedureId: 'proc-5',
        procedureName: 'Iridotomia a Laser (Glaucoma de Ângulo Estreito)',
        codeSigtap: '04.05.05.021-6',
        eyeSide: 'AO',
        dateRequested: '2026-09-20',
      },
    ],
    requestedProcedureId: 'proc-5',
    requestedProcedureName: 'Iridotomia a Laser (Glaucoma de Ângulo Estreito)',
    requestedDate: '2026-09-20',
    requestingDoctorId: 'doc-3',
    requestingDoctorName: 'Dr. Eduardo Vasconcelos',
    eyeSide: 'AO',
    isUrgent: false,
    city: 'Nova Iguaçu',
    hasFollowup: false,
    notes: 'Paciente recém-encaminhada pelo posto de saúde de Nova Iguaçu. Sem tratativas.',
    unitId: 'unit-4',
    unitName: 'Hospital Municipal Lourenço Jorge — CEO Oftalmo',
    currentStatus: 'Aguardando Contato',
    totalAbsences: 0,
    absences: [],
    contactAttempts: [], // ZERO INTERACTIONS
    evolutions: [], // ZERO INTERACTIONS
    timeline: [
      {
        id: 'tl-401',
        date: '2026-09-20',
        time: '16:00',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Paciente cadastrada aguardando primeiro contato telefônico.',
        createdAt: '2026-09-20T16:00:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-09-20T16:00:00.000Z',
    createdByUserId: 'user-attendant-1',
    createdByUserName: 'Patrícia Lemos',
    updatedAt: '2026-09-20T16:00:00.000Z',
    updatedByUserId: 'user-attendant-1',
    updatedByUserName: 'Patrícia Lemos',
  },
  {
    id: 'pat-5',
    name: 'Clarice Lisbôa Silveira',
    birthDate: '1970-06-14',
    procedures: [
      {
        id: 'pitem-5',
        procedureId: 'proc-4',
        procedureName: 'Capsulotomia a YAG Laser',
        codeSigtap: '04.05.05.006-2',
        eyeSide: 'OD',
        dateRequested: '2026-09-22',
      },
    ],
    requestedProcedureId: 'proc-4',
    requestedProcedureName: 'Capsulotomia a YAG Laser',
    requestedDate: '2026-09-22',
    requestingDoctorId: 'doc-1',
    requestingDoctorName: 'Dr. Marcelo Albuquerque',
    eyeSide: 'OD',
    isUrgent: false,
    city: 'Duque de Caxias',
    hasFollowup: false,
    notes: 'Opacidade de cápsula posterior pós-facectomia há 2 anos.',
    unitId: 'unit-1',
    unitName: 'Hospital Municipal Souza Aguiar — CEO Oftalmologia',
    currentStatus: 'Aguardando Contato',
    totalAbsences: 0,
    absences: [],
    contactAttempts: [], // ZERO INTERACTIONS
    evolutions: [], // ZERO INTERACTIONS
    timeline: [
      {
        id: 'tl-501',
        date: '2026-09-22',
        time: '11:30',
        userId: 'user-attendant-1',
        userName: 'Patrícia Lemos',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Cadastro realizado aguardando fila de contato.',
        createdAt: '2026-09-22T11:30:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-09-22T11:30:00.000Z',
    createdByUserId: 'user-attendant-1',
    createdByUserName: 'Patrícia Lemos',
    updatedAt: '2026-09-22T11:30:00.000Z',
    updatedByUserId: 'user-attendant-1',
    updatedByUserName: 'Patrícia Lemos',
  },
  {
    id: 'pat-6',
    name: 'Antônio Carlos Moreira',
    birthDate: '1955-12-05',
    procedures: [
      {
        id: 'pitem-6',
        procedureId: 'proc-1',
        procedureName: 'Facectomia com Implante de LIO (Catarata)',
        codeSigtap: '04.05.05.011-9',
        eyeSide: 'OD',
        dateRequested: '2026-09-15',
      },
    ],
    requestedProcedureId: 'proc-1',
    requestedProcedureName: 'Facectomia com Implante de LIO (Catarata)',
    requestedDate: '2026-09-15',
    requestingDoctorId: 'doc-3',
    requestingDoctorName: 'Dr. Eduardo Vasconcelos',
    eyeSide: 'OD',
    isUrgent: false,
    city: 'Maricá',
    hasFollowup: false,
    notes: 'Encaminhado pelo Posto Central de Maricá. Sem interações até o momento.',
    unitId: 'unit-3',
    unitName: 'Policlínica Regional Dr. Sérgio Arouca',
    currentStatus: 'Aguardando Contato',
    totalAbsences: 0,
    absences: [],
    contactAttempts: [], // ZERO INTERACTIONS
    evolutions: [], // ZERO INTERACTIONS
    timeline: [
      {
        id: 'tl-601',
        date: '2026-09-15',
        time: '10:00',
        userId: 'user-supervisor',
        userName: 'Mariana Costa',
        action: 'Cadastro do Paciente',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Paciente inserido no sistema. Aguardando primeiro contato.',
        createdAt: '2026-09-15T10:00:00.000Z',
      },
    ],
    isDeleted: false,
    createdAt: '2026-09-15T10:00:00.000Z',
    createdByUserId: 'user-supervisor',
    createdByUserName: 'Mariana Costa',
    updatedAt: '2026-09-15T10:00:00.000Z',
    updatedByUserId: 'user-supervisor',
    updatedByUserName: 'Mariana Costa',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-18T16:45:00.000Z',
    userId: 'system',
    userName: 'Sistema Automático de Regras',
    action: 'AUTO_RULE',
    entityType: 'patient',
    entityId: 'pat-2',
    entityLabel: 'José Benedito de Oliveira',
    unitId: 'unit-2',
    unitName: 'Hospital Estadual Alberto Torres — Polo Oftalmo',
    previousValues: { currentStatus: 'Agendado', totalAbsences: 1 },
    newValues: { currentStatus: 'Aguardando Micrologos', totalAbsences: 2 },
    description: 'Regra Automática: paciente mudou para Aguardando Micrologos após atingir 2 faltas.',
    isAutomatic: true,
  },
  {
    id: 'log-2',
    timestamp: '2026-09-12T11:16:00.000Z',
    userId: 'system',
    userName: 'Sistema Automático de Regras',
    action: 'AUTO_RULE',
    entityType: 'patient',
    entityId: 'pat-3',
    entityLabel: 'Sebastião Antunes Ferreira',
    unitId: 'unit-3',
    unitName: 'Policlínica Regional Dr. Sérgio Arouca',
    previousValues: { currentStatus: 'Aguardando Contato' },
    newValues: { currentStatus: 'Aguardando Micrologos' },
    description: 'Regra Automática: paciente mudou para Aguardando Micrologos após 3 tentativas de contato frustradas.',
    isAutomatic: true,
  },
];

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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_PATIENTS);
      if (data) {
        return JSON.parse(data) as Patient[];
      }
      return INITIAL_PATIENTS.map((p) => ({ ...p, isSimulation: true }));
    } catch {
      return INITIAL_PATIENTS.map((p) => ({ ...p, isSimulation: true }));
    }
  },

  saveDemoPatients(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_PATIENTS, JSON.stringify(patients));
    } catch {}
  },

  getPatients(): Patient[] {
    return this.getRealPatients();
  },

  getInitialDemoPatients(): Patient[] {
    return INITIAL_PATIENTS.map((p) => ({ ...p, isSimulation: true }));
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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  saveDemoAuditLogs(logs: AuditLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_AUDIT_LOGS, JSON.stringify(logs));
    } catch {}
  },

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
    localStorage.removeItem(STORAGE_KEYS.DEMO_PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.REAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.DEMO_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_UNIT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // keep custom logo if uploaded
  },
};
