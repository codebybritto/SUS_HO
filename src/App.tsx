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
import { Lock, User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, login } = useAuth();
  const { patients, users } = useApp();

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

  // Find active selected patient object dynamically from state
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // If user is not authenticated, show the Login Screen
  if (!currentUser) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      const success = login(loginInput, passwordInput);
      if (!success) {
        setLoginError('Credenciais inválidas ou usuário inativo. Utilize uma das contas de demonstração abaixo.');
      }
    };

    const handleQuickLogin = (userLogin: string) => {
      setLoginInput(userLogin);
      setPasswordInput('123');
      setLoginError('');
      login(userLogin, '123');
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
                    placeholder="admin, patricia, carlos, mariana..."
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Qualquer senha ou '123'"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Accounts Quick Login */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                Perfis de Demonstração / Acesso Rápido:
              </span>
              <div className="space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.login)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 group-hover:text-blue-900">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Login: <code className="font-mono font-bold text-slate-700">{u.login}</code></span>
                        <span>•</span>
                        <span>Perfil: {u.role.toUpperCase()}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      Entrar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 z-10">
          Sistema de Gestão, Controle e Evolução de Pacientes
        </div>
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
      {/* Top Navbar (Architecture Proposal Button removed) */}
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
