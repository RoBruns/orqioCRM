import React, { useEffect, useState } from 'react';
import { GlassPane } from '../../../components/ui/Glass';
import { MetricsService } from '../services';
import { DashboardMetric } from '../types';
import { TrendingUp, Users, Calendar, CheckCircle, Bot, User } from 'lucide-react';

export const MetricsCards: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetric | null>(null);

    useEffect(() => {
        MetricsService.getMetrics().then(setMetrics);
    }, []);

    if (!metrics) return <div className="text-gray-500 animate-pulse">Carregando métricas...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.conversionRate}%</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Conversão</p>
                </div>
            </GlassPane>

            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.scheduleRate}%</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Agendamento</p>
                </div>
            </GlassPane>

            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.totalLeads}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Leads</p>
                </div>
            </GlassPane>

            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.totalScheduled}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Agendados</p>
                </div>
            </GlassPane>

            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.activeIA}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Com IA</p>
                </div>
            </GlassPane>

            <GlassPane intensity="low" className="p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.activeHuman}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Com Humano</p>
                </div>
            </GlassPane>
        </div>
    );
};
