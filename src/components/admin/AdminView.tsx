import React, { useState } from 'react';
import {
  Users,
  Building,
  Activity,
  Stethoscope,
  Sliders,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Shield,
  Save,
  CheckCircle2,
  MapPin,
  Building2,
  Key,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  User,
  Unit,
  Procedure,
  Doctor,
  SystemSettings,
  UserPermissions,
  UserRole,
  Municipality,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

type AdminTab = 'users' | 'units' | 'municipalities' | 'procedures' | 'doctors';

export const AdminView: React.FC = () => {
  const {
    users,
    units,
    municipalities,
    procedures,
    doctors,
    settings,
    addUser,
    updateUser,
    deleteUser,
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
    updateSettings,
  } = useApp();

  const { currentUser, hasPermission, adminResetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<User | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null);
  const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);

  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);

  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const canManageUsers = hasPermission('manage_users');
  const canManageUnits = hasPermission('manage_units');
  const canManageMunicipalities = hasPermission('manage_municipalities');
  const canManageProcedures = hasPermission('manage_procedures');
  const canManageDoctors = hasPermission('manage_doctors');
  const canManageSettings = hasPermission('manage_settings');

  // Handle settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Admin Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Módulo de Configuração Administrativa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie usuários, permissões granulares, unidades, municípios de abrangência, procedimentos e regras automáticas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex space-x-2 sm:space-x-4 overflow-x-auto text-xs font-semibold bg-slate-50/50">
          {canManageUsers && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-cyan-600 text-cyan-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuários & Permissões ({users.length})</span>
            </button>
          )}

          {canManageUnits && (
            <button
              type="button"
              onClick={() => setActiveTab('units')}
              className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'units'
                  ? 'border-cyan-600 text-cyan-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Unidades de Saúde ({units.length})</span>
            </button>
          )}

          {canManageMunicipalities && (
            <button
              type="button"
              onClick={() => setActiveTab('municipalities')}
              className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'municipalities'
                  ? 'border-cyan-600 text-cyan-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>Municípios & Abrangência ({municipalities.length})</span>
            </button>
          )}

          {canManageProcedures && (
            <button
              type="button"
              onClick={() => setActiveTab('procedures')}
              className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'procedures'
                  ? 'border-cyan-600 text-cyan-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Procedimentos Oftalmo ({procedures.length})</span>
            </button>
          )}

          {canManageDoctors && (
            <button
              type="button"
              onClick={() => setActiveTab('doctors')}
              className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'border-cyan-600 text-cyan-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Médicos ({doctors.length})</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* TAB: USUÁRIOS */}
          {activeTab === 'users' && canManageUsers && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Operadores e Controles de Acesso</h3>
                  <p className="text-xs text-slate-500">
                    Defina o acesso de cada atendente às unidades e configure permissões de telas e ações.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Usuário</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Operador / Usuário</th>
                        <th className="py-2.5 px-3 font-semibold">Login</th>
                        <th className="py-2.5 px-3 font-semibold">Perfil</th>
                        <th className="py-2.5 px-3 font-semibold">Unidades com Acesso</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const userUnits = units.filter((unit) => u.unitIds.includes(unit.id));
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {u.id === currentUser?.id && (
                                <span className="ml-1.5 text-[9px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.2 rounded">
                                  Você
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <span>{u.login}</span>
                                {u.mustChangePassword && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-sans font-bold" title="Usuário precisará cadastrar nova senha no próximo acesso">
                                    Troca Pendente
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : u.role === 'supervisor'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {userUnits.map((unit) => (
                                  <span
                                    key={unit.id}
                                    className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium"
                                  >
                                    {unit.code}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  u.active
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {u.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserForPasswordReset(u);
                                    setIsResetPasswordModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                                  title="Resetar / Redefinir Senha do Usuário"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUser(u);
                                    setIsUserModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded"
                                  title="Editar Usuário e Permissões"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {u.id !== currentUser?.id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Deseja realmente excluir o usuário ${u.name}?`)) {
                                        deleteUser(u.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: UNIDADES */}
          {activeTab === 'units' && canManageUnits && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Unidades de Saúde e Postos de Regulação</h3>
                  <p className="text-xs text-slate-500">
                    Cadastre unidades e defina os municípios de abrangência atendidos por cada uma.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUnit(null);
                    setIsUnitModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Unidade</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Código & Unidade</th>
                        <th className="py-2.5 px-3 font-semibold">CNES</th>
                        <th className="py-2.5 px-3 font-semibold">Cidade / Estado</th>
                        <th className="py-2.5 px-3 font-semibold">Municípios Atendidos</th>
                        <th className="py-2.5 px-3 font-semibold">Contato / Gestor</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {units.map((unit) => (
                        <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 mr-2">
                              {unit.code}
                            </span>
                            <span className="font-bold text-slate-900">{unit.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {unit.cnes || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {unit.city} - {unit.state}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {unit.municipalities && unit.municipalities.length > 0 ? (
                                unit.municipalities.map((mun) => (
                                  <span
                                    key={mun}
                                    className="text-[10px] px-1.5 py-0.2 bg-cyan-50 text-cyan-800 rounded border border-cyan-200 font-medium"
                                  >
                                    {mun}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400">Todos</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{unit.managerName || '-'}</div>
                            <div className="text-[10px] text-slate-400">{unit.phone}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUnit(unit);
                                  setIsUnitModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded"
                                title="Editar Unidade"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir unidade ${unit.name}?`)) {
                                    deleteUnit(unit.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                title="Excluir Unidade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MUNICÍPIOS & ABRANGÊNCIA (Requirement 11) */}
          {activeTab === 'municipalities' && canManageMunicipalities && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cadastro de Municípios & Abrangência</h3>
                  <p className="text-xs text-slate-500">
                    Cadastre os municípios autorizados e vincule-os às unidades responsáveis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMunicipality(null);
                    setIsMunicipalityModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Município</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Município</th>
                        <th className="py-2.5 px-3 font-semibold">Estado</th>
                        <th className="py-2.5 px-3 font-semibold">Unidades de Referência</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {municipalities.map((m) => {
                        const coveringUnits = units.filter(
                          (u) => u.municipalities && u.municipalities.includes(m.name)
                        );
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{m.state}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {coveringUnits.length > 0 ? (
                                  coveringUnits.map((u) => (
                                    <span
                                      key={u.id}
                                      className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium"
                                    >
                                      {u.code}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-amber-600 italic">Nenhuma vinculada</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Ativo
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMunicipality(m);
                                    setIsMunicipalityModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded"
                                  title="Editar Município"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Excluir município ${m.name}?`)) {
                                      deleteMunicipality(m.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                  title="Excluir Município"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROCEDIMENTOS */}
          {activeTab === 'procedures' && canManageProcedures && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Catálogo de Procedimentos Oftalmológicos</h3>
                  <p className="text-xs text-slate-500">
                    Defina quais procedimentos estão autorizados para execução em cada unidade de atendimento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProcedure(null);
                    setIsProcedureModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Procedimento</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Procedimento Oftalmológico</th>
                        <th className="py-2.5 px-3 font-semibold">Código SIGTAP</th>
                        <th className="py-2.5 px-3 font-semibold">Lateralidade (Olho)</th>
                        <th className="py-2.5 px-3 font-semibold">Unidades Autorizadas</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {procedures.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">{p.name}</span>
                            {p.description && (
                              <div className="text-[11px] text-slate-500 truncate max-w-sm">
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {p.codeSigtap || 'Não inf.'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {p.requiresEyeSide ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                                Obrigatório (AO/OD/OE)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Não exigido</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {p.unitIds.map((uid) => (
                                <span
                                  key={uid}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium"
                                >
                                  {units.find((x) => x.id === uid)?.code || uid}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProcedure(p);
                                  setIsProcedureModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded"
                                title="Editar Procedimento"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir procedimento ${p.name}?`)) {
                                    deleteProcedure(p.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                title="Excluir Procedimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MÉDICOS */}
          {activeTab === 'doctors' && canManageDoctors && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Médicos Oftalmologistas</h3>
                  <p className="text-xs text-slate-500">
                    Médicos cadastrados e suas respectivas unidades de atuação.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoctor(null);
                    setIsDoctorModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Médico</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Médico Oftalmologista</th>
                        <th className="py-2.5 px-3 font-semibold">CRM / UF</th>
                        <th className="py-2.5 px-3 font-semibold">Especialidade</th>
                        <th className="py-2.5 px-3 font-semibold">Unidades de Atuação</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doctors.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {d.crm}/{d.stateCrm}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{d.specialty}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {d.unitIds.map((uid) => (
                                <span
                                  key={uid}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium"
                                >
                                  {units.find((x) => x.id === uid)?.code || uid}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDoctor(d);
                                  setIsDoctorModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded"
                                title="Editar Médico"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir médico ${d.name}?`)) {
                                    deleteDoctor(d.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                title="Excluir Médico"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* USER MODAL */}
      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          user={editingUser}
          units={units}
          onClose={() => setIsUserModalOpen(false)}
          onSave={(userData) => {
            if (editingUser) {
              updateUser(editingUser.id, userData);
            } else {
              addUser(userData as any);
            }
            setIsUserModalOpen(false);
          }}
        />
      )}

      {/* UNIT MODAL */}
      {isUnitModalOpen && (
        <UnitModal
          isOpen={isUnitModalOpen}
          unit={editingUnit}
          municipalities={municipalities}
          onClose={() => setIsUnitModalOpen(false)}
          onSave={(unitData) => {
            if (editingUnit) {
              updateUnit(editingUnit.id, unitData);
            } else {
              addUnit(unitData as any);
            }
            setIsUnitModalOpen(false);
          }}
        />
      )}

      {/* MUNICIPALITY MODAL */}
      {isMunicipalityModalOpen && (
        <MunicipalityModal
          isOpen={isMunicipalityModalOpen}
          municipality={editingMunicipality}
          onClose={() => setIsMunicipalityModalOpen(false)}
          onSave={(munData) => {
            if (editingMunicipality) {
              updateMunicipality(editingMunicipality.id, munData);
            } else {
              addMunicipality(munData as any);
            }
            setIsMunicipalityModalOpen(false);
          }}
        />
      )}

      {/* PROCEDURE MODAL */}
      {isProcedureModalOpen && (
        <ProcedureModal
          isOpen={isProcedureModalOpen}
          procedure={editingProcedure}
          units={units}
          onClose={() => setIsProcedureModalOpen(false)}
          onSave={(procData) => {
            if (editingProcedure) {
              updateProcedure(editingProcedure.id, procData);
            } else {
              addProcedure(procData as any);
            }
            setIsProcedureModalOpen(false);
          }}
        />
      )}

      {/* DOCTOR MODAL */}
      {isDoctorModalOpen && (
        <DoctorModal
          isOpen={isDoctorModalOpen}
          doctor={editingDoctor}
          units={units}
          onClose={() => setIsDoctorModalOpen(false)}
          onSave={(docData) => {
            if (editingDoctor) {
              updateDoctor(editingDoctor.id, docData);
            } else {
              addDoctor(docData as any);
            }
            setIsDoctorModalOpen(false);
          }}
        />
      )}

      {/* RESET USER PASSWORD MODAL */}
      {isResetPasswordModalOpen && userForPasswordReset && (
        <ResetUserPasswordModal
          isOpen={isResetPasswordModalOpen}
          user={userForPasswordReset}
          onClose={() => {
            setIsResetPasswordModalOpen(false);
            setUserForPasswordReset(null);
          }}
          onReset={async (userId, newPass, forceChange) => {
            const success = await adminResetPassword(userId, newPass, forceChange);
            if (success) {
              setIsResetPasswordModalOpen(false);
              setUserForPasswordReset(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
};

// USER MODAL COMPONENT (with manage_municipalities permission)
const UserModal: React.FC<{
  isOpen: boolean;
  user: User | null;
  units: Unit[];
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
}> = ({ isOpen, user, units, onClose, onSave }) => {
  const [name, setName] = useState(user?.name || '');
  const [login, setLogin] = useState(user?.login || '');
  const [password, setPassword] = useState(user?.password || '123');
  const [role, setRole] = useState<UserRole>(user?.role || 'attendant');
  const [active, setActive] = useState(user?.active ?? true);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(user?.unitIds || [units[0]?.id || '']);
  const [mustChangePassword, setMustChangePassword] = useState(user?.mustChangePassword ?? false);

  const [permissions, setPermissions] = useState<UserPermissions>(
    user?.permissions || {
      view_patients: true,
      create_patients: true,
      edit_patients: true,
      delete_patients: false,
      edit_after_creation: true,
      record_evolution: true,
      record_contact_attempt: true,
      change_patient_status: true,
      manage_procedures: false,
      manage_doctors: false,
      manage_municipalities: false,
      view_timeline: true,
      view_logs: false,
      view_reports: true,
      export_reports: false,
      manage_users: false,
      manage_units: false,
      manage_settings: false,
    }
  );

  const toggleUnit = (uid: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !login.trim()) {
      alert('Nome e Login são campos obrigatórios.');
      return;
    }
    if (selectedUnitIds.length === 0) {
      alert('Selecione ao menos uma unidade à qual o operador terá acesso.');
      return;
    }

    onSave({
      name: name.trim(),
      login: login.trim().toLowerCase(),
      password,
      role,
      active,
      mustChangePassword,
      unitIds: selectedUnitIds,
      permissions:
        role === 'admin'
          ? {
              view_patients: true,
              create_patients: true,
              edit_patients: true,
              delete_patients: true,
              edit_after_creation: true,
              record_evolution: true,
              record_contact_attempt: true,
              change_patient_status: true,
              manage_procedures: true,
              manage_doctors: true,
              manage_municipalities: true,
              view_timeline: true,
              view_logs: true,
              view_reports: true,
              export_reports: true,
              manage_users: true,
              manage_units: true,
              manage_settings: true,
            }
          : permissions,
    });
  };

  const permissionLabels: { key: keyof UserPermissions; label: string }[] = [
    { key: 'view_patients', label: 'Visualizar pacientes da unidade' },
    { key: 'create_patients', label: 'Cadastrar novos pacientes' },
    { key: 'edit_patients', label: 'Editar dados cadastrais' },
    { key: 'delete_patients', label: 'Excluir / Inativar pacientes' },
    { key: 'edit_after_creation', label: 'Alterar informações após o cadastro' },
    { key: 'record_evolution', label: 'Registrar evolução / tratativas' },
    { key: 'record_contact_attempt', label: 'Registrar tentativas de contato' },
    { key: 'change_patient_status', label: 'Alterar status / condição manual' },
    { key: 'manage_procedures', label: 'Cadastrar e gerenciar procedimentos' },
    { key: 'manage_doctors', label: 'Cadastrar e gerenciar médicos' },
    { key: 'manage_municipalities', label: 'Cadastrar e gerenciar municípios (Abrangência)' },
    { key: 'view_timeline', label: 'Visualizar timeline do paciente' },
    { key: 'view_logs', label: 'Visualizar logs de auditoria' },
    { key: 'view_reports', label: 'Acessar central de relatórios' },
    { key: 'export_reports', label: 'Exportar relatórios' },
    { key: 'manage_users', label: 'Administrar usuários e perfis' },
    { key: 'manage_units', label: 'Administrar unidades de saúde' },
    { key: 'manage_settings', label: 'Gerenciar regras de negócio automáticas' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 my-8 border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          {user ? 'Editar Usuário e Permissões' : 'Novo Usuário do Sistema'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nome Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Login de Acesso *</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Perfil Base</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="attendant">Atendente / Regulador</option>
                <option value="supervisor">Supervisor / Coordenador</option>
                <option value="admin">Administrador Geral</option>
                <option value="viewer">Apenas Visualizador</option>
              </select>
            </div>
          </div>

          {/* Status Ativo e Troca Obrigatória */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-cyan-600"
              />
              <span className="text-xs">Usuário ativo (permite login)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-xs text-amber-950 font-semibold">Exigir troca de senha no próximo acesso</span>
            </label>
          </div>

          {/* Unidades Vinculadas */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 block mb-1">
              Unidades Autorizadas para este Usuário *
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              O atendente somente visualizará e operará pacientes pertencentes a estas unidades.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {units.map((u) => (
                <label key={u.id} className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUnitIds.includes(u.id)}
                    onChange={() => toggleUnit(u.id)}
                    className="rounded text-cyan-600"
                  />
                  <span className="text-slate-800 font-medium text-[11px]">{u.name} ({u.code})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Granular Permissions Checkboxes */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 block mb-1">
              Permissões Granulares Específicas
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              Controle detalhado de telas, botões e funcionalidades autorizadas para este operador.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {permissionLabels.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={role === 'admin' || permissions[key]}
                    disabled={role === 'admin'}
                    onChange={() => togglePermission(key)}
                    className="rounded text-cyan-600"
                  />
                  <span className="text-slate-700 text-[11px]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              Salvar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// UNIT MODAL (with multi-municipality support)
const UnitModal: React.FC<{
  isOpen: boolean;
  unit: Unit | null;
  municipalities: Municipality[];
  onClose: () => void;
  onSave: (data: Partial<Unit>) => void;
}> = ({ isOpen, unit, municipalities, onClose, onSave }) => {
  const [name, setName] = useState(unit?.name || '');
  const [code, setCode] = useState(unit?.code || '');
  const [cnes, setCnes] = useState(unit?.cnes || '');
  const [city, setCity] = useState(unit?.city || '');
  const [state, setState] = useState(unit?.state || 'SP');
  const [phone, setPhone] = useState(unit?.phone || '');
  const [address, setAddress] = useState(unit?.address || '');
  const [selectedMuns, setSelectedMuns] = useState<string[]>(unit?.municipalities || []);

  const toggleMun = (munName: string) => {
    setSelectedMuns((prev) =>
      prev.includes(munName) ? prev.filter((m) => m !== munName) : [...prev, munName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Nome e código da unidade são obrigatórios.');
      return;
    }
    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      cnes: cnes.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      phone: phone.trim(),
      address: address.trim(),
      municipalities: selectedMuns,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8 border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          {unit ? 'Editar Unidade de Atendimento' : 'Nova Unidade de Atendimento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome da Unidade *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Código / Sigla *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">CNES</label>
              <input
                type="text"
                value={cnes}
                onChange={(e) => setCnes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Município Sede</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">UF</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 uppercase text-center font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>

          {/* Multiple Municipalities of Coverage (Requirement 11) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800">
              Municípios de Abrangência desta Unidade ({selectedMuns.length} selecionados)
            </div>
            <p className="text-[11px] text-slate-500">
              Pacientes cadastrados nesta unidade poderão ser vinculados a estes municípios.
            </p>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {municipalities.map((m) => (
                <label key={m.id} className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={selectedMuns.includes(m.name)}
                    onChange={() => toggleMun(m.name)}
                    className="rounded text-cyan-600"
                  />
                  <span className="truncate">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors">
              Salvar Unidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MUNICIPALITY MODAL
const MunicipalityModal: React.FC<{
  isOpen: boolean;
  municipality: Municipality | null;
  onClose: () => void;
  onSave: (data: Partial<Municipality>) => void;
}> = ({ isOpen, municipality, onClose, onSave }) => {
  const [name, setName] = useState(municipality?.name || '');
  const [state, setState] = useState(municipality?.state || 'SP');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do município.');
      return;
    }
    onSave({
      name: name.trim(),
      state: state.trim().toUpperCase(),
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          {municipality ? 'Editar Município' : 'Cadastrar Novo Município'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome do Município *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Campinas, Guarulhos..."
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">UF (Estado) *</label>
            <input
              type="text"
              maxLength={2}
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold uppercase"
              required
            />
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PROCEDURE MODAL
const ProcedureModal: React.FC<{
  isOpen: boolean;
  procedure: Procedure | null;
  units: Unit[];
  onClose: () => void;
  onSave: (data: Partial<Procedure>) => void;
}> = ({ isOpen, procedure, units, onClose, onSave }) => {
  const [name, setName] = useState(procedure?.name || '');
  const [codeSigtap, setCodeSigtap] = useState(procedure?.codeSigtap || '');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    procedure?.unitIds || units.map((u) => u.id)
  );

  const toggleUnit = (uid: string) => {
    setSelectedUnits((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedUnits.length === 0) {
      alert('Vincule o procedimento a pelo menos uma unidade.');
      return;
    }
    onSave({
      name: name.trim(),
      codeSigtap: codeSigtap.trim(),
      unitIds: selectedUnits,
      active: true,
      requiresEyeSide: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          {procedure ? 'Editar Procedimento' : 'Novo Procedimento Oftalmológico'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome do Procedimento *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Código SIGTAP</label>
            <input
              type="text"
              value={codeSigtap}
              onChange={(e) => setCodeSigtap(e.target.value)}
              placeholder="04.05..."
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Unidades Autorizadas a Executar este Procedimento *
            </label>
            <div className="space-y-1.5 border border-slate-200 p-2 rounded-lg max-h-40 overflow-y-auto">
              {units.map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(u.id)}
                    onChange={() => toggleUnit(u.id)}
                    className="rounded text-cyan-600"
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// DOCTOR MODAL
const DoctorModal: React.FC<{
  isOpen: boolean;
  doctor: Doctor | null;
  units: Unit[];
  onClose: () => void;
  onSave: (data: Partial<Doctor>) => void;
}> = ({ isOpen, doctor, units, onClose, onSave }) => {
  const [name, setName] = useState(doctor?.name || '');
  const [crm, setCrm] = useState(doctor?.crm || '');
  const [stateCrm, setStateCrm] = useState(doctor?.stateCrm || 'SP');
  const [specialty, setSpecialty] = useState(doctor?.specialty || 'Oftalmologia Geral');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    doctor?.unitIds || units.map((u) => u.id)
  );

  const toggleUnit = (uid: string) => {
    setSelectedUnits((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !crm.trim()) return;
    if (selectedUnits.length === 0) {
      alert('Vincule o médico a pelo menos uma unidade de atuação.');
      return;
    }
    onSave({
      name: name.trim(),
      crm: crm.trim(),
      stateCrm: stateCrm.trim().toUpperCase(),
      specialty: specialty.trim(),
      unitIds: selectedUnits,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          {doctor ? 'Editar Médico' : 'Cadastrar Médico Oftalmologista'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome do Médico *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">CRM *</label>
              <input
                type="text"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">UF CRM</label>
              <input
                type="text"
                maxLength={2}
                value={stateCrm}
                onChange={(e) => setStateCrm(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 uppercase text-center font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Especialidade / Subespecialidade</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Unidades de Atuação *</label>
            <div className="space-y-1.5 border border-slate-200 p-2 rounded-lg max-h-40 overflow-y-auto">
              {units.map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(u.id)}
                    onChange={() => toggleUnit(u.id)}
                    className="rounded text-cyan-600"
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors">
              Salvar Médico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// RESET USER PASSWORD MODAL COMPONENT
const ResetUserPasswordModal: React.FC<{
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onReset: (userId: string, newPassword: string, forceChange: boolean) => Promise<boolean>;
}> = ({ isOpen, user, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState('Saude@123');
  const [forceChange, setForceChange] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 4) {
      setFeedback({ type: 'error', text: 'A senha deve conter no mínimo 4 caracteres.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    const ok = await onReset(user.id, newPassword.trim(), forceChange);
    setIsSubmitting(false);

    if (ok) {
      setFeedback({ type: 'success', text: `Senha redefinida com sucesso para o usuário ${user.name}!` });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', text: 'Falha ao redefinir a senha.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Redefinir Senha do Usuário</h3>
            <p className="text-xs text-slate-500">
              Operador: <strong>{user.name}</strong> (Login: <code className="font-mono text-slate-700">{user.login}</code>)
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Nova Senha Provisória</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Gerar Senha Aleatória</span>
              </button>
            </div>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-bold text-slate-900">Exigir troca no próximo login</span>
            </label>
            <p className="text-[10px] text-slate-600 pl-5">
              Ao acessar com esta senha provisória, o operador será obrigado a cadastrar sua própria senha pessoal antes de usar o sistema.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : 'Confirmar e Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

