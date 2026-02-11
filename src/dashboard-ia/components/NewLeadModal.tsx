import React, { useState } from 'react';
import { X, User, Mail, Phone, Bot, ChevronDown } from 'lucide-react';
import { GlassPane, Button, Input } from '../../../components/ui/Glass';
import { LeadService } from '../services';

interface NewLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (id: string) => void;
}

const STATUS_OPTIONS = [
    { value: 'Primeiro Contato', label: 'Primeiro Contato' },
    { value: 'Desqualificado', label: 'Desqualificado' },
    { value: 'Cancelamento', label: 'Cancelamento' },
    { value: 'Agendado', label: 'Agendado' },
];

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [ia, setIa] = useState(false);
    const [status, setStatus] = useState('Primeiro Contato');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setIa(false);
        setStatus('Primeiro Contato');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Formato de email inválido');
            return;
        }

        if (!phone.trim()) {
            setError('Número de WhatsApp é obrigatório');
            return;
        }

        setLoading(true);
        const result = await LeadService.createLead({
            name: name.trim(),
            email: email.trim(),
            remoteJid: phone.trim(),
            ia,
            status
        });
        setLoading(false);

        if (result.success) {
            onCreated?.(result.id!);
            resetForm();
            onClose();
        } else {
            setError(result.error || 'Erro ao criar lead');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            <GlassPane intensity="high" className="w-full max-w-lg relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/20">
                    <h2 className="text-xl font-bold text-orqio-black flex items-center gap-2">
                        <User size={20} className="text-orqio-orange" />
                        Novo Lead
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

                    <Input
                        label="Nome"
                        placeholder="Nome do lead"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="w-full">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                            WhatsApp (DDD + Número)
                        </label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-10 pr-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400"
                                placeholder="11952288820"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Será formatado automaticamente para 55{phone.startsWith('55') ? phone : phone ? `55${phone}` : '...'}@s.whatsapp.net
                        </p>
                    </div>

                    {/* IA Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-gray-200/40">
                        <div className="flex items-center gap-2">
                            <Bot size={16} className="text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Atendimento por IA</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIa(!ia)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${ia ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ia ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Status Select */}
                    <div className="w-full">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all appearance-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Criar Lead'}
                        </Button>
                    </div>
                </form>
            </GlassPane>
        </div>
    );
};
