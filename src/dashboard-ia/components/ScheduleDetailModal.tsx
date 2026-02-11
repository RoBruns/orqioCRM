import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Bot, FileText, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GlassPane, Button } from '../../../components/ui/Glass';
import { DashboardSchedule } from '../types';
import { EmailService } from '../services';
import { supabase } from '../../../lib/supabase';

interface ScheduleDetailModalProps {
    schedule: DashboardSchedule | null;
    onClose: () => void;
}

interface LeadDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    isIA: boolean;
    createdAt: string;
}

type EmailStatus = 'idle' | 'sending' | 'success' | 'error';

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({ schedule, onClose }) => {
    const [lead, setLead] = useState<LeadDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
    const [emailMessage, setEmailMessage] = useState('');

    useEffect(() => {
        if (schedule && schedule.leadId && schedule.leadId !== '0') {
            setLoading(true);
            setEmailStatus('idle');
            setEmailMessage('');
            supabase
                .from('chats')
                .select('*')
                .eq('id', parseInt(schedule.leadId))
                .single()
                .then(({ data }) => {
                    if (data) {
                        setLead({
                            id: data.id.toString(),
                            name: data.name || 'Sem Nome',
                            email: data.email || '',
                            phone: data.remotejID || '',
                            status: data.status || 'Primeiro Contato',
                            isIA: data.IA ?? false,
                            createdAt: data.created_at
                        });
                    }
                    setLoading(false);
                });
        }
    }, [schedule]);

    if (!schedule) return null;

    const scheduleDate = new Date(schedule.date);

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        confirmed: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
        pending: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
        completed: { label: 'Concluído', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
        cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50 border-red-200' }
    };

    const status = statusConfig[schedule.status] || statusConfig.confirmed;

    const handleSendEmail = async () => {
        if (!lead?.email) {
            setEmailStatus('error');
            setEmailMessage('Este lead não possui e-mail cadastrado.');
            return;
        }

        setEmailStatus('sending');
        setEmailMessage('');

        const result = await EmailService.sendConfirmation(schedule.id);

        if (result.success) {
            setEmailStatus('success');
            setEmailMessage(result.message);
        } else {
            setEmailStatus('error');
            setEmailMessage(result.message);
        }

        // Auto-reset after 5s
        setTimeout(() => {
            setEmailStatus('idle');
            setEmailMessage('');
        }, 5000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            <GlassPane intensity="high" className="w-full max-w-md relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Colored Header */}
                <div className="bg-gradient-to-r from-orqio-orange to-orange-400 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs uppercase tracking-wider opacity-80 font-semibold mb-1">Agendamento</p>
                            <h2 className="text-2xl font-bold">{schedule.leadName}</h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} border`}>
                        {status.label}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

                    {/* Schedule Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalhes do Agendamento</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orqio-orange/10 rounded-lg shrink-0">
                                    <Calendar size={16} className="text-orqio-orange" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Data</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {scheduleDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orqio-orange/10 rounded-lg shrink-0">
                                    <Clock size={16} className="text-orqio-orange" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Horário</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {scheduleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orqio-orange/10 rounded-lg shrink-0">
                                    <FileText size={16} className="text-orqio-orange" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Serviço</p>
                                    <p className="text-sm font-semibold text-gray-800">{schedule.servico}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200/60" />

                    {/* Lead Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dados do Lead</h3>

                        {loading ? (
                            <div className="text-sm text-gray-400 animate-pulse">Carregando dados do lead...</div>
                        ) : lead ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                                        {lead.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{lead.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {lead.isIA ? (
                                                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                    <Bot size={10} /> IA
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                    <User size={10} /> Humano
                                                </span>
                                            )}
                                            <span className="text-[10px] bg-orqio-orange/10 text-orqio-orange px-2 py-0.5 rounded-full font-medium capitalize">
                                                {lead.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/40 rounded-xl p-3 space-y-2 border border-gray-200/40">
                                    {lead.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={14} className="text-gray-400 shrink-0" />
                                            <span>{lead.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-gray-400 shrink-0" />
                                        <span>{lead.phone?.replace('@s.whatsapp.net', '') || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={14} className="text-gray-400 shrink-0" />
                                        <span>Lead desde {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">Dados do lead não disponíveis</div>
                        )}
                    </div>

                    {/* Email Status Feedback */}
                    {emailMessage && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${emailStatus === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {emailStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {emailMessage}
                        </div>
                    )}
                </div>

                {/* Footer with Email Button */}
                <div className="p-4 border-t border-white/20 bg-white/30 flex gap-2 justify-between">
                    <Button
                        variant="secondary"
                        onClick={handleSendEmail}
                        disabled={emailStatus === 'sending'}
                        className="text-sm gap-2"
                    >
                        {emailStatus === 'sending' ? (
                            <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                        ) : emailStatus === 'success' ? (
                            <><CheckCircle2 size={16} /> Enviado!</>
                        ) : (
                            <><Send size={16} /> Enviar E-mail de Confirmação</>
                        )}
                    </Button>
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </GlassPane>
        </div>
    );
};
