import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { DashboardLead, DashboardSchedule, DashboardMetric, LeadStage } from '../types';

// SERVICE IMPLEMENTATIONS
export const LeadService = {
    getLeads: async (): Promise<DashboardLead[]> => {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching leads:', error);
            return [];
        }

        return data.map((chat: any) => ({
            id: chat.id.toString(),
            name: chat.name || 'Sem Nome',
            email: chat.email || '',
            phone: chat.remotejID || '',
            stage: mapStatusToStage(chat.status),
            createdAt: chat.created_at,
            isIA: chat.IA ?? false // Default to false if null
        }));
    },

    subscribeToLeads: (callback: () => void): RealtimeChannel => {
        return supabase
            .channel('public:chats')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chats' },
                () => {
                    callback();
                }
            )
            .subscribe();
    }
};

export const ScheduleService = {
    getSchedules: async (): Promise<DashboardSchedule[]> => {
        // Join with chats to get lead name if possible, or just fetch agendamentos
        // Assuming cliente_id maps to chats.id? Or is it separate?
        // For now simple fetch.
        const { data, error } = await supabase
            .from('agendamentos')
            .select('id, cliente_id, horario_inicio, servico, created_at')
            .order('horario_inicio', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }

        // We need names. Let's try to fetch chat names for these client_ids
        const clientIds = data.map((d: any) => d.cliente_id).filter(Boolean);
        let namesMap: Record<string, string> = {};

        if (clientIds.length > 0) {
            const { data: clients } = await supabase
                .from('chats')
                .select('id, name')
                .in('id', clientIds);

            if (clients) {
                clients.forEach((c: any) => namesMap[c.id] = c.name);
            }
        }

        return data.map((s: any) => ({
            id: s.id.toString(),
            leadId: s.cliente_id?.toString() || '0',
            leadName: namesMap[s.cliente_id] || `Cliente ${s.cliente_id}`,
            date: s.horario_inicio,
            status: 'confirmed', // Assuming if it exists, it's confirmed
            notes: s.servico
        }));
    }
};

export const MetricsService = {
    getMetrics: async (): Promise<DashboardMetric> => {
        // Real counts
        const { count: totalLeads } = await supabase.from('chats').select('*', { count: 'exact', head: true });
        const { count: totalScheduled } = await supabase.from('agendamentos').select('*', { count: 'exact', head: true });

        // Count interactions
        const { count: activeIA } = await supabase.from('chats').select('*', { count: 'exact', head: true }).eq('IA', true);
        const { count: activeHuman } = await supabase.from('chats').select('*', { count: 'exact', head: true }).or('IA.is.null,IA.eq.false');

        // Mock rates for now as we don't have enough history/event tracking for rates
        return {
            conversionRate: 15.5,
            scheduleRate: 28.3,
            totalLeads: totalLeads || 0,
            totalScheduled: totalScheduled || 0,
            activeIA: activeIA || 0,
            activeHuman: activeHuman || 0
        };
    }
};

export const KnowledgeBaseService = {
    uploadFile: async (file: File): Promise<{ success: boolean; message: string }> => {
        console.log('Uploading file to AI Agent Knowledge Base:', file.name);
        // Needs Storage bucket setup. For now keeping mock to avoid breaking if bucket doesn't exist.
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Arquivo processado pelo agente (Simulado).' }), 1500));
    }
};

// HELPERS
function mapStatusToStage(status: string | null): LeadStage {
    if (!status) return 'primeiro_contato';
    const s = status.toLowerCase();

    if (s.includes('cancel')) return 'cancelamento';
    if (s.includes('agendad')) return 'agendado';
    if (s.includes('desqualific')) return 'desqualificado';
    if (s.includes('ganh')) return 'agendado'; // Win = scheduled/sold?
    return 'primeiro_contato';
}
