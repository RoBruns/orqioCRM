export type LeadStage = 'primeiro_contato' | 'desqualificado' | 'cancelamento' | 'agendado';

export interface DashboardLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  createdAt: string;
  isIA: boolean;
}

export interface DashboardSchedule {
  id: string;
  leadId: string;
  leadName: string;
  date: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface DashboardMetric {
  conversionRate: number; // percentage 0-100
  scheduleRate: number;   // percentage 0-100
  totalLeads: number;
  totalScheduled: number;
  activeIA: number;
  activeHuman: number;
}
