import React, { useState } from 'react';
import { 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  Server, 
  Globe, 
  DollarSign, 
  Workflow, 
  Bot, 
  Shield, 
  Send, 
  Sliders, 
  Lock,
  ChevronRight,
  TrendingUp,
  Activity,
  Terminal,
  Radio
} from 'lucide-react';
import { SystemStats, AutonomousAgent, PlanDefinition, User } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { livingAudio } from '../../services/livingAudio.ts';

interface StudioLandingPageProps {
  onEnterObservatory: () => void;
  onNavigateToDigital: () => void;
  onNavigateToLabs: () => void;
  onNavigateToAgents: () => void;
  onOpenMasterPanel: () => void;
  onOpenAuthModal: () => void;
  currentUser: User | null;
  stats: SystemStats | null;
  agents: AutonomousAgent[];
  plans: PlanDefinition[];
  onSelectPlanForCheckout?: (plan: PlanDefinition) => void;
}

export const StudioLandingPage: React.FC<StudioLandingPageProps> = ({
  onEnterObservatory,
  onNavigateToDigital,
  onNavigateToLabs,
  onNavigateToAgents,
  onOpenMasterPanel,
  onOpenAuthModal,
  currentUser,
  stats,
  agents,
  plans,
  onSelectPlanForCheckout
}) => {
  // Quote proposal calculator state
  const [selectedService, setSelectedService] = useState<'app' | 'enterprise' | 'web' | 'finance' | 'ai' | 'automation'>('ai');
  const [projectUrgency, setProjectUrgency] = useState<'standard' | 'priority' | 'emergency'>('priority');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(15000);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    company: '',
    whatsapp: '',
    notes: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const digitalServices = [
    {
      id: 'app',
      icon: Smartphone,
      title: 'Aplicativos Nativos & Mobile',
      tagline: 'iOS & Android com fluidez cinematográfica',
      desc: 'Desenvolvimento mobile de alto padrão com arquitetura reativa, performance nativa e sincronização offline-first.',
      basePrice: 'A partir de R$ 18.000'
    },
    {
      id: 'enterprise',
      icon: Server,
      title: 'Sistemas Corporativos & ERPs',
      tagline: 'Infraestrutura central para empresas complexas',
      desc: 'Plataformas de gestão desenhadas sob medida para fluxos de aprovação, estoques, suprimentos e controle hierárquico.',
      basePrice: 'A partir de R$ 25.000'
    },
    {
      id: 'web',
      icon: Globe,
      title: 'Plataformas Web & Ecossistemas',
      tagline: 'Aplicações SaaS de altíssima escala',
      desc: 'Frontends sofisticados com Next.js, Vite e WebGL integrados a backends distribuídos e microsserviços resilientes.',
      basePrice: 'A partir de R$ 14.000'
    },
    {
      id: 'finance',
      icon: DollarSign,
      title: 'Sistemas Financeiros & Pix',
      tagline: 'Liquidação instantânea e conciliação bancária',
      desc: 'Integrações seguras com Banco Central, conciliação Pix automática, webhooks idempotentes e emissão fiscal.',
      basePrice: 'A partir de R$ 16.000'
    },
    {
      id: 'automation',
      icon: Workflow,
      title: 'Automações de Processos',
      tagline: 'Eliminação radical de trabalho manual',
      desc: 'Robôs de software e workflows inteligentes integrando CRM, ERP, WhatsApp, e-mail e bancos de dados.',
      basePrice: 'A partir de R$ 9.500'
    },
    {
      id: 'ai',
      icon: Bot,
      title: 'Inteligência Artificial & Agentes LLM',
      tagline: 'Agentes autônomos com memória neural',
      desc: 'Redes de agentes especializados que trabalham 24 horas por dia qualificando leads, negociando e gerando insights.',
      basePrice: 'A partir de R$ 22.000'
    }
  ];

  const proprietaryProducts = [
    {
      name: 'AYIN SALES',
      tag: 'Motor Comercial',
      desc: 'Identifica oportunidades no radar, prospecta contatos qualificados e conduz negociações B2B 24/7.',
      icon: TrendingUp
    },
    {
      name: 'AYIN CUSTOMER',
      tag: 'Sucesso & Retenção',
      desc: 'Atendimento corporativo multicanal com memória persistente de relacionamento e análise de satisfação.',
      icon: Shield
    },
    {
      name: 'AYIN FINANCE',
      tag: 'Tesouraria & Pix',
      desc: 'Gestão de fluxo de caixa, validação criptográfica de pagamentos e controle de inadimplência em tempo real.',
      icon: DollarSign
    },
    {
      name: 'AYIN CORE',
      tag: 'Cérebro Central',
      desc: 'Núcleo neural de orquestração que coordena os 11 agentes com comando de voz e observatório 3D.',
      icon: Cpu
    }
  ];

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    setIsSubmitting(true);
    livingAudio.play('command_sent');

    try {
      await api.createLead({
        name: leadForm.name,
        companyId: leadForm.company || 'comp_vertice_tech',
        email: leadForm.email,
        phone: leadForm.whatsapp,
        value: estimatedBudget,
        stage: 'Novo',
        notes: `[SOLICITAÇÃO STUDIO] Serviço: ${selectedService.toUpperCase()} | Urgência: ${projectUrgency} | Orçamento: R$ ${estimatedBudget}. Detalhes: ${leadForm.notes}`
      });

      setLeadSubmitted(true);
      livingAudio.play('complete');
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#121024] text-slate-100 min-h-screen">
      {/* 1. CINEMATIC STUDIO HERO */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-violet-500/15">
        {/* Deep ambient volumetric violet backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[400px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 text-center">
          {/* Subtle Tagline Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#17142B] border border-violet-500/30 text-xs text-violet-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest font-mono uppercase text-[11px]">
              ENGINEERING & INTELLIGENCE STUDIO · 24/7 AUTONOMOUS
            </span>
          </div>

          {/* Main Title & Brand Identity */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-cinzel font-extrabold tracking-wider text-white">
              SHEFA AYIN <span className="text-violet-400">STUDIO</span>
            </h1>
            <div className="text-sm sm:text-base font-cinzel text-amber-400/90 tracking-widest uppercase">
              עין השפע · "TECHNOLOGY. VISION. CREATION."
            </div>
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              Estúdio de tecnologia de alto padrão e inteligência artificial autônoma. 
              Desenvolvemos sistemas empresariais sob medida e operamos uma constelação 
              de <span className="text-white font-medium">11 agentes inteligentes</span> que trabalham continuamente para gerar resultados exponenciais.
            </p>
          </div>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                livingAudio.play('click');
                onEnterObservatory();
              }}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-700/30 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Eye className="w-5 h-5 text-amber-300" />
              <span>Entrar no Observatório 3D</span>
            </button>

            <a
              href="#quote-builder"
              onClick={() => livingAudio.play('click')}
              className="px-8 py-4 bg-[#17142B] hover:bg-[#1D1835] border border-violet-500/30 text-violet-200 hover:text-white font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Solicitar Projeto Sob Medida</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </a>

            {currentUser?.role === 'MASTER_OWNER' && (
              <button
                onClick={() => {
                  livingAudio.play('click');
                  onOpenMasterPanel();
                }}
                className="px-5 py-4 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Console Master Global</span>
              </button>
            )}
          </div>

          {/* Live System Telemetry Ticker */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-4 bg-[#17142B]/90 rounded-xl border border-violet-500/20 text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Agentes 24/7</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {stats?.active24hAgents || 11} / 11 Ativos
              </div>
              <span className="text-[10px] text-violet-300">Constelação autônoma</span>
            </div>

            <div className="p-4 bg-[#17142B]/90 rounded-xl border border-violet-500/20 text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Missões no Servidor</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {stats?.completedMissions || 48} Concluídas
              </div>
              <span className="text-[10px] text-slate-400">Trabalho ininterrupto</span>
            </div>

            <div className="p-4 bg-[#17142B]/90 rounded-xl border border-violet-500/20 text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Liquidação Pix</span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats?.grossRevenue || 28450)}
              </div>
              <span className="text-[10px] text-slate-400">Titular oficial validado</span>
            </div>

            <div className="p-4 bg-[#17142B]/90 rounded-xl border border-violet-500/20 text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Auditoria Criptográfica</span>
              <div className="text-xl font-bold font-mono text-violet-300 mt-0.5">
                SHA-256
              </div>
              <span className="text-[10px] text-slate-400">Imutabilidade total</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MANIFESTO & PHILOSOPHY */}
      <section className="py-20 border-b border-violet-500/15 bg-[#17142B]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 space-y-3">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase block">
                FILOSOFIA DO ESTÚDIO
              </span>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white leading-tight">
                Além do SaaS Convencional.
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-violet-500 to-amber-400 rounded-full" />
            </div>

            <div className="md:col-span-8 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              <p>
                A maioria das empresas opera sobre sistemas fragmentados: ferramentas isoladas que demandam 
                intervenção humana exaustiva para cada etapa de vendas, suporte e gestão.
              </p>
              <p>
                O <strong className="text-white font-medium">SHEFA AYIN STUDIO</strong> foi concebido para quebrar esse paradigma. 
                Combinamos engenharia de software de precisão com uma rede de agentes autônomos que não dormem, 
                não esquecem e operam continuamente em segundo plano no servidor, conectando estratégia, vendas e finanças em uma só visão soberana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHEFA AYIN DIGITAL — CUSTOM HIGH-TICKET SERVICES */}
      <section id="digital-services" className="py-24 border-b border-violet-500/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono text-violet-400 tracking-wider uppercase block">
                SHEFA AYIN DIGITAL
              </span>
              <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
                Desenvolvimento de Software Sob Medida
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl font-light">
                Do design cinematográfico à arquitetura resiliente. Criamos ativos tecnológicos de alta valorização para corporações que não aceitam mediocridade.
              </p>
            </div>

            <button
              onClick={() => {
                livingAudio.play('click');
                onNavigateToDigital();
              }}
              className="px-5 py-2.5 bg-[#17142B] hover:bg-[#1D1835] border border-violet-500/30 text-xs font-semibold text-violet-200 rounded-lg flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>Ver Pipeline de Projetos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Core Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/20 hover:border-violet-400/50 transition-all hover:-translate-y-1 space-y-4 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-amber-300 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-200 transition-colors">
                      {service.title}
                    </h3>
                    <span className="text-xs text-amber-400/90 font-medium block">
                      {service.tagline}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {service.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-violet-500/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      {service.basePrice}
                    </span>
                    <a
                      href="#quote-builder"
                      onClick={() => {
                        setSelectedService(service.id as any);
                        livingAudio.play('click');
                      }}
                      className="text-xs font-semibold text-violet-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      Simular Proposta
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SHEFA AYIN LABS — PROPRIETARY SAAS & SUBSCRIPTION PLANS */}
      <section id="labs-products" className="py-24 border-b border-violet-500/15 bg-[#17142B]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-amber-400 tracking-wider uppercase block">
              SHEFA AYIN LABS
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
              Produtos Proprietários & Planos de Assinatura
            </h2>
            <p className="text-sm text-slate-300 font-light">
              Acesso instantâneo a ecossistemas prontos de automação, vendas e inteligência operacional.
            </p>
          </div>

          {/* 4 Products Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proprietaryProducts.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="p-5 bg-[#17142B] rounded-xl border border-violet-500/20 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1D1835] border border-violet-500/30 flex items-center justify-center text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-cinzel">{p.name}</h4>
                    <span className="text-[11px] font-mono text-violet-300 uppercase">{p.tag}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 3 Authentic Subscription Plans */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold font-cinzel text-white">
                Escolha o Nível de Operação de sua Empresa
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ativação imediata via Pix com chave oficial validada e emissão de credenciais seguras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan 1: Astral Starter */}
              <div className="p-6 bg-[#17142B] rounded-2xl border border-violet-500/25 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-violet-400">Entrada</span>
                    <span className="text-xs font-cinzel text-amber-400/80">Astral</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Astral Starter</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold font-mono text-white">R$ 197</span>
                      <span className="text-xs text-slate-400 font-light">/ mês</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-light">
                    Ideal para operações em fase inicial que precisam de qualificação e suporte contínuo.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-violet-500/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até 2 Usuários autorizados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>3 Agentes essenciais (RADAR, LEAD, CUSTOMER)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>200 Missões autônomas por mês</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Integração Pix direta</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    livingAudio.play('click');
                    const plan: PlanDefinition = plans.find(p => p.tier === 'Astral Starter') || {
                      id: 'plan_starter',
                      tier: 'Astral Starter',
                      name: 'Astral Starter',
                      monthlyPrice: 197,
                      annualPrice: 1970,
                      description: 'Plano inicial de automação',
                      features: ['Até 2 Usuários', '3 Agentes essenciais', '200 Missões/mês', 'Pix automático'],
                      trialDays: 7,
                      limits: {
                        monthlyMissions: 200,
                        maxAgents: 3,
                        maxKnowledgeDocs: 20,
                        customAIPersona: false,
                        prioritySupport: false
                      }
                    };
                    if (onSelectPlanForCheckout) onSelectPlanForCheckout(plan);
                    else onNavigateToLabs();
                  }}
                  className="w-full py-3 bg-[#1D1835] hover:bg-violet-600 border border-violet-500/40 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  Contratar Astral Starter
                </button>
              </div>

              {/* Plan 2: Cosmic Growth (Featured) */}
              <div className="p-6 bg-[#1D1835] rounded-2xl border-2 border-violet-500 shadow-xl shadow-violet-900/30 flex flex-col justify-between space-y-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-amber-500 text-[10px] font-bold text-white rounded-full tracking-wider uppercase">
                  Mais Escolhido
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-violet-300">Expansão</span>
                    <span className="text-xs font-cinzel text-amber-300">Cosmic</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Cosmic Growth</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold font-mono text-white">R$ 497</span>
                      <span className="text-xs text-slate-400 font-light">/ mês</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 font-light">
                    Para empresas em escala acelerada com alta demanda comercial e fluxos de marketing.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-violet-500/20">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até 10 Usuários em equipe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>7 Agentes autônomos (inclui MARKETING & SALES)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1.000 Missões por mês no servidor</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>CRM Integrado & Relatórios Semanais</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Suporte prioritário via WhatsApp</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    livingAudio.play('click');
                    const plan: PlanDefinition = plans.find(p => p.tier === 'Cosmic Growth') || {
                      id: 'plan_growth',
                      tier: 'Cosmic Growth',
                      name: 'Cosmic Growth',
                      monthlyPrice: 497,
                      annualPrice: 4970,
                      description: 'Plano para crescimento acelerado',
                      features: ['Até 10 Usuários', '7 Agentes', '1.000 Missões/mês', 'CRM Integrado'],
                      trialDays: 7,
                      limits: {
                        monthlyMissions: 1000,
                        maxAgents: 7,
                        maxKnowledgeDocs: 100,
                        customAIPersona: true,
                        prioritySupport: true
                      }
                    };
                    if (onSelectPlanForCheckout) onSelectPlanForCheckout(plan);
                    else onNavigateToLabs();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                >
                  Contratar Cosmic Growth
                </button>
              </div>

              {/* Plan 3: Infinity Enterprise */}
              <div className="p-6 bg-[#17142B] rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-amber-400">Corporativo</span>
                    <span className="text-xs font-cinzel text-amber-300">Infinity</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Infinity Enterprise</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold font-mono text-white">R$ 1.497</span>
                      <span className="text-xs text-slate-400 font-light">/ mês</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-light">
                    Soberania total com infraestrutura isolada, todos os 11 agentes e suporte executivo.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-amber-500/15">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Usuários ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Todos os 11 Agentes liberados 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Missões e automações ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Chave Pix dedicada (Alifer Madeiro)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>SLA de resposta em até 1 hora</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    livingAudio.play('click');
                    const plan: PlanDefinition = plans.find(p => p.tier === 'Infinity Enterprise') || {
                      id: 'plan_enterprise',
                      tier: 'Infinity Enterprise',
                      name: 'Infinity Enterprise',
                      monthlyPrice: 1497,
                      annualPrice: 14970,
                      description: 'Plano corporativo ilimitado',
                      features: ['Usuários ilimitados', 'Todos os 11 Agentes', 'Missões Ilimitadas'],
                      trialDays: 7,
                      limits: {
                        monthlyMissions: 99999,
                        maxAgents: 11,
                        maxKnowledgeDocs: 9999,
                        customAIPersona: true,
                        prioritySupport: true
                      }
                    };
                    if (onSelectPlanForCheckout) onSelectPlanForCheckout(plan);
                    else onNavigateToLabs();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  Contratar Infinity Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE 11 AGENTS LIVING NETWORK PREVIEW */}
      <section className="py-24 border-b border-violet-500/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-violet-400 tracking-wider uppercase block">
                AUTONOMIA EM TEMPO REAL
              </span>
              <h2 className="text-3xl font-cinzel font-bold text-white mt-1">
                A Rede dos 11 Agentes Especializados
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cada agente possui papel estrito, fila persistente de tarefas e executa sem necessidade de navegador aberto.
              </p>
            </div>

            <button
              onClick={() => {
                livingAudio.play('click');
                onNavigateToAgents();
              }}
              className="px-4 py-2 bg-[#17142B] border border-violet-500/30 text-xs font-medium text-violet-300 rounded-lg flex items-center gap-2 hover:border-violet-400 transition-colors cursor-pointer"
            >
              <span>Gerenciar Agentes no Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 bg-[#17142B] rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-violet-300">
                    {agent.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      agent.status === 'paused' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-bold text-white font-cinzel">
                  {agent.name}
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 font-light">
                  {agent.specialty || agent.role}
                </p>

                <div className="pt-2 border-t border-violet-500/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Precisão: {agent.accuracyScore || 98}%</span>
                  <span>{agent.totalMissionsCompleted || 0} missões</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PROPOSAL BUILDER / QUOTE REQUEST */}
      <section id="quote-builder" className="py-24 border-b border-violet-500/15 bg-[#17142B]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-amber-400 tracking-wider uppercase block">
              SIMULADOR DE INVESTIMENTO
            </span>
            <h2 className="text-3xl font-cinzel font-bold text-white">
              Monte a Proposta do seu Próximo Ativo Digital
            </h2>
            <p className="text-xs text-slate-300 font-light">
              Calcule uma estimativa preliminar e receba um diagnóstico técnico detalhado do SHEFA AYIN STUDIO.
            </p>
          </div>

          <div className="p-8 bg-[#17142B] rounded-2xl border border-violet-500/30 space-y-8">
            {leadSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-cinzel text-white">
                  Proposta Registrada com Sucesso no Radar AYIN!
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto font-light">
                  Nosso agente comercial e nossa diretoria técnica analisarão os requisitos e entrarão em contato via WhatsApp/E-mail em até 2 horas úteis.
                </p>
                <button
                  onClick={() => setLeadSubmitted(false)}
                  className="px-6 py-2.5 bg-[#1D1835] border border-violet-500/40 text-xs font-semibold text-violet-200 rounded-lg hover:text-white cursor-pointer"
                >
                  Fazer Nova Simulação
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-8">
                {/* Step 1: Select Service Type */}
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-slate-400 block">
                    1. Selecione o Tipo de Solução Desejada:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {digitalServices.map((srv) => (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv.id as any);
                          livingAudio.play('click');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedService === srv.id
                            ? 'bg-violet-600/30 border-violet-400 text-white shadow-md'
                            : 'bg-[#1D1835] border-violet-500/20 text-slate-300 hover:border-violet-500/40'
                        }`}
                      >
                        <span className="text-xs font-bold block">{srv.title}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{srv.basePrice}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Estimated Budget Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-slate-400 block">
                      2. Estimativa de Orçamento Disponível:
                    </label>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedBudget)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="2500"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>R$ 5.000</span>
                    <span>R$ 50.000</span>
                    <span>R$ 100.000+</span>
                  </div>
                </div>

                {/* Step 3: Contact Details */}
                <div className="space-y-4 pt-4 border-t border-violet-500/20">
                  <label className="text-xs font-mono uppercase text-slate-400 block">
                    3. Seus Dados de Contato para o Diagnóstico:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Seu Nome Completo *"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="px-4 py-3 bg-[#1D1835] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                    />
                    <input
                      type="email"
                      placeholder="E-mail Corporativo *"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="px-4 py-3 bg-[#1D1835] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                    />
                    <input
                      type="text"
                      placeholder="Nome da sua Empresa"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="px-4 py-3 bg-[#1D1835] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp com DDD (Ex: 11 99999-9999)"
                      value={leadForm.whatsapp}
                      onChange={(e) => setLeadForm({ ...leadForm, whatsapp: e.target.value })}
                      className="px-4 py-3 bg-[#1D1835] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Descreva brevemente seu objetivo ou as principais dores que deseja resolver..."
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1D1835] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-violet-700/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{isSubmitting ? 'Registrando no Radar...' : 'Enviar Simulação & Solicitar Diagnóstico'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 7. CINEMATIC FOOTER */}
      <footer className="py-12 border-t border-violet-500/20 bg-[#121024]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-light">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-cinzel text-sm font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <span>SHEFA AYIN STUDIO</span>
              <span className="text-amber-400 text-xs">עין השפע</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Technology. Vision. Creation. · Operação Autônoma Contínua 24/7
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => {
                livingAudio.play('click');
                onEnterObservatory();
              }}
              className="text-violet-300 hover:text-white cursor-pointer"
            >
              Observatório 3D
            </button>
            <button
              onClick={() => {
                livingAudio.play('click');
                onNavigateToDigital();
              }}
              className="text-violet-300 hover:text-white cursor-pointer"
            >
              Projetos Digitais
            </button>
            <button
              onClick={() => {
                livingAudio.play('click');
                onNavigateToLabs();
              }}
              className="text-violet-300 hover:text-white cursor-pointer"
            >
              Labs & SaaS
            </button>
            <button
              onClick={() => {
                livingAudio.play('click');
                onOpenAuthModal();
              }}
              className="text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Portal do Cliente / Login
            </button>
          </div>

          <div className="text-[11px] text-slate-600 text-center md:text-right font-mono">
            Chave Pix: 11973479473 (Alifer Madeiro) · SHA-256 Audit
          </div>
        </div>
      </footer>
    </div>
  );
};
