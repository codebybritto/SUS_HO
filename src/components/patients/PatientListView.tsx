import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
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
} from 'lucide-react';
import { Patient, PatientStatus, EyeSide } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateBR, calculateAge } from '../../utils/date';
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
  const { patients, units, procedures, doctors, settings } = useApp();
  const { allowedUnits, activeUnitId, hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [unitFilter, setUnitFilter] = useState<string>(activeUnitId);
  const [procedureFilter, setProcedureFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [absenceFilter, setAbsenceFilter] = useState<string>('ALL');
  const [contactFilter, setContactFilter] = useState<string>('ALL');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'urgency' | 'absences'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Ordenar por:</span>
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
                  <th className="py-3 px-4 font-semibold">Procedimento(s) Solicitado(s)</th>
                  <th className="py-3 px-4 font-semibold">Unidade Responsável</th>
                  <th className="py-3 px-4 font-semibold text-center">Faltas</th>
                  <th className="py-3 px-4 font-semibold text-center">Contatos</th>
                  <th className="py-3 px-4 font-semibold">Condição / Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPatients.map((pat) => {
                  const age = calculateAge(pat.birthDate);
                  const statusStyle = getStatusStyle(pat.currentStatus);

                  return (
                    <tr
                      key={pat.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(pat)}
                    >
                      {/* Name & Basic Info (CNS and CPF removed) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition-colors">
                            {pat.name}
                          </span>
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

                      {/* Procedures & Lateralities (Multi-procedure support) */}
                      <td className="py-3 px-4">
                        {pat.procedures && pat.procedures.length > 0 ? (
                          <div className="space-y-1">
                            {pat.procedures.map((pr) => (
                              <div key={pr.id} className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-800">{pr.procedureName}</span>
                                <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-100 text-slate-700 font-bold border border-slate-300">
                                  {pr.eyeSide === 'AO' ? 'AO (Ambos)' : pr.eyeSide === 'OD' ? 'OD (Dir)' : 'OE (Esq)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-800">{pat.requestedProcedureName}</span>
                            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-100 text-slate-700 font-bold border border-slate-300">
                              {pat.eyeSide}
                            </span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Solicitado em {formatDateBR(pat.requestedDate)}
                        </div>
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
                          <button
                            type="button"
                            onClick={() => onSelectPatient(pat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Ver Detalhes e Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
    </div>
  );
};
