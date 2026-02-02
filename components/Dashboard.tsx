import React from 'react';
import { useLeadStore } from '../store';
import { COLUMNS, LeadStatus } from '../types';
import { GlassPane } from './ui/Glass';
import { TrendingUp, Users, AlertCircle, CheckCircle, Target, Briefcase } from 'lucide-react';

const KpiCard = ({ title, value, icon, color = "text-gray-800" }: { title: string, value: string | number, icon: React.ReactNode, color?: string }) => (
  <GlassPane intensity="medium" className="p-6 rounded-2xl flex items-center justify-between shadow-sm">
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
    </div>
    <div className="p-3 bg-white/50 rounded-xl shadow-sm text-gray-600">
      {icon}
    </div>
  </GlassPane>
);

export const Dashboard = () => {
  const { leads } = useLeadStore();

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === LeadStatus.WON).length;
  const lostLeads = leads.filter(l => l.status === LeadStatus.DISQUALIFIED).length;
  const activeLeads = totalLeads - wonLeads - lostLeads;
  
  // Calculate Conversion Rate (Won / (Won + Lost))
  const closedDeals = wonLeads + lostLeads;
  const conversionRate = closedDeals > 0 
    ? ((wonLeads / closedDeals) * 100).toFixed(1) 
    : '0.0';

  const statusCounts = Object.values(LeadStatus).reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  return (
    <div className="p-6 h-full overflow-y-auto animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Performance</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard title="Total de Leads" value={totalLeads} icon={<Users />} />
            <KpiCard title="Pipeline Ativo" value={activeLeads} icon={<Briefcase />} color="text-orqio-orange" />
            <KpiCard title="Leads Ganhos" value={wonLeads} icon={<CheckCircle className="text-green-600"/>} color="text-green-600" />
            <KpiCard title="Taxa de Conversão" value={`${conversionRate}%`} icon={<TrendingUp className="text-blue-600"/>} color="text-blue-600" />
        </div>

        {/* Charts / Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Funnel */}
            <GlassPane intensity="low" className="p-8 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="text-orqio-orange" size={24}/>
                    <h3 className="text-lg font-bold text-gray-800">Funil de Vendas</h3>
                </div>
                
                <div className="space-y-5">
                    {COLUMNS.map((col) => {
                        const count = statusCounts[col.id];
                        const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                        
                        return (
                            <div key={col.id} className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-gray-600">{col.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-gray-400 to-gray-500 ${col.color.replace('border-', 'bg-')}`} 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassPane>

            {/* Quick Stats / Info */}
            <GlassPane intensity="low" className="p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                 <div className="mb-4 p-4 bg-red-50 rounded-full text-red-500">
                    <AlertCircle size={32} />
                 </div>
                 <h3 className="text-4xl font-bold text-gray-800 mb-2">{lostLeads}</h3>
                 <p className="text-gray-500 font-medium uppercase text-sm tracking-widest">Leads Desqualificados</p>
                 <div className="mt-8 w-full border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-400">
                        Mantenha o foco nos leads qualificados. <br/> 
                        Limpar o pipeline é tão importante quanto preenchê-lo.
                    </p>
                 </div>
            </GlassPane>
        </div>
    </div>
  )
}