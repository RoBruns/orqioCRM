import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Search, UserPlus, Check } from 'lucide-react';
import { GlassPane, Button, Input } from '../../../components/ui/Glass';
import { LeadService, ScheduleService } from '../services';
import { DashboardLead } from '../types';
import { NewLeadModal } from './NewLeadModal';

interface NewScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export const NewScheduleModal: React.FC<NewScheduleModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [leads, setLeads] = useState<DashboardLead[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);
    const [dateTime, setDateTime] = useState('');
    const [servico, setServico] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            LeadService.getLeads().then(setLeads);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery)
    );

    const resetForm = () => {
        setSearchQuery('');
        setSelectedLead(null);
        setDateTime('');
        setServico('');
        setError('');
        setShowDropdown(false);
    };

    const handleLeadCreated = async (newId: string) => {
        // Refresh leads list and select the newly created lead
        const refreshed = await LeadService.getLeads();
        setLeads(refreshed);
        const newLead = refreshed.find(l => l.id === newId);
        if (newLead) {
            setSelectedLead(newLead);
            setSearchQuery(newLead.name);
            setShowDropdown(false);
        }
        setShowNewLeadModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedLead) {
            setError('Selecione um lead');
            return;
        }
        if (!dateTime) {
            setError('Informe a data e hora');
            return;
        }
        if (!servico.trim()) {
            setError('Informe o serviço');
            return;
        }

        setLoading(true);
        const result = await ScheduleService.createSchedule({
            id_cliente: selectedLead.id,
            horario_inicio: new Date(dateTime).toISOString(),
            servico: servico.trim()
        });
        setLoading(false);

        if (result.success) {
            onCreated?.();
            resetForm();
            onClose();
        } else {
            setError(result.error || 'Erro ao criar agendamento');
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

                <GlassPane intensity="high" className="w-full max-w-lg relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/20">
                        <h2 className="text-xl font-bold text-orqio-black flex items-center gap-2">
                            <Calendar size={20} className="text-orqio-orange" />
                            Novo Agendamento
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Lead Selector */}
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                Lead / Cliente
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-10 pr-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400"
                                    placeholder="Buscar lead por nome, email ou telefone..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedLead(null);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />

                                {selectedLead && (
                                    <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showDropdown && !selectedLead && (
                                <div className="mt-1 bg-white border border-gray-200/80 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 relative">
                                    {filteredLeads.length > 0 ? (
                                        filteredLeads.slice(0, 10).map(lead => (
                                            <button
                                                key={lead.id}
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left hover:bg-orqio-orange/5 flex items-center justify-between border-b border-gray-100 last:border-0 transition-colors"
                                                onClick={() => {
                                                    setSelectedLead(lead);
                                                    setSearchQuery(lead.name);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                                                    <p className="text-xs text-gray-400">{lead.phone?.replace('@s.whatsapp.net', '')}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Nenhum lead encontrado
                                        </div>
                                    )}

                                    {/* Create New Lead Button */}
                                    <button
                                        type="button"
                                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-2 border-t border-gray-200 text-indigo-600 font-medium text-sm transition-colors"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setShowNewLeadModal(true);
                                        }}
                                    >
                                        <UserPlus size={16} />
                                        Criar Novo Lead
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DateTime */}
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                Data e Hora
                            </label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-10 pr-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Service */}
                        <Input
                            label="Serviço"
                            placeholder="Ex: Consultoria, Demo, Apresentação..."
                            value={servico}
                            onChange={(e) => setServico(e.target.value)}
                            required
                        />

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Agendando...' : 'Agendar'}
                            </Button>
                        </div>
                    </form>
                </GlassPane>
            </div>

            {/* Nested New Lead Modal */}
            <NewLeadModal
                isOpen={showNewLeadModal}
                onClose={() => setShowNewLeadModal(false)}
                onCreated={handleLeadCreated}
            />
        </>
    );
};
