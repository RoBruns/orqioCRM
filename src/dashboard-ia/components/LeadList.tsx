import React, { useEffect, useState } from 'react';
import { GlassPane } from '../../../components/ui/Glass';
import { LeadService } from '../services';
import { DashboardLead, LeadStage } from '../types';
import { User, Phone, Mail, Clock, Bot } from 'lucide-react';

export const LeadList: React.FC = () => {
    const [leads, setLeads] = useState<DashboardLead[]>([]);

    useEffect(() => {
        LeadService.getLeads().then(setLeads);

        const subscription = LeadService.subscribeToLeads(() => {
            LeadService.getLeads().then(setLeads);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getStageBadge = (stage: LeadStage) => {
        switch (stage) {
            case 'primeiro_contato': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">1º Contato</span>;
            case 'agendado': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Agendado</span>;
            case 'desqualificado': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Desqualificado</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{stage}</span>;
        }
    };

    return (
        <GlassPane className="h-full flex flex-col rounded-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-orqio-orange" size={24} />
                Leads Recentes (Funil IA)
            </h2>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-3">
                    {leads.map((lead) => (
                        <div key={lead.id} className="bg-white/40 p-3 rounded-xl border border-white/50 hover:bg-white/60 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                    {lead.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                        {lead.name}
                                        {lead.isIA ? (
                                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1" title="Em atendimento com IA">
                                                <Bot size={10} /> IA
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1" title="Em atendimento Humano">
                                                <User size={10} /> Humano
                                            </span>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone?.replace('@s.whatsapp.net', '')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {getStageBadge(lead.stage)}
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GlassPane>
    );
};
