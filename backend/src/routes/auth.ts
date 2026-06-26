import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, run, update, remove, queryAll } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  const { username, password } = parsed.data;
  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  res.json({ token, username: user.username });
});

const productCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive(),
  image_url: z.string().max(500).optional().default(''),
  category: z.string().max(100).optional().default('general'),
});

const productUpdateSchema = productCreateSchema.partial();

router.post('/products', authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  const { title, description, price, image_url, category } = parsed.data;
  const id = run(
    'INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
    [title, description, price, image_url, category]
  );
  const product = queryOne('SELECT * FROM products WHERE id = ?', [id]);
  res.status(201).json(product);
});

router.put('/products/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  const existing = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const { title, description, price, image_url, category } = parsed.data;
  update(
    'UPDATE products SET title = COALESCE(?, title), description = COALESCE(?, description), price = COALESCE(?, price), image_url = COALESCE(?, image_url), category = COALESCE(?, category) WHERE id = ?',
    [title ?? null, description ?? null, price ?? null, image_url ?? null, category ?? null, req.params.id]
  );
  const product = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(product);
});

router.delete('/products/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const existing = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  remove('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

router.get('/orders', authMiddleware, (req: AuthRequest, res: Response) => {
  const orders = queryAll('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(orders);
});

export default router;
