import React, { useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Company, 
  DepartmentInfo, 
  AutonomousAgent, 
  Mission, 
  Lead, 
  ProductItem, 
  FinancialRecord, 
  KnowledgeDoc, 
  AuditLog, 
  SystemStats,
  DepartmentId,
  PlanDefinition,
  Subscription,
  EngineGovernanceSettings,
  LivingCoreVisualState
} from './types/index.ts';
import { api } from './services/api.ts';
import { livingAudio } from './services/livingAudio.ts';
import { StudioSidebar, MainNavSection } from './components/navigation/StudioSidebar.tsx';
import { ObservatoryStudioHome } from './components/observatory/ObservatoryStudioHome.tsx';
import { Observatory3D } from './components/observatory/Observatory3D.tsx';
import { AyinCoreTerminal } from './components/AyinCoreTerminal.tsx';
import { DigitalStudioView } from './components/departments/DigitalStudioView.tsx';
import { SubscriptionEngineView } from './components/business/SubscriptionEngineView.tsx';
import { ProjectsManagementView } from './components/projects/ProjectsManagementView.tsx';
import { ClientPortalView } from './components/client/ClientPortalView.tsx';
import { CommercialCrmView } from './components/commercial/CommercialCrmView.tsx';
import { FinanceView } from './components/finance/FinanceView.tsx';
import { AgentsHubView } from './components/departments/AgentsHubView.tsx';
import { CreativeStudioView } from './components/creative/CreativeStudioView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { MasterOwnerPanel } from './components/admin/MasterOwnerPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { 
  Menu, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Power, 
  Maximize2, 
  Minimize2, 
  Activity,
  Layers,
  ChevronRight,
  Cpu
} from 'lucide-react';

export default function App() {
  // Navigation & Active Section
  const [currentSection, setCurrentSection] = useState<MainNavSection>('OBSERVATORY');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [show3DObservatory, setShow3DObservatory] = useState(false);
  const [isTotalFocus, setIsTotalFocus] = useState(false);
  const [isMasterPanelOpen, setIsMasterPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [agents, setAgents] = useState<AutonomousAgent[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [governance, setGovernance] = useState<EngineGovernanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Authentication (Transparently logs in as Master Owner if not yet authenticated)
  const fetchAuth = useCallback(async () => {
    try {
      const res = await api.getMe();
      setCurrentUser(res.user);
      if (res.company) setCurrentCompany(res.company);
    } catch {
      try {
        const loginRes = await api.login('Alifermadeiro@hotmail.com', 'ShefaAyin2026!');
        setCurrentUser(loginRes.user);
      } catch (err) {
        console.warn('Auto-auth warning:', err);
      }
    }
  }, []);

  // Primary Data Loading
  const loadAllData = useCallback(async () => {
    try {
      const [
        deptsRes,
        agentsRes,
        missionsRes,
        leadsRes,
        productsRes,
        financesRes,
        knowledgeRes,
        statsRes,
        plansRes,
        subsRes,
        govRes,
        compsRes
      ] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getAgents().catch(() => []),
        api.getMissions().catch(() => []),
        api.getLeads().catch(() => []),
        api.getProducts().catch(() => []),
        api.getFinances().catch(() => []),
        api.getKnowledge().catch(() => []),
        api.getSystemStats().catch(() => null),
        api.getPlans().catch(() => []),
        api.getSubscriptions().catch(() => []),
        api.getGovernance().catch(() => null),
        api.getCompanies().catch(() => [])
      ]);

      setDepartments(deptsRes);
      setAgents(agentsRes);
      setMissions(missionsRes);
      setLeads(leadsRes);
      setProducts(productsRes);
      setFinances(financesRes);
      setKnowledge(knowledgeRes);
      setStats(statsRes);
      setPlans(plansRes);
      setSubscriptions(subsRes);
      setGovernance(govRes);
      setCompanies(compsRes);
      if (compsRes.length > 0 && !currentCompany) {
        setCurrentCompany(compsRes[0]);
      }

      try {
        const auditRes = await api.getAuditLogs();
        setAuditLogs(auditRes);
      } catch {}
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  useEffect(() => {
    fetchAuth().then(() => {
      loadAllData();
    });
  }, [fetchAuth, loadAllData]);

  // Periodic polling for continuous 24/7 background telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      loadAllData();
    }, 8000);
    return () => clearInterval(timer);
  }, [loadAllData]);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Compute 10 Authentic Visual States for Three.js Neural Core
  const computeLivingState = (): LivingCoreVisualState => {
    if (stats?.isEmergencyPaused || governance?.isEmergencyPaused) return 'PAUSADO';
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'DESCONECTADO';
    if (missions.some(m => m.status === 'awaiting_approval')) return 'AGUARDANDO_APROVACAO';
    if (missions.some(m => m.status === 'in_progress')) return 'EXECUTANDO';
    if (agents.some(a => a.status === 'analyzing')) return 'ANALISANDO';
    if (isLoading) return 'INICIALIZANDO';
    return 'ONLINE';
  };

  const livingState = computeLivingState();

  const handleSelectSection = (section: MainNavSection) => {
    if (section === 'MASTER_OWNER') {
      setIsMasterPanelOpen(true);
    } else {
      setCurrentSection(section);
      setShow3DObservatory(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121024] text-slate-100 flex font-sans selection:bg-[#8B5CF6]/40 selection:text-white">
      {/* 1. PREMIUM SIDEBAR MENU (12 SECTIONS) */}
      {!isTotalFocus && (
        <StudioSidebar
          currentSection={currentSection}
          onSelectSection={handleSelectSection}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpenMobile={isSidebarMobileOpen}
          onToggleMobile={() => setIsSidebarMobileOpen(prev => !prev)}
        />
      )}

      {/* 2. MAIN WORKSPACE CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all ${!isTotalFocus ? 'lg:pl-72' : ''}`}>
        {/* Global Top Navbar */}
        {!isTotalFocus && (
          <header className="sticky top-0 z-30 h-16 bg-[#17142B]/90 backdrop-blur-md border-b border-[#8B5CF6]/20 px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarMobileOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">SHEFA AYIN STUDIO</span>
                <span className="text-[#8B5CF6]">/</span>
                <span className="text-white font-bold">{currentSection.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3">
              {currentSection === 'OBSERVATORY' && (
                <button
                  onClick={() => {
                    livingAudio.playTone('click');
                    setShow3DObservatory(prev => !prev);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1D1835] hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 text-[#A78BFA] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{show3DObservatory ? 'Visão Painel' : 'Visão 3D Neural'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  livingAudio.playTone('click');
                  setIsTotalFocus(prev => !prev);
                }}
                title="Modo Foco Total"
                className="p-2 rounded-lg bg-[#1D1835] hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/25 text-[#A78BFA] hover:text-white transition-colors cursor-pointer"
              >
                {isTotalFocus ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {currentUser?.role === 'MASTER_OWNER' && (
                <button
                  onClick={() => {
                    livingAudio.playTone('click');
                    setIsMasterPanelOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Master Owner</span>
                </button>
              )}
            </div>
          </header>
        )}

        {/* Global Emergency Banner if System is Paused */}
        {(stats?.isEmergencyPaused || governance?.isEmergencyPaused) && (
          <div className="m-4 p-4 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <Power className="w-5 h-5 text-rose-400 animate-pulse" />
              <div>
                <strong className="text-white block">PAUSA GERAL DE EMERGÊNCIA ATIVA</strong>
                <span>Todos os loops autônomos e cobranças estão suspensos no servidor pelo Master Owner.</span>
              </div>
            </div>
            <button
              onClick={() => setIsMasterPanelOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Gerenciar
            </button>
          </div>
        )}

        {/* Dynamic Section Renderer */}
        <main className={`flex-1 p-4 sm:p-8 ${isTotalFocus ? 'max-w-none p-0' : 'max-w-7xl w-full mx-auto'}`}>
          {/* 1. OBSERVATORY: The New Flagship Home Page */}
          {currentSection === 'OBSERVATORY' && (
            show3DObservatory ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="text-sm font-cinzel font-bold text-white">Observatório Tridimensional AYIN CORE</h3>
                  <button
                    onClick={() => setShow3DObservatory(false)}
                    className="text-xs text-[#A78BFA] hover:text-white cursor-pointer"
                  >
                    Voltar ao Painel Geral
                  </button>
                </div>
                <Observatory3D
                  departments={departments}
                  agents={agents}
                  missions={missions}
                  livingState={livingState}
                  selectedDepartmentId="AYIN_RADAR"
                  onSelectDepartment={() => {}}
                  onSelectAgent={() => {}}
                  onFocusCore={() => setCurrentSection('AI_CORE')}
                  isTotalFocus={isTotalFocus}
                  onToggleTotalFocus={() => setIsTotalFocus(prev => !prev)}
                  onSendCommand={async (cmd: string) => {
                    await api.sendCommand(cmd);
                    loadAllData();
                  }}
                  currentUser={currentUser}
                  onToggleAgentPause={async (id: string) => {
                    await api.toggleAgentPause(id);
                    loadAllData();
                  }}
                  onTriggerKillSwitch={async () => {
                    await api.toggleEmergencyPause();
                    loadAllData();
                  }}
                />
              </div>
            ) : (
              <ObservatoryStudioHome
                currentUser={currentUser}
                companies={companies}
                departments={departments}
                agents={agents}
                missions={missions}
                leads={leads}
                products={products}
                finances={finances}
                stats={stats}
                plans={plans}
                onNavigateSection={handleSelectSection}
                onRefreshData={loadAllData}
                onOpenMasterPanel={() => setIsMasterPanelOpen(true)}
              />
            )
          )}

          {/* 2. DIGITAL: Desenvolvimento de Sistemas para Clientes */}
          {currentSection === 'DIGITAL' && (
            <DigitalStudioView
              currentUser={currentUser}
              leads={leads}
              onRefreshData={loadAllData}
            />
          )}

          {/* 3. LABS: Produtos Próprios & Assinaturas */}
          {currentSection === 'LABS' && (
            <SubscriptionEngineView
              plans={plans}
              subscriptions={subscriptions}
              currentUser={currentUser}
              onRefreshData={loadAllData}
            />
          )}

          {/* 4. PROJECTS: Gerenciamento de Projetos */}
          {currentSection === 'PROJECTS' && (
            <ProjectsManagementView />
          )}

          {/* 5. CLIENTS: Cadastro e Relacionamento com Clientes */}
          {currentSection === 'CLIENTS' && (
            <ClientPortalView
              companies={companies}
              currentUser={currentUser}
              currentCompany={currentCompany}
              onSelectCompany={setCurrentCompany}
              leads={leads}
              knowledge={knowledge}
              onRefreshData={loadAllData}
            />
          )}

          {/* 6. COMMERCIAL: Leads, Propostas e Vendas */}
          {currentSection === 'COMMERCIAL' && (
            <CommercialCrmView
              leads={leads}
              onRefreshData={loadAllData}
            />
          )}

          {/* 7. FINANCE: Receitas e Despesas */}
          {currentSection === 'FINANCE' && (
            <FinanceView
              finances={finances}
              stats={stats}
              onRefreshData={loadAllData}
            />
          )}

          {/* 8. AI CORE: Núcleo de Inteligência AYIN CORE Preservado */}
          {currentSection === 'AI_CORE' && (
            <AyinCoreTerminal
              currentUser={currentUser}
              missions={missions}
              onMissionCreated={(newMission) => {
                setMissions(prev => [newMission, ...prev]);
                loadAllData();
              }}
              onSelectDepartment={() => {}}
            />
          )}

          {/* 9. AI AGENTS: Gerenciamento dos 11 Agentes */}
          {currentSection === 'AI_AGENTS' && (
            <AgentsHubView
              agents={agents}
              missions={missions}
              currentUser={currentUser}
              onRefreshData={loadAllData}
            />
          )}

          {/* 10. CREATIVE STUDIO: Criação & Identidade Visual */}
          {currentSection === 'CREATIVE_STUDIO' && (
            <CreativeStudioView />
          )}

          {/* 11. SETTINGS: Configurações */}
          {currentSection === 'SETTINGS' && (
            <SettingsView
              governance={governance}
              onRefreshData={loadAllData}
            />
          )}
        </main>
      </div>

      {/* MASTER OWNER CONSOLE MODAL */}
      {isMasterPanelOpen && (
        <MasterOwnerPanel
          currentUser={currentUser}
          missions={missions}
          companies={companies}
          auditLogs={auditLogs}
          agents={agents}
          stats={stats}
          onRefreshData={loadAllData}
          onClose={() => setIsMasterPanelOpen(false)}
        />
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadAllData();
        }}
      />
    </div>
  );
}
