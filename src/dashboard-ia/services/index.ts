import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
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

    createLead: async (lead: {
        name: string;
        email: string;
        remoteJid: string;
        ia: boolean;
        status: string;
    }): Promise<{ success: boolean; id?: string; error?: string }> => {
        // Format remoteJid: ensure 55 prefix and @s.whatsapp.net suffix
        const digits = lead.remoteJid.replace(/\D/g, '');
        const withPrefix = digits.startsWith('55') ? digits : `55${digits}`;
        const formattedJid = `${withPrefix}@s.whatsapp.net`;

        const { data, error } = await supabase
            .from('chats')
            .insert({
                name: lead.name,
                email: lead.email || null,
                remotejID: formattedJid,
                IA: lead.ia,
                status: lead.status
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating lead:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data.id.toString() };
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
        const { data, error } = await supabase
            .from('agendamentos')
            .select('id, cliente_id, horario_inicio, servico, created_at')
            .order('horario_inicio', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }

        // Fetch lead names for client_ids
        const clientIds = data.map((d: any) => d.cliente_id).filter(Boolean);
        let namesMap: Record<string, string> = {};

        if (clientIds.length > 0) {
            const { data: clients } = await supabase
                .from('chats')
                .select('id, name')
                .in('id', clientIds);

            if (clients) {
                clients.forEach((c: any) => namesMap[c.id] = c.name || 'Sem Nome');
            }
        }

        return data.map((s: any) => ({
            id: s.id.toString(),
            leadId: s.cliente_id?.toString() || '0',
            leadName: namesMap[s.cliente_id] || `Cliente ${s.cliente_id}`,
            date: s.horario_inicio,
            status: 'confirmed' as const,
            servico: s.servico || 'Não especificado',
            notes: s.servico
        }));
    },

    createSchedule: async (schedule: {
        id_cliente: string;
        horario_inicio: string;
        servico: string;
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(
                'https://primary-production-599df.up.railway.app/webhook/agendamento',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_cliente: schedule.id_cliente,
                        horario_inicio: schedule.horario_inicio,
                        servico: schedule.servico
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Webhook responded with status ${response.status}`);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error creating schedule:', error);
            return { success: false, error: error.message };
        }
    }
};

export const MetricsService = {
    getMetrics: async (): Promise<DashboardMetric> => {
        const { count: totalLeads } = await supabase.from('chats').select('*', { count: 'exact', head: true });
        const { count: totalScheduled } = await supabase.from('agendamentos').select('*', { count: 'exact', head: true });

        const { count: activeIA } = await supabase.from('chats').select('*', { count: 'exact', head: true }).eq('IA', true);
        const { count: activeHuman } = await supabase.from('chats').select('*', { count: 'exact', head: true }).or('IA.is.null,IA.eq.false');

        // Conversão: leads com status "agendado" ou "ganho"
        const { count: convertedLeads } = await supabase
            .from('chats')
            .select('*', { count: 'exact', head: true })
            .or('status.ilike.%agendad%,status.ilike.%ganh%');

        // Agendamento: clientes únicos que possuem pelo menos 1 agendamento
        const { data: scheduledClients } = await supabase
            .from('agendamentos')
            .select('cliente_id');
        const uniqueScheduledClients = new Set(
            (scheduledClients || []).map((s: any) => s.cliente_id).filter(Boolean)
        ).size;

        const total = totalLeads || 0;
        const conversionRate = total > 0
            ? parseFloat(((convertedLeads || 0) / total * 100).toFixed(1))
            : 0;
        const scheduleRate = total > 0
            ? parseFloat((uniqueScheduledClients / total * 100).toFixed(1))
            : 0;

        return {
            conversionRate,
            scheduleRate,
            totalLeads: total,
            totalScheduled: totalScheduled || 0,
            activeIA: activeIA || 0,
            activeHuman: activeHuman || 0
        };
    }
};

export const KnowledgeBaseService = {
    uploadFile: async (file: File): Promise<{ success: boolean; message: string }> => {
        try {
            const secretKey = import.meta.env.VITE_KB_WEBHOOK_SECRET;
            const webhookUrl = import.meta.env.VITE_KB_WEBHOOK_URL;

            if (!secretKey || !webhookUrl) {
                console.error('Missing webhook configuration');
                return { success: false, message: 'Erro de configuração do sistema.' };
            }

            const secret = new TextEncoder().encode(secretKey);
            const jwt = await new SignJWT({ 'urn:example:claim': true })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('5m')
                .sign(secret);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            return { success: true, message: 'Arquivo enviado com sucesso para o agente.' };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, message: 'Erro ao enviar arquivo.' };
        }
    }
};

export const EmailService = {
    sendConfirmation: async (agendamentoId: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(
                'https://swmjozexpzszbyqqgnzr.supabase.co/functions/v1/send-confirmation-email',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agendamento_id: parseInt(agendamentoId) })
                }
            );

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error: any) {
            console.error('Error sending confirmation email:', error);
            return { success: false, message: error.message || 'Erro ao enviar e-mail' };
        }
    }
};

// HELPERS
function mapStatusToStage(status: string | null): LeadStage {
    if (!status) return 'primeiro_contato';
    const s = status.toLowerCase();

    if (s.includes('cancel')) return 'cancelamento';
    if (s.includes('agendad')) return 'agendado';
    if (s.includes('desqualific')) return 'desqualificado';
    if (s.includes('ganh')) return 'agendado';
    return 'primeiro_contato';
}
