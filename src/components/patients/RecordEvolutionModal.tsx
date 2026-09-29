import React, { useState } from 'react';
import { X, Activity, AlertTriangle, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { Patient } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateInputValue, getCurrentTimeInputValue } from '../../utils/date';

interface RecordEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const RecordEvolutionModal: React.FC<RecordEvolutionModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { recordEvolution } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [situation, setSituation] = useState<string>('Agendado');
  const [date, setDate] = useState<string>(getTodayDateInputValue());
  const [time, setTime] = useState<string>(getCurrentTimeInputValue());
  const [notes, setNotes] = useState<string>('');
  // Complementary fields
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [scheduledLocation, setScheduledLocation] = useState<string>('');
  const [medicalNote, setMedicalNote] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [desistenceReason, setDesistenceReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  if (!hasPermission('record_evolution')) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Permissão Negada</h3>
          <p className="text-sm text-slate-600 mt-2">
            Seu usuário não possui permissão para registrar evoluções ou tratativas clínicas.
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
    if (!notes.trim()) {
      setErrorMsg('Por favor, descreva os detalhes e observações desta evolução.');
      return;
    }

    const complementaryInfo = {
      scheduledDate: situation === 'Agendado' ? scheduledDate : undefined,
      scheduledTime: situation === 'Agendado' ? scheduledTime : undefined,
      scheduledLocation: situation === 'Agendado' ? scheduledLocation : undefined,
      medicalNote: situation === 'Doente' ? medicalNote : undefined,
      returnDate: situation === 'Doente' ? returnDate : undefined,
      reason: situation === 'Desistência' ? desistenceReason : undefined,
    };

    recordEvolution(patient.id, situation, notes.trim(), complementaryInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-2 sm:my-6 border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="shrink-0 bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-cyan-900/30">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white">Registrar Evolução / Tratativa</h2>
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

          {/* Patient summary badge */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">{patient.name}</div>
            <div className="text-slate-500 mt-0.5">
              Condição Atual: <span className="font-bold text-slate-800">{patient.currentStatus}</span> · {patient.requestedProcedureName} ({patient.eyeSide})
            </div>
          </div>

          {/* Situation selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Situação / Tratativa Registrada *
            </label>
            <select
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            >
              <option value="Agendado">Agendado (Procedimento Marcado)</option>
              <option value="Regulado">Regulado (Autorizado na Regulação)</option>
              <option value="Aguardando Micrologos">Aguardando Micrologos</option>
              <option value="Doente">Doente (Impossibilitado Temporariamente)</option>
              <option value="Faltou">Faltou ao Agendamento</option>
              <option value="Desistência">Desistência do Paciente</option>
              <option value="Óbito">Óbito</option>
              <option value="Concluído">Concluído / Alta Cirúrgica</option>
              <option value="Em Tratativa">Em Tratativa / Aguardando Documento</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Esta evolução atualizará a condição do paciente e será arquivada na Timeline com autoria de {currentUser?.name}.
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data</span>
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
                <span>Hora</span>
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

          {/* Conditional Fields based on Situation */}
          {situation === 'Agendado' && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-lg space-y-2.5">
              <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Dados Cirúrgicos:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-teal-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    <span>Data da Cirurgia</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-teal-800 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    <span>Hora da Cirurgia</span>
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-teal-800 mb-1">Local / Sala de Cirurgia</label>
                <input
                  type="text"
                  placeholder="Ex: Bloco Cirúrgico Central - Sala 1"
                  value={scheduledLocation}
                  onChange={(e) => setScheduledLocation(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {situation === 'Doente' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2">
              <div className="text-xs font-bold text-amber-900">Informações Médicas do Afastamento:</div>
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-0.5">CID ou Descrição do Atestado</label>
                <input
                  type="text"
                  placeholder="Ex: Internação clínica por infecção / CID J18"
                  value={medicalNote}
                  onChange={(e) => setMedicalNote(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-0.5">Previsão de Retorno</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          )}

          {situation === 'Desistência' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md space-y-2">
              <div className="text-xs font-bold text-rose-900">Motivo da Desistência:</div>
              <input
                type="text"
                placeholder="Ex: Realizou cirurgia em rede privada / Não tem interesse no momento"
                value={desistenceReason}
                onChange={(e) => setDesistenceReason(e.target.value)}
                className="w-full bg-white border border-rose-300 rounded px-2.5 py-1 text-xs"
              />
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Observações e Detalhes da Evolução *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva detalhadamente o andamento, comunicação com o paciente ou decisão clínica..."
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
              <span>Salvar Evolução</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
