export type UserRole = 'MASTER_OWNER' | 'COMPANY_ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
  lastLogin?: string;
}

export type PlanTier = 'Astral Starter' | 'Cosmic Growth' | 'Infinity Enterprise';

export type SubscriptionStatus = 
  | 'PENDING_PAYMENT' 
  | 'ACTIVE' 
  | 'TRIAL' 
  | 'EXPIRED' 
  | 'CANCELED' 
  | 'SUSPENDED' 
  | 'REFUNDED';

export interface PlanDefinition {
  id: string;
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  trialDays: number;
  limits: {
    monthlyMissions: number;
    maxAgents: number;
    maxKnowledgeDocs: number;
    customAIPersona: boolean;
    prioritySupport: boolean;
  };
}

export interface Subscription {
  id: string;
  companyId: string;
  companyName: string;
  customerEmail: string;
  planTier: PlanTier;
  billingCycle: 'monthly' | 'annual';
  status: SubscriptionStatus;
  price: number;
  startDate: string;
  expiresAt: string;
  trialEndsAt?: string;
  pixChargeId?: string;
  autoRenew: boolean;
  featuresUnlocked: string[];
  lastPaymentConfirmedAt?: string;
}

export type PixChargeStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';

export interface PixCharge {
  id: string;
  orderId: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  customerCpfOrCnpj: string;
  planTier?: PlanTier;
  amount: number;
  pixKey: string;
  pixKeyType: string;
  recipientName: string;
  copyPasteCode: string;
  qrCodeSvg?: string;
  status: PixChargeStatus;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  txId: string;
  endToEndId?: string;
  failureReason?: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpjOrTaxId: string;
  plan: PlanTier;
  status: 'active' | 'suspended';
  createdAt: string;
  subscriptionId?: string;
  aiPersona: {
    assistantName: string;
    tone: string;
    welcomeMessage: string;
    instructions: string;
  };
  quotas: {
    monthlyMissions: number;
    usedMissions: number;
    maxAgents: number;
    maxKnowledgeDocs: number;
  };
}

export type DepartmentId = 
  | 'AYIN_RADAR'
  | 'AYIN_STRATEGY'
  | 'AYIN_AGENTS'
  | 'AYIN_CREATIVE'
  | 'AYIN_SALES'
  | 'AYIN_MARKET'
  | 'AYIN_FINANCE'
  | 'AYIN_INTELLIGENCE';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  hebrewName: string;
  roleDescription: string;
  color: string;
  activeAgentsCount: number;
  pendingTasks: number;
}

export type AgentRoleType =
  | 'RADAR AGENT'
  | 'LEAD AGENT'
  | 'SALES AGENT'
  | 'CUSTOMER AGENT'
  | 'MARKETING AGENT'
  | 'CREATIVE AGENT'
  | 'MARKET AGENT'
  | 'FINANCE AGENT'
  | 'SUBSCRIPTION AGENT'
  | 'ANALYTICS AGENT'
  | 'REPORT AGENT';

export interface AutonomousAgent {
  id: string;
  companyId: string;
  name: string;
  hebrewCodename: string;
  departmentId: DepartmentId;
  agentRoleType?: AgentRoleType;
  role: string;
  specialty: string;
  autonomyLevel: 'supervised' | 'autonomous_safe' | 'full_autonomous';
  status: 'idle' | 'running' | 'analyzing' | 'paused' | 'error';
  is24hEnabled: boolean;
  isManuallyPaused?: boolean;
  totalMissionsCompleted: number;
  accuracyScore: number;
  lastActive: string;
}

export interface MissionStep {
  id: string;
  title: string;
  departmentId: DepartmentId;
  assignedAgentId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface Mission {
  id: string;
  companyId: string;
  creatorEmail: string;
  title: string;
  objective: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed' | 'rejected';
  departmentsInvolved: DepartmentId[];
  steps: MissionStep[];
  isSensitive: boolean;
  sensitiveReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  executionLogs: {
    timestamp: string;
    agentName: string;
    message: string;
    type: 'info' | 'action' | 'warning' | 'success';
  }[];
  finalReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDoc {
  id: string;
  companyId: string;
  title: string;
  category: 'policy' | 'product' | 'faq' | 'market_report' | 'guide';
  content: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: 'Novo' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido';
  value: number;
  notes: string;
  assignedAgent: string;
  createdAt: string;
  lastContact: string;
}

export interface ProductItem {
  id: string;
  companyId: string;
  title: string;
  category: string;
  price: number;
  commissionRate: number;
  type: 'proprio' | 'parceiro' | 'infoproduto';
  status: 'active' | 'draft';
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
  paymentMethod: 'PIX';
  pixChargeId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface CommissionRecord {
  id: string;
  orderId: string;
  partnerName: string;
  partnerEmail: string;
  rate: number;
  amount: number;
  status: 'pendente' | 'liquidado';
  date: string;
}

export interface FinancialRecord {
  id: string;
  companyId: string;
  title: string;
  type: 'receita' | 'custo' | 'comissao' | 'assinatura';
  amount: number;
  date: string;
  status: 'liquidado' | 'pendente' | 'aprovacao_necessaria';
}

export interface EngineGovernanceSettings {
  isEmergencyPaused: boolean;
  financialSpendingLimit: number;
  maxConcurrentTasks: number;
  autoRetryCount: number;
  pixKey: string;
  pixKeyType: string;
  masterRecipient: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  companyId: string;
  details: string;
  hash: string;
}

export interface SystemStats {
  totalCompanies: number;
  totalAgents: number;
  active24hAgents: number;
  totalMissions: number;
  completedMissions: number;
  awaitingApproval: number;
  auditEntries: number;
  grossRevenue?: number;
  mrr?: number;
  totalCosts?: number;
  netResult?: number;
  activeSubscriptions?: number;
  pendingPixCharges?: number;
  isEmergencyPaused?: boolean;
}

export type LivingCoreVisualState = 
  | 'INICIALIZANDO'
  | 'ONLINE'
  | 'ANALISANDO'
  | 'PROCESSANDO'
  | 'EXECUTANDO'
  | 'AGUARDANDO_APROVACAO'
  | 'PAUSADO'
  | 'ALERTA'
  | 'ERRO'
  | 'DESCONECTADO';
