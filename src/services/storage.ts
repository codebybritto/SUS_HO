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
  USERS: 'micrologos_users_rj_v6',
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
  { id: 'mun-1', name: 'Rio de Janeiro', state: 'RJ', active: true },
  { id: 'mun-2', name: 'Niterói', state: 'RJ', active: true },
  { id: 'mun-3', name: 'São Gonçalo', state: 'RJ', active: true },
  { id: 'mun-4', name: 'Duque de Caxias', state: 'RJ', active: true },
  { id: 'mun-5', name: 'Nova Iguaçu', state: 'RJ', active: true },
  { id: 'mun-6', name: 'Belford Roxo', state: 'RJ', active: true },
  { id: 'mun-7', name: 'São João de Meriti', state: 'RJ', active: true },
  { id: 'mun-8', name: 'Petrópolis', state: 'RJ', active: true },
  { id: 'mun-9', name: 'Volta Redonda', state: 'RJ', active: true },
  { id: 'mun-10', name: 'Magé', state: 'RJ', active: true },
  { id: 'mun-11', name: 'Itaboraí', state: 'RJ', active: true },
  { id: 'mun-12', name: 'Cabo Frio', state: 'RJ', active: true },
  { id: 'mun-13', name: 'Angra dos Reis', state: 'RJ', active: true },
  { id: 'mun-14', name: 'Maricá', state: 'RJ', active: true },
  { id: 'mun-15', name: 'Campos dos Goytacazes', state: 'RJ', active: true },
];

// Healthcare Units in Rio de Janeiro (RJ)
export const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit-1',
    name: 'Hospital Municipal Souza Aguiar — CEO Oftalmologia',
    code: 'HMSA-CENTRO',
    cnes: '2269772',
    city: 'Rio de Janeiro',
    state: 'RJ',
    active: true,
    phone: '(21) 3111-2600',
    address: 'Praça da República, 111 - Centro',
    managerName: 'Dr. Renato Silveira',
    municipalities: ['Rio de Janeiro', 'Duque de Caxias', 'São João de Meriti', 'Belford Roxo'],
  },
  {
    id: 'unit-2',
    name: 'Hospital Estadual Alberto Torres — Polo Oftalmo',
    code: 'HEAT-SG',
    cnes: '2270609',
    city: 'São Gonçalo',
    state: 'RJ',
    active: true,
    phone: '(21) 2701-8500',
    address: 'Rua Osvaldo Cruz, s/n - Colubandê',
    managerName: 'Enfª. Laura Pires',
    municipalities: ['São Gonçalo', 'Itaboraí', 'Magé', 'Maricá'],
  },
  {
    id: 'unit-3',
    name: 'Policlínica Regional Dr. Sérgio Arouca',
    code: 'PRSA-NIT',
    cnes: '2273458',
    city: 'Niterói',
    state: 'RJ',
    active: true,
    phone: '(21) 2711-3040',
    address: 'Av. Ary Parreiras, 105 - Vital Brazil',
    managerName: 'Mariana Costa',
    municipalities: ['Niterói', 'São Gonçalo', 'Maricá'],
  },
  {
    id: 'unit-4',
    name: 'Hospital Municipal Lourenço Jorge — CEO Oftalmo',
    code: 'HMLJ-BARRA',
    cnes: '2269896',
    city: 'Rio de Janeiro',
    state: 'RJ',
    active: true,
    phone: '(21) 3111-4600',
    address: 'Av. Ayrton Senna, 2000 - Barra da Tijuca',
    managerName: 'Dr. Carlos Roberto',
    municipalities: ['Rio de Janeiro', 'Nova Iguaçu'],
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
    id: 'doc-1',
    name: 'Dr. Marcelo Albuquerque',
    crm: '52.89412-3',
    stateCrm: 'RJ',
    unitIds: ['unit-1', 'unit-4'],
    specialty: 'Catarata e Segmento Anterior',
    active: true,
    phone: '(21) 98765-4321',
  },
  {
    id: 'doc-2',
    name: 'Dra. Camila Mendonça',
    crm: '52.10492-1',
    stateCrm: 'RJ',
    unitIds: ['unit-1', 'unit-2'],
    specialty: 'Retina Clínica e Cirúrgica',
    active: true,
    phone: '(21) 99123-4567',
  },
  {
    id: 'doc-3',
    name: 'Dr. Eduardo Vasconcelos',
    crm: '52.74830-5',
    stateCrm: 'RJ',
    unitIds: ['unit-2', 'unit-3'],
    specialty: 'Glaucoma e Oftalmologia Geral',
    active: true,
    phone: '(21) 98111-2233',
  },
  {
    id: 'doc-4',
    name: 'Dra. Helena Bittencourt',
    crm: '52.92301-8',
    stateCrm: 'RJ',
    unitIds: ['unit-1', 'unit-3'],
    specialty: 'Córnea e Doenças Externas',
    active: true,
    phone: '(21) 97654-3210',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-igor-britto',
    name: 'Igor Britto',
    login: 'igor.britto',
    password: 'ho2026@',
    role: 'admin',
    active: true,
    unitIds: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
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
    email: 'igor.britto@gestao.saude.rj.gov.br',
    createdAt: '2026-09-28T13:41:00.000Z',
  },
];

export const DEMO_USER: User = {
  id: 'user-demo',
  name: 'Operador de Demonstração (Simulado)',
  login: 'demo',
  password: '',
  role: 'admin',
  active: true,
  unitIds: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
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
      return data ? JSON.parse(data) : INITIAL_UNITS;
    } catch {
      return INITIAL_UNITS;
    }
  },

  saveUnits(units: Unit[]): void {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
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
      return data ? JSON.parse(data) : INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  },

  saveDoctors(doctors: Doctor[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  },

  getRealPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REAL_PATIENTS);
      if (data) {
        const list = JSON.parse(data) as Patient[];
        return list.map((p) => ({
          ...p,
          isSimulation: false,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  saveRealPatients(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REAL_PATIENTS, JSON.stringify(patients));
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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REAL_AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRealAuditLogs(logs: AuditLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REAL_AUDIT_LOGS, JSON.stringify(logs));
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
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_UNIT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // keep custom logo if uploaded
  },
};
