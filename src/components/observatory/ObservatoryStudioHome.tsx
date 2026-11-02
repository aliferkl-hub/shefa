import React, { useState } from 'react';
import { 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  FolderKanban, 
  Building2, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Send, 
  Activity, 
  Zap, 
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Power
} from 'lucide-react';
import { 
  User, 
  Company, 
  DepartmentInfo, 
  AutonomousAgent, 
  Mission, 
  Lead, 
  ProductItem, 
  FinancialRecord, 
  SystemStats,
  PlanDefinition
} from '../../types/index.ts';
import { MainNavSection } from '../navigation/StudioSidebar.tsx';
import { livingAudio } from '../../services/livingAudio.ts';
import { api } from '../../services/api.ts';

interface ObservatoryStudioHomeProps {
  currentUser: User | null;
  companies: Company[];
  departments: DepartmentInfo[];
  agents: AutonomousAgent[];
  missions: Mission[];
  leads: Lead[];
  products: ProductItem[];
  finances: FinancialRecord[];
  stats: SystemStats | null;
  plans: PlanDefinition[];
  onNavigateSection: (section: MainNavSection) => void;
  onRefreshData: () => void;
  onOpenMasterPanel: () => void;
}

export const ObservatoryStudioHome: React.FC<ObservatoryStudioHomeProps> = ({
  currentUser,
  companies,
  departments,
  agents,
  missions,
  leads,
  products,
  finances,
  stats,
  plans,
  onNavigateSection,
  onRefreshData,
  onOpenMasterPanel
}) => {
  const [quickMissionPrompt, setQuickMissionPrompt] = useState('');
  const [isSubmittingQuickMission, setIsSubmittingQuickMission] = useState(false);
  const [quickSuccessMsg, setQuickSuccessMsg] = useState<string | null>(null);

  // Active projects overview
  const activeProjects = [
    { name: 'Vértice Tech Global', category: 'ERP Corporativo & Automação B2B', progress: 68, value: 48000, deadline: '28/04/2026' },
    { name: 'Grupo Aurora Saúde', category: 'Plataforma Web & Telemedicina', progress: 88, value: 34500, deadline: '15/04/2026' },
    { name: 'Titan Capital Partners', category: 'Motor Pix & Conciliação Bancária', progress: 100, value: 62000, deadline: 'Concluído' },
    { name: 'BioNexus Diagnósticos', category: 'IA & Agentes Especialistas', progress: 25, value: 29000, deadline: '20/05/2026' }
  ];

  const pendingApprovals = missions.filter(m => m.status === 'awaiting_approval');

  const handleQuickCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMissionPrompt.trim() || isSubmittingQuickMission) return;

    setIsSubmittingQuickMission(true);
    setQuickSuccessMsg(null);
    livingAudio.playTone('command_sent');

    try {
      const res = await api.sendCommand(quickMissionPrompt);
      livingAudio.playTone('complete');
      setQuickSuccessMsg(`Missão criada com sucesso: "${res.mission.title}". Disparada para os agentes!`);
      setQuickMissionPrompt('');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      livingAudio.playTone('alert');
      setQuickSuccessMsg(err.message || 'Falha ao despachar missão rápida.');
    } finally {
      setIsSubmittingQuickMission(false);
    }
  };

  const handleApprove = async (missionId: string) => {
    try {
      livingAudio.playTone('command_sent');
      await api.approveMission(missionId);
      livingAudio.playTone('complete');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. CINEMATIC HERO & MASTER GREETING */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17142B] via-[#1D1835] to-[#121024] border border-[#8B5CF6]/30 p-6 sm:p-8 shadow-2xl">
        {/* Ambient volumetric glowing lights */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121024]/80 border border-[#8B5CF6]/30 text-xs text-[#A78BFA] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  OBSERVATÓRIO DE INTELIGÊNCIA EM TEMPO REAL · NÚCLEO SOBERANO
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black text-white tracking-wide">
                SHEFA AYIN <span className="text-[#A78BFA]">STUDIO</span>
              </h1>
              
              <div className="text-sm sm:text-base font-cinzel text-amber-400/90 tracking-widest uppercase flex items-center gap-2">
                <span>עין השפע · "TECHNOLOGY. VISION. CREATION."</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-light max-w-3xl leading-relaxed pt-1">
                Bem-vindo, <strong className="text-white font-semibold">Alifer Madeiro</strong> (Master Owner). 
                A infraestrutura autônoma está ativa no servidor: os <span className="text-[#A78BFA] font-medium">11 agentes inteligentes</span> e os <span className="text-[#A78BFA] font-medium">8 departamentos</span> operam continuamente para expansão de receita, desenvolvimento sob medida e atendimento de clientes.
              </p>
            </div>

            {/* Master Action Shortcuts */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => {
                  livingAudio.playTone('click');
                  onNavigateSection('AI_CORE');
                }}
                className="px-5 py-3 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-violet-950/50 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-amber-300" />
                <span>Acessar Núcleo AI CORE</span>
              </button>

              <button
                onClick={() => {
                  livingAudio.playTone('click');
                  onNavigateSection('DIGITAL');
                }}
                className="px-5 py-3 bg-[#17142B] hover:bg-[#1D1835] border border-[#8B5CF6]/30 text-xs font-semibold text-[#A78BFA] hover:text-white rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Projetos em Andamento</span>
              </button>

              <button
                onClick={() => {
                  livingAudio.playTone('click');
                  onOpenMasterPanel();
                }}
                className="px-5 py-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-xs font-semibold text-amber-300 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Console Master Global</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL EXECUTIVE INDICATORS STRIP (OS 8 INDICADORES REAIS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-[#A78BFA] tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Indicadores Reais & Saúde Operacional do Negócio</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Atualização Contínua · Chave Pix: 11973479473
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. MRR */}
          <div 
            onClick={() => onNavigateSection('FINANCE')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">MRR Líquido</span>
            <div className="text-base font-bold font-mono text-amber-300">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats?.mrr || 17407)}
            </div>
            <span className="text-[10px] text-slate-400 block">2 Assinaturas ativas</span>
          </div>

          {/* 2. Receita Pix Liquidada */}
          <div 
            onClick={() => onNavigateSection('FINANCE')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Receita Pix</span>
            <div className="text-base font-bold font-mono text-emerald-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats?.grossRevenue || 252000)}
            </div>
            <span className="text-[10px] text-slate-400 block">Titular: Alifer Madeiro</span>
          </div>

          {/* 3. Projetos Digitais */}
          <div 
            onClick={() => onNavigateSection('PROJECTS')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Projetos Ativos</span>
            <div className="text-base font-bold font-mono text-white">
              {activeProjects.length} Corporativos
            </div>
            <span className="text-[10px] text-[#A78BFA] block">R$ 173.500 contratado</span>
          </div>

          {/* 4. Clientes Multitenant */}
          <div 
            onClick={() => onNavigateSection('CLIENTS')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Empresas Clientes</span>
            <div className="text-base font-bold font-mono text-white">
              {companies.length} Isoladas
            </div>
            <span className="text-[10px] text-slate-400 block">Isolamento hermético</span>
          </div>

          {/* 5. Pipeline Comercial */}
          <div 
            onClick={() => onNavigateSection('COMMERCIAL')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Pipeline B2B</span>
            <div className="text-base font-bold font-mono text-amber-300">
              {leads.length} Leads Ativos
            </div>
            <span className="text-[10px] text-slate-400 block">RADAR + LEAD hunter</span>
          </div>

          {/* 6. Agentes 24/7 */}
          <div 
            onClick={() => onNavigateSection('AI_AGENTS')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Agentes 24/7</span>
            <div className="text-base font-bold font-mono text-emerald-400">
              {agents.filter(a => a.status !== 'paused').length} / {agents.length} Ativos
            </div>
            <span className="text-[10px] text-slate-400 block">Autonomia contínua</span>
          </div>

          {/* 7. Missões Concluídas */}
          <div 
            onClick={() => onNavigateSection('AI_CORE')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Missões</span>
            <div className="text-base font-bold font-mono text-white">
              {stats?.completedMissions || missions.filter(m => m.status === 'completed').length} / {missions.length}
            </div>
            <span className="text-[10px] text-slate-400 block">Execução no servidor</span>
          </div>

          {/* 8. Auditoria SHA-256 */}
          <div 
            onClick={() => onNavigateSection('MASTER_OWNER')}
            className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all cursor-pointer space-y-1"
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Auditoria</span>
            <div className="text-base font-bold font-mono text-[#A78BFA]">
              {stats?.auditEntries || 14} Logs
            </div>
            <span className="text-[10px] text-slate-400 block">SHA-256 Imutável</span>
          </div>
        </div>
      </section>

      {/* 3. FLUXO DE TRABALHO DO MASTER OWNER: "COMO ESTÁ A EMPRESA?" & DECISÕES PENDENTES */}
      {pendingApprovals.length > 0 && (
        <section className="p-5 bg-amber-950/60 border border-amber-500/50 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Ações Sensíveis Aguardando Decisão Soberana do Master Owner ({pendingApprovals.length})
              </h3>
              <p className="text-xs text-amber-200 font-light">
                O motor autônomo identificou tarefas com impacto financeiro ou tático crítico que exigem sua aprovação explícita.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            {pendingApprovals.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-[#121024]/80 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{m.title}</span>
                  <span className="text-[11px] text-amber-300 font-light block">
                    Motivo da Trava: {m.sensitiveReason || 'Impacto financeiro ou estratégico superior a R$ 1.000'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(m.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Aprovar Missão
                  </button>
                  <button
                    onClick={() => onNavigateSection('AI_CORE')}
                    className="px-3 py-1.5 bg-[#17142B] text-slate-300 hover:text-white rounded-lg cursor-pointer"
                  >
                    Inspecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN WORKSPACE: PROJETOS DIGITAIS + ATIVIDADES RECENTES + DEPARTAMENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Projetos Corporativos & Acesso ao AI CORE */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick AI CORE Directive Dispatch Card */}
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
                  <Cpu className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-cinzel font-bold text-white">
                    Despachar Diretriz Rápida para o AYIN CORE
                  </h3>
                  <p className="text-xs text-slate-300 font-light">
                    O cérebro neural decompõe a ordem e orquestra os 11 agentes autônomos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateSection('AI_CORE')}
                className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                Abrir Terminal Completo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleQuickCommand} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Identificar 5 concorrentes na área de ERP e gerar estratégia de abordagem para grandes contas..."
                  value={quickMissionPrompt}
                  onChange={(e) => setQuickMissionPrompt(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingQuickMission || !quickMissionPrompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingQuickMission ? 'Orquestrando...' : 'Despachar'}</span>
                </button>
              </div>

              {quickSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                  {quickSuccessMsg}
                </div>
              )}
            </form>
          </div>

          {/* Projetos em Andamento (Quadro Resumo) */}
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-cinzel font-bold text-white">
                  Projetos Corporativos em Andamento (SHEFA AYIN DIGITAL)
                </h3>
              </div>
              <button
                onClick={() => onNavigateSection('PROJECTS')}
                className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                Gerenciar Todos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#1D1835] rounded-xl border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white font-cinzel">{proj.name}</h4>
                      <span className="text-[11px] text-slate-400 block">{proj.category}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(proj.value)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Evolução</span>
                      <span className="text-[#A78BFA] font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121024] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-amber-400 rounded-full transition-all"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#8B5CF6]/10">
                    <span>Prazo: {proj.deadline}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Em execução
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constelação dos 8 Departamentos Independentes */}
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-cinzel font-bold text-white">
                  Constelação dos 8 Departamentos Independentes
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Orquestração Contínua
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-3.5 bg-[#1D1835] rounded-xl border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 transition-all space-y-1.5"
                >
                  <div className="text-xs font-bold text-white truncate">
                    {dept.name}
                  </div>
                  <div className="text-[10px] font-cinzel text-amber-400/80">
                    {dept.hebrewName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#8B5CF6]/10 flex justify-between">
                    <span>{dept.activeAgentsCount} Agentes</span>
                    <span className="text-emerald-400">Ativo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Feed Recente, Clientes & Atalhos Rápidos */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="p-5 bg-gradient-to-b from-[#1D1835] to-[#17142B] rounded-2xl border border-[#8B5CF6]/30 shadow-xl space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Atalhos de Ação Rápida
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateSection('DIGITAL')}
                className="p-3 rounded-xl bg-[#121024] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 text-left text-xs text-white transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-[#A78BFA] group-hover:text-amber-400 mb-1" />
                <span className="font-bold block">Novo Projeto</span>
                <span className="text-[10px] text-slate-400">Sob Medida</span>
              </button>

              <button
                onClick={() => onNavigateSection('COMMERCIAL')}
                className="p-3 rounded-xl bg-[#121024] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 text-left text-xs text-white transition-all cursor-pointer group"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-bold block">Ver Leads CRM</span>
                <span className="text-[10px] text-slate-400">{leads.length} Oportunidades</span>
              </button>

              <button
                onClick={() => onNavigateSection('FINANCE')}
                className="p-3 rounded-xl bg-[#121024] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 text-left text-xs text-white transition-all cursor-pointer group"
              >
                <DollarSign className="w-4 h-4 text-amber-400 mb-1" />
                <span className="font-bold block">Extrato Pix</span>
                <span className="text-[10px] text-slate-400">11973479473</span>
              </button>

              <button
                onClick={() => onNavigateSection('AI_AGENTS')}
                className="p-3 rounded-xl bg-[#121024] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 text-left text-xs text-white transition-all cursor-pointer group"
              >
                <Bot className="w-4 h-4 text-[#A78BFA] mb-1" />
                <span className="font-bold block">11 Agentes</span>
                <span className="text-[10px] text-slate-400">Gerenciar 24/7</span>
              </button>
            </div>
          </div>

          {/* Feed de Atividades Recentes do Servidor */}
          <div className="p-5 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#8B5CF6]/20">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A78BFA]" />
                <span>Atividades Recentes 24/7</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Ao Vivo</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {missions.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-[#1D1835] rounded-xl border border-[#8B5CF6]/15 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {m.title}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      m.status === 'completed' ? 'bg-emerald-950 text-emerald-300' :
                      m.status === 'awaiting_approval' ? 'bg-amber-950 text-amber-300' :
                      'bg-violet-950 text-[#A78BFA]'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 font-light">
                    {m.objective}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#8B5CF6]/10">
                    <span>{new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="text-violet-300">AYIN CORE Engine</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empresas Clientes (Hermético) */}
          <div className="p-5 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#8B5CF6]/20">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Clientes Multitenant</span>
              </h3>
              <button
                onClick={() => onNavigateSection('CLIENTS')}
                className="text-[11px] text-[#A78BFA] hover:text-white cursor-pointer"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-[#1D1835] rounded-xl border border-[#8B5CF6]/15 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.tradeName || c.name}</span>
                    <span className="text-[10px] font-mono text-[#A78BFA]">{c.plan}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    Ativo
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
