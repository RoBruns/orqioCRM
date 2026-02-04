import React, { useEffect, useState } from 'react';
import { GlassPane } from '../../../components/ui/Glass';
import { AgentLeadModal } from './AgentLeadModal';
import { LeadService } from '../services';
import { DashboardLead, LeadStage } from '../types';
import { User, Phone, Mail, Bot } from 'lucide-react';

const COLUMNS: { id: LeadStage; label: string; color: string }[] = [
    { id: 'primeiro_contato', label: 'Primeiro Contato', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'desqualificado', label: 'Desqualificado', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'cancelamento', label: 'Cancelamento', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { id: 'agendado', label: 'Agendado', color: 'bg-green-100 text-green-800 border-green-200' },
];

export const AgentKanban: React.FC = () => {
    const [leads, setLeads] = useState<DashboardLead[]>([]);
    const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);

    useEffect(() => {
        LeadService.getLeads().then(setLeads);

        const subscription = LeadService.subscribeToLeads(() => {
            LeadService.getLeads().then(setLeads);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getLeadsByStage = (stage: LeadStage) => leads.filter(l => l.stage === stage);

    return (
        <>
            <div className="flex h-full gap-4 overflow-x-auto pb-2">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="min-w-[280px] w-full max-w-xs flex flex-col h-full">
                        <div className={`p-3 rounded-xl mb-3 border font-semibold flex items-center justify-between ${col.color}`}>
                            {col.label}
                            <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs">
                                {getLeadsByStage(col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {getLeadsByStage(col.id).map((lead) => (
                                <GlassPane
                                    key={lead.id}
                                    className="p-4 rounded-xl cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all border-white/60 intensity-low"
                                    onClick={() => setSelectedLead(lead)}
                                >
                                    <h4 className="font-bold text-gray-800 flex items-center justify-between">
                                        {lead.name}
                                        {lead.isIA ? (
                                            <Bot size={14} className="text-indigo-500" title="IA Ativa" />
                                        ) : (
                                            <User size={14} className="text-gray-400" title="Humano" />
                                        )}
                                    </h4>
                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Mail size={12} /> {lead.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Phone size={12} /> {lead.phone?.replace('@s.whatsapp.net', '')}
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[10px] text-gray-400 text-right">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </GlassPane>
                            ))}
                            {getLeadsByStage(col.id).length === 0 && (
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center p-4">
                                    Nenhum lead nesta etapa
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AgentLeadModal
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
            />
        </>
    );
};
