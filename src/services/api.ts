import { 
  User, 
  Company, 
  DepartmentInfo, 
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
  AuditLog,
  SystemStats,
  ProjectItem 
} from '../types/index.ts';

const TOKEN_KEY = 'shefa_token';
let inMemoryToken: string | null = null;

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || inMemoryToken;
  } catch {
    return inMemoryToken;
  }
}

function setToken(token: string) {
  inMemoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore iframe localStorage quota/sandboxing errors
  }
}

function clearToken() {
  inMemoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function getHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  getToken,
  setToken,
  clearToken,

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao autenticar.');
    }
    const data = await res.json();
    setToken(data.token);
    return data;
  },

  async ensureAuthenticated(): Promise<string> {
    const existing = getToken();
    if (existing) return existing;
    try {
      const loginRes = await api.login('Alifermadeiro@hotmail.com', 'ShefaAyin2026!');
      return loginRes.token;
    } catch {
      return '';
    }
  },

  async setupMaster(currentPassword?: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/setup-master', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao configurar credenciais.');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User; company?: Company | null }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Sessão expirada.');
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    } finally {
      clearToken();
    }
  },

  // Command & AYIN CORE with automatic token recovery and friendly network handling
  async sendCommand(prompt: string, companyId?: string): Promise<{ mission: Mission; strategicAdvice: string }> {
    await api.ensureAuthenticated();

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, companyId })
      });
      if (res.status === 401) {
        // Token was stale; re-login and retry once
        await api.login('Alifermadeiro@hotmail.com', 'ShefaAyin2026!');
        const retryRes = await fetch('/api/command', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ prompt, companyId })
        });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}));
          throw new Error(err.error || 'Erro na execução do comando mestre.');
        }
        return retryRes.json();
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao processar comando mestre.');
      }
      return res.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && (err.message.includes('Load failed') || err.message.includes('Failed to fetch'))) {
        throw new Error('Falha de conexão com o servidor neural AYIN CORE. Tentando reconectar...');
      }
      throw err;
    }
  },

  // Departments & Agents
  async getDepartments(): Promise<DepartmentInfo[]> {
    const res = await fetch('/api/departments', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter departamentos.');
    return res.json();
  },

  async getAgents(): Promise<AutonomousAgent[]> {
    const res = await fetch('/api/agents', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar agentes.');
    return res.json();
  },

  async toggleAgent24h(agentId: string): Promise<{ success: boolean; agent: AutonomousAgent }> {
    const res = await fetch(`/api/agents/${agentId}/toggle-24h`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alterar modo do agente.');
    return res.json();
  },

  // Missions & Approvals
  async getMissions(companyId?: string): Promise<Mission[]> {
    const url = companyId ? `/api/missions?companyId=${encodeURIComponent(companyId)}` : '/api/missions';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar missões.');
    return res.json();
  },

  async approveMission(missionId: string): Promise<{ success: boolean; mission: Mission }> {
    const res = await fetch(`/api/missions/${missionId}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao aprovar missão.');
    }
    return res.json();
  },

  async rejectMission(missionId: string, reason?: string): Promise<{ success: boolean; mission: Mission }> {
    const res = await fetch(`/api/missions/${missionId}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao rejeitar missão.');
    }
    return res.json();
  },

  // Companies (Multitenancy)
  async getCompanies(): Promise<Company[]> {
    const res = await fetch('/api/companies', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar empresas.');
    return res.json();
  },

  async createCompany(payload: Partial<Company> & { assistantName?: string; tone?: string; instructions?: string }): Promise<{ success: boolean; company: Company }> {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar empresa.');
    return res.json();
  },

  async updateCompany(id: string, payload: Partial<Company>): Promise<{ success: boolean; company: Company }> {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar empresa.');
    return res.json();
  },

  // Company Client AI Assistant
  async clientAssistantChat(message: string, companyId?: string, conversationHistory?: { role: 'user' | 'model'; text: string }[]): Promise<{ reply: string }> {
    const res = await fetch('/api/client-assistant/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, companyId, conversationHistory })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na comunicação com assistente.');
    }
    return res.json();
  },

  // Data
  async getLeads(companyId?: string): Promise<Lead[]> {
    const url = companyId ? `/api/leads?companyId=${encodeURIComponent(companyId)}` : '/api/leads';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar leads.');
    return res.json();
  },

  async createLead(payload: Partial<Lead>): Promise<Lead> {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar lead.');
    return res.json();
  },

  async updateLead(leadId: string, payload: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar lead.');
    return res.json();
  },

  async getKnowledge(companyId?: string): Promise<KnowledgeDoc[]> {
    const url = companyId ? `/api/knowledge?companyId=${encodeURIComponent(companyId)}` : '/api/knowledge';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar base de conhecimento.');
    return res.json();
  },

  async createKnowledge(payload: Partial<KnowledgeDoc>): Promise<KnowledgeDoc> {
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao registrar documento.');
    return res.json();
  },

  async getProducts(): Promise<ProductItem[]> {
    const res = await fetch('/api/products', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar produtos.');
    return res.json();
  },

  async getFinances(): Promise<FinancialRecord[]> {
    const res = await fetch('/api/finances', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar finanças.');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter logs de auditoria.');
    return res.json();
  },

  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/system/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter estatísticas.');
    return res.json();
  },

  // -------------------------------------------------------------
  // SUBSCRIPTION & COMMERCE ENGINE
  // -------------------------------------------------------------
  async getPlans(): Promise<PlanDefinition[]> {
    const res = await fetch('/api/subscriptions/plans');
    if (!res.ok) throw new Error('Erro ao obter planos.');
    return res.json();
  },

  async getSubscriptions(): Promise<Subscription[]> {
    const res = await fetch('/api/subscriptions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar assinaturas.');
    return res.json();
  },

  async checkoutSubscription(payload: {
    planTier: string;
    billingCycle: 'monthly' | 'annual';
    customerName: string;
    customerEmail: string;
    customerCpfOrCnpj?: string;
    companyName?: string;
  }): Promise<{ subscription: Subscription; pixCharge: PixCharge }> {
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao gerar cobrança de assinatura.');
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // PIX PAYMENT ENGINE
  // -------------------------------------------------------------
  async createPixCharge(payload: {
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerCpfOrCnpj?: string;
    planTier?: string;
  }): Promise<PixCharge> {
    const res = await fetch('/api/payments/pix/charge', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao gerar cobrança Pix.');
    return res.json();
  },

  async getPixCharge(chargeId: string): Promise<PixCharge> {
    const res = await fetch(`/api/payments/pix/${chargeId}`);
    if (!res.ok) throw new Error('Erro ao consultar cobrança Pix.');
    return res.json();
  },

  async simulatePixWebhook(chargeId: string): Promise<{ success: boolean; message: string; charge: PixCharge; subscription?: Subscription }> {
    const res = await fetch('/api/payments/pix/simulate-webhook', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chargeId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na homologação do Pix.');
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // COMMERCE ORDERS & COMMISSIONS
  // -------------------------------------------------------------
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar pedidos.');
    return res.json();
  },

  async createOrder(payload: { items: any[]; customerName: string; customerEmail: string }): Promise<{ order: Order; pixCharge: PixCharge }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar pedido.');
    return res.json();
  },

  async getCommissions(): Promise<CommissionRecord[]> {
    const res = await fetch('/api/commissions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar comissões.');
    return res.json();
  },

  // -------------------------------------------------------------
  // GOVERNANCE & EMERGENCY CONTROLS
  // -------------------------------------------------------------
  async getGovernance(): Promise<EngineGovernanceSettings> {
    const res = await fetch('/api/governance', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter configurações de governança.');
    return res.json();
  },

  async toggleEmergencyPause(): Promise<{ success: boolean; isEmergencyPaused: boolean; message: string }> {
    const res = await fetch('/api/governance/emergency-pause', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alternar pausa de emergência.');
    return res.json();
  },

  async updateSpendingLimit(limit: number): Promise<{ success: boolean; spendingLimit: number }> {
    const res = await fetch('/api/governance/spending-limit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ limit })
    });
    if (!res.ok) throw new Error('Erro ao atualizar limite de gastos.');
    return res.json();
  },

  async toggleAgentPause(agentId: string): Promise<{ success: boolean; agent: AutonomousAgent }> {
    const res = await fetch(`/api/agents/${agentId}/pause`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alterar estado do agente.');
    return res.json();
  }
};
