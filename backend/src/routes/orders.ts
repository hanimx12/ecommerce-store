import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { queryOne, run } from '../database';

const router = Router();

const orderSchema = z.object({
  customer_name: z.string().min(1).max(200),
  customer_email: z.string().email().max(200),
  customer_address: z.string().max(500).optional().default(''),
  items: z.array(z.object({
    id: z.number(),
    title: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1),
});

router.post('/', (req: Request, res: Response) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid order', details: parsed.error.issues });

  const { customer_name, customer_email, customer_address, items } = parsed.data;
  let total = 0;
  for (const item of items) {
    const product = queryOne('SELECT price FROM products WHERE id = ?', [item.id]);
    if (!product) return res.status(400).json({ error: `Product id ${item.id} not found` });
    total += product.price * item.quantity;
  }

  const id = run(
    'INSERT INTO orders (customer_name, customer_email, customer_address, total, items) VALUES (?, ?, ?, ?, ?)',
    [customer_name, customer_email, customer_address, total, JSON.stringify(items)]
  );

  const order = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
  res.status(201).json(order);
});

export default router;
