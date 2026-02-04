import React from 'react';
import { MetricsCards } from './MetricsCards';
import { LeadList } from './LeadList';
import { ScheduleList } from './ScheduleList';
import { KnowledgeBase } from './KnowledgeBase';

export const AgentDashboard: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar p-1">
            {/* Metrics Section */}
            <div className="animate-fade-in-up">
                <MetricsCards />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px] animate-fade-in-up delay-100">
                {/* Left Column: Leads */}
                <div className="lg:col-span-1 h-[500px] lg:h-auto">
                    <LeadList />
                </div>

                {/* Middle Column: Schedules */}
                <div className="lg:col-span-1 h-[500px] lg:h-auto">
                    <ScheduleList />
                </div>

                {/* Right Column: Knowledge Base */}
                <div className="lg:col-span-1 h-auto lg:h-[400px]">
                    <KnowledgeBase />
                </div>
            </div>
        </div>
    );
};
