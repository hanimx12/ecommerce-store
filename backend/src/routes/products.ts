import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const products = queryAll('SELECT * FROM products ORDER BY created_at DESC');
  res.json(products);
});

router.get('/:id', (req: Request, res: Response) => {
  const product = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

export default router;
