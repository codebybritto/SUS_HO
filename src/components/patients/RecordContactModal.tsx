import React, { useState } from 'react';
import { X, PhoneCall, AlertTriangle, Calendar, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Patient, ContactAttempt } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateInputValue, getCurrentTimeInputValue } from '../../utils/date';

interface RecordContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const RecordContactModal: React.FC<RecordContactModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { recordContactAttempt, settings } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const nextAttemptNum = patient.contactAttempts.length + 1;
  const isLastAllowedAttempt = nextAttemptNum >= settings.maxContactAttempts;

  const [date, setDate] = useState<string>(getTodayDateInputValue());
  const [time, setTime] = useState<string>(getCurrentTimeInputValue());
  const [channel, setChannel] = useState<ContactAttempt['channel']>('Telefone');
  const [result, setResult] = useState<ContactAttempt['result']>('Sem Resposta / Chamou até cair');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  if (!hasPermission('record_contact_attempt')) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Permissão Negada</h3>
          <p className="text-sm text-slate-600 mt-2">
            Seu usuário não possui permissão para registrar tentativas de contato com o paciente.
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

  // Determine if chosen result counts as success
  const isSuccessful =
    result === 'Contato com Sucesso - Agendamento Confirmado' ||
    result === 'Contato com Sucesso - Paciente Recusou / Desistiu' ||
    result === 'Contato com Sucesso - Paciente Informou Doença';

  const willTriggerAutomaticMicrologos =
    !isSuccessful &&
    settings.autoAguardandoMicrologosOnFailedContacts &&
    patient.contactAttempts.filter((a) => !a.isSuccessful).length + 1 >= settings.maxContactAttempts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg('Por favor, informe uma observação sobre a tentativa de contato realizada.');
      return;
    }

    recordContactAttempt(patient.id, {
      date,
      time,
      channel,
      result,
      isSuccessful,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-2 sm:my-6 border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="shrink-0 bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-cyan-900/30">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Registrar Tentativa de Contato ({nextAttemptNum} de {settings.maxContactAttempts})
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{patient.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded-md text-xs font-semibold"
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

          {/* Contact attempts history bar */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Status das Tentativas de Contato:</span>
              <span className="text-teal-700 font-bold">{patient.contactAttempts.length} / {settings.maxContactAttempts} registradas</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => {
                const prevAttempt = patient.contactAttempts.find((a) => a.attemptNumber === num);
                const isCurrent = num === nextAttemptNum;
                return (
                  <div
                    key={num}
                    className={`p-2 rounded text-center text-xs border ${
                      prevAttempt
                        ? prevAttempt.isSuccessful
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                        : isCurrent
                        ? 'bg-teal-50 border-teal-400 text-teal-900 font-bold ring-1 ring-teal-400'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">{num}ª Tentativa</div>
                    <div className="text-[10px] mt-0.5">
                      {prevAttempt
                        ? prevAttempt.isSuccessful
                          ? 'Sucesso'
                          : 'Sem Sucesso'
                        : isCurrent
                        ? 'Registrando Agora'
                        : 'Pendente'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Rule Warning Banner */}
          {willTriggerAutomaticMicrologos && (
            <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-md text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Atenção: Gatilho de Regra Automática</span>
                Como esta é a {nextAttemptNum}ª tentativa de contato e o resultado indicado é de insucesso,
                o sistema <strong>alterará automaticamente a condição deste paciente para "Aguardando Micrologos"</strong> e registrará o evento na Timeline.
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data da Ligação/Contato</span>
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
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Horário</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800"
                required
              />
            </div>
          </div>

          {/* Canal de Comunicação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Canal de Comunicação *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { value: 'Telefone', label: 'Ligação Telefônica' },
                { value: 'WhatsApp', label: 'WhatsApp' },
                { value: 'Recado Familiar', label: 'Recado Familiar' },
                { value: 'Agente de Saúde', label: 'Agente Comunitário' },
                { value: 'Outro', label: 'Outro Meio' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setChannel(item.value as ContactAttempt['channel'])}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md border text-center transition-colors ${
                    channel === item.value
                      ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado do Contato */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Resultado da Tentativa *
            </label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as ContactAttempt['result'])}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              required
            >
              <optgroup label="Tentativas SEM Sucesso">
                <option value="Sem Resposta / Chamou até cair">Sem Resposta / Chamou até cair</option>
                <option value="Número Inexistente / Errado">Número Inexistente / Errado</option>
                <option value="Ocupado">Ocupado / Fora de Área</option>
                <option value="Recado Deixado">Recado Deixado (Aguardando retorno)</option>
              </optgroup>
              <optgroup label="Tentativas COM Sucesso">
                <option value="Contato com Sucesso - Agendamento Confirmado">
                  Contato com Sucesso - Agendamento Confirmado
                </option>
                <option value="Contato com Sucesso - Paciente Recusou / Desistiu">
                  Contato com Sucesso - Paciente Recusou / Desistiu
                </option>
                <option value="Contato com Sucesso - Paciente Informou Doença">
                  Contato com Sucesso - Paciente Informou Doença
                </option>
              </optgroup>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Observações / Detalhes da Tentativa *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o que ocorreu (ex: número chamou 5 vezes sem resposta; deixado recado com nora Maria; paciente confirmou data...)"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
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
              className="px-4 py-1.5 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Salvar Tentativa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
