import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Send, 
  Search, 
  Filter, 
  DollarSign, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Lead } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface CommercialCrmViewProps {
  leads: Lead[];
  onRefreshData: () => void;
}

export const CommercialCrmView: React.FC<CommercialCrmViewProps> = ({ leads, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'funnel' | 'leads' | 'partners'>('funnel');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    companyId: '',
    email: '',
    phone: '',
    value: 25000,
    stage: 'Novo' as Lead['stage'],
    notes: ''
  });

  const stages: Lead['stage'][] = ['Novo', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'];

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) return;

    try {
      livingAudio.playTone('command_sent');
      await api.createLead({
        name: newLead.name,
        companyId: newLead.companyId || 'Lead Corporativo',
        email: newLead.email,
        phone: newLead.phone,
        value: Number(newLead.value),
        stage: newLead.stage,
        notes: newLead.notes
      });
      setIsNewLeadOpen(false);
      setNewLead({ name: '', companyId: '', email: '', phone: '', value: 25000, stage: 'Novo', notes: '' });
      livingAudio.playTone('complete');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const advanceLeadStage = async (lead: Lead) => {
    const curIdx = stages.indexOf(lead.stage);
    if (curIdx < stages.length - 1) {
      const nextStage = stages[curIdx + 1];
      livingAudio.playTone('command_sent');
      try {
        await api.updateLead(lead.id, { stage: nextStage });
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-amber-400 shadow">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                COMMERCIAL · CRM & FUNIL DE VENDAS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                PROSPECÇÃO ATIVA 24/7
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Gestão de leads corporativos, propostas de alto valor, negociações assistidas por IA e comissões.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-300 bg-[#1D1835] px-3.5 py-2 rounded-xl border border-[#8B5CF6]/20">
            Pipeline: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalPipelineValue)}
          </span>
          <button
            onClick={() => {
              livingAudio.playTone('click');
              setIsNewLeadOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('funnel')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'funnel' ? 'bg-[#1D1835] text-white border border-[#8B5CF6]/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Funil de Estágios ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'leads' ? 'bg-[#1D1835] text-white border border-[#8B5CF6]/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lista de Leads
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#17142B] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      </div>

      {/* FUNNEL VIEW */}
      {activeTab === 'funnel' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            const stageTotal = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);

            return (
              <div
                key={stage}
                className="p-4 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/20 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#8B5CF6]/15">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {stage}
                    </span>
                    <span className="text-[10px] font-mono text-[#A78BFA] bg-[#1D1835] px-1.5 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-amber-300 block pt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stageTotal)}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[300px]">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-500 italic">
                      Nenhum lead nesta etapa
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3.5 bg-[#1D1835] rounded-xl border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 transition-all space-y-2 shadow"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-white text-xs truncate">
                            {lead.companyId || lead.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.value)}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300">
                          <div>{lead.name}</div>
                          <div className="text-slate-500 truncate">{lead.email}</div>
                        </div>

                        {lead.stage !== 'Fechado' && (
                          <button
                            onClick={() => advanceLeadStage(lead)}
                            className="w-full py-1 text-[10px] font-semibold text-[#A78BFA] hover:text-white bg-[#121024] hover:bg-[#8B5CF6]/20 rounded border border-[#8B5CF6]/20 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Avançar Estágio</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {activeTab === 'leads' && (
        <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/20 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-[#8B5CF6]/20 pb-2">
              <tr>
                <th className="p-3">Empresa / Lead</th>
                <th className="p-3">Decisor</th>
                <th className="p-3">Valor Estimado</th>
                <th className="p-3">Estágio</th>
                <th className="p-3">Agente Responsável</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B5CF6]/10">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#1D1835]/60 transition-colors">
                  <td className="p-3 font-bold text-white">{lead.companyId || 'Cliente Direto'}</td>
                  <td className="p-3">{lead.name} <span className="text-slate-500 block text-[10px]">{lead.email}</span></td>
                  <td className="p-3 font-mono text-amber-300 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.value)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1D1835] text-[#A78BFA] border border-[#8B5CF6]/30">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[10px]">{lead.assignedAgent || 'Ayin Sales Hunter'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => advanceLeadStage(lead)}
                      className="px-2.5 py-1 text-[11px] bg-[#1D1835] hover:bg-[#8B5CF6]/30 text-[#A78BFA] rounded border border-[#8B5CF6]/20 cursor-pointer"
                    >
                      Avançar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Lead */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-[#17142B] border border-[#8B5CF6]/40 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-base font-cinzel font-bold text-white">Adicionar Oportunidade Comercial</h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Decisor:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Andrade"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome da Empresa:</label>
                <input
                  type="text"
                  placeholder="Ex: Grupo Omega Log"
                  value={newLead.companyId}
                  onChange={(e) => setNewLead({ ...newLead, companyId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail Corporativo:</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@empresa.com.br"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor da Proposta (R$):</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#8B5CF6]/20">
                <button
                  type="button"
                  onClick={() => setIsNewLeadOpen(false)}
                  className="px-4 py-2 bg-[#1D1835] text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B5CF6] hover:bg-violet-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
