import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type MainTab = 'dashboard' | 'patients' | 'reports' | 'audit' | 'admin';

interface NavigationProps {
  currentTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  onNewPatient: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab, onNewPatient }) => {
  const { hasPermission } = useAuth();

  const canViewPatients = hasPermission('view_patients');
  const canCreatePatient = hasPermission('create_patients');
  const canViewLogs = hasPermission('view_logs');
  const canViewReports = hasPermission('view_reports');
  const canAdmin =
    hasPermission('manage_users') ||
    hasPermission('manage_units') ||
    hasPermission('manage_procedures') ||
    hasPermission('manage_doctors') ||
    hasPermission('manage_municipalities') ||
    hasPermission('manage_settings');

  const navItems = [
    {
      id: 'dashboard' as MainTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'patients' as MainTab,
      label: 'Pacientes',
      icon: Users,
      visible: canViewPatients,
    },
    {
      id: 'reports' as MainTab,
      label: 'Relatórios',
      icon: FileText,
      visible: canViewReports,
    },
    {
      id: 'audit' as MainTab,
      label: 'Auditoria & Logs',
      icon: ShieldAlert,
      visible: canViewLogs,
    },
    {
      id: 'admin' as MainTab,
      label: 'Administração',
      icon: Settings,
      visible: canAdmin,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-xs no-print">
      <div className="flex items-center justify-between">
        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Quick Action: New Patient */}
        {canCreatePatient && (
          <button
            type="button"
            onClick={onNewPatient}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Cadastrar Paciente</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </div>
    </div>
  );
};
