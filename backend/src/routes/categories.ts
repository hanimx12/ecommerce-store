import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { run, queryAll, queryOne, remove } from '../database';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(100),
});

// Get all categories
router.get('/', (_req: Request, res: Response) => {
  const categories = queryAll('SELECT * FROM categories ORDER BY name ASC');
  res.json(categories);
});

// Create category (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  const { name } = parsed.data;
  try {
    const id = run('INSERT INTO categories (name) VALUES (?)', [name]);
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json(category);
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    throw err;
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const existing = queryOne('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Category not found' });
  remove('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted' });
});

export default router;
