import { supabase, isSupabaseConfigured } from './supabase';
import {
  Patient,
  Unit,
  Procedure,
  Doctor,
  User,
  AuditLog,
  SystemSettings,
  Municipality,
} from '../types';

// ==================== PATIENT MAPPERS ====================
export const mapPatientFromDb = (row: any): Patient => {
  const timeline = row.timeline || [];
  const priorityEvent = timeline.find(
    (e: any) => e.eventType === 'priority_override' || e.eventType === 'priority_reset'
  );
  const isPriorityOverride = priorityEvent?.eventType === 'priority_override';

  return {
    id: row.id,
    name: row.name || '',
    birthDate: row.birth_date || '',
    procedures: row.procedures || [],
    requestedProcedureId: row.requested_procedure_id || '',
    requestedProcedureName: row.requested_procedure_name || '',
    eyeSide: row.eye_side || 'AO',
    requestedDate: row.requested_date || '',
    requestingDoctorId: row.requesting_doctor_id || '',
    requestingDoctorName: row.requesting_doctor_name || '',
    isUrgent: Boolean(row.is_urgent),
    isSimulation: Boolean(row.is_simulation),
    isPriorityOverride,
    priorityOverrideAt: isPriorityOverride ? priorityEvent?.createdAt : undefined,
    priorityOverrideBy: isPriorityOverride ? priorityEvent?.userName : undefined,
    priorityOverrideReason: isPriorityOverride ? priorityEvent?.details?.reason : undefined,
    priorityOrder: isPriorityOverride ? priorityEvent?.details?.priorityOrder : undefined,
    city: row.city || '',
    hasFollowup: Boolean(row.has_followup),
    followupDate: row.followup_date || undefined,
    notes: row.notes || '',
    unitId: row.unit_id || '',
    unitName: row.unit_name || '',
    currentStatus: row.current_status || 'Aguardando Contato',
    previousStatus: row.previous_status || undefined,
    totalAbsences: Number(row.total_absences || 0),
    absences: row.absences || [],
    contactAttempts: row.contact_attempts || [],
    evolutions: row.evolutions || [],
    timeline,
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at || undefined,
    deletedBy: row.deleted_by || undefined,
    deletionReason: row.deletion_reason || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    createdByUserId: row.created_by_user_id || 'system',
    createdByUserName: row.created_by_user_name || 'Sistema',
    updatedAt: row.updated_at || new Date().toISOString(),
    updatedByUserId: row.updated_by_user_id || undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
  };
};

export const mapPatientToDb = (p: Patient): any => ({
  id: p.id,
  name: p.name,
  birth_date: p.birthDate,
  procedures: p.procedures || [],
  requested_procedure_id: p.requestedProcedureId,
  requested_procedure_name: p.requestedProcedureName,
  eye_side: p.eyeSide,
  requested_date: p.requestedDate,
  requesting_doctor_id: p.requestingDoctorId,
  requesting_doctor_name: p.requestingDoctorName,
  is_urgent: p.isUrgent,
  is_simulation: Boolean(p.isSimulation),
  city: p.city,
  has_followup: p.hasFollowup,
  followup_date: p.followupDate || null,
  notes: p.notes || '',
  unit_id: p.unitId,
  unit_name: p.unitName,
  current_status: p.currentStatus,
  previous_status: p.previousStatus || null,
  total_absences: p.totalAbsences || 0,
  absences: p.absences || [],
  contact_attempts: p.contactAttempts || [],
  evolutions: p.evolutions || [],
  timeline: p.timeline || [],
  is_deleted: p.isDeleted,
  deleted_at: p.deletedAt || null,
  deleted_by: p.deletedBy || null,
  deletion_reason: p.deletionReason || null,
  created_at: p.createdAt,
  created_by_user_id: p.createdByUserId,
  created_by_user_name: p.createdByUserName,
  updated_at: p.updatedAt,
  updated_by_user_id: p.updatedByUserId || null,
  updated_by_user_name: p.updatedByUserName || null,
});

// ==================== PATIENT SERVICE ====================
export const supabaseService = {
  // --- Patients ---
  async fetchPatients(): Promise<Patient[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Erro ao carregar pacientes do Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapPatientFromDb);
  },

  async upsertPatient(patient: Patient): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const row = mapPatientToDb(patient);
    const { error } = await supabase.from('patients').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao salvar paciente no Supabase:', error.message);
      return false;
    }
    return true;
  },

  async upsertPatients(patients: Patient[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || patients.length === 0) return false;
    const rows = patients.map(mapPatientToDb);
    const { error } = await supabase.from('patients').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao sincronizar pacientes em lote no Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deletePatient(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir paciente no Supabase:', error.message);
      return false;
    }
    return true;
  },

  // --- Units ---
  async fetchUnits(): Promise<Unit[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('units').select('*');
    if (error) {
      console.warn('Erro ao carregar unidades do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      cnes: r.cnes,
      city: r.city,
      state: r.state,
      active: r.active,
      phone: r.phone,
      address: r.address,
      managerName: r.manager_name,
      municipalities: r.municipalities || [],
    }));
  },

  async upsertUnit(u: Unit): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('units').upsert({
      id: u.id,
      name: u.name,
      code: u.code,
      cnes: u.cnes,
      city: u.city,
      state: u.state,
      active: u.active,
      phone: u.phone,
      address: u.address,
      manager_name: u.managerName,
      municipalities: u.municipalities || [],
    });
    return !error;
  },

  async upsertUnits(units: Unit[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || units.length === 0) return false;
    const rows = units.map((u) => ({
      id: u.id,
      name: u.name,
      code: u.code,
      cnes: u.cnes,
      city: u.city,
      state: u.state,
      active: u.active,
      phone: u.phone,
      address: u.address,
      manager_name: u.managerName,
      municipalities: u.municipalities || [],
    }));
    const { error } = await supabase.from('units').upsert(rows, { onConflict: 'id' });
    return !error;
  },

  async deleteUnit(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('units').delete().eq('id', id);
    return !error;
  },

  // --- Municipalities ---
  async fetchMunicipalities(): Promise<Municipality[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('municipalities').select('*').order('name');
    if (error) {
      console.warn('Erro ao carregar municípios do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      active: r.active,
    }));
  },

  async upsertMunicipality(m: Municipality): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('municipalities').upsert({
      id: m.id,
      name: m.name,
      state: m.state,
      active: m.active,
    });
    return !error;
  },

  async upsertMunicipalities(municipalities: Municipality[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || municipalities.length === 0) return false;
    const rows = municipalities.map((m) => ({
      id: m.id,
      name: m.name,
      state: m.state,
      active: m.active,
    }));
    const { error } = await supabase.from('municipalities').upsert(rows, { onConflict: 'id' });
    return !error;
  },

  async deleteMunicipality(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('municipalities').delete().eq('id', id);
    return !error;
  },

  // --- Procedures ---
  async fetchProcedures(): Promise<Procedure[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('procedures').select('*').order('name');
    if (error) {
      console.warn('Erro ao carregar procedimentos do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      codeSigtap: r.code_sigtap,
      unitIds: r.unit_ids || [],
      active: r.active,
      description: r.description,
      requiresEyeSide: r.requires_eye_side,
    }));
  },

  async upsertProcedure(p: Procedure): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('procedures').upsert({
      id: p.id,
      name: p.name,
      code_sigtap: p.codeSigtap,
      unit_ids: p.unitIds || [],
      active: p.active,
      description: p.description,
      requires_eye_side: p.requiresEyeSide,
    });
    return !error;
  },

  async upsertProcedures(procs: Procedure[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || procs.length === 0) return false;
    const rows = procs.map((p) => ({
      id: p.id,
      name: p.name,
      code_sigtap: p.codeSigtap,
      unit_ids: p.unitIds || [],
      active: p.active,
      description: p.description,
      requires_eye_side: p.requiresEyeSide,
    }));
    const { error } = await supabase.from('procedures').upsert(rows, { onConflict: 'id' });
    return !error;
  },

  async deleteProcedure(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('procedures').delete().eq('id', id);
    return !error;
  },

  // --- Doctors ---
  async fetchDoctors(): Promise<Doctor[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('doctors').select('*').order('name');
    if (error) {
      console.warn('Erro ao carregar médicos do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      crm: r.crm,
      stateCrm: r.state_crm,
      unitIds: r.unit_ids || [],
      specialty: r.specialty,
      active: r.active,
      phone: r.phone,
    }));
  },

  async upsertDoctor(d: Doctor): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('doctors').upsert({
      id: d.id,
      name: d.name,
      crm: d.crm,
      state_crm: d.stateCrm,
      unit_ids: d.unitIds || [],
      specialty: d.specialty,
      active: d.active,
      phone: d.phone,
    });
    return !error;
  },

  async upsertDoctors(doctors: Doctor[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || doctors.length === 0) return false;
    const rows = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      crm: d.crm,
      state_crm: d.stateCrm,
      unit_ids: d.unitIds || [],
      specialty: d.specialty,
      active: d.active,
      phone: d.phone,
    }));
    const { error } = await supabase.from('doctors').upsert(rows, { onConflict: 'id' });
    return !error;
  },

  async deleteDoctor(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    return !error;
  },

  // --- Users & Profiles (Supabase Auth & Profiles) ---
  async fetchUsers(): Promise<User[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    // Tenta carregar primeiro da tabela oficial 'profiles'
    try {
      const { data: profs, error: profErr } = await supabase.from('profiles').select('*');
      if (!profErr && profs && profs.length > 0) {
        return profs.map((r: any) => ({
          id: r.id,
          name: r.name,
          login: r.login,
          role: r.role,
          active: r.active,
          unitIds: r.unit_ids || [],
          permissions: r.permissions || {},
          email: r.email,
          createdAt: r.created_at,
          lastLoginAt: undefined,
          mustChangePassword: false,
        }));
      }
    } catch {
      // continua para fallback
    }

    // Fallback para 'system_users' (sem campo de senha)
    const { data, error } = await supabase.from('system_users').select('id, name, login, role, active, unit_ids, permissions, email, created_at, last_login_at, must_change_password');
    if (error) {
      console.warn('Erro ao carregar usuários do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      login: r.login,
      role: r.role,
      active: r.active,
      unitIds: r.unit_ids || [],
      permissions: r.permissions || {},
      email: r.email,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at,
      mustChangePassword: Boolean(r.must_change_password),
    }));
  },

  async fetchProfile(userId: string): Promise<User | null> {
    if (!supabase || !isSupabaseConfigured() || !userId) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          login: data.login,
          role: data.role,
          active: data.active,
          unitIds: data.unit_ids || [],
          permissions: data.permissions || {},
          email: data.email,
          createdAt: data.created_at,
        };
      }
    } catch {}
    return null;
  },

  async upsertUser(u: User): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;

    // Tenta atualizar/inserir em profiles
    try {
      await supabase.from('profiles').upsert({
        id: u.id,
        name: u.name,
        login: u.login,
        role: u.role,
        active: u.active,
        unit_ids: u.unitIds || [],
        permissions: u.permissions,
        email: u.email || `${u.login}@gestao.saude.rj.gov.br`,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch {}

    // Mantém compatibilidade com system_users sem senha
    const { error } = await supabase.from('system_users').upsert({
      id: u.id,
      name: u.name,
      login: u.login,
      role: u.role,
      active: u.active,
      unit_ids: u.unitIds || [],
      permissions: u.permissions,
      email: u.email,
      created_at: u.createdAt,
      last_login_at: u.lastLoginAt || null,
      must_change_password: Boolean(u.mustChangePassword),
    });
    return !error;
  },

  async upsertUsers(users: User[]): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured() || users.length === 0) return false;
    const rows = users.map((u) => ({
      id: u.id,
      name: u.name,
      login: u.login,
      role: u.role,
      active: u.active,
      unit_ids: u.unitIds || [],
      permissions: u.permissions,
      email: u.email,
      created_at: u.createdAt,
      last_login_at: u.lastLoginAt || null,
      must_change_password: Boolean(u.mustChangePassword),
    }));
    const { error } = await supabase.from('system_users').upsert(rows, { onConflict: 'id' });
    return !error;
  },

  async deleteUser(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch {}
    const { error } = await supabase.from('system_users').delete().eq('id', id);
    return !error;
  },

  // --- Audit Logs ---
  async fetchAuditLogs(): Promise<AuditLog[] | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500);
    if (error) {
      console.warn('Erro ao carregar logs de auditoria do Supabase:', error.message);
      return null;
    }
    return (data || []).map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      userId: r.user_id,
      userName: r.user_name,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      entityLabel: r.entity_label,
      unitId: r.unit_id,
      unitName: r.unit_name,
      previousValues: r.previous_values,
      newValues: r.new_values,
      description: r.description,
      isAutomatic: r.is_automatic,
    }));
  },

  async insertAuditLog(log: AuditLog): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      entity_label: log.entityLabel,
      unit_id: log.unitId || null,
      unit_name: log.unitName || null,
      previous_values: log.previousValues || null,
      new_values: log.newValues || null,
      description: log.description,
      is_automatic: log.isAutomatic || false,
    });
    return !error;
  },

  // --- Settings ---
  async fetchSettings(): Promise<SystemSettings | null> {
    if (!supabase || !isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('system_settings').select('settings').eq('id', 'global').maybeSingle();
    if (error || !data) return null;
    return data.settings as SystemSettings;
  },

  async saveSettings(settings: SystemSettings): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    const { error } = await supabase.from('system_settings').upsert({
      id: 'global',
      settings,
    });
    return !error;
  },
};
