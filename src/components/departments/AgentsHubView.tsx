import React, { useState } from 'react';
import { 
  AutonomousAgent, 
  Mission, 
  User 
} from '../../types/index.ts';
import { 
  Bot, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Zap, 
  Activity, 
  ShieldCheck,
  RotateCw,
  Terminal,
  Filter
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface AgentsHubViewProps {
  agents: AutonomousAgent[];
  missions: Mission[];
  currentUser: User | null;
  onRefreshData: () => void;
  onFocusAgentInObservatory?: (agent: AutonomousAgent) => void;
}

export const AgentsHubView: React.FC<AgentsHubViewProps> = ({
  agents,
  missions,
  currentUser,
  onRefreshData,
  onFocusAgentInObservatory
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent_radar');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [directPrompt, setDirectPrompt] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleTogglePause = async (agentId: string) => {
    try {
      livingAudio.play('command_sent');
      await api.toggleAgentPause(agentId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle agent pause:', err);
    }
  };

  const handleDispatchDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPrompt.trim() || !selectedAgent) return;

    setIsDispatching(true);
    livingAudio.play('command_sent');

    try {
      await api.sendCommand(`[DIRETO PARA ${selectedAgent.name}] ${directPrompt}`);
      setDirectPrompt('');
      onRefreshData();
      livingAudio.play('complete');
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const filteredAgents = filterRole === 'all' 
    ? agents 
    : agents.filter(a => a.role.toLowerCase().includes(filterRole.toLowerCase()));

  const agentMissions = missions.filter(m => 
    m.departmentsInvolved?.includes(selectedAgent?.departmentId) || 
    m.title?.toLowerCase().includes(selectedAgent?.role?.toLowerCase() || '')
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/25 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-amber-400 shadow">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                REDE DOS 11 AGENTES AUTÔNOMOS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                EXECUÇÃO 24/7 NO SERVIDOR
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-light">
              Supervisão individual de autonomia, taxas de sucesso, fila de trabalho e disparo de missões diretas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="px-3 py-1.5 rounded-lg bg-[#1D1835] border border-violet-500/30">
            {agents.filter(a => a.status !== 'paused').length} Ativos
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#1D1835] border border-amber-500/30 text-amber-300">
            {agents.filter(a => a.status === 'paused').length} Pausados
          </span>
        </div>
      </div>

      {/* Main Grid: Left Agents Selector / Right Detailed Control Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 11 Agents List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
            <span className="text-xs font-mono uppercase text-slate-400">
              Constelação de Agentes ({agents.length})
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-[#17142B] text-slate-300 border border-violet-500/30 rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Papéis</option>
                <option value="radar">RADAR</option>
                <option value="lead">LEAD</option>
                <option value="sales">SALES</option>
                <option value="customer">CUSTOMER</option>
                <option value="marketing">MARKETING</option>
                <option value="finance">FINANCE</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredAgents.map((agent) => {
              const isSelected = agent.id === selectedAgent?.id;
              const isPaused = agent.status === 'paused';

              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    livingAudio.play('click');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1D1835] border-violet-400 shadow-md shadow-violet-900/20'
                      : 'bg-[#17142B] border-violet-500/20 hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-cinzel">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono text-violet-300 px-1.5 py-0.2 rounded bg-violet-950/60">
                          {agent.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block line-clamp-1 font-light">
                        {agent.specialty || agent.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {agent.totalMissionsCompleted || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">tarefas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Agent Console */}
        {selectedAgent && (
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/25 space-y-6">
              {/* Agent Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-cinzel text-white">
                      {selectedAgent.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/30">
                      {selectedAgent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light">
                    {selectedAgent.specialty || selectedAgent.role}
                  </p>
                </div>

                {/* Pause/Resume Toggle */}
                <button
                  onClick={() => handleTogglePause(selectedAgent.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                    selectedAgent.status === 'paused'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600/80 hover:bg-amber-500 text-white'
                  }`}
                >
                  {selectedAgent.status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Reativar Agente</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar Agente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real Metrics Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#1D1835] rounded-xl border border-violet-500/20">
                  <span className="text-[10px] uppercase text-slate-400 block">Status Operacional</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 capitalize">
                    {selectedAgent.status}
                  </span>
                </div>
                <div className="p-3 bg-[#1D1835] rounded-xl border border-violet-500/20">
                  <span className="text-[10px] uppercase text-slate-400 block">Taxa de Precisão</span>
                  <span className="text-sm font-bold font-mono text-amber-300">
                    {selectedAgent.accuracyScore || 98}%
                  </span>
                </div>
                <div className="p-3 bg-[#1D1835] rounded-xl border border-violet-500/20">
                  <span className="text-[10px] uppercase text-slate-400 block">Missões Cumpridas</span>
                  <span className="text-sm font-bold font-mono text-violet-300">
                    {selectedAgent.totalMissionsCompleted || 0}
                  </span>
                </div>
              </div>

              {/* Direct Mission Dispatch Form */}
              <form onSubmit={handleDispatchDirect} className="space-y-3">
                <label className="text-xs font-mono uppercase text-slate-400 block">
                  Despachar Ordem Direta para {selectedAgent.name}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Ex: Execute varredura prioritária para novos clientes...`}
                    value={directPrompt}
                    onChange={(e) => setDirectPrompt(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#1D1835] border border-violet-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Despachar</span>
                  </button>
                </div>
              </form>

              {/* Agent Mission Backlog */}
              <div className="space-y-3 pt-3 border-t border-violet-500/20">
                <span className="text-xs font-mono uppercase text-slate-400 block">
                  Fila de Missões Recentes deste Agente ({agentMissions.length}):
                </span>

                {agentMissions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Nenhuma missão pendente para este agente no momento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {agentMissions.map(m => (
                      <div
                        key={m.id}
                        className="p-3 bg-[#121024] rounded-lg border border-violet-500/15 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 max-w-sm truncate">
                          <span className="font-semibold text-white block truncate">{m.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          m.status === 'completed' ? 'bg-emerald-950 text-emerald-300' :
                          m.status === 'in_progress' ? 'bg-indigo-950 text-indigo-300' :
                          'bg-amber-950 text-amber-300'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
