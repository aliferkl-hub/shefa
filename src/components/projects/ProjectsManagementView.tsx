import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  User, 
  Calendar, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { livingAudio } from '../../services/livingAudio.ts';

interface ProjectItem {
  id: string;
  name: string;
  client: string;
  category: string;
  contractValue: number;
  progress: number;
  stage: 'Planejamento' | 'Desenvolvimento' | 'Homologação' | 'Concluído';
  deadline: string;
  assignedAgents: string[];
  scope: string[];
}

export const ProjectsManagementView: React.FC = () => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj_01',
      name: 'Vértice Tech Global - ERP Corporativo',
      client: 'Roberto Alencar (Diretoria Vértice)',
      category: 'Sistemas Corporativos & ERP',
      contractValue: 48000,
      progress: 68,
      stage: 'Desenvolvimento',
      deadline: '28/04/2026',
      assignedAgents: ['LEAD', 'SALES', 'FINANCE'],
      scope: ['Modelagem PostgreSQL & Schemas', 'API de Conciliação em Tempo Real', 'Dashboard Executivo']
    },
    {
      id: 'proj_02',
      name: 'Grupo Aurora - Telemedicina & Portal do Paciente',
      client: 'Carla Silveira (Gestão Aurora)',
      category: 'Plataforma Web & Telemedicina',
      contractValue: 34500,
      progress: 88,
      stage: 'Homologação',
      deadline: '15/04/2026',
      assignedAgents: ['CUSTOMER', 'MARKETING', 'CREATIVE'],
      scope: ['Portal do Paciente WebRTC', 'Assinatura Digital de Prontuários', 'Blindagem LGPD']
    },
    {
      id: 'proj_03',
      name: 'Titan Capital - Motor Pix & Liquidação',
      client: 'Fernando Castilho',
      category: 'Fintech & Motor Pix',
      contractValue: 62000,
      progress: 100,
      stage: 'Concluído',
      deadline: 'Entregue',
      assignedAgents: ['FINANCE', 'RADAR', 'SUBSCRIPTION'],
      scope: ['Gateway Pix Idempotente', 'Auditoria SHA-256 de Transações', 'Relatórios Fiscais']
    },
    {
      id: 'proj_04',
      name: 'BioNexus Diagnósticos - Rede Neural de Triagem',
      client: 'Dra. Márcia Rios',
      category: 'Inteligência Artificial & Agentes LLM',
      contractValue: 29000,
      progress: 25,
      stage: 'Planejamento',
      deadline: '20/05/2026',
      assignedAgents: ['ANALYTICS', 'REPORT'],
      scope: ['Diagnóstico Operacional', 'PoC de Agente Especialista', 'Validação de Acurácia']
    }
  ]);

  const [newForm, setNewForm] = useState({
    name: '',
    client: '',
    category: 'Sistemas Corporativos & ERP',
    contractValue: 35000,
    deadline: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name) return;

    const newItem: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: newForm.name,
      client: newForm.client || 'Cliente Corporativo',
      category: newForm.category,
      contractValue: Number(newForm.contractValue),
      progress: 10,
      stage: 'Planejamento',
      deadline: newForm.deadline || 'A definir',
      assignedAgents: ['RADAR', 'LEAD'],
      scope: ['Kickoff e Alinhamento Estratégico', 'Especificação de Arquitetura']
    };

    setProjects([newItem, ...projects]);
    setIsModalOpen(false);
    livingAudio.playTone('complete');
  };

  const advanceProgress = (id: string) => {
    livingAudio.playTone('command_sent');
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextProgress = Math.min(100, p.progress + 15);
      const nextStage = nextProgress >= 100 ? 'Concluído' : nextProgress >= 80 ? 'Homologação' : 'Desenvolvimento';
      return { ...p, progress: nextProgress, stage: nextStage };
    }));
  };

  const filtered = filterStage === 'all' ? projects : projects.filter(p => p.stage === filterStage);
  const totalValue = projects.reduce((acc, p) => acc + p.contractValue, 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shadow">
            <FolderKanban className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                PROJECTS · GERENCIAMENTO DE PROJETOS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                {projects.length} CONTRATOS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Acompanhamento de entregáveis, cronogramas, alocação de agentes autônomos e faturamento por projeto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-300 bg-[#1D1835] px-3 py-2 rounded-xl border border-[#8B5CF6]/20">
            Total em Carteira: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValue)}
          </span>
          <button
            onClick={() => {
              livingAudio.playTone('click');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2">
          {['all', 'Planejamento', 'Desenvolvimento', 'Homologação', 'Concluído'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStage(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStage === st
                  ? 'bg-[#1D1835] text-white border border-[#8B5CF6]/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'Todos os Projetos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/60 transition-all flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                  proj.stage === 'Concluído' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                  proj.stage === 'Homologação' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' :
                  proj.stage === 'Desenvolvimento' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                  'bg-violet-950 text-[#A78BFA] border-[#8B5CF6]/40'
                }`}>
                  {proj.stage}
                </span>

                <span className="text-sm font-mono font-bold text-amber-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(proj.contractValue)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-cinzel font-bold text-white">{proj.name}</h3>
                <span className="text-xs text-slate-400 block">{proj.client} · {proj.category}</span>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Progresso Técnico</span>
                  <span className="text-[#A78BFA] font-bold">{proj.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#121024] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Scope Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-[#8B5CF6]/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Entregáveis:</span>
                {proj.scope.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Assigned Agents */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Agentes Alocados:</span>
                {proj.assignedAgents.map(ag => (
                  <span key={ag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1D1835] text-[#A78BFA] border border-[#8B5CF6]/30">
                    {ag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#8B5CF6]/15 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Entrega: {proj.deadline}
              </span>

              {proj.progress < 100 && (
                <button
                  onClick={() => advanceProgress(proj.id)}
                  className="px-3 py-1.5 bg-[#1D1835] hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 text-xs font-semibold text-[#A78BFA] rounded-lg transition-colors cursor-pointer"
                >
                  Avançar Sprint (+15%)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-[#17142B] border border-[#8B5CF6]/40 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-base font-cinzel font-bold text-white">Cadastrar Novo Projeto</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Título do Projeto:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ERP de Supply Chain e Logística"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Cliente / Decisor:</label>
                <input
                  type="text"
                  placeholder="Ex: Diretoria Executiva"
                  value={newForm.client}
                  onChange={(e) => setNewForm({ ...newForm, client: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor do Contrato (R$):</label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={newForm.contractValue}
                  onChange={(e) => setNewForm({ ...newForm, contractValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Prazo de Entrega Estimado:</label>
                <input
                  type="text"
                  placeholder="Ex: 30/06/2026"
                  value={newForm.deadline}
                  onChange={(e) => setNewForm({ ...newForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#8B5CF6]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1D1835] text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B5CF6] hover:bg-violet-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
