import React, { useState } from 'react';
import { GlassPane, Button, Input } from '../../../components/ui/Glass';
import { KnowledgeBaseService } from '../services';
import { Upload, FileText, Check, AlertCircle, X } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await KnowledgeBaseService.uploadFile(file);
            setStatus('success');
            setFile(null);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <GlassPane className="p-6 rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Base de Conhecimento</h2>
                    <p className="text-sm text-gray-500">Treine seu agente com novos documentos</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
                {!file ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="text-gray-400 mb-3" size={32} />
                        <p className="text-gray-600 font-medium">Clique para selecionar um arquivo</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT até 10MB</p>
                    </div>
                ) : (
                    <div className="border-2 border-solid border-indigo-200 bg-indigo-50/50 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                                <FileText size={24} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <p className="text-gray-800 font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Cancelar seleção"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                        <Check size={16} /> Arquivo enviado com sucesso para o agente!
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle size={16} /> Erro ao enviar arquivo.
                    </div>
                )}

                <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full mt-auto"
                >
                    {uploading ? 'Enviando...' : 'Enviar para o Agente'}
                </Button>
            </div>
        </GlassPane>
    );
};
