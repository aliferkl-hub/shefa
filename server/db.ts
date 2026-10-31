import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  Company, 
  AutonomousAgent, 
  Mission, 
  KnowledgeDoc, 
  Lead, 
  ProductItem, 
  Order,
  Subscription,
  PlanDefinition,
  PixCharge,
  CommissionRecord,
  EngineGovernanceSettings,
  FinancialRecord, 
  AuditLog 
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'shefa_db.json');

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  agents: AutonomousAgent[];
  missions: Mission[];
  knowledge: KnowledgeDoc[];
  leads: Lead[];
  products: ProductItem[];
  orders: Order[];
  subscriptions: Subscription[];
  plans: PlanDefinition[];
  pixCharges: PixCharge[];
  commissions: CommissionRecord[];
  governance: EngineGovernanceSettings;
  finances: FinancialRecord[];
  auditLogs: AuditLog[];
  sessions: { token: string; userId: string; expiresAt: string }[];
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, generatedSalt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: generatedSalt
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}

export const INITIAL_PLANS: PlanDefinition[] = [
  {
    id: 'plan_astral_starter',
    tier: 'Astral Starter',
    name: 'SHEFA ASTRAL · Start',
    monthlyPrice: 1990,
    annualPrice: 19900,
    description: 'Central de IA autônoma para negócios em aceleração e estruturação de canais comerciais.',
    features: [
      'Núcleo AYIN CORE integrado',
      'Até 3 agentes autônomos simultâneos',
      '150 missões estratégicas/mês',
      'Funil de vendas e qualificação de leads',
      'Base de conhecimento privativa (até 15 docs)',
      'Recebimento e gestão de cobranças Pix'
    ],
    trialDays: 7,
    limits: {
      monthlyMissions: 150,
      maxAgents: 3,
      maxKnowledgeDocs: 15,
      customAIPersona: false,
      prioritySupport: false
    }
  },
  {
    id: 'plan_cosmic_growth',
    tier: 'Cosmic Growth',
    name: 'SHEFA COSMIC · Growth',
    monthlyPrice: 4990,
    annualPrice: 49900,
    description: 'Operação autônoma contínua 24h para empresas consolidadas com múltiplos canais e agentes dedicados.',
    features: [
      'Núcleo AYIN CORE com prioridade alta',
      'Até 8 agentes especializados 24/7',
      '500 missões estratégicas/mês',
      'Assistente de IA dedicado com persona própria',
      'Automação completa de propostas e follow-up',
      'Base de conhecimento privativa (até 50 docs)',
      'Conciliação Pix automatizada via webhook'
    ],
    trialDays: 7,
    limits: {
      monthlyMissions: 500,
      maxAgents: 8,
      maxKnowledgeDocs: 50,
      customAIPersona: true,
      prioritySupport: false
    }
  },
  {
    id: 'plan_infinity_enterprise',
    tier: 'Infinity Enterprise',
    name: 'SHEFA INFINITY · Enterprise',
    monthlyPrice: 14900,
    annualPrice: 149000,
    description: 'Soberania corporativa total, rede ilimitada de agentes, alta autonomia e suporte consultivo 24/7.',
    features: [
      'Acesso total à constelação com 11 agentes',
      'Capacidade de missões ilimitadas (3.000+/mês)',
      'Blindagem LGPD & Isolamento físico-lógico',
      'Módulo 24/7 autônomo ininterrupto no servidor',
      'Aprovações do Master Owner com travas personalizadas',
      'Comissionamento dinâmico de afiliados e parceiros',
      'Suporte prioritário sob demanda e consultoria tática'
    ],
    trialDays: 14,
    limits: {
      monthlyMissions: 3000,
      maxAgents: 15,
      maxKnowledgeDocs: 200,
      customAIPersona: true,
      prioritySupport: true
    }
  }
];

function getInitialData(): DatabaseSchema {
  const masterAuth = hashPassword('ShefaAyin2026!');
  const clientAuth = hashPassword('Empresa@2026');

  const masterUser: User = {
    id: 'user_master_owner',
    email: 'Alifermadeiro@hotmail.com',
    name: 'Alifer Madeiro (Master Owner)',
    role: 'MASTER_OWNER',
    passwordHash: masterAuth.hash,
    salt: masterAuth.salt,
    createdAt: new Date().toISOString()
  };

  const clientUser: User = {
    id: 'user_client_vertice',
    email: 'contato@verticecorp.com.br',
    name: 'Diretoria Vértice',
    role: 'COMPANY_ADMIN',
    companyId: 'comp_vertice_tech',
    passwordHash: clientAuth.hash,
    salt: clientAuth.salt,
    createdAt: new Date().toISOString()
  };

  const clientUser2: User = {
    id: 'user_client_aurora',
    email: 'gestao@aurorabusiness.com',
    name: 'Gestão Aurora',
    role: 'COMPANY_ADMIN',
    companyId: 'comp_aurora_sa',
    passwordHash: clientAuth.hash,
    salt: clientAuth.salt,
    createdAt: new Date().toISOString()
  };

  const companies: Company[] = [
    {
      id: 'comp_vertice_tech',
      name: 'Vértice Tech Global',
      tradeName: 'Vértice Sistemas Inteligentes',
      cnpjOrTaxId: '42.891.023/0001-94',
      plan: 'Infinity Enterprise',
      status: 'active',
      createdAt: '2026-01-15T09:00:00Z',
      subscriptionId: 'sub_vertice_001',
      aiPersona: {
        assistantName: 'Ayin Vértice',
        tone: 'Consultivo, corporativo e analítico',
        welcomeMessage: 'Bem-vindo à Vértice Tech. Sou a inteligência dedicada às suas operações.',
        instructions: 'Focar na automação de processos B2B e expansão da receita com clientes corporativos.'
      },
      quotas: {
        monthlyMissions: 3000,
        usedMissions: 142,
        maxAgents: 15,
        maxKnowledgeDocs: 200
      }
    },
    {
      id: 'comp_aurora_sa',
      name: 'Grupo Aurora Logística & Varejo',
      tradeName: 'Aurora Express',
      cnpjOrTaxId: '18.345.678/0001-12',
      plan: 'Cosmic Growth',
      status: 'active',
      createdAt: '2026-03-10T14:30:00Z',
      subscriptionId: 'sub_aurora_002',
      aiPersona: {
        assistantName: 'Ayin Aurora',
        tone: 'Ágil, comercial e focado em logística e entregas',
        welcomeMessage: 'Olá! Sou o assistente de inteligência de frotas e distribuição da Aurora.',
        instructions: 'Otimizar taxas de conversão de fretes e renegociação com transportadoras parceiras.'
      },
      quotas: {
        monthlyMissions: 500,
        usedMissions: 88,
        maxAgents: 8,
        maxKnowledgeDocs: 50
      }
    }
  ];

  const subscriptions: Subscription[] = [
    {
      id: 'sub_vertice_001',
      companyId: 'comp_vertice_tech',
      companyName: 'Vértice Tech Global',
      customerEmail: 'contato@verticecorp.com.br',
      planTier: 'Infinity Enterprise',
      billingCycle: 'annual',
      status: 'ACTIVE',
      price: 149000,
      startDate: '2026-01-15T00:00:00Z',
      expiresAt: '2027-01-15T00:00:00Z',
      autoRenew: true,
      featuresUnlocked: [
        'Constelação total 11 agentes',
        'Missões ilimitadas',
        'Conciliação Pix 24/7',
        'Blindagem dedicada'
      ],
      lastPaymentConfirmedAt: '2026-01-15T10:00:00Z'
    },
    {
      id: 'sub_aurora_002',
      companyId: 'comp_aurora_sa',
      companyName: 'Grupo Aurora Logística & Varejo',
      customerEmail: 'gestao@aurorabusiness.com',
      planTier: 'Cosmic Growth',
      billingCycle: 'monthly',
      status: 'ACTIVE',
      price: 4990,
      startDate: '2026-10-10T00:00:00Z',
      expiresAt: '2026-11-10T00:00:00Z',
      autoRenew: true,
      featuresUnlocked: [
        'Até 8 agentes 24/7',
        '500 missões/mês',
        'Conciliação Pix automática'
      ],
      lastPaymentConfirmedAt: '2026-10-10T14:30:00Z'
    }
  ];

  // The 11 Autonomous Integrated Agents Network (Section 3 of Master Command)
  const agents: AutonomousAgent[] = [
    {
      id: 'agent_radar_01',
      companyId: 'global',
      name: 'Radar Sentinel',
      hebrewCodename: 'צופה (Tzofeh)',
      departmentId: 'AYIN_RADAR',
      agentRoleType: 'RADAR AGENT',
      role: 'Varredura Contínua de Oportunidades',
      specialty: 'Mapeamento de empresas corporativas com demanda para soluções da SHEFA AYIN',
      autonomyLevel: 'autonomous_safe',
      status: 'analyzing',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 341,
      accuracyScore: 98,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_lead_02',
      companyId: 'global',
      name: 'Lead Organizer',
      hebrewCodename: 'שומר (Shoer)',
      departmentId: 'AYIN_SALES',
      agentRoleType: 'LEAD AGENT',
      role: 'Qualificação & Estruturação de Contatos',
      specialty: 'Segmentação de leads corporativos, enriquecimento de dados e pontuação de fit',
      autonomyLevel: 'autonomous_safe',
      status: 'running',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 452,
      accuracyScore: 97,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_sales_03',
      companyId: 'global',
      name: 'Sales Negotiator',
      hebrewCodename: 'נושא (Noseh)',
      departmentId: 'AYIN_SALES',
      agentRoleType: 'SALES AGENT',
      role: 'Apresentação de Ofertas & Fechamento',
      specialty: 'Condução de negociações dentro dos limites autorizados e elaboração de propostas',
      autonomyLevel: 'autonomous_safe',
      status: 'running',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 520,
      accuracyScore: 97,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_customer_04',
      companyId: 'global',
      name: 'Customer Concierge 24/7',
      hebrewCodename: 'עוזר (Ozer)',
      departmentId: 'AYIN_AGENTS',
      agentRoleType: 'CUSTOMER AGENT',
      role: 'Atendimento & Suporte Contínuo',
      specialty: 'Tira-dúvidas 24h, orientação de planos, checkout Pix e suporte consultivo',
      autonomyLevel: 'full_autonomous',
      status: 'running',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 885,
      accuracyScore: 99,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_marketing_05',
      companyId: 'global',
      name: 'Marketing Herald',
      hebrewCodename: 'מבשר (Mevaser)',
      departmentId: 'AYIN_CREATIVE',
      agentRoleType: 'MARKETING AGENT',
      role: 'Planejamento de Campanhas & Ativação',
      specialty: 'Estratégias de conteúdo de atração e acompanhamento de métricas de alcance',
      autonomyLevel: 'autonomous_safe',
      status: 'idle',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 290,
      accuracyScore: 95,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_creative_06',
      companyId: 'global',
      name: 'Creative Scribe',
      hebrewCodename: 'סופר (Sofer)',
      departmentId: 'AYIN_CREATIVE',
      agentRoleType: 'CREATIVE AGENT',
      role: 'Produção de Propostas & Copywriting',
      specialty: 'Copywriting de alta persuasão, pitches comerciais e materiais de divulgação',
      autonomyLevel: 'autonomous_safe',
      status: 'idle',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 412,
      accuracyScore: 96,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_market_07',
      companyId: 'global',
      name: 'Market Intelligence Scout',
      hebrewCodename: 'סוחר (Socher)',
      departmentId: 'AYIN_MARKET',
      agentRoleType: 'MARKET AGENT',
      role: 'Monitoramento de Concorrência & Tendências',
      specialty: 'Acompanhamento de precificação concorrencial e oportunidades de arbitragem',
      autonomyLevel: 'supervised',
      status: 'idle',
      is24hEnabled: false,
      isManuallyPaused: false,
      totalMissionsCompleted: 145,
      accuracyScore: 94,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_finance_08',
      companyId: 'global',
      name: 'Finance Custodian',
      hebrewCodename: 'גזבר (Gizbar)',
      departmentId: 'AYIN_FINANCE',
      agentRoleType: 'FINANCE AGENT',
      role: 'Auditoria de Receitas & Despesas',
      specialty: 'Acompanhamento de pagamentos Pix, liquidações, comissões e proteção de margem',
      autonomyLevel: 'supervised',
      status: 'idle',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 388,
      accuracyScore: 100,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_sub_09',
      companyId: 'global',
      name: 'Subscription Warden',
      hebrewCodename: 'נציב (Natsiv)',
      departmentId: 'AYIN_FINANCE',
      agentRoleType: 'SUBSCRIPTION AGENT',
      role: 'Gestão de Assinaturas & Acessos',
      specialty: 'Ativação imediata pós-Pix, controle de vencimentos, trials e cotas de uso',
      autonomyLevel: 'autonomous_safe',
      status: 'running',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 610,
      accuracyScore: 99,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_analytics_10',
      companyId: 'global',
      name: 'Analytics Strategist',
      hebrewCodename: 'חכם (Chacham)',
      departmentId: 'AYIN_STRATEGY',
      agentRoleType: 'ANALYTICS AGENT',
      role: 'Otimização Comercial & Operacional',
      specialty: 'Identificação de melhorias no funil de conversão e eficiência dos agentes',
      autonomyLevel: 'full_autonomous',
      status: 'running',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 672,
      accuracyScore: 99,
      lastActive: new Date().toISOString()
    },
    {
      id: 'agent_report_11',
      companyId: 'global',
      name: 'Report Chronicler',
      hebrewCodename: 'מזכיר (Mazkir)',
      departmentId: 'AYIN_INTELLIGENCE',
      agentRoleType: 'REPORT AGENT',
      role: 'Geração de Relatórios Executivos',
      specialty: 'Consolidação de relatórios executivos para o Master Owner com visão 360°',
      autonomyLevel: 'autonomous_safe',
      status: 'idle',
      is24hEnabled: true,
      isManuallyPaused: false,
      totalMissionsCompleted: 430,
      accuracyScore: 98,
      lastActive: new Date().toISOString()
    }
  ];

  const missions: Mission[] = [
    {
      id: 'mis_001_market_radar',
      companyId: 'global',
      creatorEmail: 'Alifermadeiro@hotmail.com',
      title: 'Mapeamento Global de Inteligências Verticais 2026',
      objective: 'Identificar movimentos de concorrentes no setor de IA corporativa e mapear oportunidades de consolidação.',
      priority: 'high',
      status: 'completed',
      departmentsInvolved: ['AYIN_RADAR', 'AYIN_STRATEGY'],
      steps: [
        {
          id: 'step_1',
          title: 'Varredura de 14 plataformas corporativas emergentes',
          departmentId: 'AYIN_RADAR',
          assignedAgentId: 'agent_radar_01',
          status: 'completed',
          result: 'Mapeadas 14 soluções. Oportunidade identificada: carência de observatórios integrados com execução 24/7 em background.'
        },
        {
          id: 'step_2',
          title: 'Elaboração da Matriz de Diferenciação Shefa',
          departmentId: 'AYIN_STRATEGY',
          assignedAgentId: 'agent_analytics_10',
          status: 'completed',
          result: 'Matriz consolidada. Destaque para governança multi-tenant e aprovações do Master Owner.'
        }
      ],
      isSensitive: false,
      executionLogs: [
        {
          timestamp: '2026-10-30T14:00:00Z',
          agentName: 'Radar Sentinel',
          message: 'Iniciada varredura de sinais de mercado via conectores autorizados.',
          type: 'info'
        },
        {
          timestamp: '2026-10-30T14:15:00Z',
          agentName: 'Analytics Strategist',
          message: 'Análise sintética concluída com 98% de precisão.',
          type: 'success'
        }
      ],
      finalReport: 'Relatório Executivo Shefa: O mercado busca plataformas de inteligência com soberania de dados e sem falsas simulações.',
      createdAt: '2026-10-30T13:50:00Z',
      updatedAt: '2026-10-30T14:20:00Z'
    }
  ];

  const knowledge: KnowledgeDoc[] = [
    {
      id: 'knd_001',
      companyId: 'global',
      title: 'Constituição Operacional SHEFA AYIN',
      category: 'policy',
      content: 'A Shefa Ayin opera sob três pilares inegociáveis: Transparência Absoluta (sem números simulados), Soberania do Master Owner (ações sensíveis exigem aprovação manual) e Isolamento Multitenant Hermético.',
      updatedAt: '2026-10-25T10:00:00Z'
    },
    {
      id: 'knd_002',
      companyId: 'comp_vertice_tech',
      title: 'Manual de Soluções e Acordos de Nível de Serviço (SLA)',
      category: 'guide',
      content: 'A Vértice Tech garante 99.9% de uptime para sistemas de missão crítica, com resposta inicial do suporte em até 15 minutos para clientes Enterprise.',
      updatedAt: '2026-10-20T12:00:00Z'
    }
  ];

  const leads: Lead[] = [
    {
      id: 'lead_101',
      companyId: 'comp_vertice_tech',
      name: 'Dra. Carolina Mendonça',
      email: 'carolina.m@inovalab.io',
      phone: '+55 (11) 98765-4321',
      source: 'Inbound Conectado',
      stage: 'Negociação',
      value: 120000,
      notes: 'Interesse em implantar agentes de automação contínua para 4 subsidiárias.',
      assignedAgent: 'Sales Negotiator',
      createdAt: '2026-10-28T11:20:00Z',
      lastContact: '2026-10-30T17:40:00Z'
    },
    {
      id: 'lead_102',
      companyId: 'comp_vertice_tech',
      name: 'Eng. Roberto Albuquerque',
      email: 'roberto@sindlog.com.br',
      phone: '+55 (21) 99123-8844',
      source: 'Radar de Oportunidades',
      stage: 'Proposta',
      value: 48000,
      notes: 'Solicitou proposta com integração de dados sensíveis e auditoria LGPD.',
      assignedAgent: 'Sales Negotiator',
      createdAt: '2026-10-29T09:15:00Z',
      lastContact: '2026-10-30T15:00:00Z'
    }
  ];

  const products: ProductItem[] = [
    {
      id: 'prod_001',
      companyId: 'global',
      title: 'SHEFA AYIN Enterprise Hub (Licença Anual)',
      category: 'Plataforma Core',
      price: 149000,
      commissionRate: 15,
      type: 'proprio',
      status: 'active'
    },
    {
      id: 'prod_002',
      companyId: 'global',
      title: 'Módulo de Operação Contínua 24h & Rede de Agentes',
      category: 'Expansão de Inteligência',
      price: 49900,
      commissionRate: 20,
      type: 'proprio',
      status: 'active'
    },
    {
      id: 'prod_003',
      companyId: 'comp_vertice_tech',
      title: 'Vértice Core API - Middleware de Alta Disponibilidade',
      category: 'Software Corporativo',
      price: 64000,
      commissionRate: 10,
      type: 'proprio',
      status: 'active'
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord_2026_01',
      companyId: 'comp_vertice_tech',
      customerName: 'Vértice Tech Global',
      customerEmail: 'contato@verticecorp.com.br',
      items: [
        {
          productId: 'prod_001',
          title: 'SHEFA AYIN Enterprise Hub (Licença Anual)',
          price: 149000,
          quantity: 1
        }
      ],
      totalAmount: 149000,
      status: 'CONFIRMED',
      paymentMethod: 'PIX',
      pixChargeId: 'pix_initial_01',
      createdAt: '2026-01-15T09:30:00Z',
      confirmedAt: '2026-01-15T10:00:00Z'
    }
  ];

  const pixCharges: PixCharge[] = [
    {
      id: 'pix_initial_01',
      orderId: 'ord_2026_01',
      companyId: 'comp_vertice_tech',
      customerName: 'Vértice Tech Global',
      customerEmail: 'contato@verticecorp.com.br',
      customerCpfOrCnpj: '42.891.023/0001-94',
      planTier: 'Infinity Enterprise',
      amount: 149000,
      pixKey: '11973479473',
      pixKeyType: 'TELEFONE CELULAR',
      recipientName: 'Alifer Madeiro',
      copyPasteCode: '00020126360014br.gov.bcb.pix0111119734794735204000053039865410149000.005802BR5914Alifer Madeiro6009SAO PAULO62110507SHEFA016304E8A2',
      status: 'CONFIRMED',
      createdAt: '2026-01-15T09:30:00Z',
      expiresAt: '2026-01-15T10:30:00Z',
      confirmedAt: '2026-01-15T10:00:00Z',
      txId: 'SHEFA01'
    }
  ];

  const commissions: CommissionRecord[] = [
    {
      id: 'com_001',
      orderId: 'ord_2026_01',
      partnerName: 'Rede de Expansão Alfa',
      partnerEmail: 'parceiros@alfaexp.com.br',
      rate: 10,
      amount: 14900,
      status: 'liquidado',
      date: '2026-01-16T00:00:00Z'
    }
  ];

  const finances: FinancialRecord[] = [
    {
      id: 'fin_001',
      companyId: 'global',
      title: 'Assinatura Anual Infinity Enterprise - Vértice Tech',
      type: 'assinatura',
      amount: 149000,
      date: '2026-01-15',
      status: 'liquidado'
    },
    {
      id: 'fin_002',
      companyId: 'global',
      title: 'Assinatura Mensal Cosmic Growth - Aurora Logística',
      type: 'assinatura',
      amount: 4990,
      date: '2026-10-10',
      status: 'liquidado'
    },
    {
      id: 'fin_003',
      companyId: 'global',
      title: 'Custo de Servidores Cloud & Cluster GPU Dedicado',
      type: 'custo',
      amount: 3200,
      date: '2026-10-25',
      status: 'liquidado'
    }
  ];

  const governance: EngineGovernanceSettings = {
    isEmergencyPaused: false,
    financialSpendingLimit: 1000,
    maxConcurrentTasks: 5,
    autoRetryCount: 3,
    pixKey: '11973479473',
    pixKeyType: 'TELEFONE CELULAR',
    masterRecipient: 'Alifer Madeiro (Master Owner)'
  };

  const genesisLog: AuditLog = {
    id: 'audit_genesis',
    timestamp: '2026-10-31T00:00:00Z',
    actorEmail: 'system@shefa-ayin.io',
    actorRole: 'MASTER_OWNER',
    action: 'INIT_BUSINESS_ENGINE',
    companyId: 'global',
    details: 'Autonomous Business Engine e módulo Pix 11973479473 inicializados.',
    hash: crypto.createHash('sha256').update('INIT_BUSINESS_ENGINE_2026').digest('hex')
  };

  return {
    users: [masterUser, clientUser, clientUser2],
    companies,
    agents,
    missions,
    knowledge,
    leads,
    products,
    orders,
    subscriptions,
    plans: INITIAL_PLANS,
    pixCharges,
    commissions,
    governance,
    finances,
    auditLogs: [genesisLog],
    sessions: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        
        // Backward-compatible schema evolution: ensure new collections exist
        const initial = getInitialData();
        this.data = {
          users: parsed.users || initial.users,
          companies: parsed.companies || initial.companies,
          agents: parsed.agents && parsed.agents.length >= 11 ? parsed.agents : initial.agents,
          missions: parsed.missions || initial.missions,
          knowledge: parsed.knowledge || initial.knowledge,
          leads: parsed.leads || initial.leads,
          products: parsed.products || initial.products,
          orders: parsed.orders || initial.orders,
          subscriptions: parsed.subscriptions || initial.subscriptions,
          plans: parsed.plans || initial.plans,
          pixCharges: parsed.pixCharges || initial.pixCharges,
          commissions: parsed.commissions || initial.commissions,
          governance: parsed.governance || initial.governance,
          finances: parsed.finances || initial.finances,
          auditLogs: parsed.auditLogs || initial.auditLogs,
          sessions: parsed.sessions || []
        };

        // Ensure Master Owner exists with Alifermadeiro@hotmail.com
        const masterExists = this.data.users.find(u => u.email.toLowerCase() === 'alifermadeiro@hotmail.com');
        if (!masterExists) {
          const masterAuth = hashPassword('ShefaAyin2026!');
          this.data.users.push({
            id: 'user_master_owner',
            email: 'Alifermadeiro@hotmail.com',
            name: 'Alifer Madeiro (Master Owner)',
            role: 'MASTER_OWNER',
            passwordHash: masterAuth.hash,
            salt: masterAuth.salt,
            createdAt: new Date().toISOString()
          });
        }
        this.save();
      } catch (err) {
        console.error('Failed reading DB file, reinitializing:', err);
        this.data = getInitialData();
        this.save();
      }
    } else {
      this.data = getInitialData();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed saving database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public commit() {
    this.save();
  }

  public logAudit(actorEmail: string, actorRole: 'MASTER_OWNER' | 'COMPANY_ADMIN' | 'OPERATOR', action: string, companyId: string, details: string): AuditLog {
    const lastLog = this.data.auditLogs[this.data.auditLogs.length - 1];
    const prevHash = lastLog ? lastLog.hash : '00000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    
    const hash = crypto.createHash('sha256')
      .update(`${prevHash}:${timestamp}:${actorEmail}:${action}:${companyId}:${details}`)
      .digest('hex');

    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actorEmail,
      actorRole,
      action,
      companyId,
      details,
      hash
    };

    this.data.auditLogs.push(log);
    this.save();
    return log;
  }
}

export const db = new Database();
