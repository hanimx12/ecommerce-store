import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { addItem } = useCart()

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
  }, [])

  const categories = ['all', ...new Set(products.map(p => p.category))]
  const filtered = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-[#1a1a2e] tracking-tight">All Products</h1>
          <p className="text-gray-500 mt-2">Browse our curated collection of premium goods.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1a1a2e] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="group overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-gray-50">
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
                    <span className="font-semibold text-base sm:text-lg">${product.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        addItem({ id: product.id, title: product.title, price: product.price, image_url: product.image_url })
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
