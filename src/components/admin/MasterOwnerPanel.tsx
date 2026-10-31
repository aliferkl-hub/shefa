import React, { useState, useEffect } from 'react';
import { Mission, Company, AuditLog, User, AutonomousAgent, EngineGovernanceSettings, SystemStats } from '../../types/index.ts';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Plus, 
  Lock, 
  History, 
  Building2, 
  Power, 
  DollarSign, 
  QrCode, 
  Cpu, 
  Pause, 
  Play, 
  RefreshCw, 
  Zap,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface MasterOwnerPanelProps {
  currentUser: User | null;
  missions: Mission[];
  companies: Company[];
  auditLogs: AuditLog[];
  agents?: AutonomousAgent[];
  stats?: SystemStats | null;
  onRefreshData: () => void;
  onClose: () => void;
}

export const MasterOwnerPanel: React.FC<MasterOwnerPanelProps> = ({
  currentUser,
  missions,
  companies,
  auditLogs,
  agents = [],
  stats,
  onRefreshData,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'business' | 'companies' | 'audit' | 'security'>('approvals');
  
  // Governance & Emergency Engine State
  const [governance, setGovernance] = useState<EngineGovernanceSettings | null>(null);
  const [spendingLimitInput, setSpendingLimitInput] = useState<string>('1000');
  const [isTogglingEmergency, setIsTogglingEmergency] = useState(false);
  const [isSavingLimit, setIsSavingLimit] = useState(false);
  const [governanceFeedback, setGovernanceFeedback] = useState<string | null>(null);

  // New Company form
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [companyPlan, setCompanyPlan] = useState<'Astral Starter' | 'Cosmic Growth' | 'Infinity Enterprise'>('Cosmic Growth');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  // Security Credentials Update form
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [securityStatus, setSecurityStatus] = useState<string | null>(null);

  const pendingApprovals = missions.filter(m => m.status === 'awaiting_approval');

  // Load governance settings
  useEffect(() => {
    api.getGovernance()
      .then((data) => {
        setGovernance(data);
        setSpendingLimitInput((data.financialSpendingLimit ?? 1000).toString());
      })
      .catch((err) => console.error('Failed to load governance:', err));
  }, []);

  const handleToggleEmergencyPause = async () => {
    setIsTogglingEmergency(true);
    setGovernanceFeedback(null);
    try {
      const res = await api.toggleEmergencyPause();
      setGovernance(prev => prev ? { ...prev, isEmergencyPaused: res.isEmergencyPaused } : null);
      setGovernanceFeedback(res.message);
      if (res.isEmergencyPaused) {
        livingAudio.playTone('emergency');
        livingAudio.speak('Atenção. Trava de emergência geral acionada pelo Master Owner. Operações suspensas no servidor.');
      } else {
        livingAudio.playTone('complete');
        livingAudio.speak('Motor autônomo restabelecido com sucesso pelo Master Owner.');
      }
      onRefreshData();
    } catch (err: any) {
      setGovernanceFeedback(err.message || 'Falha ao acionar trava de emergência.');
      livingAudio.playTone('alert');
    } finally {
      setIsTogglingEmergency(false);
    }
  };

  const handleUpdateSpendingLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(spendingLimitInput);
    if (isNaN(limit) || limit < 0) {
      setGovernanceFeedback('Por favor insira um valor válido de limite em reais.');
      return;
    }
    setIsSavingLimit(true);
    try {
      await api.updateSpendingLimit(limit);
      setGovernance(prev => prev ? { ...prev, financialSpendingLimit: limit } : null);
      setGovernanceFeedback(`Limite autorizado atualizado para R$ ${limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      onRefreshData();
    } catch (err: any) {
      setGovernanceFeedback(err.message || 'Falha ao atualizar limite.');
    } finally {
      setIsSavingLimit(false);
    }
  };

  const handleToggleAgent = async (agentId: string) => {
    try {
      await api.toggleAgentPause(agentId);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar estado do agente.');
    }
  };

  const handleApprove = async (missionId: string) => {
    try {
      await api.approveMission(missionId);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar missão.');
    }
  };

  const handleReject = async (missionId: string) => {
    const reason = prompt('Informe a justificativa do bloqueio da ação:');
    if (!reason) return;
    try {
      await api.rejectMission(missionId, reason);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar missão.');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyCnpj.trim()) return;
    setIsCreatingCompany(true);

    try {
      await api.createCompany({
        name: companyName,
        cnpjOrTaxId: companyCnpj,
        plan: companyPlan
      });
      setCompanyName('');
      setCompanyCnpj('');
      onRefreshData();
      alert('Nova empresa cliente provisionada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar empresa.');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setSecurityStatus('A confirmação da nova senha não confere.');
      return;
    }
    if (newPass.length < 8) {
      setSecurityStatus('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }

    try {
      await api.setupMaster(currPass, newPass);
      setSecurityStatus('Credenciais do Master Owner atualizadas com hash scrypt no servidor!');
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      onRefreshData();
    } catch (err: any) {
      setSecurityStatus(err.message || 'Erro ao atualizar credenciais.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-[#07070d] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-[#07070d] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-cinzel font-bold text-white tracking-wide">
                  Console Soberano · Master Owner
                </h2>
                <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  Alifermadeiro@hotmail.com
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Supervisão global, botão de emergência kill-switch, controle de agentes e motor Pix soberano.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg glass-obsidian transition-colors cursor-pointer"
          >
            Fechar Console
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-purple-900/20 bg-[#050508]/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approvals' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Aprovações Sensíveis ({pendingApprovals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'business' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span>Business Engine & Soberania</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'companies' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Gestão de Empresas ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Segurança & Credenciais</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400">
                  Fila de Ações Sensíveis que Exigem Autorização Explícita
                </span>
                <span className="text-xs text-amber-400">
                  Nenhum gasto ou alteração crítica executa sem seu consentimento
                </span>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-12 text-center glass-obsidian rounded-xl border border-purple-900/20 text-slate-400 text-xs">
                  Nenhuma ação sensível pendente de aprovação no momento. Todas as diretrizes estão em conformidade.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((mission) => (
                    <div
                      key={mission.id}
                      className="p-4 glass-obsidian-gold rounded-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono-numbers text-amber-400">{mission.id}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-semibold text-white">{mission.title}</span>
                        </div>
                        <p className="text-xs text-amber-200/90 font-light">
                          Motivo da Retenção: {mission.sensitiveReason || 'Impacto orçamentário ou alteração sensível detectada'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Solicitante: {mission.creatorEmail} · Empresa: {mission.companyId}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(mission.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Autorizar Execução</span>
                        </button>
                        <button
                          onClick={() => handleReject(mission.id)}
                          className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejeitar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* Emergency Kill-Switch Master Banner */}
              <div className={`p-5 rounded-2xl border transition-all ${
                governance?.isEmergencyPaused 
                  ? 'bg-rose-950/60 border-rose-500/60 shadow-xl shadow-rose-950/40' 
                  : 'glass-obsidian-gold border-amber-500/30'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Power className={`w-5 h-5 ${governance?.isEmergencyPaused ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                      <h3 className="text-sm font-cinzel font-bold text-white tracking-wide">
                        {governance?.isEmergencyPaused 
                          ? 'PAUSA GERAL DE EMERGÊNCIA ATIVADA (KILL-SWITCH)' 
                          : 'SISTEMA AUTÔNOMO OPERACIONAL 24/7 (SISTEMA ATIVO)'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 font-light max-w-2xl leading-relaxed">
                      {governance?.isEmergencyPaused 
                        ? 'Todas as rotinas autônomas, emissões de cobrança, prospecções e ações de agentes estão totalmente paralisadas pelo Master Owner.'
                        : 'Os 11 agentes autônomos operam de forma contínua em segundo plano, respeitando limites de autorização e o isolamento de dados.'}
                    </p>
                  </div>

                  <button
                    onClick={handleToggleEmergencyPause}
                    disabled={isTogglingEmergency}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shrink-0 ${
                      governance?.isEmergencyPaused
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>
                      {isTogglingEmergency 
                        ? 'Processando...' 
                        : governance?.isEmergencyPaused 
                        ? 'Reativar Motor Autônomo' 
                        : 'Acionar Pausa Geral de Emergência'}
                    </span>
                  </button>
                </div>

                {governanceFeedback && (
                  <div className="mt-3 p-2.5 bg-black/40 rounded-lg text-xs text-amber-300 font-mono-numbers border border-amber-500/20">
                    {governanceFeedback}
                  </div>
                )}
              </div>

              {/* Financial Metrics Strip (Tabular numbers, no pending counted as liquid) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 glass-obsidian rounded-xl border border-purple-900/30">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Receita Líquida Real</span>
                  <div className="text-lg font-bold font-mono-numbers text-emerald-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.grossRevenue || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-light">Apenas Pix liquidado</span>
                </div>

                <div className="p-3.5 glass-obsidian rounded-xl border border-purple-900/30">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">MRR Líquido Vigente</span>
                  <div className="text-lg font-bold font-mono-numbers text-amber-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.mrr || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-light">Assinaturas ativas</span>
                </div>

                <div className="p-3.5 glass-obsidian rounded-xl border border-purple-900/30">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Assinaturas Ativas</span>
                  <div className="text-lg font-bold font-mono-numbers text-white">
                    {stats?.activeSubscriptions || 0}
                  </div>
                  <span className="text-[10px] text-slate-400 font-light">Planos corporativos</span>
                </div>

                <div className="p-3.5 glass-obsidian rounded-xl border border-purple-900/30">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Pix Aguardando Pgto</span>
                  <div className="text-lg font-bold font-mono-numbers text-purple-300">
                    {stats?.pendingPixCharges || 0}
                  </div>
                  <span className="text-[10px] text-rose-300/80 font-light">Não computado em receita</span>
                </div>
              </div>

              {/* Official Pix Key Terminal & Spending Limit Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Official Pix Destination */}
                <div className="p-5 glass-obsidian-gold rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Terminal Pix Oficial de Recebimento
                    </h4>
                  </div>
                  
                  <div className="bg-[#050508] p-3.5 rounded-lg border border-purple-900/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Chave Pix Soberana:</span>
                      <span className="font-mono-numbers font-bold text-amber-300 select-all">11973479473</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tipo de Chave:</span>
                      <span className="text-slate-200 uppercase text-[10px] font-mono-numbers">Telefone Celular</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Beneficiário Exclusivo:</span>
                      <span className="text-slate-200 font-medium">Alifer Madeiro</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cidade Base:</span>
                      <span className="text-slate-200">São Paulo - SP</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    Todos os pagamentos de assinaturas, vendas de software e serviços entram diretamente nesta chave. O sistema audita o padrão EMV BACEN com hash CRC16.
                  </p>
                </div>

                {/* Spending Limit Form */}
                <div className="p-5 glass-obsidian rounded-xl border border-purple-900/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Limite de Gastos Autorizado
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Operações financeiras ou de contratação com valor superior ao teto abaixo exigem autorização expressa do Master Owner em Aprovações Sensíveis.
                  </p>

                  <form onSubmit={handleUpdateSpendingLimit} className="flex items-center gap-3 pt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono-numbers">
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={spendingLimitInput}
                        onChange={(e) => setSpendingLimitInput(e.target.value)}
                        className="w-full bg-[#050508] border border-purple-900/40 text-xs pl-9 pr-3 py-2 rounded-lg text-white font-mono-numbers"
                        placeholder="1000"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingLimit}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {isSavingLimit ? 'Salvando...' : 'Atualizar Limite'}
                    </button>
                  </form>
                </div>
              </div>

              {/* 11 Autonomous Agents Fleet Controls */}
              <div className="p-5 glass-obsidian rounded-xl border border-purple-900/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Frota de 11 Agentes Especializados · Controle de Execução
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-numbers">
                    {agents.filter(a => a.status !== 'paused' && !a.isManuallyPaused).length} / {agents.length} em operação
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agents.map((agent) => {
                    const isPaused = agent.status === 'paused' || agent.isManuallyPaused;
                    return (
                      <div
                        key={agent.id}
                        className="p-3.5 bg-[#050508] rounded-xl border border-purple-900/30 flex flex-col justify-between space-y-2 hover:border-purple-500/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 text-xs">
                            <span className="font-semibold text-white">{agent.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-numbers ${
                              !isPaused 
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}>
                              {!isPaused ? 'Ativo 24/7' : 'Pausado'}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-300/80 font-mono-numbers block mt-0.5">
                            {agent.role}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 font-light">
                            {agent.specialty || agent.role}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-purple-900/20 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono-numbers">
                            {agent.totalMissionsCompleted || 0} missões
                          </span>
                          <button
                            onClick={() => handleToggleAgent(agent.id)}
                            className={`px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer flex items-center gap-1 ${
                              !isPaused
                                ? 'bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-500/20'
                                : 'bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {!isPaused ? (
                              <>
                                <Pause className="w-3 h-3" />
                                <span>Pausar</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                <span>Retomar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              {/* Provision new company form */}
              <form onSubmit={handleCreateCompany} className="p-4 glass-obsidian rounded-xl border border-purple-900/30 space-y-3">
                <span className="text-xs font-semibold text-white block">Provisionar Nova Empresa Cliente</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Razão Social ou Nome..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200 placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="CNPJ / ID Fiscal..."
                    value={companyCnpj}
                    onChange={(e) => setCompanyCnpj(e.target.value)}
                    className="bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200 placeholder-slate-500"
                  />
                  <select
                    value={companyPlan}
                    onChange={(e: any) => setCompanyPlan(e.target.value)}
                    className="bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
                  >
                    <option value="Astral Starter">Plano Astral Starter</option>
                    <option value="Cosmic Growth">Plano Cosmic Growth</option>
                    <option value="Infinity Enterprise">Plano Infinity Enterprise</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isCreatingCompany || !companyName.trim() || !companyCnpj.trim()}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Provisionar Empresa com Isolamento</span>
                </button>
              </form>

              {/* Companies list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((c) => (
                  <div key={c.id} className="p-4 glass-obsidian rounded-xl border border-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-[10px] text-amber-300 font-mono-numbers">{c.plan}</span>
                    </div>
                    <p className="text-xs text-slate-400">CNPJ: {c.cnpjOrTaxId}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-purple-900/20 font-mono-numbers">
                      <span>Assistente: {c.aiPersona.assistantName}</span>
                      <span>{c.quotas.usedMissions}/{c.quotas.monthlyMissions} Missões</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 block mb-2">
                Livro Razão de Auditoria com Hash Criptográfico Encadeado (SHA-256)
              </span>
              <div className="space-y-2">
                {auditLogs.slice(-12).reverse().map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#050508] rounded-xl border border-purple-900/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-mono-numbers">{log.action}</span>
                      <span className="text-slate-500 font-mono-numbers">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-slate-200">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-numbers pt-1 border-t border-purple-900/10">
                      <span>Autor: {log.actorEmail} ({log.actorRole})</span>
                      <span className="truncate max-w-[280px]" title={log.hash}>Hash: {log.hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-900/20">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  Redefinição Privada de Credenciais do Master Owner
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Atualize sua frase secreta com derivação de chave criptográfica scrypt com salt no servidor.
              </p>

              <form onSubmit={handleUpdateCredentials} className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    placeholder="Digite sua senha atual..."
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    className="w-full bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Nova Frase Secreta (mín. 8 caracteres)
                  </label>
                  <input
                    type="password"
                    placeholder="Nova senha de alta entropia..."
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha..."
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-[#050508] border border-purple-900/40 text-xs px-3 py-2 rounded-lg text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-medium transition-all cursor-pointer"
                >
                  Atualizar Senha com Scrypt
                </button>

                {securityStatus && (
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-200 text-center">
                    {securityStatus}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
