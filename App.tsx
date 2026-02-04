import React, { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, BarChart3, LogOut, Bot } from 'lucide-react';
import { useLeadStore } from './store';
import { Lead } from './types';
import { Button, Input } from './components/ui/Glass';
import { LeadModal } from './components/LeadModal';
import { KanbanBoard } from './components/KanbanBoard';
import { Dashboard } from './components/Dashboard';
import { DashboardIA } from './src/dashboard-ia/DashboardIA';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';

function MainApp() {
  const { user, signOut } = useAuth();
  const { leads, addLead, updateLead, addNote, deleteLead } = useLeadStore();

  const [currentView, setCurrentView] = useState<'kanban' | 'dashboard' | 'dashboard-ia'>(() => {
    return (localStorage.getItem('app_current_view') as 'kanban' | 'dashboard' | 'dashboard-ia') || 'kanban';
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
    <div className="h-screen w-screen flex flex-col overflow-hidden text-orqio-black">

      {/* Top Bar */}
      <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-orqio-orange w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-bold text-xl">
            O
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CRM Orqio</h1>
            <p className="text-xs text-gray-500">Pipeline de Vendas</p>
          </div>
        </div>

        {/* Navigation & Search */}
        <div className="flex items-center gap-3 flex-1 md:justify-end">

          {/* View Toggles */}
          <div className="flex bg-white/40 p-1 rounded-xl border border-white/40 mr-2">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`p-2 rounded-lg transition-all ${currentView === 'kanban' ? 'bg-white shadow-sm text-orqio-orange' : 'text-gray-500 hover:text-gray-700'}`}
              title="Pipeline Kanban"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`p-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-white shadow-sm text-orqio-orange' : 'text-gray-500 hover:text-gray-700'}`}
              title="Dashboard KPIs"
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setCurrentView('dashboard-ia')}
              className={`p-2 rounded-lg transition-all ${currentView === 'dashboard-ia' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Agente IA"
            >
              <Bot size={20} />
            </button>
          </div>

          <div className="relative w-full max-w-xs group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orqio-orange transition-colors" size={18} />
            <Input
              placeholder="Buscar..."
              className="pl-10 bg-white/40 border-transparent hover:bg-white/60 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={currentView === 'dashboard'} // Disable search in dashboard
            />
          </div>

          <Button onClick={() => { setEditingLead(null); setModalOpen(true); }} className="whitespace-nowrap">
            <Plus size={18} /> <span className="hidden sm:inline">Novo Lead</span>
          </Button>

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
        {currentView === 'kanban' ? (
          <KanbanBoard
            leads={filteredLeads}
            onLeadClick={(lead) => { setEditingLead(lead); setModalOpen(true); }}
          />
        ) : currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <DashboardIA />
        )}
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