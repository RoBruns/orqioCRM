import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, MessageSquare, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
// Correct import path assuming the file structure
import { parseMarkdownToBlocks } from '../../utils/scriptParser'; // Adjust path as needed
import { ScriptBlock } from '../../types/ScriptTypes';

interface ScriptStepViewerProps {
    content: string;
}

export const ScriptStepViewer: React.FC<ScriptStepViewerProps> = ({ content }) => {
    const blocks = useMemo(() => parseMarkdownToBlocks(content), [content]);

    // render helper
    const renderBlock = (block: ScriptBlock) => {
        switch (block.type) {
            case 'h1':
                return (
                    <div key={block.id} className="mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{block.content}</h1>
                        <div className="mt-4 w-24 h-1.5 bg-gradient-to-r from-orqio-orange to-pink-500 mx-auto rounded-full opacity-80"></div>
                    </div>
                );

            case 'h2':
                return (
                    <div key={block.id} className="mt-16 mb-8 relative">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <div className="relative flex justify-center">
                            <h2 className="text-lg font-bold text-gray-700 uppercase tracking-widest px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                                {block.content}
                            </h2>
                        </div>
                    </div>
                );

            case 'h3':
                return (
                    <div key={block.id} className="mt-8 mb-4 flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"></div>
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">{block.content}</h3>
                    </div>
                );

            case 'code':
                return (
                    <div key={block.id} className="my-6 relative group pl-4">
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-orqio-orange to-pink-500 rounded-full shadow-sm"></div>
                        <div className="bg-gradient-to-r from-orange-50/50 to-white border border-orange-100/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <p className="text-[10px] items-center gap-1 font-bold text-orqio-orange uppercase tracking-wider mb-2 flex opacity-60">
                                <MessageSquare size={12} /> Sugestão de Fala
                            </p>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigator.clipboard.writeText(block.content)}
                                    className="p-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-orqio-orange rounded-xl shadow-sm border border-gray-100 transition-colors"
                                    title="Copiar resposta"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="font-medium text-gray-800 text-xl leading-relaxed whitespace-pre-wrap font-sans">
                                "{block.content}"
                            </div>
                        </div>
                    </div>
                );

            case 'alert':
            case 'blockquote':
                let icon = <Info size={20} />;
                let styles = "bg-blue-50 border-blue-100 text-blue-800";

                if (block.content.toLowerCase().includes('não') || block.content.includes('❌') || block.content.includes('⚠️')) {
                    icon = <AlertTriangle size={20} />;
                    styles = "bg-red-50/80 border-red-100 text-red-900";
                } else if (block.content.includes('✅') || block.content.toLowerCase().includes('dica')) {
                    icon = <CheckCircle size={20} />;
                    styles = "bg-emerald-50/80 border-emerald-100 text-emerald-900";
                }

                return (
                    <div key={block.id} className={`my-6 p-5 rounded-2xl border flex items-start gap-4 ${styles}`}>
                        <div className="shrink-0 mt-0.5 p-1 bg-white/50 rounded-full">{icon}</div>
                        <div className="text-base font-medium leading-relaxed opacity-90">
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                    </div>
                );

            default:
                // Text blocks
                return (
                    <div key={block.id} className="my-4 text-gray-600 text-lg leading-relaxed prose prose-gray max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {blocks.map(renderBlock)}
        </div>
    );
};
