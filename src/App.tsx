/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Navigation, MainTab } from './components/layout/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientListView } from './components/patients/PatientListView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { AdminView } from './components/admin/AdminView';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { RecordEvolutionModal } from './components/patients/RecordEvolutionModal';
import { RecordContactModal } from './components/patients/RecordContactModal';
import { RecordAbsenceModal } from './components/patients/RecordAbsenceModal';
import { Patient } from './types';
import { AppLogo } from './components/common/AppLogo';
import { Lock, User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, KeyRound, HelpCircle, X, LogOut, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, login, sessionExpiredMessage, clearSessionExpiredMessage, isDemoMode, enterDemoMode, exitDemoMode } = useAuth();
  const { patients } = useApp();

  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientStatusFilter, setPatientStatusFilter] = useState<string>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [patientForEvolution, setPatientForEvolution] = useState<Patient | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [patientForContact, setPatientForContact] = useState<Patient | null>(null);

  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [patientForAbsence, setPatientForAbsence] = useState<Patient | null>(null);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  // Find active selected patient object dynamically from state
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // If user is not authenticated, show the Login Screen
  if (!currentUser) {
    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      clearSessionExpiredMessage();
      setIsLoggingIn(true);
      try {
        const res = await login(loginInput, passwordInput);
        if (!res.success) {
          setLoginError(res.error || 'Credenciais inválidas ou usuário inativo. Verifique seu login e senha.');
        }
      } catch (err: any) {
        setLoginError(`Falha na comunicação ao autenticar usuário: ${err?.message || 'Erro inesperado'}`);
      } finally {
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 z-10">
          {/* Header with official shield logo */}
          <div className="bg-[#0f1d33] p-8 text-white text-center border-b border-slate-700/50">
            <div className="flex justify-center mb-3">
              <AppLogo variant="icon" size="xl" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Controle de Pacientes
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Sistema de Acompanhamento, Gestão e Evolução Clínica
            </p>
          </div>

          <div className="p-7 space-y-6">
            {sessionExpiredMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{sessionExpiredMessage}</span>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operador / Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Digite seu login de operador"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Esqueci minha senha</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoggingIn ? 'Autenticando...' : 'Acessar o Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Modo Demonstração (Informações Fictícias) */}
            <div className="pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={enterDemoMode}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs group"
              >
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Acessar Modo Demonstração (Informações Fictícias)</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                Ambiente de teste com dados e prontuários simulados. Nenhuma informação fictícia é gravada no banco de dados real.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 z-10">
          Sistema de Gestão, Controle e Evolução de Pacientes
        </div>

        {/* Forgot Password Modal */}
        {isForgotPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recuperação de Acesso</h3>
                  <p className="text-xs text-slate-500">Política de segurança e redefinição</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Esqueceu sua senha de operador?</p>
                  Por conformidade com as normas de segurança de dados de saúde, a redefinição de senhas é realizada diretamente pelo <strong>Administrador do Sistema</strong>.
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Como funciona o procedimento:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
                    <li>Contate o Administrador para solicitar uma <strong>redefinição de senha</strong>.</li>
                    <li>O Administrador definirá uma senha temporária com a opção <strong>"Troca obrigatória no próximo login"</strong> ativada.</li>
                    <li>Ao efetuar login com essa credencial provisória, o sistema exigirá que você cadastre sua nova senha pessoal antes de acessar os prontuários.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-[11px]">
                  <span className="font-bold block mb-1">Acesso Administrativo Oficial:</span>
                  O Administrador do Sistema pode redefinir senhas e gerenciar novos operadores diretamente no módulo de Administração.
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Entendi, voltar ao login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle opening patient detail
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
  };

  // Handle navigation with specific status filter from dashboard
  const handleNavigateWithFilter = (status: string) => {
    setPatientStatusFilter(status);
    setCurrentTab('patients');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Banner de Modo Demonstração */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md z-50 border-b border-amber-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
            <span>MODO DEMONSTRAÇÃO ATIVO — Exibindo informações e prontuários fictícios para apresentação. Nenhuma alteração é gravada na base real.</span>
          </div>
          <button
            type="button"
            onClick={exitDemoMode}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-xs shrink-0 ml-3"
          >
            Sair da Demonstração
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar onSearchSelectPatient={(id) => setSelectedPatientId(id)} />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'patients') {
            setPatientStatusFilter('ALL');
          }
          setCurrentTab(tab);
        }}
        onNewPatient={() => {
          setPatientToEdit(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectPatient={handleSelectPatient}
            onNavigateToPatientsWithFilter={handleNavigateWithFilter}
          />
        )}

        {currentTab === 'patients' && (
          <PatientListView
            initialStatusFilter={patientStatusFilter}
            onSelectPatient={handleSelectPatient}
            onNewPatient={() => {
              setPatientToEdit(null);
              setIsFormModalOpen(true);
            }}
            onEditPatient={(patient) => {
              setPatientToEdit(patient);
              setIsFormModalOpen(true);
            }}
            onRecordEvolution={(patient) => {
              setPatientForEvolution(patient);
              setIsEvolutionModalOpen(true);
            }}
            onRecordContact={(patient) => {
              setPatientForContact(patient);
              setIsContactModalOpen(true);
            }}
            onRecordAbsence={(patient) => {
              setPatientForAbsence(patient);
              setIsAbsenceModalOpen(true);
            }}
          />
        )}

        {currentTab === 'reports' && <ReportsView />}

        {currentTab === 'audit' && <AuditLogsView />}

        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* MODALS */}
      {/* 1. Patient Details & Timeline Modal */}
      {selectedPatient && (
        <PatientDetailModal
          isOpen={!!selectedPatient}
          patient={selectedPatient}
          onClose={() => setSelectedPatientId(null)}
          onEditPatient={(patient) => {
            setPatientToEdit(patient);
            setIsFormModalOpen(true);
          }}
          onRecordEvolution={(patient) => {
            setPatientForEvolution(patient);
            setIsEvolutionModalOpen(true);
          }}
          onRecordContact={(patient) => {
            setPatientForContact(patient);
            setIsContactModalOpen(true);
          }}
          onRecordAbsence={(patient) => {
            setPatientForAbsence(patient);
            setIsAbsenceModalOpen(true);
          }}
        />
      )}

      {/* 2. Patient Form (Create / Edit) Modal */}
      {isFormModalOpen && (
        <PatientFormModal
          isOpen={isFormModalOpen}
          patientToEdit={patientToEdit}
          onClose={() => {
            setIsFormModalOpen(false);
            setPatientToEdit(null);
          }}
          onSaved={(savedPatient) => {
            if (selectedPatientId === savedPatient.id) {
              setSelectedPatientId(savedPatient.id);
            }
          }}
        />
      )}

      {/* 3. Record Evolution Modal */}
      {isEvolutionModalOpen && patientForEvolution && (
        <RecordEvolutionModal
          isOpen={isEvolutionModalOpen}
          patient={patientForEvolution}
          onClose={() => {
            setIsEvolutionModalOpen(false);
            setPatientForEvolution(null);
          }}
        />
      )}

      {/* 4. Record Contact Attempt Modal */}
      {isContactModalOpen && patientForContact && (
        <RecordContactModal
          isOpen={isContactModalOpen}
          patient={patientForContact}
          onClose={() => {
            setIsContactModalOpen(false);
            setPatientForContact(null);
          }}
        />
      )}

      {/* 5. Record Absence Modal */}
      {isAbsenceModalOpen && patientForAbsence && (
        <RecordAbsenceModal
          isOpen={isAbsenceModalOpen}
          patient={patientForAbsence}
          onClose={() => {
            setIsAbsenceModalOpen(false);
            setPatientForAbsence(null);
          }}
        />
      )}

      {/* 6. Mandatory Forced Password Change Modal */}
      {currentUser?.mustChangePassword && <ForcedPasswordChangeModal />}
    </div>
  );
};

const ForcedPasswordChangeModal: React.FC = () => {
  const { currentUser, changeOwnPassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    if (currentUser && newPassword.toLowerCase() === currentUser.login.toLowerCase()) {
      setError('Por segurança, a senha não pode ser igual ao seu login.');
      return;
    }

    setLoading(true);
    try {
      const ok = await changeOwnPassword(newPassword);
      if (!ok) {
        setError('Ocorreu um erro ao atualizar a senha. Tente novamente.');
      }
    } catch {
      setError('Erro ao salvar. Verifique a conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Troca Obrigatória de Senha</h2>
            <p className="text-xs text-slate-500">
              Operador: <span className="font-semibold text-slate-700">{currentUser?.name}</span> ({currentUser?.login})
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            O administrador redefiniu sua credencial ou exigiu atualização cadastral. Para prosseguir e acessar os prontuários, cadastre uma nova senha pessoal.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Salvando...' : 'Cadastrar Senha e Acessar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
