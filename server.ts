import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.js';
import { agentEngine } from './server/agentEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Restricted CORS middleware: allows authorized AI Studio Preview and App domains
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isAllowedOrigin = (orig: string): boolean => {
      if (!orig) return true;
      if (orig.includes('localhost') || orig.includes('127.0.0.1')) return true;
      if (orig.endsWith('.run.app')) return true;
      if (orig.endsWith('.google.com') || orig.endsWith('.aistudio.google.com')) return true;
      if (process.env.APP_URL && orig === process.env.APP_URL) return true;
      return false;
    };

    if (origin && isAllowedOrigin(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    } else if (!origin) {
      // Same-origin, direct API calls, curl, or server-to-server
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-shefa-webhook-secret');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount API routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', system: 'SHEFA_AYIN_OBSERVATORY', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Start background continuous agent engine
  agentEngine.start();

  app.listen(port, '0.0.0.0', () => {
    console.log(`[SHEFA AYIN] The Intelligence Observatory operational at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('[SERVER BOOT ERROR]', err);
  process.exit(1);
});
