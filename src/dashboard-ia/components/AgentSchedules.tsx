import React, { useEffect, useState, useMemo } from 'react';
import { GlassPane, Button } from '../../../components/ui/Glass';
import { ScheduleService } from '../services';
import { DashboardSchedule } from '../types';
import { Calendar as CalendarIcon, Clock, Video, Search, Filter, X, ChevronDown } from 'lucide-react';
import { NewScheduleModal } from './NewScheduleModal';
import { ScheduleDetailModal } from './ScheduleDetailModal';

export const AgentSchedules: React.FC = () => {
    const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<DashboardSchedule | null>(null);

    // Filter state
    const [filterName, setFilterName] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterService, setFilterService] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const loadSchedules = () => {
        ScheduleService.getSchedules().then(setSchedules);
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    const filteredSchedules = useMemo(() => {
        return schedules.filter(s => {
            const matchName = !filterName || s.leadName.toLowerCase().includes(filterName.toLowerCase());
            const matchDate = !filterDate || s.date?.startsWith(filterDate);
            const matchService = !filterService || (s.servico || '').toLowerCase().includes(filterService.toLowerCase());
            const matchStatus = !filterStatus || s.status === filterStatus;
            return matchName && matchDate && matchService && matchStatus;
        });
    }, [schedules, filterName, filterDate, filterService, filterStatus]);

    const hasActiveFilters = filterName || filterDate || filterService || filterStatus;

    const clearFilters = () => {
        setFilterName('');
        setFilterDate('');
        setFilterService('');
        setFilterStatus('');
    };

    const statusLabel = (status: string) => {
        const map: Record<string, string> = {
            confirmed: 'Confirmado',
            pending: 'Pendente',
            completed: 'Concluído',
            cancelled: 'Cancelado'
        };
        return map[status] || status;
    };

    const statusColor = (status: string) => {
        const map: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return map[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Header */}
            <GlassPane className="p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orqio-orange/10 rounded-xl text-orqio-orange">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Agendamentos</h2>
                        <p className="text-sm text-gray-500">
                            {filteredSchedules.length} agendamento{filteredSchedules.length !== 1 ? 's' : ''}
                            {hasActiveFilters ? ' (filtrado)' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant={showFilters ? 'primary' : 'secondary'}
                        className="text-sm gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filtrar
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                    </Button>
                    <Button className="text-sm gap-2" onClick={() => setShowNewModal(true)}>
                        <CalendarIcon size={16} /> Novo Agendamento
                    </Button>
                </div>
            </GlassPane>

            {/* Filter Bar */}
            {showFilters && (
                <GlassPane className="p-4 rounded-2xl shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-9 pr-3 py-2 text-sm text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400"
                                placeholder="Nome do cliente..."
                                value={filterName}
                                onChange={e => setFilterName(e.target.value)}
                            />
                        </div>

                        <input
                            type="date"
                            className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-3 py-2 text-sm text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />

                        <input
                            className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-3 py-2 text-sm text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="Serviço..."
                            value={filterService}
                            onChange={e => setFilterService(e.target.value)}
                        />

                        <div className="relative">
                            <select
                                className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-3 py-2 text-sm text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all appearance-none"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Todos os status</option>
                                <option value="confirmed">Confirmado</option>
                                <option value="pending">Pendente</option>
                                <option value="completed">Concluído</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={clearFilters}
                                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                            >
                                <X size={12} /> Limpar filtros
                            </button>
                        </div>
                    )}
                </GlassPane>
            )}

            {/* Schedule Cards */}
            <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                {filteredSchedules.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                        {hasActiveFilters ? 'Nenhum agendamento encontrado com os filtros aplicados' : 'Nenhum agendamento registrado'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                        {filteredSchedules.map(schedule => (
                            <GlassPane key={schedule.id} className="p-5 rounded-xl border-l-4 border-l-orqio-orange group hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor(schedule.status)}`}>
                                        {statusLabel(schedule.status)}
                                    </span>
                                    <Video size={16} className="text-gray-400 group-hover:text-orqio-orange transition-colors" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-1">{schedule.leadName}</h3>
                                <p className="text-sm text-indigo-600 font-medium mb-4">{schedule.servico}</p>

                                <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CalendarIcon size={14} className="text-gray-400 shrink-0" />
                                        {new Date(schedule.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={14} className="text-gray-400 shrink-0" />
                                        {new Date(schedule.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button variant="secondary" className="w-full text-xs py-1 h-8">Reprogramar</Button>
                                    <Button
                                        className="w-full text-xs py-1 h-8"
                                        onClick={() => setSelectedSchedule(schedule)}
                                    >
                                        Detalhes
                                    </Button>
                                </div>
                            </GlassPane>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <NewScheduleModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onCreated={loadSchedules}
            />

            <ScheduleDetailModal
                schedule={selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
            />
        </div>
    );
};
