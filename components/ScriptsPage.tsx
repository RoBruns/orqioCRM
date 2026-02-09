import React, { useState, useEffect } from 'react';
import { ScriptStepViewer } from './scripts/ScriptStepViewer';
import { ScriptVisualEditor } from './scripts/ScriptVisualEditor';
import { GlassPane, Button } from './ui/Glass';
import { Edit3, Save, X, FileText, ChevronRight, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Script {
    id: string;
    title: string;
    content: string;
    category: string;
    updated_at: string;
}

export const ScriptsPage: React.FC = () => {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchScripts();
    }, []);

    const fetchScripts = async () => {
        try {
            const { data, error } = await supabase
                .from('sales_scripts')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setScripts(data || []);
            if (data && data.length > 0 && !selectedScript) {
                setSelectedScript(data[0]);
            }
        } catch (error) {
            console.error('Erro ao carregar scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (selectedScript) {
            setEditContent(selectedScript.content);
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!selectedScript) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('sales_scripts')
                .update({ content: editContent })
                .eq('id', selectedScript.id);

            if (error) throw error;

            setSelectedScript({ ...selectedScript, content: editContent });
            setScripts(scripts.map(s =>
                s.id === selectedScript.id ? { ...s, content: editContent } : s
            ));
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar script:', error);
            alert('Erro ao salvar script');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditContent('');
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Carregando scripts...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex p-6 overflow-hidden bg-gray-50/50 text-orqio-black gap-4">
            {/* Sidebar */}
            <GlassPane className="w-72 flex flex-col h-full rounded-2xl p-4 shrink-0 hidden md:flex">
                <div className="flex items-center gap-3 px-4 mb-6 mt-2">
                    <div className="bg-orqio-orange text-white p-2 rounded-xl shadow-lg shadow-orange-500/30">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight">Scripts</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Cold Call</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1 overflow-y-auto">
                    {scripts.map((script) => {
                        const isActive = selectedScript?.id === script.id;
                        return (
                            <button
                                key={script.id}
                                onClick={() => setSelectedScript(script)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left ${isActive
                                    ? 'bg-orange-50 text-orqio-orange shadow-sm'
                                    : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                                    }`}
                            >
                                <FileText size={18} className={isActive ? 'text-orqio-orange' : 'text-gray-400'} />
                                <span className="truncate flex-1">{script.title}</span>
                                {isActive && <ChevronRight size={16} className="text-orqio-orange" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 mt-4">
                    <p className="text-xs text-orange-800 font-medium mb-1">Dica</p>
                    <p className="text-xs text-gray-600">Clique em "Editar" para personalizar os scripts de acordo com sua equipe.</p>
                </div>
            </GlassPane>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedScript ? (
                    <GlassPane className="flex-1 rounded-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orqio-orange/10 rounded-lg text-orqio-orange">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800">{selectedScript.title}</h1>
                                    <p className="text-xs text-gray-500">
                                        Atualizado em {new Date(selectedScript.updated_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                                            <X size={16} /> Cancelar
                                        </Button>
                                        <Button onClick={handleSave} disabled={saving}>
                                            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="secondary" onClick={handleEdit}>
                                        <Edit3 size={16} /> Editar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isEditing ? (
                                <ScriptVisualEditor
                                    initialContent={editContent}
                                    onChange={setEditContent}
                                />
                            ) : (
                                <ScriptStepViewer content={selectedScript.content} />
                            )}
                        </div>
                    </GlassPane>
                ) : (
                    <GlassPane className="flex-1 rounded-2xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Selecione um script para visualizar</p>
                        </div>
                    </GlassPane>
                )}
            </div>
        </div>
    );
};
