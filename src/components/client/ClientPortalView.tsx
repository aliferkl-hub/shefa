import React, { useState } from 'react';
import { Company, User, Lead, KnowledgeDoc } from '../../types/index.ts';
import { Bot, Send, ShieldCheck, Building2, BookOpen, Users, Sliders, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.ts';

interface ClientPortalViewProps {
  companies: Company[];
  currentUser: User | null;
  currentCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  leads: Lead[];
  knowledge: KnowledgeDoc[];
  onRefreshData: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  companies,
  currentUser,
  currentCompany,
  onSelectCompany,
  leads,
  knowledge,
  onRefreshData
}) => {
  const activeCompany = currentCompany || companies[0];
  const isMaster = currentUser?.role === 'MASTER_OWNER';

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: activeCompany?.aiPersona.welcomeMessage || 'Olá! Sou o assistente de inteligência autônoma da sua empresa.'
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Persona edit states
  const [assistantName, setAssistantName] = useState(activeCompany?.aiPersona.assistantName || '');
  const [assistantTone, setAssistantTone] = useState(activeCompany?.aiPersona.tone || '');
  const [assistantInstructions, setAssistantInstructions] = useState(activeCompany?.aiPersona.instructions || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending || !activeCompany) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const res = await api.clientAssistantChat(userMsg, activeCompany.id, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', text: res.reply }]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev, 
        { role: 'model', text: 'Desculpe, ocorreu uma instabilidade momentânea na resposta do assistente.' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setIsSavingSettings(true);
    setSettingsSaved(false);

    try {
      await api.updateCompany(activeCompany.id, {
        aiPersona: {
          assistantName,
          tone: assistantTone,
          welcomeMessage: activeCompany.aiPersona.welcomeMessage,
          instructions: assistantInstructions
        }
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="p-12 text-center text-slate-400">
        Nenhuma empresa vinculada ao usuário.
      </div>
    );
  }

  // Filtered by company
  const companyLeads = leads.filter(l => l.companyId === activeCompany.id);
  const companyDocs = knowledge.filter(k => k.companyId === activeCompany.id);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Company Switcher (if Master Owner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-obsidian rounded-2xl border border-purple-900/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl glass-obsidian-gold border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                {activeCompany.name}
              </h2>
              <span className="text-xs text-amber-300 font-mono-numbers px-2 py-0.5 rounded glass-obsidian border border-amber-500/20">
                {activeCompany.plan}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              CNPJ: {activeCompany.cnpjOrTaxId} · Ambiente com isolamento hermético por companyId
            </p>
          </div>
        </div>

        {/* Master Owner Company Selector */}
        {isMaster && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Alternar Tenant:</span>
            <select
              value={activeCompany.id}
              onChange={(e) => {
                const found = companies.find(c => c.id === e.target.value);
                if (found) {
                  onSelectCompany(found);
                  setChatHistory([{ role: 'model', text: found.aiPersona.welcomeMessage }]);
                  setAssistantName(found.aiPersona.assistantName);
                  setAssistantTone(found.aiPersona.tone);
                  setAssistantInstructions(found.aiPersona.instructions);
                }
              }}
              className="bg-[#07070d] text-xs text-slate-200 border border-purple-900/40 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.tradeName} ({c.name})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quotas & Capacity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Missões Utilizadas</span>
          <div className="text-xl font-bold font-mono-numbers text-white">
            {activeCompany.quotas.usedMissions} / {activeCompany.quotas.monthlyMissions}
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: `${(activeCompany.quotas.usedMissions / activeCompany.quotas.monthlyMissions) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Capacidade de Agentes</span>
          <div className="text-xl font-bold font-mono-numbers text-amber-400">
            {activeCompany.quotas.maxAgents} Agentes
          </div>
          <span className="text-[11px] text-slate-500">Operações Concorrentes</span>
        </div>

        <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Docs de Conhecimento</span>
          <div className="text-xl font-bold font-mono-numbers text-purple-300">
            {companyDocs.length} / {activeCompany.quotas.maxKnowledgeDocs}
          </div>
          <span className="text-[11px] text-slate-500">Documentos indexados</span>
        </div>

        <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Leads Ativos</span>
          <div className="text-xl font-bold font-mono-numbers text-emerald-400">
            {companyLeads.length} Registros
          </div>
          <span className="text-[11px] text-slate-500">Isolados nesta empresa</span>
        </div>
      </div>

      {/* Main Grid: Dedicated AI Assistant + Company Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dedicated Company Assistant Chat (2 cols) */}
        <div className="lg:col-span-2 p-6 glass-obsidian rounded-2xl border border-purple-900/30 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-4 border-b border-purple-900/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {activeCompany.aiPersona.assistantName}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Assistente Exclusivo da {activeCompany.tradeName}
                </span>
              </div>
            </div>

            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono-numbers">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Base Própria Carregada
            </span>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-purple-700 text-white rounded-br-none'
                      : 'bg-[#07070d]/90 text-slate-200 border border-purple-900/30 rounded-bl-none font-light'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-[#07070d]/90 text-purple-300 text-xs p-3 rounded-xl border border-purple-900/30 animate-pulse">
                  {activeCompany.aiPersona.assistantName} está consultando a base de dados da empresa...
                </div>
              </div>
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={`Pergunte ao ${activeCompany.aiPersona.assistantName} sobre políticas, processos ou clientes da ${activeCompany.tradeName}...`}
              className="flex-1 bg-[#07070d] text-xs text-slate-200 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-purple-900/40 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isSending || !chatMessage.trim()}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>

        {/* Company AI Persona & Custom Instructions (1 col) */}
        <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-purple-900/20">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Diretrizes & Personalidade da IA
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Nome do Assistente
              </label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                className="w-full bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Tom de Voz
              </label>
              <input
                type="text"
                value={assistantTone}
                onChange={(e) => setAssistantTone(e.target.value)}
                className="w-full bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Instruções & Regras de Atendimento
              </label>
              <textarea
                value={assistantInstructions}
                onChange={(e) => setAssistantInstructions(e.target.value)}
                rows={4}
                className="w-full bg-[#050508] border border-purple-900/40 text-xs p-3 rounded-lg text-slate-200 resize-none font-light leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSavingSettings ? 'Salvando...' : 'Salvar Diretrizes'}</span>
            </button>

            {settingsSaved && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Diretrizes atualizadas no servidor!</span>
              </div>
            )}
          </form>

          {/* Isolated Knowledge List for Company */}
          <div className="pt-4 border-t border-purple-900/20 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Base de Documentos da Empresa ({companyDocs.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {companyDocs.map(doc => (
                <div key={doc.id} className="p-2 bg-[#050508] rounded border border-purple-900/20 text-xs">
                  <span className="font-medium text-slate-200 block truncate">{doc.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono-numbers">
                    Atualizado em {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
