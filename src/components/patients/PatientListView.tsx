import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  PhoneCall,
  CalendarX,
  Activity,
  UserPlus,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Clock,
  ChevronDown,
  Building2,
  Calendar,
  MoreHorizontal,
  FastForward,
  Star,
  ArrowUpCircle,
  X,
} from 'lucide-react';
import { Patient, PatientStatus, EyeSide } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateBR, formatDateTimeBR, calculateAge } from '../../utils/date';
import { getStatusStyle } from '../../utils/statusColors';

interface PatientListViewProps {
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
  onRecordEvolution: (patient: Patient) => void;
  onRecordContact: (patient: Patient) => void;
  onRecordAbsence: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  initialStatusFilter?: string;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  onSelectPatient,
  onNewPatient,
  onRecordEvolution,
  onRecordContact,
  onRecordAbsence,
  onEditPatient,
  initialStatusFilter = 'ALL',
}) => {
  const {
    patients,
    units,
    procedures,
    doctors,
    settings,
    setPatientPriorityOverride,
    recordStatusChange,
  } = useApp();
  const { currentUser, allowedUnits, activeUnitId, hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [unitFilter, setUnitFilter] = useState<string>(activeUnitId);
  const [procedureFilter, setProcedureFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [absenceFilter, setAbsenceFilter] = useState<string>('ALL');
  const [contactFilter, setContactFilter] = useState<string>('ALL');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Manager Priority Override Modal state
  const [priorityModalPatient, setPriorityModalPatient] = useState<Patient | null>(null);
  const [priorityReason, setPriorityReason] = useState<string>('');

  // Completion Modal state (Ação Rápida Concluído)
  const [completeModalPatient, setCompleteModalPatient] = useState<Patient | null>(null);
  const [completionOutcome, setCompletionOutcome] = useState<string>('Procedimento Realizado com Sucesso');
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const handleOpenCompleteModal = (patient: Patient) => {
    setCompleteModalPatient(patient);
    setCompletionOutcome('Procedimento Realizado com Sucesso');
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setCompletionNotes('');
  };

  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalPatient) return;
    setIsCompleting(true);
    try {
      const parts = [
        `Desfecho: ${completionOutcome}`,
        completionDate ? `Data: ${formatDateBR(completionDate)}` : '',
        completionNotes ? `Obs: ${completionNotes.trim()}` : '',
      ].filter(Boolean);

      recordStatusChange(completeModalPatient.id, 'Concluído', parts.join(' | '));
      setCompleteModalPatient(null);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReopenPatient = () => {
    if (!completeModalPatient) return;
    recordStatusChange(
      completeModalPatient.id,
      'Agendado',
      'Atendimento reaberto na fila cirúrgica/ambulatorial pela equipe.'
    );
    setCompleteModalPatient(null);
  };

  const canManagePriority =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'supervisor' ||
    hasPermission('change_patient_status') ||
    hasPermission('edit_patients');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Sorting: 'priority' (Fila de Atendimento) is the default order!
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'date' | 'status' | 'urgency' | 'absences'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Keep unitFilter in sync with activeUnitId from header
  React.useEffect(() => {
    setUnitFilter(activeUnitId);
  }, [activeUnitId]);

  // Keep statusFilter in sync if initialStatusFilter changes
  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const allowedUnitIds = useMemo(() => allowedUnits.map((u) => u.id), [allowedUnits]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        if (!allowedUnitIds.includes(p.unitId)) return false;
        if (unitFilter !== 'ALL' && p.unitId !== unitFilter) return false;
        if (!showDeleted && p.isDeleted) return false;
        if (showDeleted && !p.isDeleted) return false;

        // Search text (CNS and CPF removed)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesCity = p.city?.toLowerCase().includes(q);
          const matchesProc = p.requestedProcedureName.toLowerCase().includes(q);
          const matchesDoctor = p.requestingDoctorName?.toLowerCase().includes(q);
          if (!matchesName && !matchesCity && !matchesProc && !matchesDoctor) return false;
        }

        // Status filter (including Aguardando Micrologos and SEM_INTERACAO)
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'Aguardando Micrologos') {
            if (p.currentStatus !== 'Aguardando Micrologos' && p.currentStatus !== 'Micrologos') {
              return false;
            }
          } else if (statusFilter === 'SEM_INTERACAO') {
            if (p.contactAttempts.length !== 0 || p.evolutions.length !== 0 || p.totalAbsences !== 0) {
              return false;
            }
          } else if (statusFilter === 'URGENTE') {
            if (!p.isUrgent) return false;
          } else if (p.currentStatus !== statusFilter) {
            return false;
          }
        }

        // Procedure filter
        if (procedureFilter !== 'ALL') {
          const matchesPrimary = p.requestedProcedureId === procedureFilter;
          const matchesList = p.procedures?.some((pr) => pr.procedureId === procedureFilter);
          if (!matchesPrimary && !matchesList) return false;
        }

        // Urgency filter
        if (urgencyFilter === 'urgent' && !p.isUrgent) return false;
        if (urgencyFilter === 'normal' && p.isUrgent) return false;

        // Absences filter
        if (absenceFilter === '0' && p.totalAbsences !== 0) return false;
        if (absenceFilter === '1' && p.totalAbsences !== 1) return false;
        if (absenceFilter === '2plus' && p.totalAbsences < 2) return false;

        // Contact attempts filter
        if (contactFilter === '0' && p.contactAttempts.length !== 0) return false;
        if (contactFilter === '1' && p.contactAttempts.length !== 1) return false;
        if (contactFilter === '2' && p.contactAttempts.length !== 2) return false;
        if (contactFilter === '3' && p.contactAttempts.length !== 3) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          // 1. Manager priority overrides come first
          const aOverride = a.isPriorityOverride ? 1 : 0;
          const bOverride = b.isPriorityOverride ? 1 : 0;
          if (aOverride !== bOverride) {
            return sortOrder === 'asc' ? bOverride - aOverride : aOverride - bOverride;
          }
          if (a.isPriorityOverride && b.isPriorityOverride) {
            const aOrd = a.priorityOrder ?? 1;
            const bOrd = b.priorityOrder ?? 1;
            if (aOrd !== bOrd) return sortOrder === 'asc' ? aOrd - bOrd : bOrd - aOrd;
            const aTime = a.priorityOverrideAt || a.createdAt;
            const bTime = b.priorityOverrideAt || b.createdAt;
            return sortOrder === 'asc' ? aTime.localeCompare(bTime) : bTime.localeCompare(aTime);
          }
          // 2. Chronological registration priority (earliest registered = 1st priority in queue)
          const aReg = a.createdAt || a.requestedDate || '';
          const bReg = b.createdAt || b.requestedDate || '';
          const cmp = aReg.localeCompare(bReg);
          return sortOrder === 'asc' ? cmp : -cmp;
        }

        let cmp = 0;
        if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'date') cmp = a.requestedDate.localeCompare(b.requestedDate);
        else if (sortBy === 'status') cmp = a.currentStatus.localeCompare(b.currentStatus);
        else if (sortBy === 'urgency') cmp = (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
        else if (sortBy === 'absences') cmp = a.totalAbsences - b.totalAbsences;
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    patients,
    allowedUnitIds,
    unitFilter,
    showDeleted,
    searchTerm,
    statusFilter,
    procedureFilter,
    urgencyFilter,
    absenceFilter,
    contactFilter,
    sortBy,
    sortOrder,
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    unitFilter,
    procedureFilter,
    urgencyFilter,
    absenceFilter,
    contactFilter,
    showDeleted,
  ]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    procedureFilter !== 'ALL' ||
    urgencyFilter !== 'ALL' ||
    absenceFilter !== 'ALL' ||
    contactFilter !== 'ALL' ||
    showDeleted ||
    searchTerm.trim().length > 0;

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setProcedureFilter('ALL');
    setUrgencyFilter('ALL');
    setAbsenceFilter('ALL');
    setContactFilter('ALL');
    setShowDeleted(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search without CNS/CPF */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome do paciente, município, procedimento ou médico..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-cyan-600" />
              <span>Filtros Avançados</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-cyan-600 ml-1" />}
            </button>

            {hasPermission('create_patients') && (
              <button
                type="button"
                onClick={onNewPatient}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Novo Paciente</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Drawer */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* Unidade */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Unidade</label>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">Todas as Unidades</option>
                {allowedUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (with Aguardando Micrologos & Sem Interação) */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Condição / Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">Todos os Status</option>
                <option value="Aguardando Contato">Aguardando Contato</option>
                <option value="Agendado">Agendado</option>
                <option value="Regulado">Regulado</option>
                <option value="Aguardando Micrologos">Aguardando Micrologos</option>
                <option value="SEM_INTERACAO">Sem Nenhuma Interação</option>
                <option value="Doente">Doente</option>
                <option value="Faltou">Faltou</option>
                <option value="Desistência">Desistência</option>
                <option value="Óbito">Óbito</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            {/* Procedimento */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Procedimento</label>
              <select
                value={procedureFilter}
                onChange={(e) => setProcedureFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">Todos os Procedimentos</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgência */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Prioridade</label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">Todas as Prioridades</option>
                <option value="urgent">Apenas URGENTES</option>
                <option value="normal">Apenas Eletivos / Normais</option>
              </select>
            </div>

            {/* Faltas */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Faltas</label>
              <select
                value={absenceFilter}
                onChange={(e) => setAbsenceFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">Todas as Faltas</option>
                <option value="0">Sem faltas (0)</option>
                <option value="1">1 Falta</option>
                <option value="2plus">2 ou mais faltas</option>
              </select>
            </div>

            {/* Tentativas de Contato */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Contatos</label>
              <select
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">Todas as tentativas</option>
                <option value="0">0 Tentativas (Sem Contato)</option>
                <option value="1">1ª Tentativa</option>
                <option value="2">2ª Tentativa</option>
                <option value="3">3 Tentativas (Limite)</option>
              </select>
            </div>

            {/* Inativos / Reset */}
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-6 flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Exibir pacientes inativados / excluídos logicamente</span>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-slate-500 hover:text-cyan-700 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Patients Data Table (CNS/CPF removed) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-600">
            Mostrando <strong>{filteredPatients.length}</strong> de {patients.length} pacientes
            {unitFilter !== 'ALL' && (
              <span> · Unidade: {units.find((u) => u.id === unitFilter)?.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-semibold text-slate-600">Ordenar por:</span>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'priority') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('priority');
                  setSortOrder('asc');
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                sortBy === 'priority'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title="Ordem de Fila / Prioridade: Prioridades da gerência primeiro, seguidas por ordem cronológica de cadastro (mais antigo primeiro)"
            >
              <Star className={`w-3.5 h-3.5 ${sortBy === 'priority' ? 'fill-amber-300 text-amber-300' : 'text-amber-500'}`} />
              <span>Prioridade da Fila</span>
              {sortBy === 'priority' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium ${
                sortBy === 'name' ? 'bg-cyan-100 text-cyan-900 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Nome {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium ${
                sortBy === 'date' ? 'bg-cyan-100 text-cyan-900 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Data Solicitada {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'status') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else {
                  setSortBy('status');
                  setSortOrder('asc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium ${
                sortBy === 'status' ? 'bg-cyan-100 text-cyan-900 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Status {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">Nenhum paciente localizado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tente alterar os termos de pesquisa ou limpar os filtros ativos para visualizar os pacientes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Paciente</th>
                  <th className="py-3 px-4 font-semibold min-w-[220px]">Procedimento(s) Solicitado(s)</th>
                  <th className="py-3 px-3 font-semibold text-center whitespace-nowrap min-w-[105px]">Olho</th>
                  <th className="py-3 px-4 font-semibold">Unidade Responsável</th>
                  <th className="py-3 px-4 font-semibold text-center">Faltas</th>
                  <th className="py-3 px-4 font-semibold text-center">Contatos</th>
                  <th className="py-3 px-4 font-semibold">Condição / Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPatients.map((pat, idx) => {
                  const age = calculateAge(pat.birthDate);
                  const statusStyle = getStatusStyle(pat.currentStatus);
                  const queueIndex = (currentPage - 1) * pageSize + idx;

                  return (
                    <tr
                      key={pat.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(pat)}
                    >
                      {/* Name & Basic Info + Queue position & Priority badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-[11px] font-bold font-mono ${
                              pat.isPriorityOverride
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                            title={`Posição na fila: ${queueIndex + 1}º lugar`}
                          >
                            {queueIndex + 1}º
                          </span>
                          <span className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition-colors">
                            {pat.name}
                          </span>
                          {pat.isPriorityOverride && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs"
                              title={
                                pat.priorityOverrideReason
                                  ? `Prioridade Gerencial (${pat.priorityOverrideBy || 'Gerência'}): "${pat.priorityOverrideReason}"`
                                  : `Prioridade Gerencial definida por ${pat.priorityOverrideBy || 'Gerência'}`
                              }
                            >
                              <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                              Passado na Frente
                            </span>
                          )}
                          {pat.isUrgent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                              URGENTE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{age !== null ? `${age} anos` : 'Idade N/D'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDateBR(pat.birthDate)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">{pat.city}</span>
                        </div>
                      </td>

                      {/* Procedures list */}
                      <td className="py-3 px-4">
                        {pat.procedures && pat.procedures.length > 0 ? (
                          <div className="space-y-1.5">
                            {pat.procedures.map((pr) => (
                              <div key={pr.id} className="min-h-[22px] flex items-center">
                                <span className="font-medium text-slate-800 line-clamp-1" title={pr.procedureName}>
                                  {pr.procedureName}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="min-h-[22px] flex items-center">
                            <span className="font-medium text-slate-800">{pat.requestedProcedureName}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          Solicitado em {formatDateBR(pat.requestedDate)}
                        </div>
                      </td>

                      {/* Olho / Lateralidade (dedicated aligned column) */}
                      <td className="py-3 px-3 text-center align-top pt-3.5">
                        {pat.procedures && pat.procedures.length > 0 ? (
                          <div className="space-y-1.5 flex flex-col items-center">
                            {pat.procedures.map((pr) => {
                              const eyeLabel =
                                pr.eyeSide === 'AO' ? 'AO (Ambos)' : pr.eyeSide === 'OD' ? 'OD (Dir)' : 'OE (Esq)';
                              const eyeBadgeStyle =
                                pr.eyeSide === 'AO'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : pr.eyeSide === 'OD'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                              return (
                                <div key={pr.id} className="min-h-[22px] flex items-center justify-center">
                                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${eyeBadgeStyle} whitespace-nowrap shadow-2xs`}>
                                    {eyeLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="min-h-[22px] flex items-center justify-center">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                              pat.eyeSide === 'AO'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : pat.eyeSide === 'OD'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            } whitespace-nowrap shadow-2xs`}>
                              {pat.eyeSide === 'AO' ? 'AO (Ambos)' : pat.eyeSide === 'OD' ? 'OD (Dir)' : 'OE (Esq)'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium truncate max-w-[200px]">{pat.unitName}</div>
                        <div className="text-[11px] text-slate-400">
                          {pat.requestingDoctorName ? `Dr(a). ${pat.requestingDoctorName}` : 'Sem médico'}
                        </div>
                      </td>

                      {/* Absences Counter */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            pat.totalAbsences >= 2
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : pat.totalAbsences === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {pat.totalAbsences}
                        </span>
                      </td>

                      {/* Contact Attempts Counter */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            pat.contactAttempts.length >= 3
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : pat.contactAttempts.length > 0
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {pat.contactAttempts.length}/{settings.maxContactAttempts}
                        </span>
                      </td>

                      {/* Status Badge with Distinct Color */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.badgeClass}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusStyle.dotColor }}
                          />
                          <span>{statusStyle.label}</span>
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {canManagePriority && (
                            <button
                              type="button"
                              onClick={() => {
                                setPriorityModalPatient(pat);
                                setPriorityReason(pat.priorityOverrideReason || '');
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                pat.isPriorityOverride
                                  ? 'text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={
                                pat.isPriorityOverride
                                  ? `Gerenciar / Cancelar prioridade gerencial de ${pat.name}`
                                  : `Passar ${pat.name} na frente da fila (Prioridade Gerencial)`
                              }
                            >
                              <FastForward className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRecordEvolution(pat)}
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 rounded transition-colors"
                            title="Registrar Tratativa / Evolução"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRecordContact(pat)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors"
                            title="Registrar Tentativa de Contato"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRecordAbsence(pat)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                            title="Registrar Falta"
                          >
                            <CalendarX className="w-3.5 h-3.5" />
                          </button>
                          {/* Ação Rápida: Concluído */}
                          <button
                            type="button"
                            onClick={() => handleOpenCompleteModal(pat)}
                            className={`p-1.5 rounded transition-colors ${
                              pat.currentStatus === 'Concluído'
                                ? 'text-teal-700 bg-teal-100 hover:bg-teal-200 ring-1 ring-teal-400/40'
                                : 'text-slate-500 hover:text-teal-700 hover:bg-teal-50'
                            }`}
                            title={
                              pat.currentStatus === 'Concluído'
                                ? 'Atendimento Concluído (Clique para gerenciar)'
                                : 'Marcar como Concluído'
                            }
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${pat.currentStatus === 'Concluído' ? 'stroke-[2.5]' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredPatients.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Exibir</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>por página</span>
              <span className="text-slate-400">·</span>
              <span>
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (
                {filteredPatients.length} pacientes)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-medium text-xs transition-colors"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                          currentPage === p
                            ? 'bg-cyan-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-medium text-xs transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: PASSAR PACIENTE NA FRENTE DA FILA */}
      {priorityModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FastForward className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {priorityModalPatient.isPriorityOverride ? 'Gerenciar Prioridade na Fila' : 'Passar Paciente na Frente'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPriorityModalPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs text-slate-500 font-medium">Paciente Selecionado:</div>
                <div className="font-bold text-slate-900 text-base mt-0.5">{priorityModalPatient.name}</div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                  <span>{priorityModalPatient.city}</span>
                  <span>·</span>
                  <span>{priorityModalPatient.unitName}</span>
                  <span>·</span>
                  <span>Cadastrado em {formatDateTimeBR(priorityModalPatient.createdAt)}</span>
                </div>
              </div>

              {priorityModalPatient.isPriorityOverride ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Paciente atualmente prioritário na fila</span>
                  </div>
                  <div>Priorizado por: <strong>{priorityModalPatient.priorityOverrideBy || 'Gerência'}</strong></div>
                  {priorityModalPatient.priorityOverrideAt && (
                    <div>Em: {formatDateTimeBR(priorityModalPatient.priorityOverrideAt)}</div>
                  )}
                  {priorityModalPatient.priorityOverrideReason && (
                    <div>Motivo informado: <em>"{priorityModalPatient.priorityOverrideReason}"</em></div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-blue-900">
                  <p>
                    <strong>Ação de Gerência:</strong> Ao confirmar, este paciente receberá prioridade especial e será posicionado no início da fila de regulação, à frente dos demais pacientes da unidade.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Justificativa / Motivo da Priorização:
                </label>
                <textarea
                  rows={2}
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  placeholder="Ex: Determinação médica para cirurgia imediata, ordem judicial, gravidade..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-none text-slate-800"
                />

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    'Determinação Médica',
                    'Urgência Clínica',
                    'Decisão Judicial',
                    'Idoso / Prioridade Legal',
                    'Reavaliação Pós-Procedimento',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPriorityReason(preset)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {priorityModalPatient.isPriorityOverride ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remover a prioridade especial de ${priorityModalPatient.name}? O paciente voltará à posição cronológica normal na fila.`)) {
                        setPatientPriorityOverride(priorityModalPatient.id, false);
                        setPriorityModalPatient(null);
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Remover Prioridade (Voltar à Fila)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPriorityModalPatient(null)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPatientPriorityOverride(
                      priorityModalPatient.id,
                      true,
                      priorityReason.trim() || undefined
                    );
                    setPriorityModalPatient(null);
                    setPriorityReason('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>
                    {priorityModalPatient.isPriorityOverride ? 'Atualizar Justificativa' : 'Confirmar e Passar na Frente'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Concluir Atendimento do Paciente */}
      {completeModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {completeModalPatient.currentStatus === 'Concluído'
                      ? 'Gerenciar Atendimento Concluído'
                      : 'Concluir Atendimento'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{completeModalPatient.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModalPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleConfirmCompletion} className="p-5 space-y-4 text-xs">
              {/* Patient Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Procedimento:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[240px]">
                    {completeModalPatient.requestedProcedureName || 'Procedimento Geral'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Olho:</span>
                  <span className="font-bold text-slate-800">{completeModalPatient.eyeSide}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Município / Polo:</span>
                  <span className="font-medium text-slate-700">{completeModalPatient.city} ({completeModalPatient.unitName})</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Status Atual:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusStyle(completeModalPatient.currentStatus).badgeClass}`}>
                    {completeModalPatient.currentStatus}
                  </span>
                </div>
              </div>

              {completeModalPatient.currentStatus === 'Concluído' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">Este paciente já está com o atendimento Concluído.</p>
                      <p className="text-teal-700 mt-0.5">Você pode atualizar as observações ou reabrir o paciente na fila caso necessite de novo procedimento.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Anotações / Observações Adicionais
                    </label>
                    <textarea
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Observações adicionais sobre o pós-operatório..."
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleReopenPatient}
                      className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                      title="Voltar o paciente para a fila ativa"
                    >
                      Reabrir na Fila
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCompleteModalPatient(null)}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Fechar
                      </button>
                      <button
                        type="submit"
                        disabled={isCompleting}
                        className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Salvar Anotação</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Desfecho do Atendimento *
                    </label>
                    <select
                      value={completionOutcome}
                      onChange={(e) => setCompletionOutcome(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    >
                      <option value="Procedimento Realizado com Sucesso">Procedimento Realizado com Sucesso</option>
                      <option value="Alta Médica / Tratamento Concluído">Alta Médica / Tratamento Concluído</option>
                      <option value="Cirurgia Concluída - Pós-Operatório Agendado">Cirurgia Concluída - Pós-Operatório Agendado</option>
                      <option value="Procedimento Realizado em Outra Unidade">Procedimento Realizado em Outra Unidade</option>
                      <option value="Outro Desfecho Concluído">Outro Desfecho Concluído</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Data da Realização / Conclusão *
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Observações Clínicas / Pós-Operatório
                    </label>
                    <textarea
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Ex: Procedimento cirúrgico concluído sem intercorrências..."
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCompleteModalPatient(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCompleting}
                      className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar Conclusão</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
