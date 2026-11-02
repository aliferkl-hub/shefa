import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Plus, 
  Download,
  AlertCircle
} from 'lucide-react';
import { FinancialRecord, SystemStats } from '../../types/index.ts';
import { livingAudio } from '../../services/livingAudio.ts';
import { api } from '../../services/api.ts';

interface FinanceViewProps {
  finances: FinancialRecord[];
  stats: SystemStats | null;
  onRefreshData: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ finances, stats, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pix' | 'costs'>('overview');
  const [pixAmount, setPixAmount] = useState<number>(1497);
  const [pixCustomer, setPixCustomer] = useState('');
  const [generatedPix, setGeneratedPix] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate Real Pix Charge
  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || pixAmount <= 0) return;

    setIsGenerating(true);
    livingAudio.playTone('command_sent');

    try {
      const charge = await api.createPixCharge({
        amount: Number(pixAmount),
        customerName: pixCustomer || 'Cliente Corporativo',
        customerEmail: 'cliente@corporativo.com',
        customerCpfOrCnpj: '00.000.000/0001-00',
        planTier: 'Infinity Enterprise'
      });
      setGeneratedPix(charge);
      livingAudio.playTone('complete');
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPixCode = () => {
    if (generatedPix?.copyPasteCode) {
      navigator.clipboard.writeText(generatedPix.copyPasteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      livingAudio.playTone('click');
    }
  };

  const grossRevenue = stats?.grossRevenue || finances.filter(f => f.type === 'receita' || f.type === 'assinatura').reduce((acc, f) => acc + f.amount, 0);
  const totalCosts = stats?.totalCosts || finances.filter(f => f.type === 'custo').reduce((acc, f) => acc + f.amount, 0);
  const netResult = grossRevenue - totalCosts;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-amber-400 shadow">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                FINANCE · TESOURARIA, RECEITAS & PIX
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                LIQUIDAÇÃO OFICIAL VALIDADA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Chave Pix: <strong className="text-white font-mono">11973479473</strong> (Titular: Alifer Madeiro) · Conciliação bancária e fluxo de caixa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pix')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <QrCode className="w-4 h-4" />
            <span>Emitir Pix Oficial</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#17142B] rounded-2xl border border-emerald-500/30 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Receita Efetivamente Liquidada</span>
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(grossRevenue)}
          </div>
          <span className="text-[11px] text-slate-400">Recebido via Pix e contratos B2B</span>
        </div>

        <div className="p-5 bg-[#17142B] rounded-2xl border border-rose-500/30 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Custos Totais de Infraestrutura</span>
          </span>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalCosts)}
          </div>
          <span className="text-[11px] text-slate-400">Servidores, APIs e custos operacionais</span>
        </div>

        <div className="p-5 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/40 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Margem Líquida Soberana</span>
          </span>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(netResult)}
          </div>
          <span className="text-[11px] text-[#A78BFA]">Resultado operacional retido</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#8B5CF6]/20 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#1D1835] text-white border border-[#8B5CF6]/50' : 'text-slate-400 hover:text-white'
          }`}
        >
          Extrato Financeiro
        </button>
        <button
          onClick={() => setActiveTab('pix')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'pix' ? 'bg-[#1D1835] text-white border border-[#8B5CF6]/50' : 'text-slate-400 hover:text-white'
          }`}
        >
          Emissor Pix Dinâmico
        </button>
      </div>

      {/* TAB 1: EXTRATO */}
      {activeTab === 'overview' && (
        <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/20 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-[#8B5CF6]/20 pb-2">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição / Operação</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Empresa / Origem</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B5CF6]/10">
              {finances.map((rec) => {
                const isPositive = rec.type === 'receita' || rec.type === 'assinatura';
                return (
                  <tr key={rec.id} className="hover:bg-[#1D1835]/50 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{new Date(rec.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 font-semibold text-white">{rec.title}</td>
                    <td className="p-3 text-[#A78BFA] font-mono text-[11px] capitalize">{rec.status}</td>
                    <td className="p-3 text-slate-400">{rec.companyId || 'SHEFA AYIN'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        isPositive ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {rec.type}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(rec.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PIX GENERATOR */}
      {activeTab === 'pix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 shadow-xl space-y-4">
            <h3 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              <span>Gerador de Cobrança Pix Imediata</span>
            </h3>
            <p className="text-xs text-slate-300 font-light">
              Gera QR Code compatível com Banco Central vinculado diretamente à chave oficial do titular Alifer Madeiro.
            </p>

            <form onSubmit={handleGeneratePix} className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cliente / Razão Social:</label>
                <input
                  type="text"
                  placeholder="Ex: Vértice Tech Global"
                  value={pixCustomer}
                  onChange={(e) => setPixCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor do Pix (R$):</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>{isGenerating ? 'Gerando Código...' : 'Emitir Cobrança Pix Oficial'}</span>
              </button>
            </form>
          </div>

          {generatedPix ? (
            <div className="p-6 bg-[#17142B] rounded-2xl border border-amber-500/40 shadow-xl space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>QR Code Gerado e Registrado</span>
              </div>

              {generatedPix.qrCodeSvg && (
                <div 
                  className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-xl"
                  dangerouslySetInnerHTML={{ __html: generatedPix.qrCodeSvg }}
                />
              )}

              <div className="space-y-1">
                <div className="text-lg font-bold font-mono text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(generatedPix.amount)}
                </div>
                <div className="text-xs text-slate-400">
                  Titular: {generatedPix.recipientName} · Chave: {generatedPix.pixKey}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={copyPixCode}
                  className="w-full py-2.5 bg-[#1D1835] hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-xs font-semibold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>{copiedCode ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix Copia-e-Cola'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/20 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
              <QrCode className="w-12 h-12 text-[#8B5CF6]/40" />
              <span className="text-xs">Preencha o valor e cliente para gerar a ordem Pix</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
