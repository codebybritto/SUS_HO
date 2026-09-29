import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  Unit,
  Procedure,
  Doctor,
  User,
  AuditLog,
  SystemSettings,
  TimelineEvent,
  ContactAttempt,
  EvolutionRecord,
  AbsenceRecord,
  PatientStatus,
  Municipality,
  PatientProcedureItem,
} from '../types';
import { storageService } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabase';
import { syncQueueService } from '../services/syncQueueService';
import { useAuth } from './AuthContext';
import { formatDateBR } from '../utils/date';

export type SupabaseStatus = 'connected' | 'offline' | 'syncing' | 'unconfigured' | 'error';

interface AppContextType {
  patients: Patient[];
  units: Unit[];
  municipalities: Municipality[];
  procedures: Procedure[];
  doctors: Doctor[];
  users: User[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  // Supabase status & actions
  supabaseSyncStatus: SupabaseStatus;
  isSupabaseActive: boolean;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  reloadFromSupabase: () => Promise<void>;
  // Database Mode (Base Real vs Simulação)
  databaseMode: 'real' | 'simulation';
  setDatabaseMode: (mode: 'real' | 'simulation') => void;
  resetSimulationPatients: () => void;
  allPatientsCount: { real: number; simulation: number };
  // Patient Actions
  addPatient: (data: Partial<Patient> & { procedures?: PatientProcedureItem[] }) => Patient;
  updatePatient: (id: string, data: Partial<Patient> & { procedures?: PatientProcedureItem[] }) => void;
  deletePatient: (id: string, reason: string) => void;
  restorePatient: (id: string) => void;
  recordStatusChange: (patientId: string, newStatus: PatientStatus, notes?: string) => void;
  recordEvolution: (
    patientId: string,
    situation: string,
    notes: string,
    complementaryInfo?: EvolutionRecord['complementaryInfo']
  ) => void;
  recordContactAttempt: (
    patientId: string,
    attempt: Omit<ContactAttempt, 'id' | 'attemptNumber' | 'createdAt' | 'userId' | 'userName'>
  ) => void;
  recordAbsence: (
    patientId: string,
    absence: Omit<AbsenceRecord, 'id' | 'absenceNumber' | 'createdAt' | 'userId' | 'userName'>
  ) => void;
  setPatientPriorityOverride: (
    patientId: string,
    isPriority: boolean,
    reason?: string,
    customOrder?: number
  ) => void;
  // Administrative Actions
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addMunicipality: (mun: Omit<Municipality, 'id'>) => void;
  updateMunicipality: (id: string, mun: Partial<Municipality>) => void;
  deleteMunicipality: (id: string) => void;
  addProcedure: (proc: Omit<Procedure, 'id'>) => void;
  updateProcedure: (id: string, proc: Partial<Procedure>) => void;
  deleteProcedure: (id: string) => void;
  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, doc: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateUser: (id: string, user: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState<Patient[]>(() => storageService.getRealPatients());
  const [units, setUnits] = useState<Unit[]>(() => storageService.getUnits());
  const [municipalities, setMunicipalities] = useState<Municipality[]>(() =>
    storageService.getMunicipalities()
  );
  const [procedures, setProcedures] = useState<Procedure[]>(() => storageService.getProcedures());
  const [doctors, setDoctors] = useState<Doctor[]>(() => storageService.getDoctors());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getRealAuditLogs());
  const [settings, setSettings] = useState<SystemSettings>(() => storageService.getSettings());

  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<SupabaseStatus>(() =>
    isSupabaseConfigured() ? 'syncing' : 'unconfigured'
  );

  const [databaseMode, setDatabaseModeState] = useState<'real' | 'simulation'>('real');

  const setDatabaseMode = (mode: 'real' | 'simulation') => {
    setDatabaseModeState(mode);
  };

  const resetSimulationPatients = useCallback(() => {
    // Modo simulação descontinuado
  }, []);

  // Unified visible patients: all active records available without simulation filtering
  const visiblePatients = React.useMemo(() => {
    return patients;
  }, [patients]);

  const allPatientsCount = React.useMemo(() => {
    const real = patients.filter((p) => !p.isDeleted).length;
    return { real, simulation: 0 };
  }, [patients]);

  // Active current user info for audit & timeline
  const currentUserId = currentUser?.id || 'system';
  const currentUserName = currentUser?.name || 'Sistema';

  // Helper to sync patient changes to Supabase with offline queue fallback
  const syncPatientToSupabase = useCallback((patient: Patient) => {
    if (isSupabaseConfigured()) {
      if (syncQueueService.isOnline()) {
        supabaseService.upsertPatient(patient).then((ok) => {
          if (!ok) {
            syncQueueService.enqueue('UPSERT_PATIENT', patient.id, patient);
          }
        }).catch((err) => {
          console.warn('Erro ao salvar paciente no Supabase, enfileirando offline:', err);
          syncQueueService.enqueue('UPSERT_PATIENT', patient.id, patient);
        });
      } else {
        syncQueueService.enqueue('UPSERT_PATIENT', patient.id, patient);
      }
    }
  }, []);

  // Sync entire dataset to Supabase
  const syncAllToSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
      };
    }

    try {
      setSupabaseSyncStatus('syncing');

      await Promise.all([
        supabaseService.upsertMunicipalities(municipalities),
        supabaseService.upsertUnits(units),
        supabaseService.upsertProcedures(procedures),
        supabaseService.upsertDoctors(doctors),
        supabaseService.upsertUsers(users),
        supabaseService.upsertPatients(patients),
        supabaseService.saveSettings(settings),
      ]);

      setSupabaseSyncStatus('connected');
      return {
        success: true,
        message: 'Todos os dados locais foram sincronizados com o Supabase com sucesso!',
      };
    } catch (err: any) {
      setSupabaseSyncStatus('error');
      return {
        success: false,
        message: `Falha na sincronização: ${err?.message || err}`,
      };
    }
  }, [municipalities, units, procedures, doctors, users, patients, settings]);

  // Load dataset from Supabase
  const reloadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseSyncStatus('unconfigured');
      return;
    }

    try {
      setSupabaseSyncStatus('syncing');

      const [
        supaUnits,
        supaMunis,
        supaProcs,
        supaDocs,
        supaUsers,
        supaPatients,
        supaLogs,
        supaSettings,
      ] = await Promise.all([
        supabaseService.fetchUnits(),
        supabaseService.fetchMunicipalities(),
        supabaseService.fetchProcedures(),
        supabaseService.fetchDoctors(),
        supabaseService.fetchUsers(),
        supabaseService.fetchPatients(),
        supabaseService.fetchAuditLogs(),
        supabaseService.fetchSettings(),
      ]);

      let hasSupabaseData = false;

      if (supaUnits && supaUnits.length > 0) {
        const cleanUnits = supaUnits.filter(
          (u) => u.active !== false && !['unit-1', 'unit-2', 'unit-3', 'unit-4'].includes(u.id)
        );
        setUnits(cleanUnits);
        storageService.saveUnits(cleanUnits);
        hasSupabaseData = true;
      }
      if (supaMunis && supaMunis.length > 0) {
        setMunicipalities(supaMunis);
        storageService.saveMunicipalities(supaMunis);
        hasSupabaseData = true;
      }
      if (supaProcs && supaProcs.length > 0) {
        setProcedures(supaProcs);
        storageService.saveProcedures(supaProcs);
        hasSupabaseData = true;
      }
      if (supaDocs && supaDocs.length > 0) {
        setDoctors(supaDocs);
        storageService.saveDoctors(supaDocs);
        hasSupabaseData = true;
      }
      if (supaUsers && supaUsers.length > 0) {
        setUsers(supaUsers);
        storageService.saveUsers(supaUsers);
        hasSupabaseData = true;
      }
      if (supaPatients !== null) {
        setPatients(supaPatients);
        storageService.saveRealPatients(supaPatients);
      }
      if (supaLogs !== null) {
        setAuditLogs(supaLogs);
        storageService.saveRealAuditLogs(supaLogs);
      }
      if (supaSettings) {
        setSettings(supaSettings);
      }

      setSupabaseSyncStatus('connected');
    } catch (err) {
      console.warn('Falha ao carregar dados do Supabase. Operando em modo offline:', err);
      setSupabaseSyncStatus('error');
    }
  }, []);

  // User login synchronization: strictly load real data from Supabase
  useEffect(() => {
    if (isSupabaseConfigured()) {
      reloadFromSupabase();
    }
  }, [currentUser?.id, reloadFromSupabase]);

  // Reconnect listener: process offline queue automatically when connection is restored
  useEffect(() => {
    const unsubscribe = syncQueueService.subscribe(async (count, isOnline) => {
      if (isOnline && count > 0 && isSupabaseConfigured()) {
        try {
          const result = await syncQueueService.flush({
            onUpsertPatient: async (p) => supabaseService.upsertPatient(p),
            onDeletePatient: async (id) => supabaseService.deletePatient(id),
            onInsertAudit: async (l) => supabaseService.insertAuditLog(l),
          });
          if (result.processed > 0) {
            reloadFromSupabase();
          }
        } catch (e) {
          console.warn('Erro ao processar fila offline de pacientes:', e);
        }
      }
    });

    return unsubscribe;
  }, [reloadFromSupabase]);

  // Save changes to LocalStorage whenever state updates (offline cache)
  useEffect(() => {
    storageService.saveRealPatients(patients);
  }, [patients]);

  useEffect(() => {
    storageService.saveUnits(units);
  }, [units]);

  useEffect(() => {
    storageService.saveMunicipalities(municipalities);
  }, [municipalities]);

  useEffect(() => {
    storageService.saveProcedures(procedures);
  }, [procedures]);

  useEffect(() => {
    storageService.saveDoctors(doctors);
  }, [doctors]);

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storageService.saveRealAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  const logAudit = (logData: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: currentUserId,
      userName: currentUserName,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 1999)]);

    if (isSupabaseConfigured()) {
      supabaseService.insertAuditLog(newLog).catch((err) => {
        console.warn('Erro ao registrar log no Supabase:', err);
      });
    }
  };

  // 1. Patient Actions
  const addPatient = (data: Partial<Patient> & { procedures?: PatientProcedureItem[] }): Patient => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = isoString.split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5);

    const initialStatus = (data.currentStatus || 'Aguardando Contato') as PatientStatus;
    const unit = units.find((u) => u.id === data.unitId);
    const doc = doctors.find((d) => d.id === data.requestingDoctorId);

    // Multiple procedures handling
    const procsList: PatientProcedureItem[] =
      data.procedures && data.procedures.length > 0
        ? data.procedures
        : data.requestedProcedureId
        ? [
            {
              id: `pitem-${Date.now()}`,
              procedureId: data.requestedProcedureId,
              procedureName:
                procedures.find((p) => p.id === data.requestedProcedureId)?.name || 'Procedimento',
              eyeSide: data.eyeSide || 'AO',
              dateRequested: data.requestedDate || dateFormatted,
            },
          ]
        : [];

    const primaryProcId = procsList[0]?.procedureId || data.requestedProcedureId || '';
    const primaryProcName = procsList.map((p) => `${p.procedureName} (${p.eyeSide})`).join(', ') ||
      procedures.find((p) => p.id === primaryProcId)?.name ||
      'Procedimento Oftalmológico';
    const primaryEye = procsList[0]?.eyeSide || data.eyeSide || 'AO';

    const initialTimeline: TimelineEvent[] = [
      {
        id: `time-${Date.now()}-1`,
        date: dateFormatted,
        time: timeFormatted,
        userId: currentUserId,
        userName: currentUserName,
        action: 'Cadastro Inicial do Paciente',
        eventType: 'creation',
        newStatus: initialStatus,
        description: `Paciente cadastrado para: ${primaryProcName} na unidade ${unit?.name || 'Geral'}.`,
        createdAt: isoString,
      },
    ];

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: data.name || '',
      birthDate: data.birthDate || '',
      procedures: procsList,
      requestedProcedureId: primaryProcId,
      requestedProcedureName: primaryProcName,
      requestedDate: data.requestedDate || dateFormatted,
      requestingDoctorId: data.requestingDoctorId || '',
      requestingDoctorName: doc?.name || data.requestingDoctorName || '',
      eyeSide: primaryEye,
      isUrgent: !!data.isUrgent,
      isSimulation: false,
      city: data.city || '',
      hasFollowup: !!data.hasFollowup,
      followupDate: data.followupDate,
      notes: data.notes || '',
      unitId: data.unitId || '',
      unitName: unit?.name || '',
      currentStatus: initialStatus,
      totalAbsences: 0,
      absences: [],
      contactAttempts: [],
      evolutions: [],
      timeline: initialTimeline,
      isDeleted: false,
      createdAt: isoString,
      createdByUserId: currentUserId,
      createdByUserName: currentUserName,
      updatedAt: isoString,
    };

    setPatients((prev) => [newPatient, ...prev]);
    syncPatientToSupabase(newPatient);

    logAudit({
      action: 'CREATE',
      entityType: 'patient',
      entityId: newPatient.id,
      entityLabel: newPatient.name,
      unitId: newPatient.unitId,
      unitName: newPatient.unitName,
      description: `Cadastro de novo paciente: ${newPatient.name} (${primaryProcName})`,
      newValues: {
        name: newPatient.name,
        procedures: procsList.map((p) => p.procedureName),
        unit: unit?.name,
        status: initialStatus,
      },
    });

    return newPatient;
  };

  const updatePatient = (
    id: string,
    data: Partial<Patient> & { procedures?: PatientProcedureItem[] }
  ) => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = isoString.split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5);

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== id) return pat;

        const previousValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};
        const changes: string[] = [];

        // Check procedures change
        let updatedProcedures = pat.procedures || [];
        if (data.procedures) {
          updatedProcedures = data.procedures;
          previousValues.procedures = (pat.procedures || []).map((p) => `${p.procedureName} (${p.eyeSide})`);
          newValues.procedures = data.procedures.map((p) => `${p.procedureName} (${p.eyeSide})`);
          changes.push(`Procedimentos atualizados: ${newValues.procedures.join(', ')}`);
        }

        // Check unit change
        if (data.unitId && data.unitId !== pat.unitId) {
          const newUnit = units.find((u) => u.id === data.unitId);
          previousValues.unit = pat.unitName;
          newValues.unit = newUnit?.name;
          changes.push(`Unidade alterada para "${newUnit?.name}"`);
        }

        // Check doctor change
        if (data.requestingDoctorId && data.requestingDoctorId !== pat.requestingDoctorId) {
          const newDoc = doctors.find((d) => d.id === data.requestingDoctorId);
          previousValues.doctor = pat.requestingDoctorName;
          newValues.doctor = newDoc?.name;
          changes.push(`Médico solicitante alterado para "${newDoc?.name}"`);
        }

        // Check urgency change
        if (data.isUrgent !== undefined && data.isUrgent !== pat.isUrgent) {
          previousValues.isUrgent = pat.isUrgent;
          newValues.isUrgent = data.isUrgent;
          changes.push(data.isUrgent ? 'Marcado como URGENTE' : 'Prioridade alterada para normal');
        }

        const newTimelineEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          action: 'Alteração Cadastral',
          eventType: 'update',
          description:
            changes.length > 0
              ? changes.join('; ')
              : 'Informações cadastrais atualizadas pelo usuário.',
          details: { previousValues, newValues },
          createdAt: isoString,
        };

        const primaryProcName =
          updatedProcedures.length > 0
            ? updatedProcedures.map((p) => `${p.procedureName} (${p.eyeSide})`).join(', ')
            : pat.requestedProcedureName;

        const updatedPatient: Patient = {
          ...pat,
          ...data,
          procedures: updatedProcedures,
          requestedProcedureId: updatedProcedures[0]?.procedureId || pat.requestedProcedureId,
          requestedProcedureName: primaryProcName,
          eyeSide: updatedProcedures[0]?.eyeSide || pat.eyeSide,
          requestingDoctorName:
            data.requestingDoctorId && doctors.find((d) => d.id === data.requestingDoctorId)?.name
              ? doctors.find((d) => d.id === data.requestingDoctorId)!.name
              : pat.requestingDoctorName,
          unitName:
            data.unitId && units.find((u) => u.id === data.unitId)?.name
              ? units.find((u) => u.id === data.unitId)!.name
              : pat.unitName,
          timeline: [newTimelineEvent, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updatedPatient);

        logAudit({
          action: 'UPDATE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: updatedPatient.unitId,
          unitName: updatedPatient.unitName,
          description: `Atualização de cadastro de ${pat.name}: ${changes.join(', ') || 'Dados gerais'}`,
          previousValues,
          newValues,
        });

        return updatedPatient;
      })
    );
  };

  const deletePatient = (id: string, reason: string) => {
    const now = new Date();
    const isoString = now.toISOString();

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== id) return pat;

        const deleteEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: isoString.split('T')[0],
          time: now.toTimeString().slice(0, 5),
          userId: currentUserId,
          userName: currentUserName,
          action: 'Exclusão Lógica do Paciente',
          eventType: 'deletion',
          description: `Paciente excluído logicamente. Motivo: ${reason}`,
          details: { reason },
          createdAt: isoString,
        };

        logAudit({
          action: 'DELETE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Exclusão do paciente ${pat.name}. Motivo informado: ${reason}`,
          newValues: { deletionReason: reason },
        });

        const updated = {
          ...pat,
          isDeleted: true,
          deletedAt: isoString,
          deletedBy: currentUserName,
          deletionReason: reason,
          timeline: [deleteEvent, ...pat.timeline],
          updatedAt: isoString,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  const restorePatient = (id: string) => {
    const now = new Date();
    const isoString = now.toISOString();

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== id) return pat;

        const restoreEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: isoString.split('T')[0],
          time: now.toTimeString().slice(0, 5),
          userId: currentUserId,
          userName: currentUserName,
          action: 'Restauração do Paciente',
          eventType: 'update',
          description: 'Paciente restaurado pelo administrador.',
          createdAt: isoString,
        };

        logAudit({
          action: 'RESTORE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Paciente ${pat.name} restaurado no sistema`,
        });

        const updated = {
          ...pat,
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          deletionReason: undefined,
          timeline: [restoreEvent, ...pat.timeline],
          updatedAt: isoString,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  const setPatientPriorityOverride = (
    patientId: string,
    isPriority: boolean,
    reason?: string,
    customOrder?: number
  ) => {
    const now = new Date();
    const isoString = now.toISOString();

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== patientId) return pat;

        const timelineEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: isoString.split('T')[0],
          time: now.toTimeString().slice(0, 5),
          userId: currentUserId,
          userName: currentUserName,
          action: isPriority ? 'Prioridade Gerencial (Passado na Frente)' : 'Prioridade Normal Restaurada',
          eventType: isPriority ? 'priority_override' : 'priority_reset',
          description: isPriority
            ? `Paciente passado na frente da fila pela gerência (${currentUserName}).${reason ? ` Motivo: ${reason}` : ''}`
            : `Prioridade especial removida por ${currentUserName}. Paciente retornou à fila cronológica padrão.`,
          details: { reason, priorityOrder: customOrder || 1 },
          createdAt: isoString,
        };

        const updated: Patient = {
          ...pat,
          isPriorityOverride: isPriority,
          priorityOverrideAt: isPriority ? isoString : undefined,
          priorityOverrideBy: isPriority ? currentUserName : undefined,
          priorityOverrideReason: isPriority ? reason : undefined,
          priorityOrder: isPriority ? (customOrder || 1) : undefined,
          timeline: [timelineEvent, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updated);

        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: isPriority
            ? `Paciente ${pat.name} colocado como prioridade gerencial na fila por ${currentUserName}.${reason ? ` Motivo: ${reason}` : ''}`
            : `Prioridade gerencial do paciente ${pat.name} revogada por ${currentUserName}`,
          newValues: { isPriorityOverride: isPriority, reason },
        });

        return updated;
      })
    );
  };

  const recordStatusChange = (patientId: string, newStatus: PatientStatus, notes?: string) => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = isoString.split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5);

    // Normalize Micrologos to Aguardando Micrologos
    const normalizedStatus =
      newStatus === 'Micrologos' ? 'Aguardando Micrologos' : newStatus;

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== patientId) return pat;
        const prevStatus = pat.currentStatus;

        const newTimelineEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          action: `Mudança de Condição: ${normalizedStatus}`,
          eventType: 'status_change',
          previousStatus: prevStatus,
          newStatus: normalizedStatus,
          description: notes
            ? `Status alterado para ${normalizedStatus}. Obs: ${notes}`
            : `Status alterado para ${normalizedStatus}.`,
          createdAt: isoString,
        };

        logAudit({
          action: 'STATUS_CHANGE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Alteração de status de "${prevStatus}" para "${normalizedStatus}"`,
          previousValues: { status: prevStatus },
          newValues: { status: normalizedStatus, notes },
        });

        const updated = {
          ...pat,
          previousStatus: prevStatus,
          currentStatus: normalizedStatus,
          timeline: [newTimelineEvent, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  const recordEvolution = (
    patientId: string,
    situation: string,
    notes: string,
    complementaryInfo?: EvolutionRecord['complementaryInfo']
  ) => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = isoString.split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5);

    // Normalize situation
    const normalizedSituation =
      situation === 'Micrologos' ? 'Aguardando Micrologos' : situation;

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== patientId) return pat;

        const newEvolution: EvolutionRecord = {
          id: `evo-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          situation: normalizedSituation,
          notes,
          complementaryInfo,
          createdAt: isoString,
        };

        const prevStatus = pat.currentStatus;
        const recognizedStatuses: PatientStatus[] = [
          'Agendado',
          'Regulado',
          'Aguardando Micrologos',
          'Micrologos',
          'Aguardando Contato',
          'Doente',
          'Faltou',
          'Desistência',
          'Óbito',
          'Concluído',
        ];

        let updatedStatus = pat.currentStatus;
        let timelineDesc = `Evolução/Tratativa registrada: ${normalizedSituation}. ${notes}`;

        if (recognizedStatuses.includes(normalizedSituation as PatientStatus)) {
          updatedStatus = (normalizedSituation === 'Micrologos'
            ? 'Aguardando Micrologos'
            : normalizedSituation) as PatientStatus;

          if (updatedStatus === 'Agendado' && complementaryInfo?.scheduledDate) {
            const dateStr = formatDateBR(complementaryInfo.scheduledDate);
            const timeStr = complementaryInfo.scheduledTime ? ` às ${complementaryInfo.scheduledTime}` : '';
            const locStr = complementaryInfo.scheduledLocation ? ` no local ${complementaryInfo.scheduledLocation}` : '';
            timelineDesc = `Cirurgia agendada para ${dateStr}${timeStr}${locStr}. Obs: ${notes}`;
          } else {
            timelineDesc = `Evolução: Situação alterada para "${updatedStatus}". Obs: ${notes}`;
          }
        }

        const newTimelineEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          action: `Evolução: ${normalizedSituation}`,
          eventType: 'evolution',
          previousStatus: prevStatus,
          newStatus: updatedStatus,
          description: timelineDesc,
          details: { complementaryInfo },
          createdAt: isoString,
        };

        logAudit({
          action: 'EVOLUTION',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Evolução registrada para ${pat.name}: ${normalizedSituation}`,
          newValues: { situation: normalizedSituation, notes, complementaryInfo },
        });

        const updated = {
          ...pat,
          previousStatus: updatedStatus !== prevStatus ? prevStatus : pat.previousStatus,
          currentStatus: updatedStatus,
          evolutions: [newEvolution, ...pat.evolutions],
          timeline: [newTimelineEvent, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  // 2. Contact Attempt Action + AUTOMATIC RULE CHECK
  const recordContactAttempt = (
    patientId: string,
    attemptData: Omit<ContactAttempt, 'id' | 'attemptNumber' | 'createdAt' | 'userId' | 'userName'>
  ) => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = attemptData.date || isoString.split('T')[0];
    const timeFormatted = attemptData.time || now.toTimeString().slice(0, 5);

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== patientId) return pat;

        const nextAttemptNum = pat.contactAttempts.length + 1;
        const newAttempt: ContactAttempt = {
          ...attemptData,
          id: `cnt-${Date.now()}`,
          attemptNumber: nextAttemptNum,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          createdAt: isoString,
        };

        const updatedAttempts = [...pat.contactAttempts, newAttempt];

        const timelineEvent: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          action: `Tentativa de Contato ${nextAttemptNum} (${attemptData.isSuccessful ? 'Sucesso' : 'Sem Sucesso'})`,
          eventType: 'contact_attempt',
          description: `Canal: ${attemptData.channel} · Resultado: ${attemptData.result}. Obs: ${attemptData.notes || 'Sem observações adicionais.'}`,
          createdAt: isoString,
        };

        let newStatus = pat.currentStatus;
        const additionalTimelineEvents: TimelineEvent[] = [];
        const additionalEvolutions: EvolutionRecord[] = [];

        if (attemptData.result === 'Contato com Sucesso - Paciente Recusou / Desistiu') {
          newStatus = 'Desistência';
        }

        // AUTOMATIC RULE CHECK: 3 failed contact attempts -> automatically switch condition to 'Aguardando Micrologos'
        const failedAttempts = updatedAttempts.filter((a) => !a.isSuccessful);
        if (
          settings.autoAguardandoMicrologosOnFailedContacts &&
          failedAttempts.length >= settings.maxContactAttempts &&
          pat.currentStatus !== 'Aguardando Micrologos' &&
          pat.currentStatus !== 'Micrologos'
        ) {
          newStatus = 'Aguardando Micrologos';

          const autoTimeline: TimelineEvent = {
            id: `time-${Date.now()}-auto`,
            date: dateFormatted,
            time: timeFormatted,
            userId: 'system',
            userName: 'Sistema Automático',
            action: 'Regra Automática: Aguardando Micrologos por Limite de Contatos',
            eventType: 'automatic_rule',
            isAutomatic: true,
            previousStatus: pat.currentStatus,
            newStatus: 'Aguardando Micrologos',
            description: `Paciente atingiu ${settings.maxContactAttempts} tentativas de contato sem sucesso. Alterado automaticamente para "Aguardando Micrologos".`,
            createdAt: isoString,
          };

          const autoEvo: EvolutionRecord = {
            id: `evo-${Date.now()}-auto`,
            date: dateFormatted,
            time: timeFormatted,
            userId: 'system',
            userName: 'Regra do Sistema',
            situation: 'Aguardando Micrologos',
            notes: `Sistema aplicou regra automática: 3 contatos sem sucesso registrados.`,
            createdAt: isoString,
          };

          additionalTimelineEvents.push(autoTimeline);
          additionalEvolutions.push(autoEvo);

          logAudit({
            action: 'AUTO_RULE',
            entityType: 'patient',
            entityId: pat.id,
            entityLabel: pat.name,
            unitId: pat.unitId,
            unitName: pat.unitName,
            isAutomatic: true,
            description: `Regra Automática aplicada a ${pat.name}: Condição alterada para Aguardando Micrologos após ${settings.maxContactAttempts} tentativas sem sucesso`,
            previousValues: { status: pat.currentStatus },
            newValues: { status: 'Aguardando Micrologos' },
          });
        }

        logAudit({
          action: 'CONTACT_ATTEMPT',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Tentativa de contato ${nextAttemptNum} registrada (${attemptData.channel} - ${attemptData.result})`,
          newValues: { attemptNumber: nextAttemptNum, result: attemptData.result, channel: attemptData.channel },
        });

        const updated = {
          ...pat,
          currentStatus: newStatus,
          previousStatus: newStatus !== pat.currentStatus ? pat.currentStatus : pat.previousStatus,
          contactAttempts: updatedAttempts,
          evolutions: [...additionalEvolutions, ...pat.evolutions],
          timeline: [...additionalTimelineEvents, timelineEvent, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  // 3. Absence Action + AUTOMATIC RULE CHECK
  const recordAbsence = (
    patientId: string,
    absenceData: Omit<AbsenceRecord, 'id' | 'absenceNumber' | 'createdAt' | 'userId' | 'userName'>
  ) => {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = absenceData.date || isoString.split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5);

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== patientId) return pat;

        const nextAbsenceNum = pat.totalAbsences + 1;
        const newAbsence: AbsenceRecord = {
          ...absenceData,
          id: `abs-${Date.now()}`,
          absenceNumber: nextAbsenceNum,
          userId: currentUserId,
          userName: currentUserName,
          createdAt: isoString,
        };

        const updatedAbsences = [...pat.absences, newAbsence];
        let newStatus: PatientStatus = 'Faltou';

        const absenceTimeline: TimelineEvent = {
          id: `time-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          userId: currentUserId,
          userName: currentUserName,
          action: `Registro de Falta (${nextAbsenceNum}ª Falta)`,
          eventType: 'absence',
          previousStatus: pat.currentStatus,
          newStatus: 'Faltou',
          description: `Paciente faltou na data de agendamento ${absenceData.scheduledDate}. Motivo/Obs: ${absenceData.notes || absenceData.reason || 'Sem justificativa'}`,
          createdAt: isoString,
        };

        const additionalTimelineEvents: TimelineEvent[] = [];
        const additionalEvolutions: EvolutionRecord[] = [];

        // AUTOMATIC RULE CHECK: 2 absences -> automatically change condition to 'Aguardando Micrologos'
        if (
          settings.autoAguardandoMicrologosOnAbsences &&
          nextAbsenceNum >= settings.absencesThresholdForAguardandoMicrologos &&
          pat.currentStatus !== 'Aguardando Micrologos' &&
          pat.currentStatus !== 'Micrologos'
        ) {
          newStatus = 'Aguardando Micrologos';

          const autoTimeline: TimelineEvent = {
            id: `time-${Date.now()}-auto`,
            date: dateFormatted,
            time: timeFormatted,
            userId: 'system',
            userName: 'Sistema Automático',
            action: 'Regra Automática: Aguardando Micrologos por Limite de Faltas',
            eventType: 'automatic_rule',
            isAutomatic: true,
            previousStatus: 'Faltou',
            newStatus: 'Aguardando Micrologos',
            description: `Paciente acumulou ${nextAbsenceNum} faltas consecutivas. Alterado automaticamente para "Aguardando Micrologos".`,
            createdAt: isoString,
          };

          const autoEvo: EvolutionRecord = {
            id: `evo-${Date.now()}-auto`,
            date: dateFormatted,
            time: timeFormatted,
            userId: 'system',
            userName: 'Regra do Sistema',
            situation: 'Aguardando Micrologos',
            notes: `Sistema aplicou regra automática: ${nextAbsenceNum} faltas registradas.`,
            createdAt: isoString,
          };

          additionalTimelineEvents.push(autoTimeline);
          additionalEvolutions.push(autoEvo);

          logAudit({
            action: 'AUTO_RULE',
            entityType: 'patient',
            entityId: pat.id,
            entityLabel: pat.name,
            unitId: pat.unitId,
            unitName: pat.unitName,
            isAutomatic: true,
            description: `Regra Automática aplicada a ${pat.name}: Condição alterada para Aguardando Micrologos por atingir ${settings.absencesThresholdForAguardandoMicrologos} faltas`,
            previousValues: { status: 'Faltou' },
            newValues: { status: 'Aguardando Micrologos' },
          });
        }

        logAudit({
          action: 'ABSENCE',
          entityType: 'patient',
          entityId: pat.id,
          entityLabel: pat.name,
          unitId: pat.unitId,
          unitName: pat.unitName,
          description: `Falta número ${nextAbsenceNum} registrada para o paciente ${pat.name}`,
          newValues: { totalAbsences: nextAbsenceNum, scheduledDate: absenceData.scheduledDate },
        });

        const updated = {
          ...pat,
          totalAbsences: nextAbsenceNum,
          currentStatus: newStatus,
          previousStatus: newStatus !== pat.currentStatus ? pat.currentStatus : pat.previousStatus,
          absences: updatedAbsences,
          evolutions: [...additionalEvolutions, ...pat.evolutions],
          timeline: [...additionalTimelineEvents, absenceTimeline, ...pat.timeline],
          updatedAt: isoString,
          updatedByUserId: currentUserId,
          updatedByUserName: currentUserName,
        };

        syncPatientToSupabase(updated);
        return updated;
      })
    );
  };

  // Administrative Actions
  const addUnit = (unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      ...unitData,
      id: `unit-${Date.now()}`,
      municipalities: unitData.municipalities || [],
    };
    setUnits((prev) => [...prev, newUnit]);
    if (isSupabaseConfigured()) {
      supabaseService.upsertUnit(newUnit).catch(console.warn);
    }
    logAudit({
      action: 'ADMIN_CHANGE',
      entityType: 'unit',
      entityId: newUnit.id,
      entityLabel: newUnit.name,
      description: `Nova unidade criada: ${newUnit.name} (${newUnit.city})`,
    });
  };

  const updateUnit = (id: string, unitData: Partial<Unit>) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const updated = { ...u, ...unitData };
        if (isSupabaseConfigured()) {
          supabaseService.upsertUnit(updated).catch(console.warn);
        }
        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'unit',
          entityId: id,
          entityLabel: updated.name,
          description: `Unidade ${updated.name} atualizada`,
        });
        return updated;
      })
    );
  };

  const deleteUnit = (id: string) => {
    const unit = units.find((u) => u.id === id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
    if (isSupabaseConfigured()) {
      supabaseService.deleteUnit(id).catch(console.warn);
    }
    if (unit) {
      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'unit',
        entityId: id,
        entityLabel: unit.name,
        description: `Unidade ${unit.name} excluída`,
      });
    }
  };

  // Municipalities
  const addMunicipality = (munData: Omit<Municipality, 'id'>) => {
    const newMun: Municipality = {
      ...munData,
      id: `mun-${Date.now()}`,
    };
    setMunicipalities((prev) => [...prev, newMun]);
    if (isSupabaseConfigured()) {
      supabaseService.upsertMunicipality(newMun).catch(console.warn);
    }
    logAudit({
      action: 'ADMIN_CHANGE',
      entityType: 'municipality',
      entityId: newMun.id,
      entityLabel: `${newMun.name} - ${newMun.state}`,
      description: `Novo município cadastrado: ${newMun.name}/${newMun.state}`,
    });
  };

  const updateMunicipality = (id: string, munData: Partial<Municipality>) => {
    setMunicipalities((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...munData };
        if (isSupabaseConfigured()) {
          supabaseService.upsertMunicipality(updated).catch(console.warn);
        }
        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'municipality',
          entityId: id,
          entityLabel: `${updated.name} - ${updated.state}`,
          description: `Município ${updated.name} atualizado`,
        });
        return updated;
      })
    );
  };

  const deleteMunicipality = (id: string) => {
    const m = municipalities.find((mun) => mun.id === id);
    setMunicipalities((prev) => prev.filter((mun) => mun.id !== id));
    if (isSupabaseConfigured()) {
      supabaseService.deleteMunicipality(id).catch(console.warn);
    }
    if (m) {
      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'municipality',
        entityId: id,
        entityLabel: `${m.name} - ${m.state}`,
        description: `Município ${m.name} removido`,
      });
    }
  };

  // Procedures
  const addProcedure = (procData: Omit<Procedure, 'id'>) => {
    const newProc: Procedure = {
      ...procData,
      id: `proc-${Date.now()}`,
    };
    setProcedures((prev) => [...prev, newProc]);
    if (isSupabaseConfigured()) {
      supabaseService.upsertProcedure(newProc).catch(console.warn);
    }
    logAudit({
      action: 'ADMIN_CHANGE',
      entityType: 'procedure',
      entityId: newProc.id,
      entityLabel: newProc.name,
      description: `Novo procedimento cadastrado: ${newProc.name} (SIGTAP: ${newProc.codeSigtap || 'N/A'})`,
    });
  };

  const updateProcedure = (id: string, procData: Partial<Procedure>) => {
    setProcedures((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...procData };
        if (isSupabaseConfigured()) {
          supabaseService.upsertProcedure(updated).catch(console.warn);
        }
        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'procedure',
          entityId: id,
          entityLabel: updated.name,
          description: `Procedimento ${updated.name} atualizado`,
        });
        return updated;
      })
    );
  };

  const deleteProcedure = (id: string) => {
    const proc = procedures.find((p) => p.id === id);
    setProcedures((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured()) {
      supabaseService.deleteProcedure(id).catch(console.warn);
    }
    if (proc) {
      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'procedure',
        entityId: id,
        entityLabel: proc.name,
        description: `Procedimento ${proc.name} desativado/removido`,
      });
    }
  };

  // Doctors
  const addDoctor = (docData: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...docData,
      id: `doc-${Date.now()}`,
    };
    setDoctors((prev) => [...prev, newDoc]);
    if (isSupabaseConfigured()) {
      supabaseService.upsertDoctor(newDoc).catch(console.warn);
    }
    logAudit({
      action: 'ADMIN_CHANGE',
      entityType: 'doctor',
      entityId: newDoc.id,
      entityLabel: newDoc.name,
      description: `Médico cadastrado: ${newDoc.name} (CRM ${newDoc.crm}-${newDoc.stateCrm})`,
    });
  };

  const updateDoctor = (id: string, docData: Partial<Doctor>) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d, ...docData };
        if (isSupabaseConfigured()) {
          supabaseService.upsertDoctor(updated).catch(console.warn);
        }
        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'doctor',
          entityId: id,
          entityLabel: updated.name,
          description: `Médico ${updated.name} atualizado`,
        });
        return updated;
      })
    );
  };

  const deleteDoctor = (id: string) => {
    const doc = doctors.find((d) => d.id === id);
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    if (isSupabaseConfigured()) {
      supabaseService.deleteDoctor(id).catch(console.warn);
    }
    if (doc) {
      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'doctor',
        entityId: id,
        entityLabel: doc.name,
        description: `Médico ${doc.name} removido`,
      });
    }
  };

  // Users
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    try {
      const created = await supabaseService.createUser({
        name: userData.name,
        login: userData.login,
        email: userData.email || `${userData.login}@gestao.saude.rj.gov.br`,
        password: userData.password || 'Saude2026@',
        role: userData.role,
        unitIds: userData.unitIds,
        permissions: userData.permissions,
        active: userData.active ?? true,
        mustChangePassword: userData.mustChangePassword,
      });

      if (!created) {
        throw new Error('Falha ao registrar usuário no Supabase Auth e perfis.');
      }

      setUsers((prev) => {
        const next = [...prev.filter((u) => u.id !== created.id), created];
        storageService.saveUsers(next);
        return next;
      });

      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'user',
        entityId: created.id,
        entityLabel: created.name,
        description: `Novo usuário cadastrado no Supabase Auth: ${created.name} (${created.login}) com perfil ${created.role}`,
      });
    } catch (err: any) {
      console.error('Erro ao adicionar usuário:', err);
      alert(`Erro ao cadastrar usuário: ${err.message || 'Erro desconhecido'}`);
      throw err;
    }
  };

  const updateUser = async (id: string, userData: Partial<User> & { password?: string }) => {
    try {
      const updated = await supabaseService.updateUser({ id, ...userData });
      const targetUser = updated || { ...(users.find((u) => u.id === id) as User), ...userData };

      setUsers((prev) => {
        const next = prev.map((u) => (u.id === id ? targetUser : u));
        storageService.saveUsers(next);
        return next;
      });

      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'user',
        entityId: id,
        entityLabel: targetUser.name,
        description: `Dados do usuário ${targetUser.name} (${targetUser.login}) alterados`,
      });
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err);
      alert(`Erro ao atualizar usuário: ${err.message || 'Erro desconhecido'}`);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id);
    try {
      await supabaseService.deleteUser(id);
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== id);
        storageService.saveUsers(next);
        return next;
      });
      if (user) {
        logAudit({
          action: 'ADMIN_CHANGE',
          entityType: 'user',
          entityId: id,
          entityLabel: user.name,
          description: `Usuário ${user.name} excluído do sistema`,
        });
      }
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      alert(`Erro ao excluir usuário: ${err.message || 'Erro desconhecido'}`);
      throw err;
    }
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (isSupabaseConfigured()) {
        supabaseService.saveSettings(updated).catch(console.warn);
      }
      logAudit({
        action: 'ADMIN_CHANGE',
        entityType: 'setting',
        entityId: 'system_settings',
        entityLabel: 'Configurações de Regras Automáticas',
        description: 'Parâmetros de regras automáticas atualizados pelo administrador',
        previousValues: prev,
        newValues: updated,
      });
      return updated;
    });
  };

  const resetAllData = () => {
    storageService.resetAllToDefaults();
    setPatients(storageService.getPatients());
    setUnits(storageService.getUnits());
    setMunicipalities(storageService.getMunicipalities());
    setProcedures(storageService.getProcedures());
    setDoctors(storageService.getDoctors());
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
    setSettings(storageService.getSettings());
  };

  return (
    <AppContext.Provider
      value={{
        patients: visiblePatients,
        databaseMode,
        setDatabaseMode,
        resetSimulationPatients,
        allPatientsCount,
        units,
        municipalities,
        procedures,
        doctors,
        users,
        auditLogs,
        settings,
        supabaseSyncStatus,
        isSupabaseActive: isSupabaseConfigured(),
        syncAllToSupabase,
        reloadFromSupabase,
        addPatient,
        updatePatient,
        deletePatient,
        restorePatient,
        recordStatusChange,
        recordEvolution,
        recordContactAttempt,
        recordAbsence,
        setPatientPriorityOverride,
        addUnit,
        updateUnit,
        deleteUnit,
        addMunicipality,
        updateMunicipality,
        deleteMunicipality,
        addProcedure,
        updateProcedure,
        deleteProcedure,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
