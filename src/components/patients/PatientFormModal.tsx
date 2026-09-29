import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  AlertTriangle,
  Eye,
  Calendar,
  Building,
  Stethoscope,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import { Patient, EyeSide, PatientStatus, PatientProcedureItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateInputValue } from '../../utils/date';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSaved?: (patient: Patient) => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  onSaved,
}) => {
  const { units, procedures, doctors, municipalities, addPatient, updatePatient } = useApp();
  const { allowedUnits, activeUnitId, hasPermission } = useAuth();

  const defaultUnit =
    patientToEdit?.unitId ||
    (activeUnitId !== 'ALL' ? activeUnitId : allowedUnits[0]?.id || units[0]?.id || '');

  const [unitId, setUnitId] = useState<string>(defaultUnit);
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');

  // Multiple procedures list
  const [selectedProcedures, setSelectedProcedures] = useState<PatientProcedureItem[]>([]);
  // Temp inputs for adding a procedure to list
  const [tempProcedureId, setTempProcedureId] = useState<string>('');
  const [tempEyeSide, setTempEyeSide] = useState<EyeSide>('AO');

  const [requestedDate, setRequestedDate] = useState<string>(getTodayDateInputValue());
  const [requestingDoctorId, setRequestingDoctorId] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [city, setCity] = useState<string>('');
  const [hasFollowup, setHasFollowup] = useState<boolean>(false);
  const [followupDate, setFollowupDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<PatientStatus>('Aguardando Contato');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Find active unit object
  const currentUnitObj = units.find((u) => u.id === unitId);

  // Unique list of all active registered municipalities in the system, sorted alphabetically
  const allRegisteredMunicipalities = React.useMemo(() => {
    const list = municipalities
      .filter((m) => m.active !== false)
      .map((m) => m.name.trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [municipalities]);

  // Municipalities attended by the currently selected unit
  const unitAttendedMunicipalities = React.useMemo(() => {
    if (!currentUnitObj?.municipalities) return [];
    return Array.from(
      new Set(currentUnitObj.municipalities.map((m) => m.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [currentUnitObj]);

  // Other registered municipalities in the system not covered by this unit
  const otherMunicipalities = React.useMemo(() => {
    return allRegisteredMunicipalities.filter((m) => !unitAttendedMunicipalities.includes(m));
  }, [allRegisteredMunicipalities, unitAttendedMunicipalities]);

  // Auto-fill municipality if unit attends only one
  useEffect(() => {
    if (!patientToEdit) {
      if (unitAttendedMunicipalities.length === 1) {
        setCity(unitAttendedMunicipalities[0]);
      }
    }
  }, [unitAttendedMunicipalities, patientToEdit]);

  // FILTER PROCEDURES BY SELECTED UNIT
  const availableProcedures = procedures.filter(
    (p) => p.active && (!unitId || p.unitIds.includes(unitId))
  );

  // FILTER DOCTORS BY SELECTED UNIT
  const availableDoctors = doctors.filter(
    (d) => d.active && (!unitId || d.unitIds.includes(unitId))
  );

  // When patientToEdit changes or modal opens
  useEffect(() => {
    if (patientToEdit) {
      setUnitId(patientToEdit.unitId);
      setName(patientToEdit.name);
      setBirthDate(patientToEdit.birthDate);

      // Populate procedures list
      if (patientToEdit.procedures && patientToEdit.procedures.length > 0) {
        setSelectedProcedures(patientToEdit.procedures);
      } else if (patientToEdit.requestedProcedureId) {
        setSelectedProcedures([
          {
            id: `pitem-${Date.now()}`,
            procedureId: patientToEdit.requestedProcedureId,
            procedureName: patientToEdit.requestedProcedureName,
            eyeSide: patientToEdit.eyeSide || 'AO',
            dateRequested: patientToEdit.requestedDate,
          },
        ]);
      } else {
        setSelectedProcedures([]);
      }

      setRequestedDate(patientToEdit.requestedDate);
      setRequestingDoctorId(patientToEdit.requestingDoctorId);
      setIsUrgent(patientToEdit.isUrgent);
      setCity(patientToEdit.city);
      setHasFollowup(patientToEdit.hasFollowup);
      setFollowupDate(patientToEdit.followupDate || '');
      setNotes(patientToEdit.notes || '');
      setCurrentStatus(
        patientToEdit.currentStatus === 'Micrologos'
          ? 'Aguardando Micrologos'
          : patientToEdit.currentStatus
      );
    } else {
      setUnitId(defaultUnit);
      setName('');
      setBirthDate('');
      setSelectedProcedures([]);
      setTempProcedureId('');
      setTempEyeSide('AO');
      setRequestedDate(getTodayDateInputValue());
      setRequestingDoctorId('');
      setIsUrgent(false);
      setCity('');
      setHasFollowup(false);
      setFollowupDate('');
      setNotes('');
      setCurrentStatus('Aguardando Contato');
    }
    setErrorMsg('');
  }, [patientToEdit, isOpen, defaultUnit]);

  // Handle adding procedure to list
  const handleAddProcedure = () => {
    if (!tempProcedureId) {
      setErrorMsg('Selecione um procedimento para adicionar.');
      return;
    }
    const procObj = procedures.find((p) => p.id === tempProcedureId);
    if (!procObj) return;

    // Check if duplicate with same eye
    const exists = selectedProcedures.some(
      (p) => p.procedureId === tempProcedureId && p.eyeSide === tempEyeSide
    );
    if (exists) {
      setErrorMsg('Este procedimento com esta lateralidade já foi adicionado.');
      return;
    }

    const newItem: PatientProcedureItem = {
      id: `pitem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      procedureId: tempProcedureId,
      procedureName: procObj.name,
      codeSigtap: procObj.codeSigtap,
      eyeSide: tempEyeSide,
      dateRequested: requestedDate,
    };

    setSelectedProcedures([...selectedProcedures, newItem]);
    setTempProcedureId('');
    setErrorMsg('');
  };

  const handleRemoveProcedure = (itemId: string) => {
    setSelectedProcedures(selectedProcedures.filter((p) => p.id !== itemId));
  };

  if (!isOpen) return null;

  const isEditing = !!patientToEdit;

  // Check permissions
  if (isEditing && !hasPermission('edit_patients')) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">Sem Permissão</h3>
          <p className="text-xs text-slate-500 mt-1">
            Seu usuário não possui permissão para editar registros de pacientes.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('O nome do paciente é obrigatório.');
      return;
    }

    if (!birthDate) {
      setErrorMsg('A data de nascimento é obrigatória.');
      return;
    }

    if (!unitId) {
      setErrorMsg('Selecione a unidade responsável.');
      return;
    }

    if (selectedProcedures.length === 0) {
      setErrorMsg('Inclua pelo menos um procedimento solicitado para o paciente.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Informe ou selecione o município do paciente.');
      return;
    }

    if (!requestingDoctorId) {
      setErrorMsg('Selecione o médico solicitante credenciado para a unidade.');
      return;
    }

    const docObj = doctors.find((d) => d.id === requestingDoctorId);

    const payload: Partial<Patient> & { procedures: PatientProcedureItem[] } = {
      name: name.trim(),
      birthDate,
      unitId,
      procedures: selectedProcedures,
      requestedProcedureId: selectedProcedures[0].procedureId,
      requestedProcedureName: selectedProcedures.map((p) => `${p.procedureName} (${p.eyeSide})`).join(', '),
      eyeSide: selectedProcedures[0].eyeSide,
      requestedDate,
      requestingDoctorId,
      requestingDoctorName: docObj?.name || '',
      isUrgent,
      city: city.trim(),
      hasFollowup,
      followupDate: hasFollowup ? followupDate : undefined,
      notes: notes.trim(),
      currentStatus,
    };

    if (isEditing && patientToEdit) {
      updatePatient(patientToEdit.id, payload);
      if (onSaved) onSaved({ ...patientToEdit, ...payload });
    } else {
      const created = addPatient(payload);
      if (onSaved) onSaved(created);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-start p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-2 sm:my-6 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
        {/* Header - Fixed at Top */}
        <div className="shrink-0 bg-slate-950 px-5 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-cyan-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isEditing ? 'Editar Registro de Paciente' : 'Cadastrar Paciente'}
              </h2>
              <p className="text-xs text-slate-400">
                Regulação e controle de fila de atendimento ambulatorial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Form Body - Scrollable with Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

          {/* Unit Responsible */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Building className="w-4 h-4 text-cyan-600" />
              <span>Unidade Responsável pelo Acompanhamento</span>
            </div>
            <select
              value={unitId}
              onChange={(e) => {
                const newUid = e.target.value;
                setUnitId(newUid);
                if (!patientToEdit) {
                  const targetUnit = units.find((u) => u.id === newUid);
                  if (targetUnit?.municipalities?.length === 1) {
                    setCity(targetUnit.municipalities[0]);
                  } else if (targetUnit?.municipalities && targetUnit.municipalities.length > 0) {
                    if (!targetUnit.municipalities.includes(city)) {
                      setCity('');
                    }
                  }
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            >
              {allowedUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.city}) {u.cnes ? `· CNES: ${u.cnes}` : ''}
                </option>
              ))}
            </select>
            {currentUnitObj && currentUnitObj.municipalities && currentUnitObj.municipalities.length > 0 && (
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Municípios atendidos por esta unidade: </span>
                {currentUnitObj.municipalities.join(', ')}
              </p>
            )}
          </div>

          {/* Patient Identification (CNS and CPF removed as requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo do Paciente *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Maria do Carmo Silva"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Município de Residência (Municípios Atendidos) *</span>
                {unitAttendedMunicipalities.length > 0 && (
                  <span className="text-[10px] text-cyan-700 font-semibold lowercase">
                    {unitAttendedMunicipalities.length} atendido(s)
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                  required
                >
                  <option value="">-- Selecione o município atendido --</option>

                  {/* Caso o paciente já possua um município salvo que não conste na lista, mantém para não perder dados */}
                  {city &&
                    !unitAttendedMunicipalities.includes(city) &&
                    !otherMunicipalities.includes(city) && (
                      <option value={city}>{city} (Registrado no prontuário)</option>
                    )}

                  {unitAttendedMunicipalities.length > 0 ? (
                    <>
                      <optgroup
                        label={`Municípios Atendidos pela ${currentUnitObj?.name || 'Unidade'}`}
                      >
                        {unitAttendedMunicipalities.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                      {otherMunicipalities.length > 0 && (
                        <optgroup label="Outros Municípios Cadastrados no Sistema">
                          {otherMunicipalities.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  ) : (
                    allRegisteredMunicipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Apenas municípios atendidos e cadastrados no sistema estão disponíveis para seleção.
              </p>
            </div>
          </div>

          {/* MULTIPLE PROCEDURES SECTION (Requirement: Possibilidade de incluir mais de um procedimento) */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-cyan-600" />
                <span>Procedimentos Oftalmológicos Solicitados ({selectedProcedures.length})</span>
              </div>
              <span className="text-[11px] text-slate-500">Pelo menos 1 obrigatório</span>
            </div>

            {/* List of currently added procedures */}
            {selectedProcedures.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedProcedures.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-700">#{idx + 1}</span>
                      <span className="font-semibold text-slate-800">{item.procedureName}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 font-bold border border-slate-300">
                        {item.eyeSide === 'AO'
                          ? 'AO — Ambos os Olhos'
                          : item.eyeSide === 'OD'
                          ? 'OD — Olho Direito'
                          : 'OE — Olho Esquerdo'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProcedure(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Remover este procedimento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
                Nenhum procedimento adicionado. Selecione abaixo e clique em "+ Adicionar Procedimento".
              </div>
            )}

            {/* Add new procedure inline selector */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-7">
                <select
                  value={tempProcedureId}
                  onChange={(e) => setTempProcedureId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Selecione o procedimento permitido...</option>
                  {availableProcedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.codeSigtap ? `· SIGTAP: ${p.codeSigtap}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={tempEyeSide}
                  onChange={(e) => setTempEyeSide(e.target.value as EyeSide)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="AO">AO — Ambos os olhos</option>
                  <option value="OD">OD — Olho direito</option>
                  <option value="OE">OE — Olho esquerdo</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddProcedure}
                  className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Requested Date & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Data Solicitada / Encaminhamento *
              </label>
              <input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Médico Solicitante * (Filtrado p/ Unidade)
              </label>
              <select
                value={requestingDoctorId}
                onChange={(e) => setRequestingDoctorId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              >
                <option value="">Selecione o médico...</option>
                {availableDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (CRM {d.crm}-{d.stateCrm})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Urgency & Accompaniment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Condição / Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as PatientStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Aguardando Contato">Aguardando Contato</option>
                <option value="Agendado">Agendado</option>
                <option value="Regulado">Regulado</option>
                <option value="Aguardando Micrologos">Aguardando Micrologos</option>
                <option value="Doente">Doente</option>
                <option value="Faltou">Faltou</option>
                <option value="Desistência">Desistência</option>
                <option value="Óbito">Óbito</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  Classificar como URGENTE (Prioritário)
                </span>
              </label>
            </div>
          </div>

          {/* Accompaniment */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFollowup}
                onChange={(e) => setHasFollowup(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                Possui acompanhamento agendado / retorno clínico?
              </span>
            </label>

            {hasFollowup && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data Prevista do Acompanhamento:
                </label>
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full sm:w-1/2 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observações Gerais / Histórico
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais do encaminhamento, UBS de origem ou necessidades especiais..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          </div>

          {/* Sticky Actions Footer */}
          <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
