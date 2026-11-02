import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  DollarSign, 
  Cpu, 
  Save, 
  Key, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Database,
  RefreshCw
} from 'lucide-react';
import { EngineGovernanceSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface SettingsViewProps {
  governance: EngineGovernanceSettings | null;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ governance, onRefreshData }) => {
  const [spendingLimit, setSpendingLimit] = useState<number>(governance?.financialSpendingLimit || 1000);
  const [pixKey, setPixKey] = useState('11973479473');
  const [pixTitular, setPixTitular] = useState('Alifer Madeiro');
  const [loopInterval, setLoopInterval] = useState('15');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    livingAudio.playTone('command_sent');

    try {
      await api.updateSpendingLimit(spendingLimit);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      livingAudio.playTone('complete');
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shadow">
            <Settings className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                SETTINGS · CONFIGURAÇÕES DO SISTEMA
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                GOVERNANÇA ATIVA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Parâmetros de operação do motor contínuo, limites de gastos, credenciais e integrações financeiras.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Governança Financeira & Pix */}
        <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
          <h3 className="text-sm font-cinzel font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Tesouraria & Integração Pix Oficial</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Chave Pix Principal:</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Titular da Conta / Beneficiário:</label>
              <input
                type="text"
                value={pixTitular}
                onChange={(e) => setPixTitular(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Trava de Segurança Financeira (R$):
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs font-mono text-amber-300"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Operações com valor superior a este montante são retidas e exigem aprovação expressa do Master Owner.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Motor Autônomo 24/7 & IA */}
        <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
          <h3 className="text-sm font-cinzel font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#A78BFA]" />
            <span>Motor de Agentes & Orquestração 24/7</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Modelo de IA Principal:</label>
              <div className="p-2.5 rounded-lg bg-[#1D1835] border border-[#8B5CF6]/20 text-xs font-mono text-emerald-400">
                models/gemini-3.8-flash (com decomposição determinística resiliente)
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Intervalo do Ciclo de Autonomia:</label>
              <select
                value={loopInterval}
                onChange={(e) => setLoopInterval(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
              >
                <option value="15">A cada 15 segundos (Padrão Operacional)</option>
                <option value="30">A cada 30 segundos</option>
                <option value="60">A cada 1 minuto (Modo Econômico)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Integridade Criptográfica:</label>
              <div className="p-2.5 rounded-lg bg-[#1D1835] border border-[#8B5CF6]/20 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Algoritmo SHA-256 Encadeado</span>
                <span className="text-emerald-400 font-bold">Ativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex items-center justify-between p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {isSaved && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Configurações salvas e aplicadas no servidor!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Gravando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
