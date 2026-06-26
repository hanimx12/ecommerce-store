import { getDb, initSchema, run, queryOne } from './database';
import bcrypt from 'bcryptjs';

async function seed() {
  await getDb();
  initSchema();

  const adminExists = queryOne('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('Admin user created (admin / admin123)');
  }

  const row = queryOne('SELECT COUNT(*) as cnt FROM products');
  const productCount = row?.cnt ?? 0;

  if (productCount === 0) {
    const products = [
      { title: 'Minimalist Watch', description: 'Elegant timepiece with a clean dial and premium leather strap. Featuring sapphire crystal glass, Japanese quartz movement, and a genuine Italian leather band.', price: 249.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', category: 'Accessories' },
      { title: 'Wireless Headphones', description: 'Premium noise-cancelling headphones with 30hr battery life, Hi-Res audio support, and ultra-comfortable memory foam ear cushions.', price: 349.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', category: 'Electronics' },
      { title: 'Sneakers Classic', description: 'Timeless design meets modern comfort with responsive cushioning, breathable mesh upper, and a durable rubber outsole. Perfect for everyday wear.', price: 189.99, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category: 'Footwear' },
      { title: 'Leather Backpack', description: 'Handcrafted full-grain leather backpack with padded laptop sleeve, multiple organizer pockets, and brass hardware. Ages beautifully with use.', price: 199.99, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', category: 'Accessories' },
      { title: 'Smart Speaker', description: 'Voice-controlled speaker with rich, room-filling 360° sound, smart home hub functionality, and multi-room audio support.', price: 129.99, image_url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600', category: 'Electronics' },
      { title: 'Sunglasses Aviator', description: 'Classic aviator style with UV400 protection, gold frame, polarized lenses, and spring hinges for all-day comfort.', price: 159.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', category: 'Accessories' },
      { title: 'Canvas Backpack', description: 'Minimalist waxed canvas backpack with leather trim, roll-top closure, and padded laptop compartment. Built to last a lifetime.', price: 89.99, image_url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600', category: 'Accessories' },
      { title: 'Premium Hoodie', description: 'Heavyweight 400gsm organic cotton hoodie with a relaxed fit, ribbed cuffs, and a kangaroo pocket. Pre-shrunk for lasting fit.', price: 119.99, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', category: 'Clothing' },
      { title: 'Ceramic Mug Set', description: 'Set of 4 hand-thrown ceramic mugs in matte earth tones. Microwave and dishwasher safe. Each piece is slightly unique.', price: 49.99, image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', category: 'Home' },
      { title: 'Desk Lamp', description: 'Adjustable LED desk lamp with wireless charging base, 5 brightness levels, 3 color temperatures, and a sleek aluminum arm.', price: 79.99, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600', category: 'Home' },
    ];
    for (const p of products) {
      run('INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
        [p.title, p.description, p.price, p.image_url, p.category]);
    }
    console.log(`${products.length} products seeded`);
  }
  console.log('Seed complete!');
}

seed();
