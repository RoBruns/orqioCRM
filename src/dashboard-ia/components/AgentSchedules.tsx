import React, { useEffect, useState } from 'react';
import { GlassPane, Button } from '../../../components/ui/Glass';
import { ScheduleService } from '../services';
import { DashboardSchedule } from '../types';
import { Calendar as CalendarIcon, Clock, Users, Video, Search, Filter } from 'lucide-react';

export const AgentSchedules: React.FC = () => {
    const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);

    useEffect(() => {
        ScheduleService.getSchedules().then(setSchedules);
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <GlassPane className="p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orqio-orange/10 rounded-xl text-orqio-orange">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Agendamentos</h2>
                        <p className="text-sm text-gray-500">Visualize todas as reuniões marcadas pelo agente</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="secondary" className="text-sm gap-2">
                        <Filter size={16} /> Filtrar
                    </Button>
                    <Button className="text-sm gap-2">
                        <CalendarIcon size={16} /> Novo Agendamento
                    </Button>
                </div>
            </GlassPane>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 custom-scrollbar">
                {schedules.map(schedule => (
                    <GlassPane key={schedule.id} className="p-5 rounded-xl border-l-4 border-l-orqio-orange flex flex-col group hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${schedule.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {schedule.status === 'confirmed' ? 'Confirmado' : schedule.status === 'pending' ? 'Pendente' : schedule.status}
                            </span>
                            <Video size={16} className="text-gray-400 group-hover:text-orqio-orange transition-colors" />
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{schedule.leadName}</h3>
                            <p className="text-sm text-indigo-600 font-medium">Reunião de Vendas (Demo)</p>
                        </div>

                        <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CalendarIcon size={14} className="text-gray-400" />
                                {new Date(schedule.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                {new Date(schedule.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" className="w-full text-xs py-1 h-8">Reprogramar</Button>
                            <Button className="w-full text-xs py-1 h-8">Detalhes</Button>
                        </div>
                    </GlassPane>
                ))}
            </div>
        </div>
    );
};
