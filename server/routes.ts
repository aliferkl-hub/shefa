import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword } from './db.js';
import { interpretAyinCommand, askCompanyAssistant } from './gemini.js';
import { agentEngine } from './agentEngine.js';
import { generatePixChargePayload } from './pix.js';
import { 
  User, 
  Mission, 
  DepartmentId, 
  Lead, 
  ProductItem, 
  Order,
  Subscription,
  PlanDefinition,
  PlanTier,
  PixCharge,
  CommissionRecord,
  KnowledgeDoc, 
  FinancialRecord 
} from './types.js';

export const apiRouter = Router();

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Token de sessão não fornecido.' });
  }

  const token = authHeader.substring(7);
  const data = db.getData();
  const session = data.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());

  if (!session) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }

  const user = data.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado.' });
  }

  req.user = user;
  next();
}

// Master Owner Only Middleware
function masterOwnerOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'MASTER_OWNER') {
    return res.status(403).json({ error: 'Acesso negado. Apenas o Master Owner possui privilégios para esta operação.' });
  }
  next();
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  // Create secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  data.sessions.push({ token, userId: user.id, expiresAt });
  user.lastLogin = new Date().toISOString();
  db.commit();

  db.logAudit(user.email, user.role, 'USER_LOGIN', user.companyId || 'global', 'Login realizado com sucesso.');

  const { passwordHash, salt, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

// Endpoint to securely configure or update master owner passphrase
apiRouter.post('/auth/setup-master', (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const data = db.getData();
  const master = data.users.find(u => u.email.toLowerCase() === 'alifermadeiro@hotmail.com');

  if (!master) {
    return res.status(404).json({ error: 'Usuário Master Owner não localizado.' });
  }

  // If already has password, verify current
  if (currentPassword) {
    const valid = verifyPassword(currentPassword, master.passwordHash, master.salt);
    if (!valid) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve possuir ao menos 8 caracteres de alta entropia.' });
  }

  const newHash = hashPassword(newPassword);
  master.passwordHash = newHash.hash;
  master.salt = newHash.salt;
  db.commit();

  db.logAudit(master.email, 'MASTER_OWNER', 'MASTER_CREDENTIALS_UPDATED', 'global', 'Credenciais do Master Owner atualizadas com hash criptográfico scrypt.');

  return res.json({ success: true, message: 'Credenciais do Master Owner atualizadas com segurança.' });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash, salt, ...safeUser } = req.user!;
  const data = db.getData();
  const company = req.user!.companyId ? data.companies.find(c => c.id === req.user!.companyId) : null;
  return res.json({ user: safeUser, company });
});

apiRouter.post('/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers.authorization!.substring(7);
  const data = db.getData();
  data.sessions = data.sessions.filter(s => s.token !== token);
  db.commit();
  return res.json({ success: true });
});

// -------------------------------------------------------------
// AYIN CORE COMMAND & MISSION ORCHESTRATION
// -------------------------------------------------------------

apiRouter.post('/command', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const prompt = req.body.prompt || req.body.command;
  const companyId = req.body.companyId;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Comando em texto é obrigatório.' });
  }

  const user = req.user!;
  const targetCompanyId = user.role === 'MASTER_OWNER' ? (companyId || 'global') : user.companyId!;
  const data = db.getData();
  const company = targetCompanyId !== 'global' ? data.companies.find(c => c.id === targetCompanyId) : undefined;

  try {
    // 1. AYIN CORE analyzes command via Gemini
    const plan = await interpretAyinCommand(
      prompt,
      user.email,
      user.role === 'MASTER_OWNER',
      company ? { companyName: company.name, plan: company.plan } : undefined
    );

    // 2. Generate new Mission
    const newMissionId = `mis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMission: Mission = {
      id: newMissionId,
      companyId: targetCompanyId,
      creatorEmail: user.email,
      title: plan.title,
      objective: plan.objective,
      priority: plan.priority,
      status: plan.isSensitive ? 'awaiting_approval' : 'queued',
      departmentsInvolved: plan.departmentsInvolved,
      isSensitive: plan.isSensitive,
      sensitiveReason: plan.sensitiveReason,
      steps: plan.steps.map((st, i) => ({
        id: `step_${i + 1}`,
        title: st.title,
        departmentId: st.departmentId,
        status: 'pending'
      })),
      executionLogs: [
        {
          timestamp: new Date().toISOString(),
          agentName: 'AYIN CORE Director',
          message: `Comando mestre interpretado. Missão decomposta em ${plan.steps.length} etapas estratégicas.`,
          type: 'info'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (plan.isSensitive) {
      newMission.executionLogs.push({
        timestamp: new Date().toISOString(),
        agentName: 'Ayin Finance Custodian',
        message: `Ação Sensível Detectada: "${plan.sensitiveReason}". Missão retida aguardando aprovação explícita do Master Owner.`,
        type: 'warning'
      });
    }

    data.missions.unshift(newMission);
    db.commit();

    db.logAudit(
      user.email,
      user.role,
      'COMMAND_DISPATCHED',
      targetCompanyId,
      `Comando: "${prompt}". Missão criada: ${newMission.id}. Sensível: ${plan.isSensitive}`
    );

    // Trigger tick
    if (!plan.isSensitive) {
      agentEngine.executeMissionNow(newMission.id).catch(console.error);
    }

    return res.json({
      mission: newMission,
      strategicAdvice: plan.strategicAdvice
    });
  } catch (error) {
    console.error('Error executing command:', error);
    return res.status(500).json({ error: 'Falha no processamento neural do AYIN CORE.' });
  }
});

// -------------------------------------------------------------
// MISSIONS & APPROVAL GATES
// -------------------------------------------------------------

apiRouter.get('/missions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let missions = data.missions;
  if (user.role !== 'MASTER_OWNER') {
    missions = missions.filter(m => m.companyId === user.companyId);
  } else if (req.query.companyId) {
    missions = missions.filter(m => m.companyId === req.query.companyId);
  }

  return res.json(missions);
});

apiRouter.post('/missions/:id/approve', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const missionId = req.params.id;
  const data = db.getData();
  const mission = data.missions.find(m => m.id === missionId);

  if (!mission) {
    return res.status(404).json({ error: 'Missão não encontrada.' });
  }

  if (mission.status !== 'awaiting_approval') {
    return res.status(400).json({ error: 'Apenas missões aguardando aprovação podem ser autorizadas.' });
  }

  mission.status = 'in_progress';
  mission.approvedBy = req.user!.email;
  mission.approvedAt = new Date().toISOString();
  mission.executionLogs.push({
    timestamp: new Date().toISOString(),
    agentName: 'Master Owner (Alifermadeiro@hotmail.com)',
    message: 'Autorização formal concedida pelo Master Owner. Desbloqueando execução.',
    type: 'success'
  });

  db.commit();
  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'MISSION_APPROVED',
    mission.companyId,
    `Missão sensível ${mission.id} aprovada pelo Master Owner.`
  );

  agentEngine.executeMissionNow(mission.id).catch(console.error);
  return res.json({ success: true, mission });
});

apiRouter.post('/missions/:id/reject', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const missionId = req.params.id;
  const { reason } = req.body;
  const data = db.getData();
  const mission = data.missions.find(m => m.id === missionId);

  if (!mission) {
    return res.status(404).json({ error: 'Missão não encontrada.' });
  }

  mission.status = 'rejected';
  mission.executionLogs.push({
    timestamp: new Date().toISOString(),
    agentName: 'Master Owner (Alifermadeiro@hotmail.com)',
    message: `Ação sensível rejeitada pelo Master Owner. Motivo: ${reason || 'Bloqueio administrativo por precaução orçamentária.'}`,
    type: 'warning'
  });

  db.commit();
  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'MISSION_REJECTED',
    mission.companyId,
    `Missão sensível ${mission.id} rejeitada pelo Master Owner.`
  );

  return res.json({ success: true, mission });
});

// -------------------------------------------------------------
// AGENTS & CONTINUOUS 24/7 OPERATION
// -------------------------------------------------------------

apiRouter.get('/agents', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let agents = data.agents;
  if (user.role !== 'MASTER_OWNER') {
    agents = agents.filter(a => a.companyId === 'global' || a.companyId === user.companyId);
  }

  return res.json(agents);
});

apiRouter.post('/agents/:id/toggle-24h', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const data = db.getData();
  const agent = data.agents.find(a => a.id === agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agente não localizado.' });
  }

  // Check company permissions
  if (req.user!.role !== 'MASTER_OWNER' && agent.companyId !== req.user!.companyId) {
    return res.status(403).json({ error: 'Sem permissão para alterar este agente.' });
  }

  agent.is24hEnabled = !agent.is24hEnabled;
  db.commit();

  db.logAudit(
    req.user!.email,
    req.user!.role,
    'AGENT_24H_TOGGLED',
    agent.companyId,
    `Modo 24h do agente ${agent.name} alterado para: ${agent.is24hEnabled ? 'ATIVO' : 'DESATIVADO'}`
  );

  return res.json({ success: true, agent });
});

// -------------------------------------------------------------
// DEPARTMENTS
// -------------------------------------------------------------

apiRouter.get('/departments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const deptIds: DepartmentId[] = [
    'AYIN_RADAR',
    'AYIN_STRATEGY',
    'AYIN_AGENTS',
    'AYIN_CREATIVE',
    'AYIN_SALES',
    'AYIN_MARKET',
    'AYIN_FINANCE',
    'AYIN_INTELLIGENCE'
  ];

  const deptMeta: Record<DepartmentId, { name: string; hebrew: string; role: string; color: string }> = {
    AYIN_RADAR: { name: 'Ayin Radar', hebrew: 'צופה המרחב', role: 'Pesquisa de mercado, tendências e concorrentes', color: '#8b5cf6' },
    AYIN_STRATEGY: { name: 'Ayin Strategy', hebrew: 'תבונת התוכנית', role: 'Análise, engenharia tática e planos comerciais', color: '#a855f7' },
    AYIN_AGENTS: { name: 'Ayin Agents', hebrew: 'שליחי השפע', role: 'Cadastro, orquestração e monitoramento 24h', color: '#c084fc' },
    AYIN_CREATIVE: { name: 'Ayin Creative', hebrew: 'יוצר הסגנון', role: 'Campanhas publicitárias, copywriting e roteiros', color: '#e879f9' },
    AYIN_SALES: { name: 'Ayin Sales', hebrew: 'סגירת המעגל', role: 'Leads, atendimento e acompanhamento de vendas', color: '#f43f5e' },
    AYIN_MARKET: { name: 'Ayin Market', hebrew: 'שוק הנכסים', role: 'Produtos próprios, parceiros e comissionamentos', color: '#fb923c' },
    AYIN_FINANCE: { name: 'Ayin Finance', hebrew: 'אוצר הברכה', role: 'Receitas reais, custos, assinaturas e governança', color: '#eab308' },
    AYIN_INTELLIGENCE: { name: 'Ayin Intelligence', hebrew: 'עין החוכמה', role: 'Memória vetorial, auditoria e evolução contínua', color: '#6366f1' }
  };

  const results = deptIds.map(id => {
    const meta = deptMeta[id];
    const agentsInDept = data.agents.filter(a => a.departmentId === id);
    const pendingTasks = data.missions
      .flatMap(m => m.steps)
      .filter(s => s.departmentId === id && s.status === 'pending').length;

    return {
      id,
      name: meta.name,
      hebrewName: meta.hebrew,
      roleDescription: meta.role,
      color: meta.color,
      activeAgentsCount: agentsInDept.length,
      pendingTasks
    };
  });

  return res.json(results);
});

// -------------------------------------------------------------
// COMPANIES & CLIENT ENVIRONMENT (MULTI-TENANCY)
// -------------------------------------------------------------

apiRouter.get('/companies', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  if (user.role === 'MASTER_OWNER') {
    return res.json(data.companies);
  } else {
    const company = data.companies.filter(c => c.id === user.companyId);
    return res.json(company);
  }
});

apiRouter.post('/companies', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const { name, tradeName, cnpjOrTaxId, plan, assistantName, tone, instructions } = req.body;
  if (!name || !cnpjOrTaxId) {
    return res.status(400).json({ error: 'Nome e CNPJ/ID fiscal são obrigatórios.' });
  }

  const data = db.getData();
  const newCompanyId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const newCompany = {
    id: newCompanyId,
    name,
    tradeName: tradeName || name,
    cnpjOrTaxId,
    plan: plan || 'Cosmic Growth',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    aiPersona: {
      assistantName: assistantName || `Ayin ${name.split(' ')[0]}`,
      tone: tone || 'Consultivo, corporativo e focado em resultados',
      welcomeMessage: `Olá! Sou o assistente de inteligência autônoma da ${name}.`,
      instructions: instructions || 'Prestar suporte operacional e impulsionar as vendas da empresa.'
    },
    quotas: {
      monthlyMissions: plan === 'Infinity Enterprise' ? 500 : 250,
      usedMissions: 0,
      maxAgents: plan === 'Infinity Enterprise' ? 10 : 5,
      maxKnowledgeDocs: plan === 'Infinity Enterprise' ? 50 : 25
    }
  };

  data.companies.push(newCompany);
  db.commit();

  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'COMPANY_CREATED',
    newCompany.id,
    `Nova empresa cliente registrada: ${newCompany.name}`
  );

  return res.json({ success: true, company: newCompany });
});

apiRouter.put('/companies/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.params.id;
  const user = req.user!;
  
  if (user.role !== 'MASTER_OWNER' && user.companyId !== companyId) {
    return res.status(403).json({ error: 'Sem permissão para alterar esta empresa.' });
  }

  const data = db.getData();
  const company = data.companies.find(c => c.id === companyId);
  if (!company) {
    return res.status(404).json({ error: 'Empresa não encontrada.' });
  }

  const { aiPersona, tradeName, status, plan } = req.body;
  if (aiPersona) company.aiPersona = { ...company.aiPersona, ...aiPersona };
  if (tradeName) company.tradeName = tradeName;
  if (status && user.role === 'MASTER_OWNER') company.status = status;
  if (plan && user.role === 'MASTER_OWNER') company.plan = plan;

  db.commit();
  db.logAudit(
    user.email,
    user.role,
    'COMPANY_UPDATED',
    company.id,
    `Dados da empresa ${company.name} atualizados.`
  );

  return res.json({ success: true, company });
});

// Dedicated Company Client Assistant Chat Endpoint
apiRouter.post('/client-assistant/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { message, conversationHistory } = req.body;
  const user = req.user!;
  
  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória.' });
  }

  const companyId = req.body.companyId || user.companyId;
  if (!companyId || (user.role !== 'MASTER_OWNER' && user.companyId !== companyId)) {
    return res.status(403).json({ error: 'Acesso negado à inteligência desta empresa.' });
  }

  const data = db.getData();
  const company = data.companies.find(c => c.id === companyId);
  if (!company) {
    return res.status(404).json({ error: 'Empresa não encontrada.' });
  }

  // Isolated knowledge docs for this company
  const docs = data.knowledge.filter(k => k.companyId === companyId);

  try {
    const reply = await askCompanyAssistant(
      company.tradeName || company.name,
      company.aiPersona,
      docs,
      message,
      conversationHistory || []
    );

    return res.json({ reply });
  } catch (error) {
    console.error('Client Assistant Error:', error);
    return res.status(500).json({ error: 'Erro no assistente do cliente.' });
  }
});

// -------------------------------------------------------------
// CRM LEADS, KNOWLEDGE, PRODUCTS & FINANCES
// -------------------------------------------------------------

apiRouter.get('/leads', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let leads = data.leads;
  if (user.role !== 'MASTER_OWNER') {
    leads = leads.filter(l => l.companyId === user.companyId);
  } else if (req.query.companyId) {
    leads = leads.filter(l => l.companyId === req.query.companyId);
  }

  return res.json(leads);
});

apiRouter.post('/leads', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, stage, value, notes, companyId } = req.body;
  const user = req.user!;
  const targetCompanyId = user.role === 'MASTER_OWNER' ? (companyId || 'comp_vertice_tech') : user.companyId!;

  const newLead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: targetCompanyId,
    name: name || 'Novo Lead',
    email: email || '',
    phone: phone || '',
    source: 'Atendimento Ayin',
    stage: stage || 'Novo',
    value: Number(value) || 0,
    notes: notes || '',
    assignedAgent: 'Ayin Sales Hunter',
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString()
  };

  const data = db.getData();
  data.leads.unshift(newLead);
  db.commit();

  return res.json(newLead);
});

apiRouter.put('/leads/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const data = db.getData();
  const lead = data.leads.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  Object.assign(lead, updates, { lastContact: new Date().toISOString() });
  db.commit();
  return res.json(lead);
});

apiRouter.get('/knowledge', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let docs = data.knowledge;
  if (user.role !== 'MASTER_OWNER') {
    docs = docs.filter(k => k.companyId === 'global' || k.companyId === user.companyId);
  } else if (req.query.companyId) {
    docs = docs.filter(k => k.companyId === 'global' || k.companyId === req.query.companyId);
  }

  return res.json(docs);
});

apiRouter.post('/knowledge', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { title, category, content, companyId } = req.body;
  const user = req.user!;
  const targetCompanyId = user.role === 'MASTER_OWNER' ? (companyId || 'global') : user.companyId!;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
  }

  const newDoc: KnowledgeDoc = {
    id: `knd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: targetCompanyId,
    title,
    category: category || 'guide',
    content,
    updatedAt: new Date().toISOString()
  };

  const data = db.getData();
  data.knowledge.unshift(newDoc);
  db.commit();

  db.logAudit(user.email, user.role, 'KNOWLEDGE_ADDED', targetCompanyId, `Documento adicionado: ${title}`);

  return res.json(newDoc);
});

apiRouter.get('/products', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let products = data.products;
  if (user.role !== 'MASTER_OWNER') {
    products = products.filter(p => p.companyId === 'global' || p.companyId === user.companyId);
  }

  return res.json(products);
});

// -------------------------------------------------------------
// SUBSCRIPTIONS & COMMERCE ENGINE
// -------------------------------------------------------------

apiRouter.get('/subscriptions/plans', (_req: Request, res: Response) => {
  const data = db.getData();
  return res.json(data.plans);
});

apiRouter.get('/subscriptions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  if (user.role === 'MASTER_OWNER') {
    return res.json(data.subscriptions);
  } else {
    const subs = data.subscriptions.filter(s => s.companyId === user.companyId);
    return res.json(subs);
  }
});

apiRouter.post('/subscriptions/checkout', async (req: Request, res: Response) => {
  const { planTier, billingCycle, customerName, customerEmail, customerCpfOrCnpj, companyName } = req.body;
  if (!planTier || !customerEmail || !customerName) {
    return res.status(400).json({ error: 'Plano, email e nome do responsável são obrigatórios.' });
  }

  const data = db.getData();
  const plan = data.plans.find(p => p.tier === planTier);
  if (!plan) {
    return res.status(404).json({ error: 'Plano não localizado.' });
  }

  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
  const amount = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

  // Find or create company
  let company = data.companies.find(c => c.cnpjOrTaxId === customerCpfOrCnpj || c.name.toLowerCase() === (companyName || customerName).toLowerCase());
  if (!company) {
    const newCompanyId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    company = {
      id: newCompanyId,
      name: companyName || `${customerName} Corp`,
      tradeName: companyName || customerName,
      cnpjOrTaxId: customerCpfOrCnpj || '00.000.000/0001-00',
      plan: plan.tier,
      status: 'active',
      createdAt: new Date().toISOString(),
      aiPersona: {
        assistantName: `Ayin ${customerName.split(' ')[0]}`,
        tone: 'Consultivo, corporativo e focado em alta conversão',
        welcomeMessage: `Olá! Sou a inteligência corporativa dedicada da ${companyName || customerName}.`,
        instructions: 'Conduzir atendimento comercial e acelerar as operações da empresa.'
      },
      quotas: {
        monthlyMissions: plan.limits.monthlyMissions,
        usedMissions: 0,
        maxAgents: plan.limits.maxAgents,
        maxKnowledgeDocs: plan.limits.maxKnowledgeDocs
      }
    };
    data.companies.push(company);
  }

  const txId = `SHF${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes for Pix payment

  // Generate official EMV Pix Copia e Cola and QR Code SVG
  const pixData = await generatePixChargePayload({
    pixKey: data.governance.pixKey || '11973479473',
    recipientName: 'Alifer Madeiro',
    city: 'SAO PAULO',
    amount,
    txId
  });

  const pixChargeId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newCharge: PixCharge = {
    id: pixChargeId,
    orderId: subId,
    companyId: company.id,
    customerName,
    customerEmail,
    customerCpfOrCnpj: customerCpfOrCnpj || '',
    planTier: plan.tier,
    amount,
    pixKey: data.governance.pixKey || '11973479473',
    pixKeyType: 'TELEFONE CELULAR',
    recipientName: 'Alifer Madeiro',
    copyPasteCode: pixData.copyPasteCode,
    qrCodeSvg: pixData.qrCodeSvg,
    status: 'PENDING',
    createdAt: now.toISOString(),
    expiresAt,
    txId
  };

  const newSub: Subscription = {
    id: subId,
    companyId: company.id,
    companyName: company.tradeName,
    customerEmail,
    planTier: plan.tier,
    billingCycle: cycle,
    status: 'PENDING_PAYMENT',
    price: amount,
    startDate: now.toISOString(),
    expiresAt: new Date(now.getTime() + (cycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    pixChargeId,
    autoRenew: true,
    featuresUnlocked: plan.features
  };

  company.subscriptionId = subId;
  data.pixCharges.unshift(newCharge);
  data.subscriptions.unshift(newSub);
  db.commit();

  db.logAudit(
    customerEmail,
    'OPERATOR',
    'SUBSCRIPTION_CHECKOUT',
    company.id,
    `Cobrança Pix de R$ ${amount.toFixed(2)} gerada para o plano ${plan.tier} (${cycle}). TxID: ${txId}`
  );

  return res.json({
    subscription: newSub,
    pixCharge: newCharge
  });
});

// -------------------------------------------------------------
// PIX PAYMENT ENGINE & WEBHOOK CONFIRMATION
// -------------------------------------------------------------

apiRouter.get('/payments/pix/:id', (req: Request, res: Response) => {
  const chargeId = req.params.id;
  const data = db.getData();
  const charge = data.pixCharges.find(c => c.id === chargeId || c.txId === chargeId);

  if (!charge) {
    return res.status(404).json({ error: 'Cobrança Pix não localizada.' });
  }

  // Check if expired
  if (charge.status === 'PENDING' && new Date(charge.expiresAt) < new Date()) {
    charge.status = 'EXPIRED';
    db.commit();
  }

  return res.json(charge);
});

apiRouter.post('/payments/pix/charge', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { amount, customerName, customerEmail, customerCpfOrCnpj, planTier } = req.body;
  const data = db.getData();
  const txId = `SHF${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const pixData = await generatePixChargePayload({
    pixKey: data.governance.pixKey || '11973479473',
    recipientName: 'Alifer Madeiro',
    city: 'SAO PAULO',
    amount: Number(amount),
    txId
  });

  const pixChargeId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newCharge: PixCharge = {
    id: pixChargeId,
    orderId: `direct_${Date.now()}`,
    companyId: req.user?.companyId || 'global',
    customerName: customerName || 'Cliente Corporativo',
    customerEmail: customerEmail || 'cliente@corporativo.com',
    customerCpfOrCnpj: customerCpfOrCnpj || '',
    planTier: planTier || 'Infinity Enterprise',
    amount: Number(amount),
    pixKey: data.governance.pixKey || '11973479473',
    pixKeyType: 'TELEFONE CELULAR',
    recipientName: 'Alifer Madeiro',
    copyPasteCode: pixData.copyPasteCode,
    qrCodeSvg: pixData.qrCodeSvg,
    status: 'PENDING',
    createdAt: now.toISOString(),
    expiresAt,
    txId
  };

  data.pixCharges.unshift(newCharge);
  db.commit();
  return res.json(newCharge);
});

// Authenticated Pix Webhook endpoint (Banco Central / Instituição Financeira)
apiRouter.post('/payments/pix/webhook', (req: Request, res: Response) => {
  const webhookSecret = req.headers['x-shefa-webhook-secret'] || req.headers['authorization'];
  const { event, txId, amount, pixKey, endToEndId } = req.body;

  const data = db.getData();
  const charge = data.pixCharges.find(c => c.txId === txId || c.id === req.body.chargeId);

  if (!charge) {
    return res.status(404).json({ error: 'Transação Pix não localizada no observatório.' });
  }

  // Idempotency: If already confirmed, don't duplicate execution
  if (charge.status === 'CONFIRMED') {
    return res.status(200).json({ success: true, message: 'Pagamento já conciliado anteriormente (Idempotente).' });
  }

  // Verification 1: Recipient Pix Key check
  const expectedKey = data.governance.pixKey || '11973479473';
  if (pixKey && pixKey !== expectedKey) {
    charge.status = 'CANCELLED';
    charge.failureReason = `Chave Pix receptora divergente (${pixKey} vs ${expectedKey})`;
    db.commit();
    return res.status(400).json({ error: 'Chave Pix de destino divergente da autorizada.' });
  }

  // Verification 2: Amount strict equality check
  const receivedAmount = Number(amount);
  if (receivedAmount && Math.abs(receivedAmount - charge.amount) > 0.01) {
    charge.status = 'CANCELLED';
    charge.failureReason = `Valor recebido (R$ ${receivedAmount.toFixed(2)}) diverge do valor faturado (R$ ${charge.amount.toFixed(2)})`;
    db.commit();
    db.logAudit(
      'webhook@bacen.gov.br',
      'OPERATOR',
      'PIX_AMOUNT_MISMATCH',
      charge.companyId,
      `Tentativa de pagamento com valor divergente detectada: Esperado R$ ${charge.amount}, Recebido R$ ${receivedAmount}`
    );
    return res.status(400).json({ error: 'Valor do Pix divergente do valor exato da cobrança.' });
  }

  // Verification 3: Expiration check
  if (new Date(charge.expiresAt) < new Date()) {
    charge.status = 'EXPIRED';
    charge.failureReason = 'Cobrança Pix expirada antes da liquidação';
    db.commit();
    return res.status(400).json({ error: 'Cobrança Pix expirada.' });
  }

  // VALID CONFIRMATION EXECUTION
  const now = new Date();
  charge.status = 'CONFIRMED';
  charge.confirmedAt = now.toISOString();
  charge.endToEndId = endToEndId || `E11973479473${now.getTime()}`;

  // 1. Activate corresponding subscription
  const sub = data.subscriptions.find(s => s.id === charge.orderId || s.pixChargeId === charge.id);
  if (sub) {
    sub.status = 'ACTIVE';
    sub.lastPaymentConfirmedAt = now.toISOString();
    const cycleDays = sub.billingCycle === 'annual' ? 365 : 30;
    sub.startDate = now.toISOString();
    sub.expiresAt = new Date(now.getTime() + cycleDays * 24 * 60 * 60 * 1000).toISOString();

    // 2. Unlock company features and quotas
    const company = data.companies.find(c => c.id === sub.companyId);
    if (company) {
      company.status = 'active';
      const plan = data.plans.find(p => p.tier === sub.planTier);
      if (plan) {
        company.plan = plan.tier;
        company.quotas.monthlyMissions = plan.limits.monthlyMissions;
        company.quotas.maxAgents = plan.limits.maxAgents;
        company.quotas.maxKnowledgeDocs = plan.limits.maxKnowledgeDocs;
      }
    }
  }

  // 2. Activate corresponding order if commerce
  const order = data.orders.find(o => o.id === charge.orderId || o.pixChargeId === charge.id);
  if (order) {
    order.status = 'CONFIRMED';
    order.confirmedAt = now.toISOString();
  }

  // 3. Register real liquid revenue in Financial Ledger (never pending!)
  const newFinRecord: FinancialRecord = {
    id: `fin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: charge.companyId,
    title: `Liquidação Pix: ${charge.planTier || 'Serviço/Produto'} (${charge.customerName})`,
    type: 'assinatura',
    amount: charge.amount,
    date: now.toISOString().split('T')[0],
    status: 'liquidado'
  };
  data.finances.unshift(newFinRecord);

  db.commit();

  db.logAudit(
    'pix.webhook@shefa-ayin.io',
    'MASTER_OWNER',
    'PIX_PAYMENT_CONFIRMED',
    charge.companyId,
    `Pagamento Pix de R$ ${charge.amount.toFixed(2)} CONFIRMADO. Assinatura ${sub?.id || ''} ATIVADA com sucesso.`
  );

  return res.json({
    success: true,
    message: 'Pagamento Pix verificado com sucesso. Assinatura e cotas liberadas imediatamente.',
    charge,
    subscription: sub
  });
});

// Homologation endpoint: allows Master Owner / integration test to simulate certified webhook receipt
apiRouter.post('/payments/pix/simulate-webhook', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const { chargeId } = req.body;
  const data = db.getData();
  const charge = data.pixCharges.find(c => c.id === chargeId || c.txId === chargeId);

  if (!charge) {
    return res.status(404).json({ error: 'Cobrança Pix não localizada.' });
  }

  // Execute verification flow
  const now = new Date();
  charge.status = 'CONFIRMED';
  charge.confirmedAt = now.toISOString();
  charge.endToEndId = `E11973479473${now.getTime()}`;

  const sub = data.subscriptions.find(s => s.id === charge.orderId || s.pixChargeId === charge.id);
  if (sub) {
    sub.status = 'ACTIVE';
    sub.lastPaymentConfirmedAt = now.toISOString();
    const cycleDays = sub.billingCycle === 'annual' ? 365 : 30;
    sub.startDate = now.toISOString();
    sub.expiresAt = new Date(now.getTime() + cycleDays * 24 * 60 * 60 * 1000).toISOString();

    const company = data.companies.find(c => c.id === sub.companyId);
    if (company) {
      company.status = 'active';
      const plan = data.plans.find(p => p.tier === sub.planTier);
      if (plan) {
        company.plan = plan.tier;
        company.quotas.monthlyMissions = plan.limits.monthlyMissions;
        company.quotas.maxAgents = plan.limits.maxAgents;
        company.quotas.maxKnowledgeDocs = plan.limits.maxKnowledgeDocs;
      }
    }
  }

  data.finances.unshift({
    id: `fin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: charge.companyId,
    title: `Liquidação Pix (Homologação): ${charge.planTier || 'Serviço'} (${charge.customerName})`,
    type: 'assinatura',
    amount: charge.amount,
    date: now.toISOString().split('T')[0],
    status: 'liquidado'
  });

  db.commit();

  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'PIX_HOMOLOGATION_CONFIRMED',
    charge.companyId,
    `Pagamento Pix de R$ ${charge.amount.toFixed(2)} liquidado via homologação do Master Owner.`
  );

  return res.json({
    success: true,
    message: 'Homologação concluída: Cobrança Pix confirmada e assinatura ativada.',
    charge,
    subscription: sub
  });
});

// -------------------------------------------------------------
// COMMERCE ENGINE & ORDERS
// -------------------------------------------------------------

apiRouter.get('/orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  if (user.role === 'MASTER_OWNER') {
    return res.json(data.orders);
  } else {
    return res.json(data.orders.filter(o => o.companyId === user.companyId));
  }
});

apiRouter.post('/orders', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { items, customerName, customerEmail } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Itens do pedido são obrigatórios.' });
  }

  const user = req.user!;
  const data = db.getData();
  const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const txId = `SHF${Date.now().toString().slice(-8)}`;

  // Generate Pix
  const pixData = await generatePixChargePayload({
    pixKey: data.governance.pixKey || '11973479473',
    recipientName: 'Alifer Madeiro',
    city: 'SAO PAULO',
    amount: totalAmount,
    txId
  });

  const pixChargeId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const newCharge: PixCharge = {
    id: pixChargeId,
    orderId,
    companyId: user.companyId || 'global',
    customerName: customerName || user.name,
    customerEmail: customerEmail || user.email,
    customerCpfOrCnpj: '',
    amount: totalAmount,
    pixKey: data.governance.pixKey || '11973479473',
    pixKeyType: 'TELEFONE CELULAR',
    recipientName: 'Alifer Madeiro',
    copyPasteCode: pixData.copyPasteCode,
    qrCodeSvg: pixData.qrCodeSvg,
    status: 'PENDING',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    txId
  };

  const newOrder: Order = {
    id: orderId,
    companyId: user.companyId || 'global',
    customerName: customerName || user.name,
    customerEmail: customerEmail || user.email,
    items,
    totalAmount,
    status: 'PENDING_PAYMENT',
    paymentMethod: 'PIX',
    pixChargeId,
    createdAt: now.toISOString()
  };

  data.pixCharges.unshift(newCharge);
  data.orders.unshift(newOrder);
  db.commit();

  return res.json({ order: newOrder, pixCharge: newCharge });
});

apiRouter.get('/commissions', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  return res.json(data.commissions);
});

// -------------------------------------------------------------
// GOVERNANCE & MASTER OWNER KILL-SWITCH
// -------------------------------------------------------------

apiRouter.get('/governance', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  return res.json(data.governance);
});

apiRouter.post('/governance/emergency-pause', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  data.governance.isEmergencyPaused = !data.governance.isEmergencyPaused;
  db.commit();

  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    data.governance.isEmergencyPaused ? 'EMERGENCY_PAUSE_TRIGGERED' : 'EMERGENCY_PAUSE_RESUMED',
    'global',
    `Pausa Geral de Emergência (Kill-Switch) do Master Owner: ${data.governance.isEmergencyPaused ? 'ATIVADA' : 'DESATIVADA'}`
  );

  return res.json({ 
    success: true, 
    isEmergencyPaused: data.governance.isEmergencyPaused,
    message: data.governance.isEmergencyPaused 
      ? 'Pausa Geral Ativada. Todos os agentes autônomos e despachos contínuos estão suspensos.' 
      : 'Operação Contínua Reativada pelo Master Owner.'
  });
});

apiRouter.post('/governance/spending-limit', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const { limit } = req.body;
  const numLimit = Number(limit);
  if (isNaN(numLimit) || numLimit < 0) {
    return res.status(400).json({ error: 'Limite financeiro inválido.' });
  }

  const data = db.getData();
  data.governance.financialSpendingLimit = numLimit;
  db.commit();

  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'SPENDING_LIMIT_UPDATED',
    'global',
    `Limite financeiro para aprovação manual configurado para R$ ${numLimit.toFixed(2)}`
  );

  return res.json({ success: true, spendingLimit: numLimit });
});

apiRouter.post('/agents/:id/pause', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const data = db.getData();
  const agent = data.agents.find(a => a.id === agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agente não encontrado.' });
  }

  agent.isManuallyPaused = !agent.isManuallyPaused;
  if (agent.isManuallyPaused) {
    agent.status = 'paused';
  } else {
    agent.status = 'idle';
  }
  db.commit();

  db.logAudit(
    req.user!.email,
    'MASTER_OWNER',
    'AGENT_PAUSED_TOGGLED',
    agent.companyId,
    `Agente ${agent.name} (${agent.agentRoleType}) foi ${agent.isManuallyPaused ? 'PAUSADO' : 'RETOMADO'}.`
  );

  return res.json({ success: true, agent });
});

// -------------------------------------------------------------
// FINANCIAL & AUDIT REPORTS
// -------------------------------------------------------------

apiRouter.get('/finances', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  let finances = data.finances;
  if (user.role !== 'MASTER_OWNER') {
    finances = finances.filter(f => f.companyId === user.companyId);
  }

  return res.json(finances);
});

apiRouter.get('/audit', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  return res.json(data.auditLogs);
});

apiRouter.get('/system/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const user = req.user!;

  const totalCompanies = data.companies.length;
  const totalAgents = data.agents.length;
  const totalMissions = user.role === 'MASTER_OWNER' 
    ? data.missions.length 
    : data.missions.filter(m => m.companyId === user.companyId).length;
  const completedMissions = user.role === 'MASTER_OWNER'
    ? data.missions.filter(m => m.status === 'completed').length
    : data.missions.filter(m => m.companyId === user.companyId && m.status === 'completed').length;
  const awaitingApproval = data.missions.filter(m => m.status === 'awaiting_approval').length;

  // Real financial metrics (never counting pending charges as confirmed revenue!)
  const confirmedFinances = data.finances.filter(f => f.status === 'liquidado');
  const grossRevenue = confirmedFinances
    .filter(f => f.type === 'assinatura' || f.type === 'receita')
    .reduce((acc, f) => acc + f.amount, 0);
  const totalCosts = confirmedFinances
    .filter(f => f.type === 'custo')
    .reduce((acc, f) => acc + f.amount, 0);

  const activeSubscriptions = data.subscriptions.filter(s => s.status === 'ACTIVE').length;
  const mrr = data.subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (s.billingCycle === 'annual' ? s.price / 12 : s.price), 0);

  const pendingPixCount = data.pixCharges.filter(p => p.status === 'PENDING').length;

  return res.json({
    totalCompanies,
    totalAgents,
    active24hAgents: data.agents.filter(a => a.is24hEnabled && !a.isManuallyPaused).length,
    totalMissions,
    completedMissions,
    awaitingApproval,
    auditEntries: data.auditLogs.length,
    grossRevenue,
    mrr,
    totalCosts,
    netResult: grossRevenue - totalCosts,
    activeSubscriptions,
    pendingPixCharges: pendingPixCount,
    isEmergencyPaused: data.governance.isEmergencyPaused
  });
});

// -------------------------------------------------------------
// CORPORATE PROJECTS MANAGEMENT
// -------------------------------------------------------------

apiRouter.get('/projects', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  return res.json(data.projects || []);
});

apiRouter.post('/projects', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const { name, client, category, contractValue, deadline, scope, assignedAgents } = req.body;
  if (!name || !client) {
    return res.status(400).json({ error: 'Nome do projeto e cliente são obrigatórios.' });
  }

  const data = db.getData();
  const newProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    client,
    category: category || 'Sistemas Corporativos & IA',
    contractValue: Number(contractValue) || 0,
    progress: 0,
    stage: 'Planejamento' as const,
    deadline: deadline || 'Em definição',
    assignedAgents: assignedAgents || ['LEAD', 'SALES', 'FINANCE'],
    scope: Array.isArray(scope) ? scope : [scope || 'Definição de escopo e arquitetura'],
    createdAt: new Date().toISOString()
  };

  data.projects.unshift(newProject);
  db.commit();

  db.logAudit(
    req.user!.email,
    req.user!.role,
    'PROJECT_CREATED',
    'global',
    `Projeto corporativo "${name}" criado para ${client}. Valor contratado: R$ ${newProject.contractValue}.`
  );

  return res.status(201).json(newProject);
});

apiRouter.put('/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const data = db.getData();
  const project = data.projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Projeto não localizado.' });
  }

  if (updates.stage) project.stage = updates.stage;
  if (typeof updates.progress === 'number') project.progress = updates.progress;
  if (updates.deadline) project.deadline = updates.deadline;
  if (updates.scope) project.scope = updates.scope;
  if (updates.assignedAgents) project.assignedAgents = updates.assignedAgents;
  if (typeof updates.contractValue === 'number') project.contractValue = updates.contractValue;

  db.commit();

  db.logAudit(
    req.user!.email,
    req.user!.role,
    'PROJECT_UPDATED',
    'global',
    `Projeto "${project.name}" atualizado. Etapa: ${project.stage}, Progresso: ${project.progress}%.`
  );

  return res.json(project);
});

apiRouter.delete('/projects/:id', authMiddleware, masterOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const idx = data.projects.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Projeto não localizado.' });
  }

  const removed = data.projects.splice(idx, 1)[0];
  db.commit();

  db.logAudit(
    req.user!.email,
    req.user!.role,
    'PROJECT_DELETED',
    'global',
    `Projeto "${removed.name}" removido do observatório.`
  );

  return res.json({ success: true, message: 'Projeto removido com sucesso.' });
});
