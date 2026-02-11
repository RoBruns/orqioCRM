import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AgentDashboard } from './components/AgentDashboard';
import { AgentKanban } from './components/AgentKanban';
import { AgentSchedules } from './components/AgentSchedules';
import { AnimatePresence, motion } from 'framer-motion';

export const DashboardIA: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'schedules'>(() => {
        return (localStorage.getItem('agent_active_tab') as 'dashboard' | 'kanban' | 'schedules') || 'dashboard';
    });

    useEffect(() => {
        localStorage.setItem('agent_active_tab', activeTab);
    }, [activeTab]);

    return (
        <div className="h-full flex p-6 overflow-hidden bg-gray-50/50 text-orqio-black">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header Placeholder (if needed later) */}

                <div className="flex-1 overflow-hidden p-2">
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <AgentDashboard />
                            </motion.div>
                        )}
                        {activeTab === 'kanban' && (
                            <motion.div
                                key="kanban"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <AgentKanban />
                            </motion.div>
                        )}
                        {activeTab === 'schedules' && (
                            <motion.div
                                key="schedules"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <AgentSchedules />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
