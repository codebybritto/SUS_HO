import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { exportHtmlToPdf } from '../../utils/pdfExport';
import {
  FileText,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building,
  User,
  AlertTriangle,
  Eye,
  Clock,
  Sparkles,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Patient, PatientStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getUnitMunicipalities } from '../../services/storage';
import { formatDateBR, calculateAge } from '../../utils/date';
import { AppLogo } from '../common/AppLogo';
import { getStatusStyle } from '../../utils/statusColors';
import { LOGO_BASE64 } from '../../assets/logo';

export const ReportsView: React.FC = () => {
  const { patients, units, procedures, doctors, municipalities } = useApp();
  const { allowedUnits, activeUnitId, currentUser, hasPermission } = useAuth();

  // Filters (Note: Faixa Etária removed as requested)
  const [selectedUnit, setSelectedUnit] = useState<string>(() => {
    if (activeUnitId && activeUnitId !== 'ALL') return activeUnitId;
    if (allowedUnits.length === 1) return allowedUnits[0].id;
    return 'ALL';
  });

  // Sync selectedUnit with activeUnitId when changed in navbar
  useEffect(() => {
    if (activeUnitId && activeUnitId !== 'ALL') {
      setSelectedUnit(activeUnitId);
    }
  }, [activeUnitId]);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedAbsences, setSelectedAbsences] = useState<string>('ALL');
  const [selectedContacts, setSelectedContacts] = useState<string>('ALL');
  const [selectedFollowup, setSelectedFollowup] = useState<string>('ALL');

  // Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const allowedUnitIds = useMemo(() => allowedUnits.map((u) => u.id), [allowedUnits]);

  // Unique cities strictly based on selected unit or authorized units
  const availableCities = useMemo(() => {
    const set = new Set<string>();

    if (selectedUnit !== 'ALL') {
      // 1. SPECIFIC UNIT: strictly show municipalities of this unit
      const targetUnit =
        units.find((u) => u.id === selectedUnit) ||
        allowedUnits.find((u) => u.id === selectedUnit);

      const unitCities = getUnitMunicipalities(targetUnit);
      unitCities.forEach((m) => {
        if (m && m.trim()) set.add(m.trim());
      });
    } else {
      // 2. "ALL" UNITS:
      // If the user is admin or has access to all units, show all municipalities for authorized units:
      const userHasAccessToAll =
        currentUser?.role === 'admin' ||
        allowedUnits.length >= units.length ||
        allowedUnits.length >= 3;

      if (userHasAccessToAll) {
        units.forEach((u) => {
          const uCities = getUnitMunicipalities(u);
          uCities.forEach((m) => {
            if (m && m.trim()) set.add(m.trim());
          });
        });
        municipalities.forEach((m) => {
          if (m.name && m.active !== false) set.add(m.name.trim());
        });
      } else {
        // User only has access to a subset of units: strictly show municipalities of those allowed units
        allowedUnits.forEach((u) => {
          const uCities = getUnitMunicipalities(u);
          uCities.forEach((m) => {
            if (m && m.trim()) set.add(m.trim());
          });
        });
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [selectedUnit, units, allowedUnits, municipalities, currentUser]);

  // Reset selectedCity if current selection is not available in the scoped unit's cities
  useEffect(() => {
    if (selectedCity !== 'ALL' && !availableCities.includes(selectedCity)) {
      setSelectedCity('ALL');
    }
  }, [availableCities, selectedCity]);

  // Combined Filter logic (Faixa etária removed)
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (p.isDeleted) return false;
      if (!allowedUnitIds.includes(p.unitId)) return false;

      // Unit
      if (selectedUnit !== 'ALL' && p.unitId !== selectedUnit) return false;

      // Dates (period)
      if (startDate && p.requestedDate < startDate) return false;
      if (endDate && p.requestedDate > endDate) return false;

      // Status
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Aguardando Micrologos') {
          if (p.currentStatus !== 'Aguardando Micrologos' && p.currentStatus !== 'Micrologos') {
            return false;
          }
        } else if (selectedStatus === 'SEM_INTERACAO') {
          if (p.contactAttempts.length !== 0 || p.evolutions.length !== 0 || p.totalAbsences !== 0) {
            return false;
          }
        } else if (p.currentStatus !== selectedStatus) {
          return false;
        }
      }

      // Procedure (check across multiple procedures)
      if (selectedProcedure !== 'ALL') {
        const matchesPrimary = p.requestedProcedureId === selectedProcedure;
        const matchesList = p.procedures?.some((pr) => pr.procedureId === selectedProcedure);
        if (!matchesPrimary && !matchesList) return false;
      }

      // Doctor
      if (selectedDoctor !== 'ALL' && p.requestingDoctorId !== selectedDoctor) return false;

      // City
      if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;

      // Urgency
      if (selectedUrgency === 'urgent' && !p.isUrgent) return false;
      if (selectedUrgency === 'normal' && p.isUrgent) return false;

      // Absences
      if (selectedAbsences === '0' && p.totalAbsences !== 0) return false;
      if (selectedAbsences === '1' && p.totalAbsences !== 1) return false;
      if (selectedAbsences === '2plus' && p.totalAbsences < 2) return false;

      // Contact attempts
      if (selectedContacts === '0' && p.contactAttempts.length !== 0) return false;
      if (selectedContacts === '1' && p.contactAttempts.length !== 1) return false;
      if (selectedContacts === '2' && p.contactAttempts.length !== 2) return false;
      if (selectedContacts === '3' && p.contactAttempts.length !== 3) return false;

      // Followup
      if (selectedFollowup === 'yes' && !p.hasFollowup) return false;
      if (selectedFollowup === 'no' && p.hasFollowup) return false;

      return true;
    });
  }, [
    patients,
    allowedUnitIds,
    selectedUnit,
    startDate,
    endDate,
    selectedStatus,
    selectedProcedure,
    selectedDoctor,
    selectedCity,
    selectedUrgency,
    selectedAbsences,
    selectedContacts,
    selectedFollowup,
  ]);



  const handleResetFilters = () => {
    setSelectedUnit('ALL');
    setStartDate('');
    setEndDate('');
    setSelectedStatus('ALL');
    setSelectedProcedure('ALL');
    setSelectedDoctor('ALL');
    setSelectedCity('ALL');
    setSelectedUrgency('ALL');
    setSelectedAbsences('ALL');
    setSelectedContacts('ALL');
    setSelectedFollowup('ALL');
  };

  // State for report orientation (Landscape recommended for wide 7-column table, Portrait also supported)
  const [reportOrientation, setReportOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Generate synthetic, space-efficient HTML string for printable iframe and PDF export
  const generateFormattedReportHtml = (orientation: 'landscape' | 'portrait' = reportOrientation) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR');
    const reportCode = `REL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    // Active filters summary string
    const filtersActive: string[] = [];
    if (selectedUnit !== 'ALL') {
      const u = units.find((x) => x.id === selectedUnit);
      filtersActive.push(`Unidade: ${u ? u.name : selectedUnit}`);
    } else {
      filtersActive.push('Unidades: Todas Autorizadas');
    }
    if (selectedStatus !== 'ALL') filtersActive.push(`Status: ${selectedStatus}`);
    if (selectedProcedure !== 'ALL') {
      const p = procedures.find((x) => x.id === selectedProcedure);
      filtersActive.push(`Procedimento: ${p ? p.name : selectedProcedure}`);
    }
    if (selectedCity !== 'ALL') filtersActive.push(`Município: ${selectedCity}`);
    if (selectedDoctor !== 'ALL') {
      const d = doctors.find((x) => x.id === selectedDoctor);
      filtersActive.push(`Médico: ${d ? d.name : selectedDoctor}`);
    }
    if (selectedUrgency !== 'ALL') filtersActive.push(`Urgência: ${selectedUrgency === 'URGENT' ? 'Somente Urgentes' : 'Não Urgentes'}`);
    if (startDate || endDate) filtersActive.push(`Período: ${startDate || 'início'} até ${endDate || 'atual'}`);
    const filterDescription = filtersActive.length > 0 ? filtersActive.join(' · ') : 'Todos os pacientes (sem restrições)';

    const unitObj = selectedUnit === 'ALL' ? null : units.find((u) => u.id === selectedUnit);

    const isLand = orientation === 'landscape';

    const colWidths = isLand
      ? { num: '3%', pac: '24%', proc: '26%', mun: '18%', med: '16%', status: '8%', cont: '5%' }
      : { num: '3%', pac: '25%', proc: '23%', mun: '17%', med: '14%', status: '11%', cont: '7%' };

    const tableRows = filteredPatients
      .map((p, idx) => {
        const style = getStatusStyle(p.currentStatus);
        const age = calculateAge(p.birthDate);
        const procNames =
          p.procedures && p.procedures.length > 0
            ? p.procedures.map((pr) => `<span>${pr.procedureName}</span>`).join('; ')
            : `<span>${p.requestedProcedureName}</span>`;

        const contactCount = p.contactAttempts?.length || 0;
        const absenceCount = p.totalAbsences || p.absences?.length || 0;
        const shortUnit = p.unitName ? p.unitName.split('—')[0].trim() : '-';

        return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 5px 3px; font-size: 8.5px; text-align: center; color: #64748b; font-weight: 700; border-right: 1px solid #e2e8f0; vertical-align: middle;">${idx + 1}</td>
          <td style="padding: ${isLand ? '5px 6px' : '4px 5px'}; border-right: 1px solid #e2e8f0; vertical-align: middle; line-height: 1.3;">
            <span style="font-weight: 700; color: #0f172a; font-size: ${isLand ? '9.5px' : '9px'};">${p.name}</span>
            <span style="font-weight: normal; color: #64748b; font-size: ${isLand ? '8.5px' : '8px'}; margin-left: 2px;">(${age !== null ? `${age}a` : '-'})</span>
            ${p.isUrgent ? ` <span style="color: #dc2626; font-weight: 900; font-size: ${isLand ? '8.5px' : '8px'}; margin-left: 3px;">[URG]</span>` : ''}
          </td>
          <td style="padding: ${isLand ? '5px 6px' : '4px 5px'}; font-size: ${isLand ? '8.5px' : '8px'}; line-height: 1.25; color: #1e293b; border-right: 1px solid #e2e8f0;">
            ${procNames}
          </td>
          <td style="padding: ${isLand ? '5px 6px' : '4px 5px'}; font-size: ${isLand ? '8.5px' : '8px'}; color: #334155; line-height: 1.25; border-right: 1px solid #e2e8f0;">
            <strong>${p.city}</strong> · <span style="color:#64748b; font-size:${isLand ? '8px' : '7.5px'};">${shortUnit}</span>
          </td>
          <td style="padding: ${isLand ? '5px 6px' : '4px 5px'}; font-size: ${isLand ? '8.5px' : '8px'}; color: #334155; line-height: 1.25; border-right: 1px solid #e2e8f0;">
            ${p.requestingDoctorName || 'Não inf.'} · <span style="color:#64748b; font-size:${isLand ? '8px' : '7.5px'};">${formatDateBR(p.requestedDate)}</span>
          </td>
          <td style="padding: ${isLand ? '5px 4px' : '4px 2px'}; text-align: center; border-right: 1px solid #e2e8f0; vertical-align: middle;">
            <span style="display: inline-block; padding: 1.5px 5px; border-radius: 9999px; font-size: ${isLand ? '8px' : '7.5px'}; font-weight: 800; border: 1px solid ${style.borderColor}; background-color: #ffffff; color: ${style.dotColor}; text-transform: uppercase; line-height: 1.1;">
              ${style.label}
            </span>
          </td>
          <td style="padding: ${isLand ? '5px 4px' : '4px 2px'}; text-align: center; font-size: ${isLand ? '8.5px' : '8px'}; color: #475569; white-space: nowrap; vertical-align: middle;">
            <span>${contactCount}c</span> · <span style="${absenceCount > 0 ? 'color:#b91c1c; font-weight:700;' : 'color:#64748b;'}">${absenceCount}f</span>
          </td>
        </tr>
      `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatório Geral de Pacientes</title>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page {
            size: A4 ${orientation};
            margin: 8mm 6mm;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            background: #ffffff;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            padding: ${isLand ? '8px 10px' : '8px 6px'};
            font-size: 9px;
            line-height: 1.3;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            tr { page-break-inside: avoid; }
            thead { display: table-header-group; }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 100%; box-sizing: border-box; margin: 0; padding: 0;">
          <!-- Header -->
          <table style="width: 100%; border-bottom: 2px solid #0f1d33; padding-bottom: 6px; margin-bottom: 6px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box;">
            <tr>
              <td style="vertical-align: middle; text-align: left; width: 56%;">
                <table style="border-collapse: collapse;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 10px; width: 48px;">
                      <img src="${LOGO_BASE64}" alt="Brasão Oficial" style="height: 42px; width: auto; max-width: 48px; object-fit: contain; display: block;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 14px; font-weight: 900; color: #0f1d33; text-transform: uppercase; letter-spacing: -0.3px;">Relatório Geral de Pacientes</div>
                      <div style="font-size: 9px; color: #475569; font-weight: 600; margin-top: 1px;">Controle de Fluxo e Linha do Tempo Ambulatorial · ${unitObj ? `${unitObj.name}` : 'Todas as Unidades Autorizadas'}</div>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="vertical-align: middle; text-align: right; width: 44%;">
                <table style="display: inline-table; border-collapse: separate; border-spacing: 0; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; text-align: right; box-sizing: border-box;">
                  <tr>
                    <td style="padding: 5px 10px 3px 10px; font-size: 8.5px; line-height: 1.3; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">
                      <span style="font-weight: 800; color: #475569; text-transform: uppercase;">Protocolo:</span>
                      <span style="font-family: monospace; font-weight: 700; color: #0f172a; margin-left: 4px;">${reportCode}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 10px 5px 10px; font-size: 8.5px; line-height: 1.3; white-space: nowrap;">
                      <span style="font-weight: 800; color: #475569; text-transform: uppercase;">Emissão:</span>
                      <span style="font-weight: 600; color: #0f172a; margin-left: 3px;">${dateFormatted} às ${timeFormatted}</span>
                      <span style="color: #94a3b8; margin: 0 4px; font-weight: 400;">·</span>
                      <span style="font-weight: 800; color: #475569; text-transform: uppercase;">Operador:</span>
                      <span style="font-weight: 600; color: #0f172a; margin-left: 3px;">${currentUser?.name || 'Administrador'}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Filter Description (Flush width, vertically centered, generous padding) -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; margin-bottom: 6px; table-layout: fixed; box-sizing: border-box;">
            <tr>
              <td style="padding: 6px 10px; font-size: 8.5px; line-height: 1.4; vertical-align: middle; color: #334155;">
                <span style="font-weight: 900; color: #0f1d33; text-transform: uppercase; letter-spacing: 0.2px;">FILTROS APLICADOS:</span>
                <span style="font-weight: 500; color: #334155; margin-left: 4px;">${filterDescription}</span>
              </td>
            </tr>
          </table>

          <!-- Patients Table -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; table-layout: fixed; margin-bottom: 6px; box-sizing: border-box;">
            <thead>
              <tr style="background: #0f1d33; color: #ffffff;">
                <th style="width: ${colWidths.num}; padding: 6px 3px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: center; border: 1px solid #0f1d33; text-transform: uppercase; white-space: nowrap;">#</th>
                <th style="width: ${colWidths.pac}; padding: 6px 5px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: left; border: 1px solid #0f1d33; text-transform: uppercase;">Paciente (Idade)</th>
                <th style="width: ${colWidths.proc}; padding: 6px 5px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: left; border: 1px solid #0f1d33; text-transform: uppercase;">Procedimento(s) Solicitado(s)</th>
                <th style="width: ${colWidths.mun}; padding: 6px 5px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: left; border: 1px solid #0f1d33; text-transform: uppercase;">Município / Unidade</th>
                <th style="width: ${colWidths.med}; padding: 6px 5px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: left; border: 1px solid #0f1d33; text-transform: uppercase;">Médico / Solicitação</th>
                <th style="width: ${colWidths.status}; padding: 6px 2px; font-size: ${isLand ? '8.5px' : '8px'}; font-weight: 800; text-align: center; border: 1px solid #0f1d33; text-transform: uppercase; white-space: nowrap;">Status</th>
                <th style="width: ${colWidths.cont}; padding: 6px 2px; font-size: ${isLand ? '8px' : '7.5px'}; font-weight: 800; text-align: center; border: 1px solid #0f1d33; text-transform: uppercase; white-space: nowrap;">Cont./Falt.</th>
              </tr>
            </thead>
            <tbody>
              ${
                tableRows ||
                '<tr><td colspan="7" style="text-align: center; padding: 16px; color: #64748b; font-size: 9.5px;">Nenhum paciente localizado para os critérios selecionados.</td></tr>'
              }
            </tbody>
          </table>

          <!-- Document Footer -->
          <table style="width: 100%; border-top: 1.5px solid #cbd5e1; padding-top: 6px; margin-top: 6px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 8.5px; color: #64748b;">
            <tr>
              <td style="text-align: left; vertical-align: middle; line-height: 1.3;">
                <span style="color: #64748b;">Sistema de Gestão e Controle de Pacientes · Emissão Eletrônica em </span>
                <span style="color: #334155; font-weight: 600;">${dateFormatted} às ${timeFormatted}</span>
                <span style="color: #64748b;"> · Operador: </span>
                <span style="color: #334155; font-weight: 600;">${currentUser?.name || 'Administrador Geral'}</span>
              </td>
              <td style="text-align: right; vertical-align: middle; width: 180px; line-height: 1.3;">
                <span style="color: #64748b;">Total de Pacientes Listados: </span>
                <span style="color: #0f172a; font-weight: 800;">${filteredPatients.length}</span>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  };

  // Export real Excel .xlsx file with clean formatting and columns
  const handleExportXLSX = () => {
    const data = filteredPatients.map((p) => {
      const age = calculateAge(p.birthDate);
      const procNames =
        p.procedures && p.procedures.length > 0
          ? p.procedures.map((pr) => pr.procedureName).join('; ')
          : p.requestedProcedureName;

      return {
        'Nome do Paciente': p.name,
        'Data de Nascimento': formatDateBR(p.birthDate),
        'Idade': age !== null ? `${age} anos` : 'N/D',
        'Procedimento(s) Solicitado(s)': procNames,
        'Município': p.city,
        'Unidade Responsável': p.unitName,
        'Médico Solicitante': p.requestingDoctorName || 'Não informado',
        'Data Solicitada': formatDateBR(p.requestedDate),
        'Condição / Status': p.currentStatus,
        'Urgente': p.isUrgent ? 'SIM' : 'NÃO',
        'Faltas': p.totalAbsences,
        'Contatos': `${p.contactAttempts.length}/3`,
        'Possui Acompanhamento': p.hasFollowup ? 'SIM' : 'NÃO',
        'Data Acompanhamento': p.followupDate ? formatDateBR(p.followupDate) : '-',
        'Observações': p.notes || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 32 }, // Nome
      { wch: 14 }, // Data Nasc
      { wch: 10 }, // Idade
      { wch: 42 }, // Procedimentos
      { wch: 18 }, // Município
      { wch: 38 }, // Unidade
      { wch: 26 }, // Médico
      { wch: 14 }, // Data Solicitada
      { wch: 22 }, // Status
      { wch: 10 }, // Urgente
      { wch: 10 }, // Faltas
      { wch: 12 }, // Contatos
      { wch: 14 }, // Acomp
      { wch: 16 }, // Data Acomp
      { wch: 32 }, // Obs
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(
      wb,
      `relatorio_pacientes_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Direct Save as PDF file download using exportHtmlToPdf
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSaveReportPdf = async () => {
    setIsGeneratingPdf(true);
    const htmlContent = generateFormattedReportHtml(reportOrientation);
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      await exportHtmlToPdf(htmlContent, `relatorio_pacientes_${dateStr}.pdf`, { orientation: reportOrientation });
    } catch (e) {
      console.error('Falha ao gerar PDF diretamente, abrindo impressão como fallback:', e);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Robust print execution with fallback to preview modal
  const handlePrint = () => {
    setIsPreviewModalOpen(true);
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const html = generateFormattedReportHtml();
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
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
    } catch (err) {
      window.print();
    }
  };


  if (!hasPermission('view_reports')) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Acesso Não Autorizado</h3>
        <p className="text-xs text-slate-500 mt-2">
          Seu perfil de usuário não tem permissão para visualizar a central de relatórios do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Screen Controls Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Central de Relatórios de Pacientes</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtre critérios clínicos e gere o relatório completo pronto para salvar em PDF ou imprimir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Orientation Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setReportOrientation('landscape')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  reportOrientation === 'landscape'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Orientação Paisagem (Horizontal) — Recomendada para relatórios com 7 colunas"
              >
                Paisagem
              </button>
              <button
                type="button"
                onClick={() => setReportOrientation('portrait')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  reportOrientation === 'portrait'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Orientação Retrato (Vertical)"
              >
                Retrato
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveReportPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              title={`Salvar diretamente o relatório em PDF (${reportOrientation === 'landscape' ? 'Paisagem' : 'Retrato'})`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Salvar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition-colors"
              title="Abrir caixa de diálogo para imprimir"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Visualizar Modelo</span>
            </button>


            {hasPermission('export_reports') && (
              <button
                type="button"
                onClick={handleExportXLSX}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                title="Exportar dados filtrados em formato Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel (.xlsx)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid (Faixa Etária removed as requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
          {/* Unit Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Unidade de Atendimento</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todas as Unidades ({allowedUnits.length})</option>
              {allowedUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (with Aguardando Micrologos and Sem Interação) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Condição / Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Regulado">Regulado</option>
              <option value="Aguardando Micrologos">Aguardando Micrologos</option>
              <option value="Aguardando Contato">Aguardando Contato</option>
              <option value="SEM_INTERACAO">Sem Nenhuma Interação</option>
              <option value="Faltou">Faltou</option>
              <option value="Doente">Doente</option>
              <option value="Desistência">Desistência</option>
              <option value="Óbito">Óbito</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {/* Procedure Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Procedimento</label>
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todos os Procedimentos</option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Prioridade</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todas as prioridades</option>
              <option value="urgent">Apenas URGENTES</option>
              <option value="normal">Apenas Eletivos / Normais</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Data Solicitada (De)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Data Solicitada (Até)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Município</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todos os Municípios</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Médico Solicitante</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">Todos os Médicos</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Reset Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Exibindo <strong className="text-slate-900">{filteredPatients.length}</strong> paciente(s) no filtro selecionado.
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-700 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar Todos os Filtros</span>
          </button>
        </div>
      </div>

      {/* Styled Data Table with CNS/CPF removed & multiple procedures */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Listagem Formatada dos Pacientes ({filteredPatients.length})
          </span>
          <span className="text-[11px] text-slate-500">Tabela de conferência</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nome do Paciente</th>
                <th className="py-3 px-3">Nascimento (Idade)</th>
                <th className="py-3 px-3">Procedimento(s) Solicitado(s)</th>
                <th className="py-3 px-3">Município</th>
                <th className="py-3 px-3">Médico</th>
                <th className="py-3 px-3">Data Solicitada</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Urgente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum paciente localizado com a combinação de filtros selecionada.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const statusStyle = getStatusStyle(p.currentStatus);
                  const age = calculateAge(p.birthDate);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.name}
                        {p.hasFollowup && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded">
                            Retorno
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDateBR(p.birthDate)} {age !== null ? `(${age}a)` : ''}
                      </td>
                      <td className="py-3 px-3">
                        {p.procedures && p.procedures.length > 0 ? (
                          <div className="space-y-1">
                            {p.procedures.map((pr) => (
                              <div key={pr.id} className="min-h-[20px] flex items-center">
                                <span className="font-medium text-slate-800 line-clamp-1">{pr.procedureName}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="min-h-[20px] flex items-center">
                            <span className="font-medium text-slate-800">{p.requestedProcedureName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{p.city}</td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">
                        {p.requestingDoctorName || 'Não informado'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDateBR(p.requestedDate)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] whitespace-nowrap ${statusStyle.badgeClass}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.isUrgent ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                            SIM
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL-SCREEN REPORT PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-2 sm:my-6 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="shrink-0 bg-[#0f1d33] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <AppLogo variant="icon" size="sm" />
                <div>
                  <h3 className="font-bold text-sm">Visualizador de Relatório Formatado</h3>
                  <p className="text-[11px] text-slate-300">
                    Layout para impressão e gravação em PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Orientation Selector in Modal */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setReportOrientation('landscape')}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      reportOrientation === 'landscape'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Paisagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOrientation('portrait')}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      reportOrientation === 'portrait'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Retrato
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveReportPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'Gerando...' : 'Salvar PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportXLSX}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold ml-1 border border-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {/* Preview Sheet Body */}
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <div className={`bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-3 mx-auto transition-all ${reportOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {/* Synthetic Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={LOGO_BASE64} alt="Brasão Oficial" className="h-10 w-auto object-contain" />
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        Relatório Geral de Pacientes
                      </h2>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Controle de Fluxo e Linha do Tempo Ambulatorial ·{' '}
                        {selectedUnit === 'ALL'
                          ? 'Todas as Unidades Autorizadas'
                          : units.find((u) => u.id === selectedUnit)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 leading-snug shadow-2xs">
                    <div className="pb-1 mb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Protocolo:</span>{' '}
                      <code className="font-mono font-bold text-slate-900">{`REL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${filteredPatients.length}`}</code>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Emissão:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</strong>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Operador:</span>{' '}
                      <strong className="text-slate-900 font-semibold">{currentUser?.name || 'Administrador'}</strong>
                    </div>
                  </div>
                </div>

                {/* Filter Description Banner in Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[11px] text-slate-700 leading-normal">
                  <strong className="text-slate-900 uppercase font-black tracking-wide text-[10.5px]">FILTROS APLICADOS:</strong>{' '}
                  {selectedUnit !== 'ALL' && `Unidade: ${units.find((u) => u.id === selectedUnit)?.name || selectedUnit} · `}
                  {selectedStatus !== 'ALL' && `Status: ${selectedStatus} · `}
                  {selectedProcedure !== 'ALL' && `Procedimento: ${procedures.find((p) => p.id === selectedProcedure)?.name || selectedProcedure} · `}
                  {selectedCity !== 'ALL' && `Município: ${selectedCity} · `}
                  {selectedUrgency !== 'ALL' && `Prioridade: ${selectedUrgency === 'urgent' ? 'Urgentes' : 'Eletivos'} · `}
                  {startDate || endDate ? `Período: ${startDate || 'início'} até ${endDate || 'atual'}` : 'Geral (sem restrições)'}
                </div>

                {/* Table */}
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2 w-8 text-center">#</th>
                      <th className="p-2">Paciente (Idade)</th>
                      <th className="p-2">Procedimento(s) Solicitado(s)</th>
                      <th className="p-2">Município / Unidade</th>
                      <th className="p-2">Médico / Solicitação</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Cont./Falt.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500">
                          Nenhum paciente localizado para os critérios selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p, idx) => {
                        const style = getStatusStyle(p.currentStatus);
                        const age = calculateAge(p.birthDate);
                        const procNames =
                          p.procedures && p.procedures.length > 0
                            ? p.procedures.map((pr) => pr.procedureName).join('; ')
                            : p.requestedProcedureName;
                        const contactCount = p.contactAttempts?.length || 0;
                        const absenceCount = p.totalAbsences || p.absences?.length || 0;
                        const shortUnit = p.unitName ? p.unitName.split('—')[0].trim() : '-';

                        return (
                          <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="p-2 text-center text-slate-500 font-bold text-[10px]">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 leading-tight">
                              <span>{p.name}</span>
                              <span className="font-normal text-slate-500 text-[10px] ml-1">
                                ({age !== null ? `${age}a` : '-'})
                              </span>
                              {p.isUrgent && (
                                <span className="text-rose-600 font-black text-[9.5px] ml-1.5 uppercase">
                                  [URG]
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-700">{procNames}</td>
                            <td className="p-2 text-slate-700">
                              <strong>{p.city}</strong> · <span className="text-slate-500 text-[10px]">{shortUnit}</span>
                            </td>
                            <td className="p-2 text-slate-700">
                              {p.requestingDoctorName || 'Não inf.'} · <span className="text-slate-500 text-[10px]">{formatDateBR(p.requestedDate)}</span>
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badgeClass}`}
                              >
                                {style.label}
                              </span>
                            </td>
                            <td className="p-2 text-center text-slate-600 text-[10px] whitespace-nowrap">
                              <span>{contactCount}c</span> · <span className={absenceCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>{absenceCount}f</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Report Footer without Signature Box */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <div>
                    Sistema de Gestão e Controle de Pacientes · Emissão Eletrônica em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} · Operador: {currentUser?.name || 'Administrador'}
                  </div>
                  <div>
                    Total de Pacientes Listados: <strong>{filteredPatients.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
