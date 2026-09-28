import React, { useState } from 'react';
import {
  Building2,
  LogOut,
  Search,
  RotateCcw,
  ChevronDown,
  Check,
  AlertCircle,
  Eye,
  Database,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AppLogo } from '../common/AppLogo';
import { getStatusStyle } from '../../utils/statusColors';

interface NavbarProps {
  onSearchSelectPatient: (patientId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSelectPatient }) => {
  const { currentUser, allowedUnits, activeUnitId, setActiveUnitId, switchUser, logout } = useAuth();
  const {
    users,
    patients,
    resetAllData,
    supabaseSyncStatus,
    isSupabaseActive,
    syncAllToSupabase,
    reloadFromSupabase,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [showDatabaseMenu, setShowDatabaseMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await syncAllToSupabase();
    setSyncFeedback(res.message);
    setIsSyncing(false);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleManualReload = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    await reloadFromSupabase();
    setSyncFeedback('Dados recarregados do Supabase com sucesso!');
    setIsSyncing(false);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Filter patients for quick search (by name, city, procedure) - CNS/CPF removed
  const filteredPatients =
    searchQuery.trim().length >= 2
      ? patients
          .filter((p) => !p.isDeleted)
          .filter((p) => {
            const q = searchQuery.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.city.toLowerCase().includes(q) ||
              p.requestedProcedureName.toLowerCase().includes(q)
            );
          })
          .slice(0, 6)
      : [];

  const handleSelectPatient = (id: string) => {
    onSearchSelectPatient(id);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Deseja restaurar todos os dados para os padrões de demonstração? Isso recarregará pacientes, unidades, procedimentos e logs.'
      )
    ) {
      resetAllData();
      window.location.reload();
    }
  };

  const activeUnitLabel =
    activeUnitId === 'ALL'
      ? 'Todas as Unidades Autorizadas'
      : allowedUnits.find((u) => u.id === activeUnitId)?.name || 'Unidade';

  return (
    <header className="bg-[#0f1d33] text-white sticky top-0 z-40 shadow-md border-b border-slate-700/60 no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand with Official Shield Logo */}
        <div className="flex items-center gap-3 min-w-max">
          <AppLogo variant="full" size="md" theme="dark" />
        </div>

        {/* Global Quick Search */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Localizar paciente por nome, município ou procedimento..."
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 rounded-lg pl-9 pr-4 py-1.5 border border-slate-700/80 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Resultados da Busca Rápida</span>
                <span className="font-mono text-[10px] text-blue-700">{filteredPatients.length} encontrado(s)</span>
              </div>
              {filteredPatients.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-500">
                  <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                  Nenhum paciente localizado com esse critério.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {filteredPatients.map((p) => {
                    const statusStyle = getStatusStyle(p.currentStatus);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p.id)}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{p.city}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px] text-slate-700">{p.requestedProcedureName}</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusStyle.badgeClass}`}
                          >
                            {statusStyle.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Supabase Status + Unit Selector + User Switcher + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Status Indicator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatabaseMenu(!showDatabaseMenu)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                supabaseSyncStatus === 'connected'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : supabaseSyncStatus === 'syncing'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                  : supabaseSyncStatus === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Status da Conexão com Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-medium text-[11px]">
                {supabaseSyncStatus === 'connected'
                  ? 'Supabase Conectado'
                  : supabaseSyncStatus === 'syncing'
                  ? 'Sincronizando...'
                  : supabaseSyncStatus === 'error'
                  ? 'Supabase Offline'
                  : 'Banco Local'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseSyncStatus === 'connected'
                    ? 'bg-emerald-400'
                    : supabaseSyncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : supabaseSyncStatus === 'error'
                    ? 'bg-rose-400'
                    : 'bg-slate-400'
                }`}
              />
            </button>

            {showDatabaseMenu && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3.5 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Banco de Dados Supabase</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      supabaseSyncStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : supabaseSyncStatus === 'syncing'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : supabaseSyncStatus === 'error'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {supabaseSyncStatus === 'connected'
                      ? 'Conectado'
                      : supabaseSyncStatus === 'syncing'
                      ? 'Sincronizando'
                      : supabaseSyncStatus === 'error'
                      ? 'Erro de Conexão'
                      : 'Modo Local'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  {isSupabaseActive
                    ? 'O sistema está conectado ao banco de dados PostgreSQL no Supabase. Alterações em pacientes, unidades e atendimentos são salvas na nuvem.'
                    : 'O sistema está operando com cache local. Para ativar a nuvem, preencha as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'}
                </p>

                {syncFeedback && (
                  <div className="mb-2.5 p-2 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
                    {syncFeedback}
                  </div>
                )}

                {isSupabaseActive ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Sincronizando...' : 'Enviar Dados Locais para o Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualReload}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 disabled:opacity-50 transition-colors"
                    >
                      <span>Recarregar Dados da Nuvem</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 mb-0.5">Como conectar:</div>
                    <div>1. Execute o script <code className="text-blue-700 font-bold bg-blue-50 px-1 py-0.5 rounded">supabase_schema.sql</code> no SQL Editor do Supabase.</div>
                    <div>2. Cole a URL e a Anon Key no arquivo <code className="text-blue-700 font-bold bg-blue-50 px-1 py-0.5 rounded">.env</code>.</div>
                    <div>3. Reinicie a aplicação para conectar automaticamente.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Unit Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUnitMenu(!showUnitMenu)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-400/40 transition-colors max-w-[190px] sm:max-w-[240px] truncate"
              title="Alternar Unidade de Trabalho"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate font-medium">{activeUnitLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showUnitMenu && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Unidade Ativa
                </div>
                {allowedUnits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveUnitId('ALL');
                      setShowUnitMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className={activeUnitId === 'ALL' ? 'font-bold text-blue-700' : 'text-slate-700'}>
                      Todas as Unidades Autorizadas ({allowedUnits.length})
                    </span>
                    {activeUnitId === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                )}
                {allowedUnits.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setActiveUnitId(u.id);
                      setShowUnitMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className={activeUnitId === u.id ? 'font-bold text-blue-700' : 'text-slate-800'}>
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {u.city} · CNES: {u.cnes || 'N/D'}
                      </div>
                    </div>
                    {activeUnitId === u.id && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Switcher / Profile Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-400/40 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden sm:block max-w-[130px] truncate">
                <div className="font-semibold text-white truncate text-[11px] leading-tight">
                  {currentUser?.name.split(' ')[0]} {currentUser?.name.split(' ')[1] || ''}
                </div>
                <div className="text-[9px] text-amber-300 uppercase font-mono">
                  {currentUser?.role === 'admin'
                    ? 'Administrador'
                    : currentUser?.role === 'supervisor'
                    ? 'Supervisora'
                    : 'Atendente'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-3 pb-2 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {currentUser?.login} · {currentUser?.email || 'saude.gestao'}
                  </div>
                  <div className="mt-1 text-[11px] text-blue-700 font-medium">
                    Perfil: {currentUser?.role.toUpperCase()} · {allowedUnits.length} unidade(s)
                  </div>
                </div>

                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simular / Alternar Usuário:
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                        currentUser?.id === u.id ? 'bg-blue-50 font-bold' : ''
                      }`}
                    >
                      <div>
                        <div className="text-slate-800 font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Login: <code className="font-mono">{u.login}</code> · Perfil: {u.role}
                        </div>
                      </div>
                      {currentUser?.id === u.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 px-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50"
                    title="Restaurar dados iniciais"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resetar Dados</span>
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prominent Direct Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-xs transition-colors"
            title="Encerrar sessão e voltar para a tela de Login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
