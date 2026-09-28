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
  ShieldCheck,
  FlaskConical,
  Key,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AppLogo } from '../common/AppLogo';
import { getStatusStyle } from '../../utils/statusColors';

interface NavbarProps {
  onSearchSelectPatient: (patientId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSelectPatient }) => {
  const {
    currentUser,
    allowedUnits,
    activeUnitId,
    setActiveUnitId,
    logout,
    changeOwnPassword,
    isDemoMode,
  } = useAuth();

  const {
    patients,
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

  // Self password change modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSaveOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordChangeMessage({ type: 'error', text: 'A senha deve conter no mínimo 4 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'As senhas informadas não coincidem.' });
      return;
    }

    const success = await changeOwnPassword(newPassword);
    if (success) {
      setPasswordChangeMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setPasswordChangeMessage(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } else {
      setPasswordChangeMessage({ type: 'error', text: 'Falha ao atualizar senha. Tente novamente.' });
    }
  };

  // Filter patients for quick search (by name, city, procedure)
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



  const activeUnitLabel =
    activeUnitId === 'ALL'
      ? 'Todas as Unidades Autorizadas'
      : allowedUnits.find((u) => u.id === activeUnitId)?.name || 'Unidade';

  return (
    <>
      <header className="bg-[#0f1d33] text-white sticky top-0 z-40 shadow-md border-b border-slate-700/60 no-print">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand with Official Shield Logo */}
          <div className="flex items-center gap-3 min-w-max">
            <AppLogo variant="full" size="md" theme="dark" />
          </div>

          {/* Global Quick Search */}
          <div className="relative flex-1 max-w-sm hidden xl:block">
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
                  <span>Resultados da Busca</span>
                  <span className="font-mono text-[10px] text-blue-700">{filteredPatients.length} encontrado(s)</span>
                </div>
                {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Nenhum paciente localizado para os termos digitados.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {filteredPatients.map((p) => {
                      const statusStyle = getStatusStyle(p.currentStatus);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPatient(p.id)}
                          className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.isUrgent && (
                                <span className="text-[9.5px] text-rose-600 font-black uppercase">
                                  [URG]
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Supabase Status Indicator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatabaseMenu(!showDatabaseMenu)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  isDemoMode
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                    : supabaseSyncStatus === 'connected'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                    : supabaseSyncStatus === 'syncing'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                    : supabaseSyncStatus === 'error'
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title={isDemoMode ? 'Modo Demonstração (Simulado)' : 'Status da Conexão com Supabase'}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden lg:inline font-medium text-[11px]">
                  {isDemoMode
                    ? 'Modo Demonstração'
                    : supabaseSyncStatus === 'connected'
                    ? 'Supabase Conectado'
                    : supabaseSyncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : supabaseSyncStatus === 'error'
                    ? 'Supabase Offline'
                    : 'Banco Local'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDemoMode
                      ? 'bg-amber-400'
                      : supabaseSyncStatus === 'connected'
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
                      <span className="text-xs font-bold text-slate-900">
                        {isDemoMode ? 'Modo Demonstração' : 'Banco de Dados Supabase'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDemoMode
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : supabaseSyncStatus === 'connected'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : supabaseSyncStatus === 'syncing'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : supabaseSyncStatus === 'error'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isDemoMode
                        ? 'Simulação Ativa'
                        : supabaseSyncStatus === 'connected'
                        ? 'Conectado'
                        : supabaseSyncStatus === 'syncing'
                        ? 'Sincronizando'
                        : supabaseSyncStatus === 'error'
                        ? 'Erro de Conexão'
                        : 'Modo Local'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    {isDemoMode
                      ? 'Você está no ambiente de demonstração com prontuários e dados simulados. Nenhuma alteração afeta ou sincroniza com o banco real (Supabase).'
                      : isSupabaseActive
                      ? 'O sistema está conectado ao banco de dados PostgreSQL no Supabase. Alterações em pacientes, unidades e atendimentos são salvas na nuvem.'
                      : 'O sistema está operando com cache local. Para ativar a nuvem, preencha as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'}
                  </p>

                  {syncFeedback && (
                    <div className="mb-2.5 p-2 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
                      {syncFeedback}
                    </div>
                  )}

                  {!isDemoMode && isSupabaseActive ? (
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
                  ) : !isDemoMode && (
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
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-400/40 transition-colors max-w-[190px] sm:max-w-[220px] truncate"
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

            {/* User Profile / Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-400/40 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block max-w-[120px] truncate">
                  <div className="font-semibold text-white truncate text-[11px] leading-tight">
                    {currentUser?.name.split(' ')[0]} {currentUser?.name.split(' ')[1] || ''}
                  </div>
                  <div className="text-[9px] text-amber-300 uppercase font-mono">
                    {isDemoMode
                      ? 'Demonstração'
                      : currentUser?.role === 'admin'
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

                  {/* Change Password Option */}
                  {!isDemoMode && (
                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsChangePasswordModalOpen(true);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>Alterar Minha Senha</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 mt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:text-rose-700 flex items-center gap-2 rounded hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair do Sistema</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Logout Button */}
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

      {/* Change Password Modal (Self) */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 relative">
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordModalOpen(false);
                setPasswordChangeMessage(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alterar Minha Senha</h3>
                <p className="text-[11px] text-slate-500">{currentUser?.name} ({currentUser?.login})</p>
              </div>
            </div>

            {passwordChangeMessage && (
              <div
                className={`mb-4 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  passwordChangeMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {passwordChangeMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{passwordChangeMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveOwnPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
