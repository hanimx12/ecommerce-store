import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'

interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const { addItem } = useCart()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
  }, [])

  const featured = products.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f8f4f0] to-white">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center px-4 max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-medium text-[#e94560] tracking-widest uppercase mb-4"
          >
            Premium Collection
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1a1a2e] leading-tight"
          >
            Designed for the
            <br />
            <span className="text-[#e94560]">modern life</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg text-gray-500 max-w-xl mx-auto"
          >
            Curated essentials that blend timeless design with everyday functionality.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Link to="/products">
              <Button variant="accent" size="lg">
                Shop Now <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg">
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={24} className="text-gray-300 animate-bounce" />
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm font-medium text-[#e94560] tracking-widest uppercase">Collection</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mt-2">Featured Products</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#1a1a2e] hover:text-[#e94560] transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>
                <CardContent className="p-3 sm:p-4">
                  <Link to={`/product/${product.id}`}>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-medium text-[#1a1a2e] mt-0.5 hover:text-[#e94560] transition-colors">{product.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        addItem({ id: product.id, title: product.title, price: product.price, image_url: product.image_url })
                      }}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Link to="/products">
            <Button variant="outline">View All Products <ArrowRight size={14} /></Button>
          </Link>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Curated Quality', desc: 'Every product is hand-picked for its design and durability.' },
              { title: 'Sustainable Mindset', desc: 'We partner with makers who share our commitment to the planet.' },
              { title: 'Timeless Design', desc: 'Clean aesthetics that transcend seasonal trends.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#e94560]/20 flex items-center justify-center mx-auto mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#e94560]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2026 NOVA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
