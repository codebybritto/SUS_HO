import React, { useState } from 'react';
import { X, CalendarX, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Patient } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateInputValue } from '../../utils/date';

interface RecordAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const RecordAbsenceModal: React.FC<RecordAbsenceModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { recordAbsence, settings } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const nextAbsenceNum = patient.totalAbsences + 1;
  const willTriggerMicrologos =
    settings.autoAguardandoMicrologosOnAbsences &&
    nextAbsenceNum >= settings.absencesThresholdForAguardandoMicrologos;

  const [date, setDate] = useState<string>(getTodayDateInputValue());
  const [scheduledDate, setScheduledDate] = useState<string>(getTodayDateInputValue());
  const [reason, setReason] = useState<string>('Não compareceu sem justificativa');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  if (!hasPermission('record_evolution') && !hasPermission('change_patient_status')) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Permissão Negada</h3>
          <p className="text-sm text-slate-600 mt-2">
            Seu usuário não possui permissão para registrar faltas ou alterar a condição de pacientes.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 px-4 py-2 bg-slate-800 text-white rounded text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      setErrorMsg('Informe a data agendada em que o paciente faltou.');
      return;
    }

    recordAbsence(patient.id, {
      date,
      scheduledDate,
      reason,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden my-2 sm:my-6 border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="shrink-0 bg-rose-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Registrar Falta ({nextAbsenceNum}ª Falta)
              </h2>
              <p className="text-xs text-rose-300 truncate max-w-xs">{patient.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-rose-200 hover:text-white bg-rose-900/80 px-2 py-1 rounded-md text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Absence Counter indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Histórico de Faltas:</span>
              <span className="font-bold text-slate-800">
                {patient.totalAbsences} falta(s) anterior(es)
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2].map((num) => (
                <div
                  key={num}
                  className={`flex-1 py-1 px-2 text-center text-xs rounded border font-semibold ${
                    num <= patient.totalAbsences
                      ? 'bg-rose-100 border-rose-300 text-rose-800'
                      : num === nextAbsenceNum
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {num}ª Falta
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Rule Warning Banner */}
          {willTriggerMicrologos && (
            <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-md text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gatilho de Regra Automática:</span>
                O registro desta <strong>{nextAbsenceNum}ª falta</strong> atingirá o limite configurado ({settings.absencesThresholdForAguardandoMicrologos} faltas).
                O sistema <strong>alterará automaticamente a condição do paciente para "Aguardando Micrologos"</strong> e adicionará o registro de auditoria e evento na Timeline.
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data do Registro
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data do Agendamento Faltado *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Motivo Inicial Informado
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="Não compareceu sem justificativa">Não compareceu sem justificativa</option>
              <option value="Alegou falta de condução/transporte municipal">Alegou falta de condução/transporte</option>
              <option value="Alegou compromisso pessoal">Alegou compromisso pessoal</option>
              <option value="Sem contato telefônico no dia">Sem contato telefônico no dia</option>
              <option value="Outro motivo">Outro motivo</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais sobre a ausência ou tentativa posterior de verificação..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registrar Falta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
