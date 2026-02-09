import React, { useState, useEffect } from 'react';
import { ScriptBlock, ScriptBlockType } from '../../types/ScriptTypes';
import { parseMarkdownToBlocks, blocksToMarkdown } from '../../utils/scriptParser';
import { Button } from '../ui/Glass';
import { Trash2, ArrowUp, ArrowDown, Plus, Type, Heading1, Heading2, MessageSquare, Quote, AlertTriangle } from 'lucide-react';

interface ScriptVisualEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
}

export const ScriptVisualEditor: React.FC<ScriptVisualEditorProps> = ({ initialContent, onChange }) => {
    const [blocks, setBlocks] = useState<ScriptBlock[]>([]);

    useEffect(() => {
        setBlocks(parseMarkdownToBlocks(initialContent));
    }, [initialContent]);

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
        // Insert after current index
        newBlocks.splice(index + 1, 0, newBlock);

        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
    };

    return (
        <div className="max-w-4xl mx-auto pb-40">
            {blocks.map((block, index) => (
                <div key={block.id} className="group relative mb-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-orqio-orange/50 transition-colors">
                    {/* Type Indicator */}
                    <div className="absolute -left-3 top-4 bg-gray-100 text-gray-500 p-1.5 rounded-lg text-xs font-mono shadow-sm border border-gray-200 z-10">
                        {block.type}
                    </div>

                    {/* Controls */}
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <ArrowUp size={14} />
                        </button>
                        <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <ArrowDown size={14} />
                        </button>
                        <button onClick={() => deleteBlock(block.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 ml-2">
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Editor Input */}
                    <div className="pl-6">
                        {block.type === 'h1' && (
                            <input
                                className="w-full text-2xl font-bold border-none focus:outline-none placeholder-gray-300"
                                placeholder="Título Principal"
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                        )}
                        {block.type === 'h2' && (
                            <input
                                className="w-full text-xl font-bold text-orqio-orange border-none focus:outline-none placeholder-gray-300"
                                placeholder="Nome da Seção"
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                        )}
                        {block.type === 'h3' && (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                                <input
                                    className="w-full text-lg font-semibold text-gray-800 border-none focus:outline-none placeholder-gray-300"
                                    placeholder="Título do Passo"
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                />
                            </div>
                        )}
                        {(block.type === 'text' || block.type === 'blockquote' || block.type === 'alert') && (
                            <textarea
                                className="w-full min-h-[60px] resize-none border-none focus:outline-none text-gray-600 bg-transparent"
                                placeholder={block.type === 'alert' ? "Aviso..." : "Instruções..."}
                                value={block.content}
                                onChange={(e) => {
                                    updateBlock(block.id, e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                        )}
                        {block.type === 'code' && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-400 mb-1 font-semibold uppercase">O que falar:</p>
                                <textarea
                                    className="w-full min-h-[80px] resize-none border-none focus:outline-none text-gray-800 bg-transparent font-sans text-lg leading-relaxed"
                                    placeholder="Fala do script..."
                                    value={block.content}
                                    onChange={(e) => {
                                        updateBlock(block.id, e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Add Button Below */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <div className="flex items-center gap-1 bg-white shadow-lg border border-gray-100 rounded-full p-1 scale-90 hover:scale-100 transition-transform">
                            <button onClick={() => addBlock('h2', index)} className="p-1.5 hover:bg-gray-50 rounded-full text-orqio-orange" title="Nova Seção"><Heading2 size={16} /></button>
                            <button onClick={() => addBlock('h3', index)} className="p-1.5 hover:bg-gray-50 rounded-full text-indigo-600" title="Novo Passo"><Heading1 size={14} /></button>
                            <button onClick={() => addBlock('code', index)} className="p-1.5 hover:bg-gray-50 rounded-full text-green-600" title="Fala/Resposta"><MessageSquare size={16} /></button>
                            <button onClick={() => addBlock('text', index)} className="p-1.5 hover:bg-gray-50 rounded-full text-gray-600" title="Texto"><Type size={16} /></button>
                            <button onClick={() => addBlock('alert', index)} className="p-1.5 hover:bg-gray-50 rounded-full text-red-500" title="Aviso"><AlertTriangle size={16} /></button>
                        </div>
                    </div>
                </div>
            ))}

            {blocks.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>Script vazio.</p>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => addBlock('h1', -1)} variant="secondary">Adicionar Título</Button>
                    </div>
                </div>
            )}

            <div className="h-20"></div>
        </div>
    );
};
