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
                    <div key={block.id} className="mb-8 border-b border-gray-200 pb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{block.content}</h1>
                    </div>
                );

            case 'h2':
                return (
                    <div key={block.id} className="mt-12 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <h2 className="text-xl font-bold text-orqio-orange px-4 py-1 bg-orange-50 rounded-full border border-orange-100">
                                {block.content}
                            </h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                    </div>
                );

            case 'h3':
                return (
                    <div key={block.id} className="mt-6 mb-3 flex items-center gap-2">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800">{block.content}</h3>
                    </div>
                );

            case 'code':
                return (
                    <div key={block.id} className="my-4 relative group">
                        <div className="absolute -left-3 top-4 bottom-4 w-1 bg-gradient-to-b from-orqio-orange to-pink-500 rounded-full opacity-50"></div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigator.clipboard.writeText(block.content)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg"
                                    title="Copiar resposta"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="font-medium text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-sans">
                                "{block.content}"
                            </div>
                        </div>
                    </div>
                );

            case 'alert':
            case 'blockquote':
                let icon = <Info size={20} />;
                let styles = "bg-blue-50 border-blue-200 text-blue-800";

                if (block.content.toLowerCase().includes('não') || block.content.includes('❌') || block.content.includes('⚠️')) {
                    icon = <AlertTriangle size={20} />;
                    styles = "bg-red-50 border-red-200 text-red-800";
                } else if (block.content.includes('✅') || block.content.toLowerCase().includes('dica')) {
                    icon = <CheckCircle size={20} />;
                    styles = "bg-green-50 border-green-200 text-green-800";
                }

                return (
                    <div key={block.id} className={`my-4 p-4 rounded-xl border flex items-start gap-3 ${styles}`}>
                        <div className="shrink-0 mt-0.5">{icon}</div>
                        <div className="text-sm font-medium leading-relaxed">
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                    </div>
                );

            default:
                // Text blocks, handle markdown rendering
                return (
                    <div key={block.id} className="my-2 text-gray-600 leading-relaxed prose prose-sm max-w-none">
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
