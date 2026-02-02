import React, { useState, useEffect } from 'react';
import { X, User, Building, Phone, Mail, FileText, Calendar, Clock, Send, Trash2, UserCheck } from 'lucide-react';
import { GlassPane, Button, Input, TextArea } from './ui/Glass';
import { Lead, Note } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: any) => void;
  onAddNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  initialData?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, onAddNote, onDelete, initialData }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setActiveTab('details'); // Reset tab when opening new lead
    } else {
      setFormData({});
      setActiveTab('details');
    }
    setNewNote('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !initialData?.id) return;
    onAddNote(initialData.id, newNote);
    setNewNote('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <GlassPane intensity="high" className="w-full max-w-2xl max-h-[90vh] flex flex-col relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-orqio-black flex items-center gap-2">
            {initialData ? <User size={20} className="text-orqio-orange"/> : <User size={20} className="text-orqio-orange"/>}
            {initialData ? 'Editar Lead' : 'Novo Lead'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs (Only if editing) */}
        {initialData && (
          <div className="flex px-6 pt-4 gap-4 border-b border-white/20">
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'details' ? 'border-orqio-orange text-orqio-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Detalhes
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'notes' ? 'border-orqio-orange text-orqio-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Notas & Histórico
              <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                {initialData.notes.length}
              </span>
            </button>
          </div>
        )}

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'details' ? (
            <form id="leadForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Primary Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Nome do Lead *" 
                  required
                  placeholder="Ex: João Silva" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                  label="Empresa *" 
                  required
                  placeholder="Ex: Acme Corp" 
                  value={formData.company || ''} 
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
                <Input 
                  label="Telefone Geral *" 
                  required
                  type="tel"
                  placeholder="(00) 00000-0000" 
                  value={formData.phone || ''} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <Input 
                  label="E-mail *" 
                  required
                  type="email"
                  placeholder="email@empresa.com" 
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              
              {/* B2B Responsible Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCheck size={14} /> Responsável na Empresa (Contato B2B)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Nome do Responsável" 
                    placeholder="Ex: Maria (Diretora)" 
                    value={formData.responsibleName || ''} 
                    onChange={e => setFormData({...formData, responsibleName: e.target.value})}
                  />
                  <Input 
                    label="Telefone do Responsável" 
                    type="tel"
                    placeholder="(00) 00000-0000" 
                    value={formData.responsiblePhone || ''} 
                    onChange={e => setFormData({...formData, responsiblePhone: e.target.value})}
                  />
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

              {/* Process Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Próxima Ação" 
                  placeholder="Ex: Ligar amanhã" 
                  value={formData.nextAction || ''} 
                  onChange={e => setFormData({...formData, nextAction: e.target.value})}
                />
                 <Input 
                  label="Origem do Lead" 
                  placeholder="Ex: Indicação" 
                  value={formData.origin || ''} 
                  onChange={e => setFormData({...formData, origin: e.target.value})}
                />
                <Input 
                  label="Responsável Interno" 
                  placeholder="Quem cuida?" 
                  value={formData.owner || ''} 
                  onChange={e => setFormData({...formData, owner: e.target.value})}
                />
              </div>

              {!initialData && (
                 <TextArea 
                  label="Nota Inicial" 
                  placeholder="Detalhes iniciais sobre o lead..." 
                  // @ts-ignore - temporary field for creation
                  value={formData.initialNote || ''} 
                  // @ts-ignore
                  onChange={e => setFormData({...formData, initialNote: e.target.value})}
                />
              )}
            </form>
          ) : (
            <div className="space-y-6">
               {/* Add Note */}
               <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <TextArea 
                      placeholder="Escreva uma nova nota..." 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button onClick={handleAddNote} disabled={!newNote.trim()} className="mt-1 h-[80px]">
                    <Send size={18} />
                  </Button>
               </div>

               {/* History */}
               <div className="space-y-4">
                 {initialData?.notes.map((note) => (
                   <div key={note.id} className="bg-white/40 p-4 rounded-xl border border-white/50">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Clock size={12}/> {formatDate(note.createdAt)}
                        </span>
                     </div>
                     <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                   </div>
                 ))}
                 {initialData?.notes.length === 0 && (
                   <div className="text-center py-10 text-gray-400">
                     Nenhuma nota registrada.
                   </div>
                 )}
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-white/30 flex justify-between items-center">
          {initialData && activeTab === 'details' ? (
             <Button type="button" variant="ghost" onClick={() => onDelete(initialData.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
               <Trash2 size={16} /> Excluir
             </Button>
          ) : <div></div>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            {activeTab === 'details' && (
              <Button type="submit" form="leadForm">Salvar Lead</Button>
            )}
          </div>
        </div>

      </GlassPane>
    </div>
  );
};