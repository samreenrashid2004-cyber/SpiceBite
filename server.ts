import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './server/db.js';
import authRouter from './server/routes/auth.js';
import menuRouter from './server/routes/menu.js';
import cartRouter from './server/routes/cart.js';
import addressesRouter from './server/routes/addresses.js';
import couponsRouter from './server/routes/coupons.js';
import ordersRouter from './server/routes/orders.js';
import adminRouter from './server/routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database and seed tables
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'SpiceBite Indian Fast Food API (Lahore, Pakistan)',
    currency: 'PKR (Rs.)',
    timezone: 'Asia/Karachi',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api', menuRouter);
app.use('/api/cart', cartRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Support Server-Side Gemini API capability
app.post('/api/generate-content', async (req: Request, res: Response) => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const bodyObj = req.body || {};
  const rawModel = bodyObj.model || 'gemini-3-flash-preview';
  const model = rawModel === 'gemini-2.5-flash' ? 'gemini-3-flash-preview' : rawModel;
  const contents = typeof bodyObj.contents === 'string'
    ? [{ parts: [{ text: bodyObj.contents }] }]
    : Array.isArray(bodyObj.contents) ? bodyObj.contents : [bodyObj.contents];
  const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents, generationConfig: bodyObj.config }),
    });
    const data = await upstream.json();
    const text = (data as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    res.status(upstream.status).json({ ...(data as object), text });
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Setup Frontend serving (Vite in Dev, Dist static in Production)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode');
    } catch (err) {
      console.error('Failed to initialize Vite dev middleware:', err);
    }
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Fallback
      app.use(express.static(__dirname));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
