import React, { useState, useMemo } from 'react';
import { Plus, Search, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useLeadStore } from './store';
import { Lead } from './types';
import { Button, Input } from './components/ui/Glass';
import { LeadModal } from './components/LeadModal';
import { KanbanBoard } from './components/KanbanBoard';
import { Dashboard } from './components/Dashboard';
import { DashboardIA } from './src/dashboard-ia/DashboardIA';
import { ScriptsPage } from './components/ScriptsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';

function MainApp() {
  const { user, signOut } = useAuth();
  const { leads, addLead, updateLead, addNote, deleteLead } = useLeadStore();

  const [currentView, setCurrentView] = useState<'kanban' | 'dashboard' | 'dashboard-ia' | 'scripts'>(() => {
    return (localStorage.getItem('app_current_view') as 'kanban' | 'dashboard' | 'dashboard-ia' | 'scripts') || 'kanban';
  });

  React.useEffect(() => {
    localStorage.setItem('app_current_view', currentView);
  }, [currentView]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');

  // Filtering (Only affects Kanban, but good to have centralized)
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = search.toLowerCase();
      // Ensure properties exist before checking includes
      return (
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q))
      );
    });
  }, [leads, search]);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden text-orqio-black bg-[#fafafa]">

      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Top Header - Kept only for Search and "New Lead" button */}
        <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {currentView === 'kanban' ? 'Pipeline de Vendas' :
                currentView === 'dashboard' ? 'Overview' :
                  currentView === 'scripts' ? 'Call Scripts' : 'Workspace IA'}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-1 md:justify-end">

            {currentView === 'kanban' && (
              <>
                <div className="relative w-full max-w-xs group hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orqio-orange transition-colors" size={18} />
                  <Input
                    placeholder="Buscar leads por nome, empresa ou telefone..."
                    className="pl-10 bg-white/40 border-transparent hover:bg-white/60 focus:bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Button onClick={() => { setEditingLead(null); setModalOpen(true); }} className="whitespace-nowrap">
                  <Plus size={18} /> <span className="hidden sm:inline">Novo Lead</span>
                </Button>
              </>
            )}

            <button
              onClick={signOut}
              className="p-2.5 rounded-xl bg-white/40 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors ml-2"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {currentView === 'kanban' ? (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full flex flex-col"
              >
                <KanbanBoard
                  leads={filteredLeads}
                  onLeadClick={(lead) => { setEditingLead(lead); setModalOpen(true); }}
                />
              </motion.div>
            ) : currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full overflow-y-auto"
              >
                <Dashboard />
              </motion.div>
            ) : currentView === 'scripts' ? (
              <motion.div
                key="scripts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full overflow-y-auto"
              >
                <ScriptsPage />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-ia"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full overflow-y-auto"
              >
                <DashboardIA />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Lead Modal */}
        <LeadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialData={editingLead}
          onSave={(data) => {
            if (editingLead) {
              updateLead(editingLead.id, data);
            } else {
              addLead(data as any);
            }
          }}
          onAddNote={addNote}
          onDelete={(id) => {
            if (confirm('Tem certeza que deseja excluir este lead?')) {
              deleteLead(id);
              setModalOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;