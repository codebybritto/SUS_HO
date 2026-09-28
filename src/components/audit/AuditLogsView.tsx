import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Calendar,
  Building,
  Eye,
  Bot,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileCode,
} from 'lucide-react';
import { AuditLog, AuditActionType } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTimeBR } from '../../utils/date';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (!hasPermission('view_logs')) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Acesso Restrito a Administradores</h3>
        <p className="text-xs text-slate-500 mt-2">
          Os logs de auditoria e conformidade são protegidos e estão disponíveis exclusivamente para usuários com permissão explícita de auditoria.
        </p>
      </div>
    );
  }

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          log.description.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.entityLabel.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, entityFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-700" />
              <span>Auditoria Geral e Rastreabilidade do Sistema</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro imutável de todas as operações, alterações cadastrais, evoluções e regras automáticas com valores anteriores e novos.
            </p>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Total de Logs Registrados: <strong>{auditLogs.length}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, usuário ou paciente..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-slate-800"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-800"
            >
              <option value="ALL">Todas as Ações</option>
              <option value="CREATE">CREATE (Criação)</option>
              <option value="UPDATE">UPDATE (Alteração)</option>
              <option value="DELETE">DELETE (Exclusão Lógica)</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE (Mudança de Condição)</option>
              <option value="CONTACT_ATTEMPT">CONTACT_ATTEMPT (Tentativa de Contato)</option>
              <option value="EVOLUTION">EVOLUTION (Evolução / Tratativa)</option>
              <option value="ABSENCE">ABSENCE (Registro de Falta)</option>
              <option value="AUTO_RULE">AUTO_RULE (Gatilho Automático do Sistema)</option>
              <option value="ADMIN_CHANGE">ADMIN_CHANGE (Configuração Administrativa)</option>
            </select>
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-800"
            >
              <option value="ALL">Todas as Entidades</option>
              <option value="patient">Pacientes</option>
              <option value="user">Usuários</option>
              <option value="unit">Unidades</option>
              <option value="procedure">Procedimentos</option>
              <option value="doctor">Médicos</option>
              <option value="setting">Configurações de Regras</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Data / Hora</th>
                <th className="py-2.5 px-3 font-semibold">Ação</th>
                <th className="py-2.5 px-3 font-semibold">Usuário Responsável</th>
                <th className="py-2.5 px-3 font-semibold">Entidade / Objeto</th>
                <th className="py-2.5 px-3 font-semibold">Descrição do Evento</th>
                <th className="py-2.5 px-3 font-semibold text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum log encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAuto = log.isAutomatic || log.action === 'AUTO_RULE';
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {formatDateTimeBR(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isAuto
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : log.action === 'DELETE'
                              ? 'bg-rose-100 text-rose-800'
                              : log.action === 'CREATE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {isAuto ? (
                          <span className="flex items-center gap-1 text-amber-800 font-bold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Sistema Automático</span>
                          </span>
                        ) : (
                          log.userName
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 font-semibold">{log.entityLabel}</span>
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-md truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Ver Diff
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details / Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 mr-2">
                  {selectedLog.action}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedLog.entityLabel} ({selectedLog.entityType})
                </span>
                <div className="text-xs text-slate-500 mt-1">
                  Registrado em {formatDateTimeBR(selectedLog.timestamp)} por {selectedLog.userName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-800 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Descrição:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 leading-relaxed">
                  {selectedLog.description}
                </div>
              </div>

              {/* Diff view */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Valores Anteriores:</span>
                  <pre className="p-3 bg-rose-50 border border-rose-200 rounded text-[11px] font-mono text-rose-950 overflow-x-auto">
                    {selectedLog.previousValues && Object.keys(selectedLog.previousValues).length > 0
                      ? JSON.stringify(selectedLog.previousValues, null, 2)
                      : 'Nenhum valor anterior (registro inicial)'}
                  </pre>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Novos Valores:</span>
                  <pre className="p-3 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-mono text-emerald-950 overflow-x-auto">
                    {selectedLog.newValues && Object.keys(selectedLog.newValues).length > 0
                      ? JSON.stringify(selectedLog.newValues, null, 2)
                      : 'Nenhum dado adicional'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
