import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  PhoneOff,
  MapPin,
  Building2,
  Activity,
  BarChart3,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onSelectPatient: (patient: Patient) => void;
  onNavigateToPatientsWithFilter: (status: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectPatient: _onSelectPatient,
  onNavigateToPatientsWithFilter,
}) => {
  const { patients, units, municipalities } = useApp();
  const { allowedUnits, activeUnitId, setActiveUnitId } = useAuth();

  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const allowedUnitIds = useMemo(() => allowedUnits.map((u) => u.id), [allowedUnits]);

  // Municipalities strictly available for the active unit or all authorized units
  const availableCities = useMemo(() => {
    const set = new Set<string>();

    if (activeUnitId !== 'ALL') {
      const targetUnit = units.find((u) => u.id === activeUnitId);
      if (targetUnit?.municipalities && targetUnit.municipalities.length > 0) {
        targetUnit.municipalities.forEach((m) => {
          if (m && m.trim()) set.add(m.trim());
        });
      } else {
        municipalities.forEach((m) => {
          if (m.name && m.active !== false) set.add(m.name.trim());
        });
      }
    } else {
      const accessibleUnits = allowedUnits.length > 0 ? allowedUnits : units;
      let hasUnitSpecificMunicipalities = false;

      accessibleUnits.forEach((u) => {
        if (u.municipalities && u.municipalities.length > 0) {
          hasUnitSpecificMunicipalities = true;
          u.municipalities.forEach((m) => {
            if (m && m.trim()) set.add(m.trim());
          });
        }
      });

      if (!hasUnitSpecificMunicipalities || set.size === 0) {
        municipalities.forEach((m) => {
          if (m.name && m.active !== false) set.add(m.name.trim());
        });
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [activeUnitId, units, allowedUnits, municipalities]);

  // Reset selectedCity when activeUnitId changes if current city is not in available list
  useEffect(() => {
    if (selectedCity !== 'ALL' && !availableCities.includes(selectedCity)) {
      setSelectedCity('ALL');
    }
  }, [availableCities, selectedCity]);

  // Scoped patients filtered by user authorization, active unit AND selected municipality
  const scopedPatients = useMemo(() => {
    return patients.filter((p) => {
      if (p.isDeleted) return false;
      if (!allowedUnitIds.includes(p.unitId)) return false;
      if (activeUnitId !== 'ALL' && p.unitId !== activeUnitId) return false;
      if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;
      return true;
    });
  }, [patients, allowedUnitIds, activeUnitId, selectedCity]);

  // 6 Required Metrics
  const total = scopedPatients.length;
  const agendados = scopedPatients.filter((p) => p.currentStatus === 'Agendado').length;
  const regulados = scopedPatients.filter((p) => p.currentStatus === 'Regulado').length;
  const aguardandoMicrologos = scopedPatients.filter(
    (p) => p.currentStatus === 'Aguardando Micrologos' || p.currentStatus === 'Micrologos'
  ).length;
  const totalSemInteracao = scopedPatients.filter(
    (p) => p.contactAttempts.length === 0 && p.evolutions.length === 0 && p.totalAbsences === 0
  ).length;
  const totalUrgentes = scopedPatients.filter((p) => p.isUrgent).length;

  // Breakdown by procedure
  const byProcedure = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedPatients.forEach((p) => {
      if (p.procedures && p.procedures.length > 0) {
        p.procedures.forEach((proc) => {
          const name = proc.procedureName || 'Procedimento';
          counts[name] = (counts[name] || 0) + 1;
        });
      } else {
        const name = p.requestedProcedureName || 'Procedimento Geral';
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scopedPatients]);

  // Breakdown by municipality
  const byCity = useMemo(() => {
    const counts: Record<string, number> = {};

    // Initialize all available cities with 0 to ensure they appear
    availableCities.forEach((city) => {
      counts[city] = 0;
    });

    scopedPatients.forEach((p) => {
      const city = p.city ? p.city.trim() : 'Outros';
      counts[city] = (counts[city] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([city]) => selectedCity === 'ALL' || city === selectedCity)
      .sort((a, b) => b[1] - a[1]);
  }, [scopedPatients, availableCities, selectedCity]);

  // Pipeline distribution percentages
  const pctRegulados = total > 0 ? Math.round((regulados / total) * 100) : 0;
  const pctAgendados = total > 0 ? Math.round((agendados / total) * 100) : 0;
  const pctMicrologos = total > 0 ? Math.round((aguardandoMicrologos / total) * 100) : 0;
  const pctSemInteracao = total > 0 ? Math.round((totalSemInteracao / total) * 100) : 0;
  const pctOutros = Math.max(0, 100 - (pctRegulados + pctAgendados + pctMicrologos + pctSemInteracao));

  return (
    <div className="space-y-6">
      {/* Header with Title and Dynamic Scope Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Painel de Acompanhamento Oftalmológico
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Indicadores & Regulação Clínica
          </h1>
        </div>

        {/* Dynamic Filters: Unit & Municipality */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit selector */}
          {allowedUnits.length > 1 ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Unidade</span>
                <select
                  value={activeUnitId}
                  onChange={(e) => setActiveUnitId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Todas as Unidades Autorizadas</option>
                  {allowedUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            allowedUnits.length === 1 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Unidade</span>
                  <span className="text-xs font-bold text-slate-800">{allowedUnits[0].name}</span>
                </div>
              </div>
            )
          )}

          {/* Municipality Selector */}
          <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-1.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-blue-600 uppercase">Município</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-blue-950 focus:outline-none cursor-pointer min-w-[170px]"
              >
                <option value="ALL">
                  {activeUnitId === 'ALL'
                    ? 'Todos os Municípios Habilitados'
                    : 'Todos os Municípios da Unidade'}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Pacientes */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('ALL')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para ver todos os pacientes"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{total}</div>
            <div className="text-[11px] text-blue-700 font-medium mt-1 truncate">Total Pacientes</div>
          </div>
        </div>

        {/* 2. Agendados */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Agendado')}
          className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para filtrar por Agendados"
        >
          <div className="flex items-center justify-between text-sky-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Agendados</span>
            <CalendarCheck className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">{agendados}</div>
            <div className="text-[11px] text-sky-700 font-medium mt-1 truncate">Data confirmada</div>
          </div>
        </div>

        {/* 3. Regulados */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Regulado')}
          className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para filtrar por Regulados"
        >
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Regulados</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">{regulados}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 truncate">Autorizados</div>
          </div>
        </div>

        {/* 4. Aguardando Micrologos */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('Aguardando Micrologos')}
          className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para filtrar Aguardando Micrologos"
        >
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Micrologos</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">{aguardandoMicrologos}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1 truncate">Faltas / contatos</div>
          </div>
        </div>

        {/* 5. Sem Interação */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('SEM_INTERACAO')}
          className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para filtrar pacientes sem interação"
        >
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Sem Interação</span>
            <PhoneOff className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">{totalSemInteracao}</div>
            <div className="text-[11px] text-rose-700 font-medium mt-1 truncate">Zero contatos</div>
          </div>
        </div>

        {/* 6. Casos Urgentes */}
        <div
          onClick={() => onNavigateToPatientsWithFilter('URGENTE')}
          className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-xs hover:border-red-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          title="Clique para filtrar casos urgentes"
        >
          <div className="flex items-center justify-between text-red-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">Casos Urgentes</span>
            <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-red-950 tracking-tight">{totalUrgentes}</div>
            <div className="text-[11px] text-red-700 font-medium mt-1 truncate">Prioridade médica</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">Panorama do Fluxo de Regulação</h3>
          </div>
          <span className="text-xs text-slate-500">
            Recorte: <strong className="text-slate-800">{total}</strong> paciente(s)
          </span>
        </div>

        {total === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Nenhum paciente cadastrado no filtro selecionado.
          </div>
        ) : (
          <>
            {/* Proportional Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
              {pctRegulados > 0 && (
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${pctRegulados}%` }}
                  title={`Regulados: ${regulados} (${pctRegulados}%)`}
                />
              )}
              {pctAgendados > 0 && (
                <div
                  className="bg-sky-500 h-full transition-all duration-500"
                  style={{ width: `${pctAgendados}%` }}
                  title={`Agendados: ${agendados} (${pctAgendados}%)`}
                />
              )}
              {pctMicrologos > 0 && (
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${pctMicrologos}%` }}
                  title={`Aguardando Micrologos: ${aguardandoMicrologos} (${pctMicrologos}%)`}
                />
              )}
              {pctSemInteracao > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${pctSemInteracao}%` }}
                  title={`Sem Interação: ${totalSemInteracao} (${pctSemInteracao}%)`}
                />
              )}
              {pctOutros > 0 && (
                <div
                  className="bg-slate-400 h-full transition-all duration-500"
                  style={{ width: `${pctOutros}%` }}
                  title={`Outros: ${pctOutros}%`}
                />
              )}
            </div>

            {/* Legend indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600 font-medium">Regulados:</span>
                <span className="font-bold text-slate-900">{regulados} ({pctRegulados}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-slate-600 font-medium">Agendados:</span>
                <span className="font-bold text-slate-900">{agendados} ({pctAgendados}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600 font-medium">Micrologos:</span>
                <span className="font-bold text-slate-900">{aguardandoMicrologos} ({pctMicrologos}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-600 font-medium">Sem Interação:</span>
                <span className="font-bold text-slate-900">{totalSemInteracao} ({pctSemInteracao}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="text-slate-600 font-medium">Urgentes:</span>
                <span className="font-bold text-slate-900">{totalUrgentes}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Clean Dual Charts: Procedures Demand & Municipalities Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Demanda por Procedimento Oftalmológico */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Demanda por Procedimento Oftalmológico</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {byProcedure.length} tipo(s)
              </span>
            </div>

            {byProcedure.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum procedimento registrado no escopo selecionado.
              </div>
            ) : (
              <div className="space-y-3.5">
                {byProcedure.slice(0, 6).map(([name, count], index) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={name} className="group">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-slate-700 font-semibold truncate" title={name}>
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{count}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Distribuição por Município de Atendimento */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Distribuição por Município</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {byCity.length} município(s)
              </span>
            </div>

            {byCity.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum município com pacientes no escopo selecionado.
              </div>
            ) : (
              <div className="space-y-3.5">
                {byCity.map(([city, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isCurrentCity = selectedCity === city;
                  return (
                    <div
                      key={city}
                      onClick={() => setSelectedCity(selectedCity === city ? 'ALL' : city)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isCurrentCity ? 'bg-emerald-50/70 border border-emerald-200' : 'hover:bg-slate-50'
                      }`}
                      title="Clique para filtrar apenas este município"
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-800 font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isCurrentCity ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                          {city}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{count}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
