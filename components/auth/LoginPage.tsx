
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassPane } from '../ui/Glass';
import { Loader2 } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu e-mail para confirmar (ou entre direto se o auto-confirm estiver ativo).');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-orqio-bg relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orqio-orange/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[100px]" />
            </div>

            <GlassPane className="p-8 w-full max-w-md rounded-3xl shadow-2xl z-10 mx-4">
                <div className="text-center mb-8">
                    <div className="bg-orqio-orange w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-bold text-2xl mx-auto mb-4">
                        O
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao CRM Orqio</h1>
                    <p className="text-sm text-gray-500 mt-2">Faça login para gerenciar seus leads</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 transition-all"
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 transition-all"
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orqio-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-500 hover:text-orqio-orange font-medium transition-colors"
                    >
                        {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </GlassPane>
        </div>
    );
};
