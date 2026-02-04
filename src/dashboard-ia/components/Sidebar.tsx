import React from 'react';
import { LayoutDashboard, KanbanSquare, Calendar, Bot } from 'lucide-react';
import { GlassPane } from '../../../components/ui/Glass';

interface SidebarProps {
    activeTab: 'dashboard' | 'kanban' | 'schedules';
    onTabChange: (tab: 'dashboard' | 'kanban' | 'schedules') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'kanban', label: 'Kanban IA', icon: KanbanSquare },
        { id: 'schedules', label: 'Agendamentos', icon: Calendar },
    ] as const;

    return (
        <GlassPane className="w-64 flex flex-col h-full rounded-2xl p-4 mr-4 hidden md:flex shrink-0">
            <div className="flex items-center gap-3 px-4 mb-8 mt-2">
                <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                    <Bot size={24} />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 leading-tight">Agente IA</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Workspace</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-800 font-medium mb-1">Status do Agente</p>
                <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Ativo e Operando
                </div>
            </div>
        </GlassPane>
    );
};
