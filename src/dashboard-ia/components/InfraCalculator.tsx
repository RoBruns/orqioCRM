import React, { useState, useMemo, useEffect } from 'react';
import { GlassPane } from '../../../components/ui/Glass';
import { Calculator, Cpu, Server, DollarSign, Users, ChevronDown, ChevronUp, RefreshCw, TrendingUp } from 'lucide-react';

interface CalcInputs {
    clientesPorDia: number;
    mensagensPorCliente: number;
    diasPorMes: number;
    tokensPorMensagemInput: number;
    tokensPorMensagemOutput: number;
    precoInputPorMilhao: number;
    precoOutputPorMilhao: number;
    custoVPS: number;
    custoSupabase: number;
    custoWhatsAppAPI: number;
    custoExterno: number;
    numeroDeClientes: number;
}

interface InputFieldProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    prefix?: string;
    suffix?: string;
    step?: number;
    min?: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, prefix, suffix, step = 1, min = 0 }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-2 bg-white/60 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {prefix && <span className="text-xs text-gray-400 font-medium shrink-0">{prefix}</span>}
            <input
                type="number"
                value={value}
                min={min}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-transparent text-sm font-semibold text-gray-800 outline-none min-w-0"
            />
            {suffix && <span className="text-xs text-gray-400 font-medium shrink-0">{suffix}</span>}
        </div>
    </div>
);

interface ResultCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    highlight?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, label, value, sublabel, highlight }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${highlight
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-300/30'
        : 'bg-white/70 border-gray-200'
        }`}>
        <div className={`p-2.5 rounded-xl ${highlight ? 'bg-indigo-500/40' : 'bg-indigo-50'}`}>
            <span className={highlight ? 'text-white' : 'text-indigo-600'}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-2xl font-bold leading-tight ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</p>
            {sublabel && <p className={`text-xs mt-0.5 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{sublabel}</p>}
        </div>
    </div>
);

const fmt = (val: number, prefix = 'R$') =>
    `${prefix} ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const InfraCalculator: React.FC = () => {
    const [showClientes, setShowClientes] = useState(false);
    const [usdRate, setUsdRate] = useState<number | null>(null);
    const [rateLoading, setRateLoading] = useState(true);
    const [rateError, setRateError] = useState(false);

    const fetchRate = async () => {
        setRateLoading(true);
        setRateError(false);
        try {
            const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
            const data = await res.json();
            setUsdRate(parseFloat(data.USDBRL.bid));
        } catch {
            setRateError(true);
        } finally {
            setRateLoading(false);
        }
    };

    useEffect(() => { fetchRate(); }, []);

    const [inputs, setInputs] = useState<CalcInputs>({
        clientesPorDia: 10,
        mensagensPorCliente: 10,
        diasPorMes: 30,
        tokensPorMensagemInput: 500,
        tokensPorMensagemOutput: 300,
        precoInputPorMilhao: 0.15,
        precoOutputPorMilhao: 0.60,
        custoVPS: 150,
        custoSupabase: 0,
        custoWhatsAppAPI: 200,
        custoExterno: 0,
        numeroDeClientes: 1,
    });

    const set = (key: keyof CalcInputs) => (val: number) =>
        setInputs((prev) => ({ ...prev, [key]: val }));

    const results = useMemo(() => {
        const mensagensPorDia = inputs.clientesPorDia * inputs.mensagensPorCliente;
        const mensagensPorMes = mensagensPorDia * inputs.diasPorMes;
        const tokensInputMes = mensagensPorMes * inputs.tokensPorMensagemInput;
        const tokensOutputMes = mensagensPorMes * inputs.tokensPorMensagemOutput;

        const custoInput = (tokensInputMes / 1_000_000) * inputs.precoInputPorMilhao;
        const custoOutput = (tokensOutputMes / 1_000_000) * inputs.precoOutputPorMilhao;
        const custoLLM = custoInput + custoOutput;

        const custoInfraFixa =
            inputs.custoVPS + inputs.custoSupabase + inputs.custoWhatsAppAPI + inputs.custoExterno;

        const rate = usdRate ?? 5.5; // fallback enquanto carrega
        const custoLLMBRL = custoLLM * rate;
        const custoTotal = custoLLMBRL + custoInfraFixa;

        const numClientes = Math.max(inputs.numeroDeClientes, 1);
        const custoInfraPorCliente = custoInfraFixa / numClientes;
        const custoPorCliente = custoInfraPorCliente + custoLLMBRL;

        return {
            mensagensPorDia,
            mensagensPorMes,
            custoLLM,
            custoLLMBRL,
            custoInfraFixa,
            custoTotal,
            custoPorCliente,
        };
    }, [inputs, usdRate]);

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar p-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                        <Calculator size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Calculadora de Custo de Infra</h1>
                        <p className="text-xs text-gray-500">Automação WhatsApp com IA — estimativa mensal</p>
                    </div>
                </div>

                {/* Badge cotação USD-BRL */}
                <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-xl px-3 py-2">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-xs text-gray-500 font-medium">USD/BRL</span>
                    {rateLoading ? (
                        <span className="text-xs text-gray-400 animate-pulse">Buscando...</span>
                    ) : rateError ? (
                        <span className="text-xs text-red-400">Erro</span>
                    ) : (
                        <span className="text-sm font-bold text-gray-800">
                            R$ {usdRate?.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
                        </span>
                    )}
                    <button
                        onClick={fetchRate}
                        disabled={rateLoading}
                        className="ml-1 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
                        title="Atualizar cotação"
                    >
                        <RefreshCw size={13} className={rateLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ─── INPUTS ─── */}
                <div className="flex flex-col gap-4">

                    {/* Volume */}
                    <GlassPane className="rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={16} className="text-indigo-500" />
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Volume de Mensagens</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Clientes / dia" value={inputs.clientesPorDia} onChange={set('clientesPorDia')} min={1} />
                            <InputField label="Mensagens / cliente" value={inputs.mensagensPorCliente} onChange={set('mensagensPorCliente')} min={1} />
                            <InputField label="Dias / mês" value={inputs.diasPorMes} onChange={set('diasPorMes')} min={1} />
                            <InputField label="Tokens input / msg" value={inputs.tokensPorMensagemInput} onChange={set('tokensPorMensagemInput')} suffix="tk" />
                            <InputField label="Tokens output / msg" value={inputs.tokensPorMensagemOutput} onChange={set('tokensPorMensagemOutput')} suffix="tk" />
                        </div>
                        <div className="bg-indigo-50 rounded-xl px-4 py-2 text-xs text-indigo-700 font-medium flex flex-wrap gap-x-4 gap-y-1">
                            <span>� <strong>{inputs.clientesPorDia}</strong> clientes × <strong>{inputs.mensagensPorCliente}</strong> msgs = <strong>{results.mensagensPorDia.toLocaleString('pt-BR')} msgs/dia</strong></span>
                            <span>📨 <strong>{results.mensagensPorMes.toLocaleString('pt-BR')} mensagens/mês</strong></span>
                        </div>
                    </GlassPane>

                    {/* LLM Pricing */}
                    <GlassPane className="rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={16} className="text-indigo-500" />
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Preço do Modelo (LLM)</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Input / 1M tokens" prefix="$" value={inputs.precoInputPorMilhao} onChange={set('precoInputPorMilhao')} step={0.01} />
                            <InputField label="Output / 1M tokens" prefix="$" value={inputs.precoOutputPorMilhao} onChange={set('precoOutputPorMilhao')} step={0.01} />
                        </div>
                    </GlassPane>

                    {/* Infra Fixa */}
                    <GlassPane className="rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Server size={16} className="text-indigo-500" />
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Infraestrutura Fixa</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="VPS / Servidor" prefix="R$" value={inputs.custoVPS} onChange={set('custoVPS')} />
                            <InputField label="Supabase" prefix="R$" value={inputs.custoSupabase} onChange={set('custoSupabase')} />
                            <InputField label="WhatsApp API" prefix="R$" value={inputs.custoWhatsAppAPI} onChange={set('custoWhatsAppAPI')} />
                            <InputField label="Outros serviços" prefix="R$" value={inputs.custoExterno} onChange={set('custoExterno')} />
                        </div>
                    </GlassPane>

                    {/* Clientes (opcional) */}
                    <GlassPane className="rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setShowClientes(!showClientes)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/30 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-indigo-500" />
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Custo por Cliente</h2>
                                <span className="text-[10px] bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">Opcional</span>
                            </div>
                            {showClientes ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                        {showClientes && (
                            <div className="px-5 pb-5">
                                <InputField label="Número de clientes" value={inputs.numeroDeClientes} onChange={set('numeroDeClientes')} min={1} />
                            </div>
                        )}
                    </GlassPane>
                </div>

                {/* ─── RESULTS ─── */}
                <div className="flex flex-col gap-4">
                    <GlassPane className="rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-indigo-500" />
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Resultado Mensal</h2>
                        </div>

                        <ResultCard
                            icon={<Cpu size={20} />}
                            label="Custo IA (LLM)"
                            value={fmt(results.custoLLMBRL)}
                            sublabel={`US$ ${results.custoLLM.toLocaleString('pt-BR', { minimumFractionDigits: 4 })} × R$ ${(usdRate ?? 5.5).toFixed(4)}`}
                        />
                        <ResultCard
                            icon={<Server size={20} />}
                            label="Custo Infra Fixa"
                            value={fmt(results.custoInfraFixa)}
                            sublabel="VPS + Supabase + WhatsApp API + Extras"
                        />
                        <ResultCard
                            icon={<DollarSign size={20} />}
                            label="Custo Total Mensal"
                            value={fmt(results.custoTotal)}
                            sublabel={rateLoading ? 'Aguardando cotação...' : undefined}
                            highlight
                        />

                        {showClientes && inputs.numeroDeClientes > 1 && (
                            <ResultCard
                                icon={<Users size={20} />}
                                label={`Custo por Cliente (${inputs.numeroDeClientes} clientes)`}
                                value={fmt(results.custoPorCliente)}
                                sublabel="Infra compartilhada + LLM individual"
                            />
                        )}
                    </GlassPane>

                    {/* Breakdown detalhado */}
                    <GlassPane className="rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Breakdown Detalhado</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'VPS / Servidor', value: fmt(inputs.custoVPS) },
                                { label: 'Supabase', value: fmt(inputs.custoSupabase) },
                                { label: 'WhatsApp API', value: fmt(inputs.custoWhatsAppAPI) },
                                { label: 'Outros serviços', value: fmt(inputs.custoExterno) },
                                { label: 'LLM em BRL (input)', value: fmt(results.custoLLMBRL * (inputs.tokensPorMensagemInput / (inputs.tokensPorMensagemInput + inputs.tokensPorMensagemOutput || 1))) },
                                { label: 'LLM em BRL (output)', value: fmt(results.custoLLMBRL * (inputs.tokensPorMensagemOutput / (inputs.tokensPorMensagemInput + inputs.tokensPorMensagemOutput || 1))) },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500">{row.label}</span>
                                    <span className="font-semibold text-gray-800">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </GlassPane>
                </div>
            </div>
        </div>
    );
};
