import React from 'react';
import { X, User, Phone, Mail, Bot, Calendar, Clock } from 'lucide-react';
import { GlassPane, Button } from '../../../components/ui/Glass';
import { DashboardLead } from '../types';

interface AgentLeadModalProps {
    lead: DashboardLead | null;
    onClose: () => void;
}

export const AgentLeadModal: React.FC<AgentLeadModalProps> = ({ lead, onClose }) => {
    if (!lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <GlassPane intensity="high" className="w-full max-w-md flex flex-col relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/20">
                    <h2 className="text-xl font-bold text-orqio-black flex items-center gap-2">
                        <User size={20} className="text-orqio-orange" />
                        Detalhes do Lead
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Main Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                            {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{lead.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {lead.isIA ? (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                        <Bot size={12} /> Em atendimento com IA
                                    </span>
                                ) : (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                        <User size={12} /> Atendimento Humano
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/30" />

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-white/40 rounded-lg"><Mail size={16} className="text-orqio-orange" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                <p className="text-sm font-medium">{lead.email || 'Não informado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-white/40 rounded-lg"><Phone size={16} className="text-orqio-orange" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Telefone / WhatsApp</p>
                                <p className="text-sm font-medium">{lead.phone?.replace('@s.whatsapp.net', '') || 'Não informado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-white/40 rounded-lg"><Calendar size={16} className="text-orqio-orange" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Data de Criação</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                    <span className="text-gray-400 text-xs font-normal flex items-center gap-1 ml-1">
                                        <Clock size={10} /> {new Date(lead.createdAt).toLocaleTimeString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orqio-orange/10 p-4 rounded-xl border border-orqio-orange/20">
                        <p className="text-xs text-orqio-orange font-bold uppercase mb-1">Status Atual</p>
                        <p className="text-sm font-medium text-gray-800 capitalize">{lead.stage.replace('_', ' ')}</p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/20 bg-white/30 flex justify-end">
                    <Button onClick={onClose}>Fechar</Button>
                </div>

            </GlassPane>
        </div>
    );
};
