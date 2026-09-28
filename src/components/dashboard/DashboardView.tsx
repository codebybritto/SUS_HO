import React, { useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  CheckCircle,
  Clock,
  UserX,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneOff,
} from 'lucide-react';
import { Patient } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getStatusStyle } from '../../utils/statusColors';

interface DashboardViewProps {
  onSelectPatient: (patient: Patient) => void;
  onNavigateToPatientsWithFilter: (status: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectPatient,
  onNavigateToPatientsWithFilter,
}) => {
  const { patients, units, procedures } = useApp();
  const { allowedUnits, activeUnitId } = useAuth();

  const allowedUnitIds = useMemo(() => allowedUnits.map((u) => u.id), [allowedUnits]);

  // Scoped patients by user authorization & active unit
  const scopedPatients = useMemo(() => {
    return patients.filter((p) => {
      if (p.isDeleted) return false;
      if (!allowedUnitIds.includes(p.unitId)) return false;
      if (activeUnitId !== 'ALL' && p.unitId !== activeUnitId) return false;
      return true;
    });
  }, [patients, allowedUnitIds, activeUnitId]);

  // Key KPI calculations
  const total = scopedPatients.length;
  const agendados = scopedPatients.filter((p) => p.currentStatus === 'Agendado').length;
  const regulados = scopedPatients.filter((p) => p.currentStatus === 'Regulado').length;
  const aguardandoMicrologos = scopedPatients.filter(
    (p) => p.currentStatus === 'Aguardando Micrologos' || p.currentStatus === 'Micrologos'
  ).length;

  // Requirement: Pacientes que NÃO tiveram nenhuma interação (zero contatos e zero evoluções pós-cadastro)
  const pacientesSemInteracao = useMemo(() => {
    return scopedPatients.filter(
      (p) => p.contactAttempts.length === 0 && p.evolutions.length === 0 && p.totalAbsences === 0
    );
  }, [scopedPatients]);
  const totalSemInteracao = pacientesSemInteracao.length;

  const aguardandoContato = scopedPatients.filter(
    (p) => p.currentStatus === 'Aguardando Contato'
  ).length;
  const faltaram = scopedPatients.filter((p) => p.currentStatus === 'Faltou').length;
  const doentes = scopedPatients.filter((p) => p.currentStatus === 'Doente').length;
  const desistencias = scopedPatients.filter((p) => p.currentStatus === 'Desistência').length;
  const obitos = scopedPatients.filter((p) => p.currentStatus === 'Óbito').length;
  const concluidos = scopedPatients.filter((p) => p.currentStatus === 'Concluído').length;

  const urgentes = scopedPatients.filter((p) => p.isUrgent);

  // Group by procedure
  const byProcedure = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedPatients.forEach((p) => {
      if (p.procedures && p.procedures.length > 0) {
        p.procedures.forEach((proc) => {
          counts[proc.procedureName] = (counts[proc.procedureName] || 0) + 1;
        });
      } else {
        const name = p.requestedProcedureName || 'Outro';
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scopedPatients]);

  // Group by city
  const byCity = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedPatients.forEach((p) => {
      const city = p.city || 'Não informada';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [scopedPatients]);

  // Group by unit
  const byUnit = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedPatients.forEach((p) => {
      const uName = p.unitName || 'Geral';
      counts[uName] = (counts[uName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scopedPatients]);

  return (
    <div className="space-y-6">
      {/* Scope banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Painel Executivo de Regulação & Acompanhamento
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            {activeUnitId === 'ALL'
              ? `Consolidado de ${allowedUnits.length} unidade(s) sob sua responsabilidade`
              : allowedUnits.find((u) => u.id === activeUnitId)?.name}
          </h2>
        </div>
      </div>

      {/* Primary KPI Cards (5 balanced cards: Contatos removed, Faltas replaced by Sem Interação, Aguardando Micrologos updated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Pacientes */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('ALL')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Pacientes</span>
            <Users className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{total}</div>
          <div className="text-[11px] text-cyan-700 font-semibold mt-1">Na fila e acompanhamento</div>
        </div>

        {/* Agendados */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Agendado')}
          className="bg-sky-50/50 p-4 rounded-xl border border-sky-200 shadow-xs hover:border-sky-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Agendados</span>
            <CalendarCheck className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-sky-950">{agendados}</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">Com data confirmada</div>
        </div>

        {/* Regulados */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Regulado')}
          className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Regulados</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-emerald-950">{regulados}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Autorizados pela regulação</div>
        </div>

        {/* Aguardando Micrologos (Updated status) */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Aguardando Micrologos')}
          className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Aguardando Micrologos
            </span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-950">{aguardandoMicrologos}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            2 faltas ou 3 contatos s/ êxito
          </div>
        </div>

        {/* Sem Nenhuma Interação (Replaced Faltas card as requested) */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('SEM_INTERACAO')}
          className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Sem Interação
            </span>
            <PhoneOff className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-rose-950">{totalSemInteracao}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {total > 0 ? Math.round((totalSemInteracao / total) * 100) : 0}% aguardando 1º contato
          </div>
        </div>
      </div>

      {/* Secondary Status Strip with Distinct Colors for each status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div
          onClick={() => onNavigateToPatientsWithFilter('Aguardando Contato')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600 font-medium">Aguardando Contato:</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">{aguardandoContato}</span>
        </div>

        <div
          onClick={() => onNavigateToPatientsWithFilter('Doente')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-yellow-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-slate-600 font-medium">Doente:</span>
          </div>
          <span className="font-bold text-amber-800 text-sm">{doentes}</span>
        </div>

        <div
          onClick={() => onNavigateToPatientsWithFilter('Desistência')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-slate-600 font-medium">Desistências:</span>
          </div>
          <span className="font-bold text-purple-900 text-sm">{desistencias}</span>
        </div>

        <div
          onClick={() => onNavigateToPatientsWithFilter('Faltou')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Faltas Ocorridas:</span>
          </div>
          <span className="font-bold text-rose-800 text-sm">{faltaram}</span>
        </div>

        <div
          onClick={() => onNavigateToPatientsWithFilter('Óbito')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            <span className="text-slate-600 font-medium">Óbitos:</span>
          </div>
          <span className="font-bold text-slate-800 text-sm">{obitos}</span>
        </div>

        <div
          onClick={() => onNavigateToPatientsWithFilter('Concluído')}
          className="bg-white p-3 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-slate-600 font-medium">Concluídos:</span>
          </div>
          <span className="font-bold text-teal-800 text-sm">{concluidos}</span>
        </div>
      </div>

      {/* Action alerts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Patients List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900">
                Casos com Marcação URGENTE ({urgentes.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToPatientsWithFilter('URGENTE')}
              className="text-xs text-cyan-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {urgentes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Nenhum paciente classificado como urgente pendente.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {urgentes.slice(0, 4).map((p) => {
                const statusStyle = getStatusStyle(p.currentStatus);
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPatient(p)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {p.requestedProcedureName}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusStyle.badgeClass}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Breakdowns by Procedure */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">Demanda por Procedimento</h3>
            <span className="text-xs text-slate-400">{byProcedure.length} tipos</span>
          </div>

          <div className="space-y-3">
            {byProcedure.slice(0, 5).map(([name, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium truncate max-w-[200px]" title={name}>
                      {name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdowns by City */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">Municípios de Origem</h3>
            <span className="text-xs text-slate-400">Top 5</span>
          </div>

          <div className="space-y-3">
            {byCity.map(([city, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">{city}</span>
                    <span className="font-bold text-slate-900">
                      {count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
