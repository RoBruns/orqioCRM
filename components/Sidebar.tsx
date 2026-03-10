import React, { useState } from 'react';
import { LayoutGrid, BarChart3, FileText, Bot, ChevronRight, LogOut, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
    currentView: 'kanban' | 'dashboard' | 'dashboard-ia' | 'scripts';
    setCurrentView: (view: 'kanban' | 'dashboard' | 'dashboard-ia' | 'scripts') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { signOut } = useAuth();

    const handleMouseEnter = () => setIsExpanded(true);
    const handleMouseLeave = () => setIsExpanded(false);

    const navItems = [
        { id: 'kanban', icon: <LayoutGrid size={24} />, label: 'Pipeline' },
        { id: 'dashboard', icon: <BarChart3 size={24} />, label: 'Dashboard' },
    ];

    const middleItems = [
        { id: 'scripts', icon: <FileText size={24} />, label: 'Call Scripts' },
    ];

    const bottomItems = [
        { id: 'dashboard-ia', icon: <Bot size={24} />, label: 'Workspace IA' },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isExpanded ? 240 : 80 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`h-full bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-[100] shrink-0 ${isExpanded ? 'items-start' : 'items-center'} py-6 overflow-hidden absolute left-0 top-0 bottom-0 md:relative`}
        >
            {/* Brand */}
            <div className={`flex items-center gap-3 px-5 mb-10 w-full ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                <div className="bg-orqio-orange w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-bold text-xl shrink-0">
                    O
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap flex-1 overflow-hidden"
                        >
                            <h1 className="text-xl font-bold tracking-tight text-orqio-black">CRM Orqio</h1>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 w-full px-3 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id as any)}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 group ${isActive ? 'bg-orqio-orange/10 text-orqio-orange' : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'} ${isExpanded ? 'justify-start gap-4' : 'justify-center'}`}
                            title={item.label}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-semibold whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}

                <div className="w-full px-4 my-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent w-full"></div>
                </div>

                {middleItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id as any)}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 group ${isActive ? 'bg-orqio-orange/10 text-orqio-orange' : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'} ${isExpanded ? 'justify-start gap-4' : 'justify-center'}`}
                            title={item.label}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-semibold whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}

                {/* Divider */}
                <div className="w-full px-4 my-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent w-full"></div>
                </div>

                {/* Secondary Nav */}
                {bottomItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id as any)}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 group ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'} ${isExpanded ? 'justify-start gap-4' : 'justify-center'}`}
                            title={item.label}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-semibold whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </nav>

            {/* Footer Nav */}
            <div className="w-full px-3 mt-auto pt-4">
                {/* Mobile only logic toggle button is inside Sidebar for full area */}
                <button
                    onClick={signOut}
                    className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 group text-gray-500 hover:bg-red-50 hover:text-red-500 ${isExpanded ? 'justify-start gap-4' : 'justify-center'}`}
                    title="Sair"
                >
                    <div className="shrink-0 transition-transform group-hover:scale-110">
                        <LogOut size={24} />
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold whitespace-nowrap overflow-hidden"
                            >
                                Sair
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

        </motion.div>
    );
};
