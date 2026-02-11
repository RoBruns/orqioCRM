import React, { useEffect, useState } from 'react';
import { GlassPane } from '../../../components/ui/Glass';
import { ScheduleService } from '../services';
import { DashboardSchedule } from '../types';
import { Calendar, Clock, Video } from 'lucide-react';

export const ScheduleList: React.FC = () => {
    const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);

    useEffect(() => {
        ScheduleService.getSchedules().then((all) => {
            const now = new Date();
            const upcoming = all.filter(s => new Date(s.date) >= now);
            setSchedules(upcoming);
        });
    }, []);

    return (
        <GlassPane className="h-full flex flex-col rounded-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-orqio-orange" size={24} />
                Próximos Agendamentos
            </h2>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-3">
                    {schedules.map((schedule) => (
                        <div key={schedule.id} className="relative pl-4 border-l-2 border-orqio-orange py-1">
                            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-orqio-orange border-2 border-white"></div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{schedule.leadName}</h4>
                                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        Reunião de Vendas
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-700 flex items-center justify-end gap-1">
                                        <Clock size={14} className="text-gray-400" />
                                        {new Date(schedule.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(schedule.date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 bg-white/50 p-2 rounded-lg border border-white/60 flex items-center gap-2">
                                <Video size={12} className="text-gray-400" />
                                Link da reunião enviado via WhatsApp
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GlassPane>
    );
};
