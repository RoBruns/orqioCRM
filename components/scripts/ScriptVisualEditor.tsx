import React, { useState, useEffect, useRef } from 'react';
import { ScriptBlock, ScriptBlockType } from '../../types/ScriptTypes';
import { parseMarkdownToBlocks, blocksToMarkdown } from '../../utils/scriptParser';
import { Button } from '../ui/Glass';
import { Trash2, ArrowUp, ArrowDown, Plus, Type, Heading1, Heading2, MessageSquare, Quote, AlertTriangle, GripVertical } from 'lucide-react';

interface ScriptVisualEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
}

export const ScriptVisualEditor: React.FC<ScriptVisualEditorProps> = ({ initialContent, onChange }) => {
    const [blocks, setBlocks] = useState<ScriptBlock[]>([]);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    // Initialize only on mount (or if key changes in parent)
    useEffect(() => {
        setBlocks(parseMarkdownToBlocks(initialContent));
    }, []);

    const updateBlock = (id: string, content: string) => {
        const newBlocks = blocks.map(b => b.id === id ? { ...b, content } : b);
        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
    };

    const deleteBlock = (id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
    };

    const addBlock = (type: ScriptBlockType, index: number) => {
        const newBlock: ScriptBlock = {
            id: `new-${Date.now()}`,
            type,
            content: ''
        };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);

        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
        setFocusedBlockId(newBlock.id);
    };

    // Auto-resize textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className="max-w-4xl mx-auto pb-40 space-y-4">
            {blocks.map((block, index) => (
                <div
                    key={block.id}
                    className={`group relative p-4 border rounded-2xl bg-white transition-all duration-300 ${focusedBlockId === block.id
                            ? 'border-orqio-orange shadow-lg shadow-orange-500/10 ring-4 ring-orange-500/5'
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                        }`}
                    onClick={() => setFocusedBlockId(block.id)}
                >
                    {/* Drag Handle & Type */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-center gap-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="cursor-grab hover:text-gray-500" title="Arrastar (Em breve)">
                            <GripVertical size={16} />
                        </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            {block.type === 'h1' && 'Título Principal'}
                            {block.type === 'h2' && 'Seção'}
                            {block.type === 'h3' && 'Passo'}
                            {block.type === 'text' && 'Texto'}
                            {block.type === 'code' && 'Fala'}
                            {block.type === 'alert' && 'Aviso'}
                            {block.type === 'blockquote' && 'Citação'}
                        </span>

                        <div className="h-4 w-px bg-gray-200"></div>

                        <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                                <ArrowUp size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                                <ArrowDown size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors ml-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content Input */}
                    <div className="pl-6 pr-32">
                        {block.type === 'h1' && (
                            <input
                                autoFocus={focusedBlockId === block.id}
                                className="w-full text-3xl font-extrabold text-gray-900 border-none focus:outline-none focus:ring-0 placeholder-gray-300 bg-transparent"
                                placeholder="Título Principal"
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                        )}
                        {block.type === 'h2' && (
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <input
                                    autoFocus={focusedBlockId === block.id}
                                    className="w-auto min-w-[200px] text-xl font-bold text-center text-orqio-orange border-none focus:outline-none focus:ring-0 placeholder-orange-200 bg-transparent"
                                    placeholder="Nome da Seção"
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                />
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                        )}
                        {block.type === 'h3' && (
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-indigo-500 rounded-full shrink-0"></div>
                                <input
                                    autoFocus={focusedBlockId === block.id}
                                    className="w-full text-lg font-semibold text-gray-800 border-none focus:outline-none focus:ring-0 placeholder-gray-300 bg-transparent"
                                    placeholder="Título do Passo"
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                />
                            </div>
                        )}
                        {(block.type === 'text' || block.type === 'blockquote' || block.type === 'alert') && (
                            <div className={`relative ${block.type === 'alert' ? 'bg-red-50/50 -mx-6 -my-4 p-6 rounded-2xl' : ''}`}>
                                {block.type === 'alert' && <AlertTriangle className="absolute left-6 top-6 text-red-500" size={20} />}
                                <textarea
                                    autoFocus={focusedBlockId === block.id}
                                    className={`w-full min-h-[24px] resize-none border-none focus:outline-none focus:ring-0 text-gray-600 bg-transparent leading-relaxed ${block.type === 'alert' ? 'pl-8 text-red-800 font-medium' : ''}`}
                                    placeholder={block.type === 'alert' ? "Digite o aviso..." : "Digite as instruções..."}
                                    value={block.content}
                                    onChange={(e) => {
                                        updateBlock(block.id, e.target.value);
                                        autoResize(e);
                                    }}
                                    onFocus={(e) => autoResize(e)}
                                />
                            </div>
                        )}
                        {block.type === 'code' && (
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orqio-orange to-pink-500 rounded-full opacity-50"></div>
                                <div className="pl-4">
                                    <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">Script / Fala</p>
                                    <textarea
                                        autoFocus={focusedBlockId === block.id}
                                        className="w-full min-h-[60px] resize-none border-none focus:outline-none focus:ring-0 text-gray-800 bg-transparent font-sans text-lg leading-relaxed placeholder-gray-300"
                                        placeholder="O que deve ser dito..."
                                        value={block.content}
                                        onChange={(e) => {
                                            updateBlock(block.id, e.target.value);
                                            autoResize(e);
                                        }}
                                        onFocus={(e) => autoResize(e)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Insert Button (Hover Between) */}
                    <div className="absolute -bottom-5 left-0 right-0 h-10 flex items-center justify-center opacity-0 hover:opacity-100 z-20 group-hover:z-30 transition-all duration-200">
                        <div className="bg-white shadow-xl shadow-orange-500/20 border border-gray-100 rounded-full p-1.5 flex items-center gap-1 scale-90 hover:scale-100 transition-transform">
                            <button onClick={(e) => { e.stopPropagation(); addBlock('h2', index); }} className="p-2 hover:bg-orange-50 rounded-full text-gray-500 hover:text-orqio-orange transition-colors" title="Nova Seção"><Heading2 size={18} /></button>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <button onClick={(e) => { e.stopPropagation(); addBlock('h3', index); }} className="p-2 hover:bg-indigo-50 rounded-full text-indigo-600" title="Novo Passo"><Heading1 size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); addBlock('text', index); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Texto"><Type size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); addBlock('code', index); }} className="p-2 hover:bg-green-50 rounded-full text-green-600" title="Fala"><MessageSquare size={16} /></button>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <button onClick={(e) => { e.stopPropagation(); addBlock('alert', index); }} className="p-2 hover:bg-red-50 rounded-full text-red-500" title="Aviso"><AlertTriangle size={16} /></button>
                        </div>
                    </div>
                </div>
            ))}

            {blocks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <p className="mb-6 font-medium">Comece seu script</p>
                    <Button onClick={() => addBlock('h1', -1)} variant="primary" className="bg-orqio-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30">
                        <Plus size={20} /> Adicionar Título
                    </Button>
                </div>
            )}
        </div>
    );
};
