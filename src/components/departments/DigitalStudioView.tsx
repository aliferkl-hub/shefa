import React, { useState } from 'react';
import { 
  Code2, 
  Layers, 
  Smartphone, 
  Server, 
  Globe, 
  DollarSign, 
  Workflow, 
  Bot, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Cpu,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { User, Lead } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface DigitalStudioViewProps {
  currentUser: User | null;
  leads: Lead[];
  onRefreshData: () => void;
  onOpenPixModal?: (amount: number, description: string) => void;
}

interface CustomProject {
  id: string;
  clientName: string;
  companyName: string;
  serviceCategory: 'App Mobile' | 'ERP Corporativo' | 'Plataforma Web' | 'Motor Pix & Fintech' | 'Automação B2B' | 'IA & Agentes';
  stage: 'Solicitação' | 'Diagnóstico' | 'Proposta' | 'Desenvolvimento' | 'Homologação' | 'Operação 24/7';
  progress: number;
  contractValue: number;
  deliveryDate: string;
  assignedAgents: string[];
  deliverables: { title: string; done: boolean }[];
}

export const DigitalStudioView: React.FC<DigitalStudioViewProps> = ({
  currentUser,
  leads,
  onRefreshData,
  onOpenPixModal
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'catalog' | 'proposals'>('pipeline');
  const [selectedProject, setSelectedProject] = useState<CustomProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Initial projects state representing real digital studio contracts
  const [projects, setProjects] = useState<CustomProject[]>([
    {
      id: 'proj_001',
      clientName: 'Roberto Alencar',
      companyName: 'Vértice Tech Logistics',
      serviceCategory: 'ERP Corporativo',
      stage: 'Desenvolvimento',
      progress: 68,
      contractValue: 48000,
      deliveryDate: '28/04/2026',
      assignedAgents: ['LEAD', 'SALES', 'FINANCE'],
      deliverables: [
        { title: 'Levantamento de Requisitos e Arquitetura', done: true },
        { title: 'Modelagem de Banco de Dados e API Segura', done: true },
        { title: 'Frontend Executivo com Observabilidade', done: true },
        { title: 'Integração de Faturamento e Pix', done: false },
        { title: 'Homologação e Testes de Carga', done: false }
      ]
    },
    {
      id: 'proj_002',
      clientName: 'Carla Silveira',
      companyName: 'Aurora Saúde & Assistência',
      serviceCategory: 'Plataforma Web',
      stage: 'Homologação',
      progress: 88,
      contractValue: 34500,
      deliveryDate: '15/04/2026',
      assignedAgents: ['CUSTOMER', 'MARKETING', 'CREATIVE'],
      deliverables: [
        { title: 'Portal do Paciente e Agendamento', done: true },
        { title: 'Módulo de Telemedicina com WebRTC', done: true },
        { title: 'Conformidade com LGPD e Criptografia', done: true },
        { title: 'Treinamento das Equipes', done: false }
      ]
    },
    {
      id: 'proj_003',
      clientName: 'Fernando Castilho',
      companyName: 'Titan Capital Partners',
      serviceCategory: 'Motor Pix & Fintech',
      stage: 'Operação 24/7',
      progress: 100,
      contractValue: 62000,
      deliveryDate: 'Concluído',
      assignedAgents: ['FINANCE', 'RADAR', 'SUBSCRIPTION'],
      deliverables: [
        { title: 'Gateway Pix com Validação de Webhooks', done: true },
        { title: 'Conciliação Bancária Automática', done: true },
        { title: 'Ledger Auditável SHA-256', done: true },
        { title: 'Monitoramento 24/7 Ativo', done: true }
      ]
    },
    {
      id: 'proj_004',
      clientName: 'Dra. Márcia Rios',
      companyName: 'BioNexus Diagnósticos',
      serviceCategory: 'IA & Agentes',
      stage: 'Diagnóstico',
      progress: 25,
      contractValue: 29000,
      deliveryDate: '20/05/2026',
      assignedAgents: ['ANALYTICS', 'REPORT'],
      deliverables: [
        { title: 'Diagnóstico de Processos e Dados', done: true },
        { title: 'PoC do Agente Neural Especialista', done: false },
        { title: 'Validação de Acurácia Médica', done: false }
      ]
    }
  ]);

  // Form for new enterprise project
  const [newProjectForm, setNewProjectForm] = useState({
    clientName: '',
    companyName: '',
    serviceCategory: 'Plataforma Web' as CustomProject['serviceCategory'],
    contractValue: 25000,
    deliveryDate: ''
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.companyName) return;

    const newProj: CustomProject = {
      id: `proj_${Date.now()}`,
      clientName: newProjectForm.clientName || 'Diretoria Executiva',
      companyName: newProjectForm.companyName,
      serviceCategory: newProjectForm.serviceCategory,
      stage: 'Solicitação',
      progress: 10,
      contractValue: Number(newProjectForm.contractValue),
      deliveryDate: newProjectForm.deliveryDate || 'Em definição',
      assignedAgents: ['RADAR', 'LEAD'],
      deliverables: [
        { title: 'Briefing e Alinhamento Estratégico', done: true },
        { title: 'Aprovação de Proposta e Contrato', done: false },
        { title: 'Desenvolvimento e Entrega', done: false }
      ]
    };

    setProjects([newProj, ...projects]);
    setIsNewProjectModalOpen(false);
    livingAudio.play('complete');
  };

  const advanceStage = (projId: string) => {
    const stages: CustomProject['stage'][] = [
      'Solicitação', 
      'Diagnóstico', 
      'Proposta', 
      'Desenvolvimento', 
      'Homologação', 
      'Operação 24/7'
    ];

    setProjects(prev => prev.map(p => {
      if (p.id !== projId) return p;
      const curIdx = stages.indexOf(p.stage);
      if (curIdx < stages.length - 1) {
        const nextStage = stages[curIdx + 1];
        const nextProgress = Math.min(100, Math.round(((curIdx + 2) / stages.length) * 100));
        livingAudio.play('command_sent');
        return { ...p, stage: nextStage, progress: nextProgress };
      }
      return p;
    }));
  };

  const stageColors: Record<CustomProject['stage'], string> = {
    'Solicitação': 'bg-slate-800 text-slate-300 border-slate-600',
    'Diagnóstico': 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    'Proposta': 'bg-violet-950/80 text-violet-300 border-violet-500/40',
    'Desenvolvimento': 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    'Homologação': 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    'Operação 24/7': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Digital Studio Header */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/25 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                SHEFA AYIN DIGITAL
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-900/40 text-violet-300 border border-violet-500/30">
                PROJETOS SOB MEDIDA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-light">
              Esteira de engenharia de software de alta precisão, contratos corporativos e entrega ponta a ponta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              livingAudio.play('click');
              setIsNewProjectModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto Digital</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-violet-500/20 pb-2">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-[#1D1835] text-white border border-violet-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pipeline de Desenvolvimento ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'proposals'
              ? 'bg-[#1D1835] text-white border border-violet-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Propostas & Leads Comerciais ({leads.length})
        </button>
      </div>

      {/* TAB 1: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/20 hover:border-violet-500/45 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${stageColors[proj.stage]}`}>
                    {proj.stage.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(proj.contractValue)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-cinzel">
                    {proj.companyName}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{proj.serviceCategory}</span>
                    <span>·</span>
                    <span>Resp: {proj.clientName}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Progresso Geral</span>
                    <span className="text-violet-300 font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#121024] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deliverables snippet */}
                <div className="space-y-1.5 pt-2 border-t border-violet-500/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Entregáveis do Escopo:
                  </span>
                  {proj.deliverables.slice(0, 3).map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${d.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={`truncate ${d.done ? 'line-through text-slate-500' : ''}`}>
                        {d.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Assigned agents */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">Agentes:</span>
                  {proj.assignedAgents.map(ag => (
                    <span key={ag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30">
                      {ag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-violet-500/15 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  Prazo: {proj.deliveryDate}
                </span>

                <button
                  onClick={() => advanceStage(proj.id)}
                  className="px-3 py-1.5 bg-[#1D1835] hover:bg-violet-600/30 border border-violet-500/30 text-xs font-semibold text-violet-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Avançar Etapa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROPOSALS & LEADS */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#17142B] rounded-xl border border-violet-500/20 text-xs text-slate-300">
            Leads e solicitações recebidas pelo simulador público do SHEFA AYIN STUDIO e processadas pelo agente <strong className="text-white">RADAR</strong> e <strong className="text-white">LEAD</strong>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 bg-[#17142B] rounded-xl border border-violet-500/20 hover:border-violet-500/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-cinzel">
                    {lead.companyId || lead.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.value)}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Contato:</strong> {lead.name} · {lead.email}</div>
                  {lead.phone && <div><strong>WhatsApp:</strong> {lead.phone}</div>}
                  {lead.notes && (
                    <div className="text-[11px] text-slate-400 bg-[#121024] p-2.5 rounded-lg border border-violet-500/10 mt-2">
                      {lead.notes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-violet-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 capitalize">
                    Estágio: {lead.stage}
                  </span>
                  <button
                    onClick={() => {
                      livingAudio.play('command_sent');
                      // Move lead into custom project
                      const newProj: CustomProject = {
                        id: `proj_${Date.now()}`,
                        clientName: lead.name,
                        companyName: lead.companyId || lead.name,
                        serviceCategory: 'Plataforma Web',
                        stage: 'Proposta',
                        progress: 40,
                        contractValue: lead.value || 30000,
                        deliveryDate: 'A definir',
                        assignedAgents: ['LEAD', 'SALES'],
                        deliverables: [
                          { title: 'Reunião de Diagnóstico Realizada', done: true },
                          { title: 'Contrato Formal Enviado', done: false }
                        ]
                      };
                      setProjects(prev => [newProj, ...prev]);
                      setActiveTab('pipeline');
                    }}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Converter em Projeto Ativo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Custom Enterprise Project */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 bg-[#17142B] border border-violet-500/30 rounded-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-violet-500/20">
              <h3 className="text-base font-cinzel font-bold text-white">
                Cadastrar Novo Projeto Digital
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Nome da Empresa / Cliente:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grupo Alpha Holding"
                  value={newProjectForm.companyName}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-violet-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Responsável / Decisor:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo"
                  value={newProjectForm.clientName}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-violet-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Categoria de Solução:
                </label>
                <select
                  value={newProjectForm.serviceCategory}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, serviceCategory: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-violet-500/30 rounded-lg text-xs text-white cursor-pointer"
                >
                  <option value="App Mobile">App Mobile (iOS / Android)</option>
                  <option value="ERP Corporativo">ERP Corporativo & Gestão</option>
                  <option value="Plataforma Web">Plataforma Web & SaaS</option>
                  <option value="Motor Pix & Fintech">Motor Pix & Fintech</option>
                  <option value="Automação B2B">Automação de Processos</option>
                  <option value="IA & Agentes">IA & Rede de Agentes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Valor Total do Contrato (R$):
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={newProjectForm.contractValue}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, contractValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-violet-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Data de Entrega Estimada:
                </label>
                <input
                  type="text"
                  placeholder="Ex: 30/06/2026"
                  value={newProjectForm.deliveryDate}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-violet-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-violet-500/20">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-[#1D1835] text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Criar Projeto Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
