import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getDb, initSchema, run, queryOne } from './database';
import productRoutes from './routes/products';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Serve built frontend
const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(distPath));

async function start() {
  await getDb();
  initSchema();

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = queryOne('SELECT id FROM users WHERE username = ?', [adminUsername]);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [adminUsername, hash]);
    console.log(`Admin user created: ${adminUsername}`);
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/products', productRoutes);
  app.use('/api', authRoutes);
  app.use('/api/orders', orderRoutes);

  // SPA catch-all: serve index.html for any non-API route
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin login: http://localhost:${PORT}/admin`);
  });
}

start();
