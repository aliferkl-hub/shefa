import React, { useState } from 'react';
import { PlanDefinition, Subscription, User, PixCharge, Order } from '../../types/index.ts';
import { PixCheckoutModal } from './PixCheckoutModal.tsx';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface SubscriptionEngineViewProps {
  plans: PlanDefinition[];
  subscriptions: Subscription[];
  currentUser: User | null;
  onRefreshData: () => void;
}

export const SubscriptionEngineView: React.FC<SubscriptionEngineViewProps> = ({
  plans,
  subscriptions,
  currentUser,
  onRefreshData
}) => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDefinition | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const isMaster = currentUser?.role === 'MASTER_OWNER';
  const mySubscription = subscriptions.find(s => s.companyId === currentUser?.companyId) || subscriptions[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 glass-obsidian-gold rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
              SHEFA AYIN · Autonomous Business & Subscription Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-light">
            Planos corporativos de inteligência autônoma 24/7 com recebimento direto via Pix na chave celular oficial do Master Owner: <strong>11973479473</strong>.
          </p>
        </div>

        {/* Cycle Toggle */}
        <div className="p-1 glass-obsidian rounded-xl border border-purple-900/40 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-purple-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'annual' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Anual (Econômico)</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-amber-200">15% OFF</span>
          </button>
        </div>
      </div>

      {/* 3 Tier Commercial Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isFeatured = plan.tier === 'Cosmic Growth';
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl flex flex-col justify-between transition-all relative ${
                isFeatured
                  ? 'glass-obsidian-gold border-2 border-amber-400/50 shadow-2xl shadow-amber-950/30 glow-gold scale-[1.02]'
                  : 'glass-obsidian border border-purple-900/30 hover:border-purple-500/40'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
                  Recomendado para Empresas
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono-numbers text-amber-400/90 uppercase tracking-widest block">
                    {plan.tier}
                  </span>
                  <h3 className="text-lg font-cinzel font-bold text-white mt-0.5">{plan.name}</h3>
                  <p className="text-xs text-slate-300 mt-2 font-light leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-3 border-y border-purple-900/20 font-mono-numbers">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price)}
                    </span>
                    <span className="text-xs text-slate-400">/{billingCycle === 'annual' ? 'ano' : 'mês'}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">
                    {plan.trialDays} dias de garantia / trial
                  </span>
                </div>

                {/* Limits Matrix */}
                <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs font-mono-numbers bg-[#050508]/60 p-2.5 rounded-xl border border-purple-900/20">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Missões</span>
                    <span className="font-semibold text-white">{plan.limits.monthlyMissions}/mês</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Agentes</span>
                    <span className="font-semibold text-amber-400">{plan.limits.maxAgents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Docs Base</span>
                    <span className="font-semibold text-purple-300">{plan.limits.maxKnowledgeDocs}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 text-xs text-slate-300 font-light">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="pt-6 mt-4 border-t border-purple-900/20">
                <button
                  onClick={() => setSelectedPlanForCheckout(plan)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                    isFeatured
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                      : 'bg-purple-700 hover:bg-purple-600 text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Contratar via Pix (Chave Oficial)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscriptions Ledger Table */}
      <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Assinaturas Corporativas Vigentes
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">
            {subscriptions.length} Assinaturas Registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-purple-900/30">
              <tr>
                <th className="py-2.5 px-3">Empresa / Contratante</th>
                <th className="py-2.5 px-3">Plano Contratado</th>
                <th className="py-2.5 px-3">Ciclo</th>
                <th className="py-2.5 px-3">Vencimento</th>
                <th className="py-2.5 px-3">Situação</th>
                <th className="py-2.5 px-3 text-right">Valor Pago (Pix)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-purple-950/20 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{sub.companyName}</span>
                    <span className="text-[11px] text-slate-400">{sub.customerEmail}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-amber-300">{sub.planTier}</td>
                  <td className="py-3 px-3 text-slate-300 uppercase text-[10px]">
                    {sub.billingCycle === 'annual' ? 'Anual' : 'Mensal'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono-numbers">
                    {new Date(sub.expiresAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers ${
                      sub.status === 'ACTIVE' 
                        ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/20' 
                        : sub.status === 'PENDING_PAYMENT'
                        ? 'text-amber-300 bg-amber-950/40 border border-amber-500/20'
                        : 'text-rose-300 bg-rose-950/40 border border-rose-500/20'
                    }`}>
                      {sub.status === 'ACTIVE' ? 'Ativa' : sub.status === 'PENDING_PAYMENT' ? 'Aguardando Pix' : sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers text-white font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sub.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pix Checkout Modal */}
      {selectedPlanForCheckout && (
        <PixCheckoutModal
          plan={selectedPlanForCheckout}
          currentUser={currentUser}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={() => {
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};
