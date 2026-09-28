import { PatientStatus } from '../types';

export interface StatusStyle {
  label: string;
  badgeClass: string;
  dotColor: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
  description: string;
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  'Agendado': {
    label: 'Agendado',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-600/20',
    dotColor: '#0284c7', // sky-600
    textColor: 'text-sky-800',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-300',
    description: 'Com data e horário de atendimento definidos',
  },
  'Regulado': {
    label: 'Regulado',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-600/20',
    dotColor: '#059669', // emerald-600
    textColor: 'text-emerald-800',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description: 'Autorizado e aprovado pelo complexo regulador',
  },
  'Aguardando Micrologos': {
    label: 'Aguardando Micrologos',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-600/20',
    dotColor: '#d97706', // amber-600
    textColor: 'text-amber-900',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description: 'Encaminhado para micrologos (por 2 faltas ou 3 contatos sem êxito)',
  },
  // Backward compatibility alias
  'Micrologos': {
    label: 'Aguardando Micrologos',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-600/20',
    dotColor: '#d97706',
    textColor: 'text-amber-900',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description: 'Encaminhado para micrologos',
  },
  'Aguardando Contato': {
    label: 'Aguardando Contato',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-600/20',
    dotColor: '#4f46e5', // indigo-600
    textColor: 'text-indigo-800',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    description: 'Cadastrado recentemente, aguardando 1ª tentativa de contato',
  },
  'Faltou': {
    label: 'Faltou',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-600/20',
    dotColor: '#e11d48', // rose-600
    textColor: 'text-rose-800',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-300',
    description: 'Paciente não compareceu ao procedimento agendado',
  },
  'Doente': {
    label: 'Doente / Impossibilitado',
    badgeClass: 'bg-yellow-50 text-yellow-900 border-yellow-400 ring-1 ring-yellow-600/20',
    dotColor: '#ca8a04', // yellow-600
    textColor: 'text-yellow-900',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    description: 'Paciente informou condição de saúde impeditiva temporária',
  },
  'Desistência': {
    label: 'Desistência',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-600/20',
    dotColor: '#7c3aed', // purple-600
    textColor: 'text-purple-800',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description: 'Manifestou desinteresse ou realizou por outro meio',
  },
  'Óbito': {
    label: 'Óbito',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-400 ring-1 ring-slate-600/20',
    dotColor: '#334155', // slate-700
    textColor: 'text-slate-800',
    bgLight: 'bg-slate-200',
    borderColor: 'border-slate-400',
    description: 'Falecimento informado por familiar ou sistema de óbitos',
  },
  'Concluído': {
    label: 'Concluído',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-600/20',
    dotColor: '#0d9488', // teal-600
    textColor: 'text-teal-800',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-300',
    description: 'Procedimento realizado e tratamento finalizado',
  },
};

export const getStatusStyle = (status: PatientStatus | string): StatusStyle => {
  return (
    STATUS_STYLES[status] || {
      label: status,
      badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      dotColor: '#64748b',
      textColor: 'text-gray-800',
      bgLight: 'bg-gray-100',
      borderColor: 'border-gray-300',
      description: status,
    }
  );
};
