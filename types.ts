export enum LeadStatus {
  NEW = 'NOVO_LEAD',
  CONTACTED = 'CONTATO_REALIZADO',
  RESPONSIBLE = 'CONTATO_RESPONSAVEL',
  MEETING = 'REUNIAO_AGENDADA',
  NEGOTIATION = 'EM_NEGOCIACAO',
  DISQUALIFIED = 'DESQUALIFICADO',
  WON = 'GANHO'
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO string
}

export interface Lead {
  id: string;
  // Required
  name: string;
  company: string;
  phone: string;
  email: string;
  status: LeadStatus;
  createdAt: string;

  // Optional
  responsibleName?: string;
  responsiblePhone?: string;
  origin?: string;
  owner?: string; // Internal user responsible
  lastInteraction?: string;
  nextAction?: string;

  notes: Note[];

  // UI Only
  isOptimistic?: boolean;
}

export const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: LeadStatus.NEW, label: 'Novo Lead', color: 'border-blue-400' },
  { id: LeadStatus.CONTACTED, label: '1º Contato', color: 'border-indigo-400' },
  { id: LeadStatus.RESPONSIBLE, label: 'Com Responsável', color: 'border-purple-400' },
  { id: LeadStatus.MEETING, label: 'Reunião Agendada', color: 'border-orqio-orange' },
  { id: LeadStatus.NEGOTIATION, label: 'Em Negociação', color: 'border-yellow-500' },
  { id: LeadStatus.WON, label: 'Ganho', color: 'border-green-500' },
  { id: LeadStatus.DISQUALIFIED, label: 'Desqualificado', color: 'border-red-400' },
];