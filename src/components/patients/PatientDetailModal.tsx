import React, { useState } from 'react';
import {
  X,
  Clock,
  PhoneCall,
  CalendarX,
  Activity,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Building,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Shield,
  Bot,
  MapPin,
  Stethoscope,
  ChevronRight,
  Filter,
  Printer,
  Download,
  Star,
  FastForward,
} from 'lucide-react';
import { exportHtmlToPdf } from '../../utils/pdfExport';
import { Patient, TimelineEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDateBR, formatDateTimeBR, calculateAge } from '../../utils/date';
import { getStatusStyle } from '../../utils/statusColors';
import { LOGO_BASE64 } from '../../assets/logo';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onEditPatient: (patient: Patient) => void;
  onRecordEvolution: (patient: Patient) => void;
  onRecordContact: (patient: Patient) => void;
  onRecordAbsence: (patient: Patient) => void;
}

type DetailTab = 'timeline' | 'evolutions' | 'contacts' | 'absences' | 'info' | 'logs';

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  onEditPatient,
  onRecordEvolution,
  onRecordContact,
  onRecordAbsence,
}) => {
  const { hasPermission, currentUser } = useAuth();
  const { deletePatient, auditLogs, settings, setPatientPriorityOverride } = useApp();

  const [activeTab, setActiveTab] = useState<DetailTab>('timeline');
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [isSavingPdf, setIsSavingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const canEdit = hasPermission('edit_patients');
  const canDelete = hasPermission('delete_patients');
  const canRecordEvolution = hasPermission('record_evolution');
  const canRecordContact = hasPermission('record_contact_attempt');
  const canViewTimeline = hasPermission('view_timeline');
  const canViewLogs = hasPermission('view_logs');

  const age = calculateAge(patient.birthDate);

  const handleDelete = () => {
    if (!deleteReason.trim()) {
      alert('Informe o motivo da exclusão/inativação do paciente.');
      return;
    }
    deletePatient(patient.id, deleteReason.trim());
    setShowDeleteModal(false);
    onClose();
  };

  // Filter timeline events
  const filteredTimeline = patient.timeline.filter((ev) => {
    if (timelineFilter === 'ALL') return true;
    if (timelineFilter === 'contact' && ev.eventType === 'contact_attempt') return true;
    if (timelineFilter === 'absence' && ev.eventType === 'absence') return true;
    if (timelineFilter === 'evolution' && ev.eventType === 'evolution') return true;
    if (timelineFilter === 'auto' && ev.isAutomatic) return true;
    if (timelineFilter === 'status' && ev.eventType === 'status_change') return true;
    return false;
  });

  // Patient logs
  const patientLogs = auditLogs.filter(
    (log) => log.entityType === 'patient' && log.entityId === patient.id
  );

  // Generate clean neutral HTML for individual patient record
  const generatePatientReportHtml = () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR');
    const prontuarioCode = `PRONT-${patient.id.toUpperCase()}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const procsList = patient.procedures && patient.procedures.length > 0
      ? patient.procedures.map((p) => `<li style="margin-bottom: 3px;"><strong>${p.procedureName}</strong> — Lateralidade: <strong>${p.eyeSide}</strong> ${p.codeSigtap ? `(Código: ${p.codeSigtap})` : ''} ${p.dateRequested ? `[Solicitado em ${formatDateBR(p.dateRequested)}]` : ''}</li>`).join('')
      : `<li><strong>${patient.requestedProcedureName}</strong> — Lateralidade: <strong>${patient.eyeSide}</strong></li>`;

    const contactRows = patient.contactAttempts && patient.contactAttempts.length > 0
      ? patient.contactAttempts.map((c) => `
        <tr style="border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 6px 8px; font-weight: bold; text-align: center; color: #475569;">#${c.attemptNumber}</td>
          <td style="padding: 6px 8px; color: #334155;">${formatDateBR(c.date)} às ${c.time}</td>
          <td style="padding: 6px 8px; color: #334155;">${c.channel}</td>
          <td style="padding: 6px 8px; color: ${c.isSuccessful ? '#047857' : '#b91c1c'}; font-weight: 600;">${c.result}</td>
          <td style="padding: 6px 8px; color: #334155;">${c.userName}</td>
          <td style="padding: 6px 8px; font-size: 10px; color: #475569;">${c.notes || '-'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="padding: 10px; text-align: center; color: #94a3b8;">Nenhuma tentativa de contato registrada.</td></tr>';

    const absenceRows = patient.absences && patient.absences.length > 0
      ? patient.absences.map((a) => `
        <tr style="border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 6px 8px; font-weight: bold; text-align: center; color: #b91c1c;">Falta #${a.absenceNumber}</td>
          <td style="padding: 6px 8px; color: #334155;">${formatDateBR(a.date)}</td>
          <td style="padding: 6px 8px; color: #334155;">${formatDateBR(a.scheduledDate)}</td>
          <td style="padding: 6px 8px; color: #334155;">${a.userName}</td>
          <td style="padding: 6px 8px; font-size: 10px; color: #475569;">${a.reason || a.notes || 'Sem justificativa informada'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="padding: 10px; text-align: center; color: #94a3b8;">Nenhuma falta registrada até o momento.</td></tr>';

    const evolutionRows = patient.evolutions && patient.evolutions.length > 0
      ? patient.evolutions.map((e) => `
        <div style="border-left: 3px solid #475569; background-color: #f8fafc; padding: 8px 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 3px;">
            <span><strong>${formatDateBR(e.date)} às ${e.time}</strong> · Operador: <strong>${e.userName}</strong></span>
            <span style="background-color: #e2e8f0; color: #1e293b; padding: 1px 6px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">${e.situation}</span>
          </div>
          <div style="font-size: 11px; color: #1e293b; line-height: 1.4;">${e.notes}</div>
          ${e.complementaryInfo?.scheduledDate ? `<div style="font-size: 10px; color: #047857; margin-top: 3px;"><strong>Data Agendada:</strong> ${formatDateBR(e.complementaryInfo.scheduledDate)} ${e.complementaryInfo.scheduledLocation ? `— Local: ${e.complementaryInfo.scheduledLocation}` : ''}</div>` : ''}
        </div>
      `).join('')
      : '<div style="padding: 10px; color: #94a3b8; text-align: center;">Nenhuma evolução clínica registrada.</div>';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Prontuário Individual — ${patient.name}</title>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4 portrait; margin: 10mm 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 12px; font-size: 11px; line-height: 1.35; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 12px; }
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-img { height: 56px; max-width: 70px; object-fit: contain; }
          .title-main { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0; }
          .title-sub { font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }
          .meta-box { text-align: right; font-size: 10px; color: #475569; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; }
          .section { margin-bottom: 14px; page-break-inside: avoid; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px; display: flex; justify-content: space-between; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; }
          .info-item { font-size: 11px; }
          .info-label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .info-value { font-weight: 700; color: #0f172a; margin-top: 1px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
          th { background-color: #f1f5f9; color: #1e293b; text-align: left; padding: 6px 8px; font-size: 9px; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 20px; border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9px; color: #64748b; }
          .sig-box { text-align: center; width: 220px; border-top: 1px solid #475569; padding-top: 4px; font-size: 10px; font-weight: 600; color: #0f172a; }
          @media print { body { padding: 0; } tr { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-box">
            <img src="${LOGO_BASE64}" alt="Brasão Oficial" class="logo-img" />
            <div>
              <div class="title-main">Prontuário Individual do Paciente</div>
              <div class="title-sub">Histórico Clínico, Contatos e Linha do Tempo</div>
            </div>
          </div>
          <div class="meta-box">
            <div><strong style="color:#475569;">Registro:</strong> <code style="color:#0f172a; font-weight:700;">${prontuarioCode}</code></div>
            <div><strong style="color:#475569;">Emissão:</strong> <span style="color:#0f172a; font-weight:600;">${dateFormatted} às ${timeFormatted}</span></div>
            <div><strong style="color:#475569;">Operador:</strong> <span style="color:#0f172a; font-weight:600;">${currentUser?.name || 'Administrador'}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title"><span>1. Identificação do Paciente</span><span style="color:#334155;">Condição: ${patient.currentStatus.toUpperCase()}</span></div>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">Nome Completo</div><div class="info-value" style="font-size:12px; color:#0f172a;">${patient.name}</div></div>
            <div class="info-item"><div class="info-label">Nascimento (Idade)</div><div class="info-value">${formatDateBR(patient.birthDate)} (${age !== null ? `${age} anos` : 'N/D'})</div></div>
            <div class="info-item"><div class="info-label">Município</div><div class="info-value">${patient.city}</div></div>
            <div class="info-item"><div class="info-label">Unidade Responsável</div><div class="info-value">${patient.unitName}</div></div>
            <div class="info-item"><div class="info-label">Médico Solicitante</div><div class="info-value">${patient.requestingDoctorName || 'Não informado'}</div></div>
            <div class="info-item"><div class="info-label">Data da Solicitação</div><div class="info-value">${formatDateBR(patient.requestedDate)} (Cadastrado em ${formatDateBR(patient.createdAt)})</div></div>
            <div class="info-item"><div class="info-label">Caráter de Urgência</div><div class="info-value">${patient.isUrgent ? '<span style="color:#b91c1c; font-weight:800;">SIM — PRIORITÁRIO</span>' : 'Rotina (Eletivo)'}</div></div>
            <div class="info-item"><div class="info-label">Acompanhamento</div><div class="info-value">${patient.hasFollowup ? `Sim — Retorno: ${patient.followupDate ? formatDateBR(patient.followupDate) : 'A definir'}` : 'Não requerido'}</div></div>
            <div class="info-item"><div class="info-label">Interações / Faltas</div><div class="info-value">${patient.contactAttempts.length} contato(s) | ${patient.totalAbsences} falta(s)</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Procedimento(s) Solicitado(s)</div>
          <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.5; font-size: 11px;">
            ${procsList}
          </ul>
          ${patient.notes ? `<div style="margin-top: 6px; padding: 6px 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10px; color:#334155;"><strong>Observações Clínicas / Encaminhamento:</strong> ${patient.notes}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">3. Histórico de Tentativas de Contato (${patient.contactAttempts.length} tentativa(s))</div>
          <table>
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">#</th>
                <th style="width: 110px;">Data / Hora</th>
                <th style="width: 90px;">Canal</th>
                <th>Desfecho / Resultado</th>
                <th style="width: 120px;">Operador</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>${contactRows}</tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">4. Histórico de Ausências e Faltas (${patient.totalAbsences} registrada(s))</div>
          <table>
            <thead>
              <tr>
                <th style="width: 80px; text-align: center;">Registro</th>
                <th style="width: 90px;">Data Falta</th>
                <th style="width: 110px;">Agendado Para</th>
                <th style="width: 120px;">Operador</th>
                <th>Motivo / Justificativa</th>
              </tr>
            </thead>
            <tbody>${absenceRows}</tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">5. Prontuário de Tratativas e Evoluções Clínicas (${patient.evolutions.length} registro(s))</div>
          ${evolutionRows}
        </div>

        <div class="footer">
          <div>
            <div>Sistema de Gestão e Controle de Pacientes · Emissão Eletrônica</div>
            <div>Documento emitido para fins regulatórios e assistenciais.</div>
          </div>
          <div>
            <div>Operador: <strong>${currentUser?.name || 'Administrador Responsável'}</strong></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Direct Save as PDF file download using exportHtmlToPdf
  const handleSavePatientPdf = async () => {
    setIsSavingPdf(true);
    const htmlContent = generatePatientReportHtml();
    const safeName = patient.name.replace(/[^a-zA-Z0-9]/g, '_');
    try {
      await exportHtmlToPdf(htmlContent, `historico_paciente_${safeName}.pdf`, { orientation: 'portrait' });
    } catch (e) {
      console.error('Falha ao exportar PDF direto, usando impressão como fallback:', e);
      window.print();
    } finally {
      setIsSavingPdf(false);
    }
  };

  // Direct print dialog
  const handlePrintPatientReport = () => {
    const htmlContent = generatePatientReportHtml();
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            window.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }, 500);
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden my-2 sm:my-6 border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header with Patient Summary - Solid elegant dark background */}
        <div className="shrink-0 bg-[#0f1d33] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{patient.name}</h2>
              {patient.isPriorityOverride && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-400 text-amber-950 border border-amber-300 tracking-wide flex items-center gap-1 shadow-xs"
                  title={
                    patient.priorityOverrideReason
                      ? `Prioridade Gerencial (${patient.priorityOverrideBy || 'Gerência'}): "${patient.priorityOverrideReason}"`
                      : `Prioridade Gerencial definida por ${patient.priorityOverrideBy || 'Gerência'}`
                  }
                >
                  <Star className="w-3 h-3 fill-amber-950 text-amber-950" />
                  PASSADO NA FRENTE
                </span>
              )}
              {patient.isUrgent && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-700 tracking-wider">
                  URGENTE
                </span>
              )}
              {patient.isDeleted && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  INATIVADO
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
              <span>{age !== null ? `${age} anos` : 'Idade N/D'} ({formatDateBR(patient.birthDate)})</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>{patient.city}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-200 font-semibold">{patient.unitName}</span>
            </div>
          </div>

          {/* Action Buttons - Solid clean buttons without blue gradients */}
          <div className="flex flex-wrap items-center gap-2">
            {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor' || hasPermission('change_patient_status')) && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => {
                  if (patient.isPriorityOverride) {
                    if (window.confirm(`Remover prioridade especial de ${patient.name}? O paciente voltará à fila normal.`)) {
                      setPatientPriorityOverride(patient.id, false);
                    }
                  } else {
                    const reason = window.prompt(
                      `Justificativa para passar ${patient.name} na frente da fila (opcional):`,
                      'Determinação da Gerência'
                    );
                    if (reason !== null) {
                      setPatientPriorityOverride(patient.id, true, reason.trim() || undefined);
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                  patient.isPriorityOverride
                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700'
                }`}
                title={patient.isPriorityOverride ? 'Remover prioridade especial' : 'Passar este paciente na frente da fila'}
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{patient.isPriorityOverride ? 'Fila Normal' : 'Passar na Frente'}</span>
              </button>
            )}

            {/* Direct Save PDF file download */}
            <button
              type="button"
              onClick={handleSavePatientPdf}
              disabled={isSavingPdf}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              title="Salvar arquivo PDF diretamente no seu computador"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isSavingPdf ? 'Gerando PDF...' : 'Salvar PDF'}</span>
            </button>

            {/* Print dialog */}
            <button
              type="button"
              onClick={handlePrintPatientReport}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xs transition-colors"
              title="Imprimir prontuário em impressora"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>

            {canRecordEvolution && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => onRecordEvolution(patient)}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                title="Registrar Tratativa / Evolução"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Evoluir</span>
              </button>
            )}

            {canRecordContact && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => onRecordContact(patient)}
                className="flex items-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                title="Registrar Tentativa de Contato"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contato ({patient.contactAttempts.length}/{settings.maxContactAttempts})</span>
              </button>
            )}

            {canRecordEvolution && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => onRecordAbsence(patient)}
                className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                title="Registrar Falta"
              >
                <CalendarX className="w-3.5 h-3.5" />
                <span>Falta ({patient.totalAbsences})</span>
              </button>
            )}

            {canEdit && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => onEditPatient(patient)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                title="Editar Cadastro do Paciente"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}

            {canDelete && !patient.isDeleted && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                title="Excluir / Inativar Paciente"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold transition-colors shadow-xs ml-1"
              title="Fechar Janela"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Status & Key Metrics Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-slate-500 font-medium">Condição Atual:</span>{' '}
              {(() => {
                const style = getStatusStyle(patient.currentStatus);
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold border text-xs ${style.badgeClass}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: style.dotColor }}
                    />
                    <span>{style.label}</span>
                  </span>
                );
              })()}
            </div>

            <div>
              <span className="text-slate-500 font-medium">Procedimento(s):</span>{' '}
              <span className="font-semibold text-slate-900">{patient.requestedProcedureName}</span>
            </div>

            {patient.requestingDoctorName && (
              <div>
                <span className="text-slate-500 font-medium">Médico:</span>{' '}
                <span className="text-slate-800 font-medium">{patient.requestingDoctorName}</span>
              </div>
            )}

            {patient.isPriorityOverride && (
              <div>
                <span className="text-slate-500 font-medium">Fila:</span>{' '}
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-300">
                  ★ Passado na Frente por {patient.priorityOverrideBy || 'Gerência'}
                  {patient.priorityOverrideReason ? ` (${patient.priorityOverrideReason})` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">
              Contatos:{' '}
              <strong className={patient.contactAttempts.length >= 3 ? 'text-rose-600' : 'text-slate-800'}>
                {patient.contactAttempts.length}/{settings.maxContactAttempts}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">
              Faltas:{' '}
              <strong className={patient.totalAbsences >= 2 ? 'text-rose-600' : 'text-slate-800'}>
                {patient.totalAbsences}
              </strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-6 bg-white flex space-x-4 overflow-x-auto text-xs font-semibold">
          {canViewTimeline && (
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline Completa ({patient.timeline.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('evolutions')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'evolutions'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Evoluções & Tratativas ({patient.evolutions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Tentativas de Contato ({patient.contactAttempts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('absences')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'absences'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarX className="w-3.5 h-3.5" />
            <span>Ocorrências de Faltas ({patient.totalAbsences})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ficha Cadastral</span>
          </button>

          {canViewLogs && (
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Auditoria ({patientLogs.length})</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* TAB 1: TIMELINE DO PACIENTE */}
          {activeTab === 'timeline' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="text-xs text-slate-500">
                  Trajetória cronológica de todos os eventos, cadastros, alterações e gatilhos automáticos do sistema.
                </div>

                {/* Filter timeline buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs">
                  {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 'status', label: 'Status' },
                    { id: 'contact', label: 'Contatos' },
                    { id: 'absence', label: 'Faltas' },
                    { id: 'evolution', label: 'Evoluções' },
                    { id: 'auto', label: 'Automáticos' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setTimelineFilter(btn.id)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        timelineFilter === btn.id
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTimeline.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Nenhum evento registrado com o filtro selecionado.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {filteredTimeline.map((ev) => {
                    const isAuto = ev.isAutomatic;
                    return (
                      <div key={ev.id} className="relative group">
                        {/* Event icon dot */}
                        <div
                          className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            isAuto
                              ? 'border-amber-600 bg-amber-500 ring-2 ring-amber-200'
                              : ev.eventType === 'absence'
                              ? 'border-rose-600 bg-rose-500'
                              : ev.eventType === 'contact_attempt'
                              ? 'border-sky-600 bg-sky-500'
                              : ev.eventType === 'status_change'
                              ? 'border-teal-600 bg-teal-500'
                              : 'border-slate-500 bg-slate-400'
                          }`}
                        />

                        {/* Event Card */}
                        <div className={`p-4 rounded-lg border bg-white shadow-xs ${
                          isAuto
                            ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300'
                            : 'border-slate-200'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1">
                            <div className="flex items-center gap-2">
                              {isAuto ? (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-300">
                                  <Bot className="w-3.5 h-3.5" />
                                  <span>REGRA AUTOMÁTICA DO SISTEMA</span>
                                </span>
                              ) : (
                                <span className="font-bold text-slate-800 text-sm">{ev.action}</span>
                              )}

                              {ev.previousStatus && ev.newStatus && (
                                <span className="text-slate-500 font-medium">
                                  ({ev.previousStatus} <span aria-hidden="true">→</span>{' '}
                                  <strong className="text-slate-900">{ev.newStatus}</strong>)
                                </span>
                              )}
                            </div>

                            <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                              <span>{formatDateBR(ev.date)}</span>
                              <span>às {ev.time}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            {ev.description}
                          </p>

                          {/* Author footer */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Responsável: <strong>{ev.userName}</strong></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVOLUÇÕES & TRATATIVAS */}
          {activeTab === 'evolutions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Histórico de Evoluções e Tratativas ({patient.evolutions.length})
                </h3>
                {canRecordEvolution && (
                  <button
                    type="button"
                    onClick={() => onRecordEvolution(patient)}
                    className="text-xs font-semibold px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded shadow-xs flex items-center gap-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Nova Evolução</span>
                  </button>
                )}
              </div>

              {patient.evolutions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Nenhuma evolução registrada até o momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.evolutions.map((evo) => (
                    <div key={evo.id} className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-teal-800 text-sm">{evo.situation}</span>
                        <span className="text-slate-400">
                          {formatDateBR(evo.date)} às {evo.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{evo.notes}</p>
                      {evo.complementaryInfo && Object.keys(evo.complementaryInfo).length > 0 && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {evo.complementaryInfo.scheduledDate && (
                            <div>Agendado para: <strong>{formatDateBR(evo.complementaryInfo.scheduledDate)}</strong></div>
                          )}
                          {evo.complementaryInfo.scheduledLocation && (
                            <div>Local: <strong>{evo.complementaryInfo.scheduledLocation}</strong></div>
                          )}
                          {evo.complementaryInfo.medicalNote && (
                            <div>Atestado/CID: <strong>{evo.complementaryInfo.medicalNote}</strong></div>
                          )}
                          {evo.complementaryInfo.returnDate && (
                            <div>Previsão de Retorno: <strong>{formatDateBR(evo.complementaryInfo.returnDate)}</strong></div>
                          )}
                          {evo.complementaryInfo.reason && (
                            <div>Motivo: <strong>{evo.complementaryInfo.reason}</strong></div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Registrado por: {evo.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TENTATIVAS DE CONTATO */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Controle de Tentativas de Contato
                  </h3>
                  <p className="text-xs text-slate-500">
                    Limite máximo configurado: {settings.maxContactAttempts} tentativas. 3 tentativas sem sucesso alteram automaticamente para Micrologos.
                  </p>
                </div>
                {canRecordContact && patient.contactAttempts.length < settings.maxContactAttempts && (
                  <button
                    type="button"
                    onClick={() => onRecordContact(patient)}
                    className="text-xs font-semibold px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded shadow-xs flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Registrar {patient.contactAttempts.length + 1}ª Tentativa</span>
                  </button>
                )}
              </div>

              {/* Progress visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((num) => {
                  const attempt = patient.contactAttempts.find((a) => a.attemptNumber === num);
                  return (
                    <div
                      key={num}
                      className={`p-3 rounded-lg border ${
                        attempt
                          ? attempt.isSuccessful
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-rose-50 border-rose-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold">{num}ª Tentativa</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            attempt
                              ? attempt.isSuccessful
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-rose-200 text-rose-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {attempt ? (attempt.isSuccessful ? 'Sucesso' : 'Sem Sucesso') : 'Não Realizada'}
                        </span>
                      </div>
                      {attempt ? (
                        <div className="text-xs text-slate-700 space-y-1 mt-2">
                          <div><strong>Data:</strong> {formatDateBR(attempt.date)} às {attempt.time}</div>
                          <div><strong>Canal:</strong> {attempt.channel}</div>
                          <div><strong>Resultado:</strong> {attempt.result}</div>
                          <div className="text-slate-500 italic mt-1">"{attempt.notes}"</div>
                          <div className="text-[10px] text-slate-400 mt-2">Por: {attempt.userName}</div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-2">Aguardando registro quando necessário.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLE DE FALTAS */}
          {activeTab === 'absences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Controle e Ocorrências de Faltas</h3>
                  <p className="text-xs text-slate-500">
                    Regra automática: 2 faltas consecutivas alteram automaticamente a condição para "Micrologos".
                  </p>
                </div>
                {canRecordEvolution && (
                  <button
                    type="button"
                    onClick={() => onRecordAbsence(patient)}
                    className="text-xs font-semibold px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded shadow-xs flex items-center gap-1"
                  >
                    <CalendarX className="w-3.5 h-3.5" />
                    <span>Registrar Nova Falta</span>
                  </button>
                )}
              </div>

              {patient.absences.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhuma falta registrada</p>
                  <p className="text-slate-500 mt-0.5">O paciente compareceu a todos os agendamentos ou ainda não teve data marcada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.absences.map((abs) => (
                    <div key={abs.id} className="p-4 rounded-lg bg-white border border-rose-200 shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-rose-800 text-sm">
                          {abs.absenceNumber}ª Ocorrência de Falta
                        </span>
                        <span className="text-slate-400">
                          Data do Registro: {formatDateBR(abs.date)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong>Data em que faltou:</strong> {formatDateBR(abs.scheduledDate)}
                        </div>
                        {abs.reason && (
                          <div>
                            <strong>Motivo alegado:</strong> {abs.reason}
                          </div>
                        )}
                        {abs.notes && (
                          <div className="text-slate-600 italic">"{abs.notes}"</div>
                        )}
                        <div className="text-[11px] text-slate-400 pt-1">
                          Registrado por: <strong>{abs.userName}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FICHA CADASTRAL COMPLETA */}
          {activeTab === 'info' && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block font-medium">Nome Completo:</span>
                  <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Data de Nascimento:</span>
                  <span className="text-slate-900 font-semibold">
                    {formatDateBR(patient.birthDate)} {age !== null && `(${age} anos)`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Município:</span>
                  <span className="text-slate-900 font-medium">{patient.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Unidade Responsável:</span>
                  <span className="text-cyan-700 font-bold">{patient.unitName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Procedimento Solicitado:</span>
                  <span className="text-slate-900 font-semibold">{patient.requestedProcedureName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Lateralidade / Olho:</span>
                  <span className="text-slate-900 font-bold">
                    {patient.eyeSide === 'AO' ? 'AO (Ambos os Olhos)' : patient.eyeSide === 'OD' ? 'OD (Olho Direito)' : 'OE (Olho Esquerdo)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Classificação de Risco:</span>
                  <span className={patient.isUrgent ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'}>
                    {patient.isUrgent ? 'URGENTE' : 'Eletivo / Normal'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Data da Solicitação:</span>
                  <span className="text-slate-900 font-medium">{formatDateBR(patient.requestedDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Médico Solicitante:</span>
                  <span className="text-slate-900 font-medium">{patient.requestingDoctorName || 'Não especificado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Acompanhamento:</span>
                  <span className="text-slate-900 font-medium">
                    {patient.hasFollowup ? `Sim (Data: ${formatDateBR(patient.followupDate)})` : 'Não'}
                  </span>
                </div>
              </div>

              {patient.notes && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-slate-400 block font-medium mb-1">Observações Cadastrais:</span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    {patient.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span>Cadastrado por: {patient.createdByUserName} em {formatDateTimeBR(patient.createdAt)}</span>
                <span>Última atualização: {formatDateTimeBR(patient.updatedAt)}</span>
              </div>
            </div>
          )}

          {/* TAB 6: AUDITORIA DO PACIENTE */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                Trilha de Auditoria Deste Paciente ({patientLogs.length})
              </h3>
              {patientLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">Nenhum log encontrado.</div>
              ) : (
                <div className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  {patientLogs.map((log) => (
                    <div key={log.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                            {log.action}
                          </span>
                          <span>{log.description}</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {formatDateTimeBR(log.timestamp)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Usuário: <strong>{log.userName}</strong>
                        {log.isAutomatic && ' (Executado pelo Robô de Regras Automáticas)'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Registro: <code className="font-mono font-semibold text-slate-700">{patient.id}</code></span>
            <span>·</span>
            <span>Unidade: <strong className="text-slate-700">{patient.unitName}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Fechar Detalhes</span>
          </button>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirmar Exclusão Lógica</span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                A exclusão é <strong>lógica</strong> (soft delete). O histórico, timeline e logs de auditoria do paciente
                permanecerão preservados no banco de dados. Informe obrigatoriamente a justificativa:
              </p>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Motivo da inativação (ex: Duplicidade cadastral, solicitação da Secretaria de Saúde...)"
                className="w-full border border-slate-300 rounded-md p-2 text-xs text-slate-800 mb-4 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                >
                  Inativar Paciente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
