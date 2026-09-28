export type EyeSide = 'AO' | 'OD' | 'OE';

export type PatientStatus =
  | 'Agendado'
  | 'Regulado'
  | 'Aguardando Micrologos'
  | 'Micrologos' // Alias for backward compatibility
  | 'Aguardando Contato'
  | 'Doente'
  | 'Faltou'
  | 'Desistência'
  | 'Óbito'
  | 'Concluído';

export type UserRole = 'admin' | 'supervisor' | 'attendant' | 'viewer';

export interface UserPermissions {
  view_patients: boolean;
  create_patients: boolean;
  edit_patients: boolean;
  delete_patients: boolean;
  edit_after_creation: boolean;
  record_evolution: boolean;
  record_contact_attempt: boolean;
  change_patient_status: boolean;
  manage_procedures: boolean;
  manage_doctors: boolean;
  manage_municipalities: boolean; // Permission to register & manage municipalities
  view_timeline: boolean;
  view_logs: boolean;
  view_reports: boolean;
  export_reports: boolean;
  manage_users: boolean;
  manage_units: boolean;
  manage_settings: boolean;
}

export interface User {
  id: string;
  name: string;
  login: string;
  password?: string;
  role: UserRole;
  active: boolean;
  unitIds: string[];
  permissions: UserPermissions;
  email?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Municipality {
  id: string;
  name: string;
  state: string;
  active: boolean;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  cnes?: string;
  city: string;
  state: string;
  active: boolean;
  phone?: string;
  address?: string;
  managerName?: string;
  municipalities: string[]; // List of municipalities served by this unit
}

export interface Procedure {
  id: string;
  name: string;
  codeSigtap?: string;
  unitIds: string[];
  active: boolean;
  description?: string;
  requiresEyeSide?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  crm: string;
  stateCrm: string;
  unitIds: string[];
  specialty: string;
  active: boolean;
  phone?: string;
}

export interface ContactAttempt {
  id: string;
  attemptNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  userId: string;
  userName: string;
  channel: 'Telefone' | 'WhatsApp' | 'Recado Familiar' | 'Agente de Saúde' | 'Outro';
  result:
    | 'Sem Resposta / Chamou até cair'
    | 'Número Inexistente / Errado'
    | 'Ocupado'
    | 'Recado Deixado'
    | 'Contato com Sucesso - Agendamento Confirmado'
    | 'Contato com Sucesso - Paciente Recusou / Desistiu'
    | 'Contato com Sucesso - Paciente Informou Doença';
  isSuccessful: boolean;
  notes: string;
  createdAt: string;
}

export interface EvolutionRecord {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  situation: string;
  notes: string;
  complementaryInfo?: {
    reason?: string;
    returnDate?: string;
    medicalNote?: string;
    scheduledDate?: string;
    scheduledLocation?: string;
    contactPerson?: string;
  };
  createdAt: string;
}

export interface AbsenceRecord {
  id: string;
  absenceNumber: number;
  date: string;
  scheduledDate: string;
  userId: string;
  userName: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export type TimelineEventType =
  | 'creation'
  | 'update'
  | 'status_change'
  | 'contact_attempt'
  | 'absence'
  | 'evolution'
  | 'automatic_rule'
  | 'deletion'
  | 'unit_change';

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  action: string;
  eventType: TimelineEventType;
  previousStatus?: string;
  newStatus?: string;
  description: string;
  details?: Record<string, any>;
  isAutomatic?: boolean;
  createdAt: string;
}

export interface PatientProcedureItem {
  id: string;
  procedureId: string;
  procedureName: string;
  codeSigtap?: string;
  eyeSide: EyeSide;
  dateRequested?: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  // Multiple procedures support
  procedures: PatientProcedureItem[];
  // Shortcut getters / compatibility
  requestedProcedureId: string;
  requestedProcedureName: string;
  eyeSide: EyeSide;
  requestedDate: string;
  requestingDoctorId: string;
  requestingDoctorName: string;
  isUrgent: boolean;
  city: string;
  hasFollowup: boolean;
  followupDate?: string;
  notes?: string;
  unitId: string;
  unitName: string;
  currentStatus: PatientStatus;
  previousStatus?: PatientStatus;
  totalAbsences: number;
  absences: AbsenceRecord[];
  contactAttempts: ContactAttempt[];
  evolutions: EvolutionRecord[];
  timeline: TimelineEvent[];
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
  updatedAt: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'STATUS_CHANGE'
  | 'CONTACT_ATTEMPT'
  | 'EVOLUTION'
  | 'ABSENCE'
  | 'AUTO_RULE'
  | 'ADMIN_CHANGE';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditActionType;
  entityType: 'patient' | 'user' | 'unit' | 'procedure' | 'doctor' | 'setting' | 'municipality';
  entityId: string;
  entityLabel: string;
  unitId?: string;
  unitName?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description: string;
  isAutomatic?: boolean;
}

export interface SystemSettings {
  maxContactAttempts: number;
  autoAguardandoMicrologosOnFailedContacts: boolean;
  absencesThresholdForAguardandoMicrologos: number;
  autoAguardandoMicrologosOnAbsences: boolean;
  allowStatusOverwriteWithoutEvolution: boolean;
  defaultEyeSideRequired: boolean;
  customLogoUrl?: string;
  colorTheme?: 'blue-orange' | 'blue-green' | 'navy-cyan';
}
