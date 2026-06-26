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
import categoryRoutes from './routes/categories';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-store-secret-key-change-in-production';

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

  // Seed categories on fresh database
  const catRow = queryOne('SELECT COUNT(*) as cnt FROM categories');
  if (!catRow || catRow.cnt === 0) {
    const cats = ['Accessories', 'Electronics', 'Footwear', 'Clothing', 'Home'];
    for (const name of cats) {
      try { run('INSERT INTO categories (name) VALUES (?)', [name]); } catch {}
    }
    console.log(`${cats.length} categories seeded`);
  }

  // Seed products on fresh database
  const row = queryOne('SELECT COUNT(*) as cnt FROM products');
  const productCount = row?.cnt ?? 0;
  if (productCount === 0) {
    const products = [
      { title: 'Minimalist Watch', description: 'Elegant timepiece with a clean dial and premium leather strap.', price: 249.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', category: 'Accessories' },
      { title: 'Wireless Headphones', description: 'Premium noise-cancelling headphones with 30hr battery life.', price: 349.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', category: 'Electronics' },
      { title: 'Sneakers Classic', description: 'Timeless design meets modern comfort with responsive cushioning.', price: 189.99, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category: 'Footwear' },
      { title: 'Leather Backpack', description: 'Handcrafted full-grain leather backpack with padded laptop sleeve.', price: 199.99, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', category: 'Accessories' },
      { title: 'Smart Speaker', description: 'Voice-controlled speaker with rich, room-filling 360° sound.', price: 129.99, image_url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600', category: 'Electronics' },
      { title: 'Sunglasses Aviator', description: 'Classic aviator style with UV400 protection and polarized lenses.', price: 159.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', category: 'Accessories' },
      { title: 'Canvas Backpack', description: 'Minimalist waxed canvas backpack with leather trim and roll-top closure.', price: 89.99, image_url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600', category: 'Accessories' },
      { title: 'Premium Hoodie', description: 'Heavyweight 400gsm organic cotton hoodie with relaxed fit.', price: 119.99, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', category: 'Clothing' },
      { title: 'Ceramic Mug Set', description: 'Set of 4 hand-thrown ceramic mugs in matte earth tones.', price: 49.99, image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', category: 'Home' },
      { title: 'Desk Lamp', description: 'Adjustable LED desk lamp with wireless charging base.', price: 79.99, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600', category: 'Home' },
    ];
    for (const p of products) {
      run('INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
        [p.title, p.description, p.price, p.image_url, p.category]);
    }
    console.log(`${products.length} products seeded`);
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/products', productRoutes);
  app.use('/api', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/categories', categoryRoutes);

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
