import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, ShoppingBag, Check } from 'lucide-react'
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

interface Review {
  name: string
  rating: number
  text: string
  date: string
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'star' : 'star empty'}>★</span>
      ))}
    </div>
  )
}

function generateReviews(title: string): Review[] {
  const names = ['Alex M.', 'Jordan K.', 'Sam T.', 'Riley P.', 'Casey B.', 'Morgan L.', 'Taylor R.', 'Jamie W.']
  const reviews = [
    { rating: 5, text: `Absolutely love this ${title.toLowerCase()}! Exceeded my expectations.` },
    { rating: 4, text: `Great quality for the price. Would recommend to anyone.` },
    { rating: 5, text: `Bought this as a gift and they couldn't stop raving about it.` },
    { rating: 3, text: `Good product but shipping took a bit longer than expected.` },
    { rating: 4, text: `Beautiful design and solid build. Very happy with my purchase.` },
    { rating: 5, text: `Second one I've bought. That's how much I like it!` },
  ]
  return reviews.slice(0, 4 + Math.floor(Math.random() * 3)).map((r, i) => ({
    ...r,
    name: names[i % names.length],
    date: `${2025 + Math.floor(i / 4)}-${String(1 + (i * 3) % 12).padStart(2, '0')}-${String(1 + (i * 7) % 28).padStart(2, '0')}`,
  }))
}

function generateImages(seed: string): string[] {
  const base = seed.includes('photo') ? seed.split('?')[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
  return [
    seed,
    base.replace(/w=(\d+)/, 'w=600&rot=90'),
    base.replace(/w=(\d+)/, 'w=600&rot=180'),
    `https://picsum.photos/seed/${seed.replace(/[^a-z]/gi, '').slice(-8)}/600/600`,
    `https://picsum.photos/seed/${seed.replace(/[^a-z]/gi, '').slice(-8)}rev/600/600`,
  ]
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews] = useState<Review[]>([])

  const allImages = product ? generateImages(product.image_url) : []
  const avgRating = 4.5
  const reviewList = reviews.length > 0 ? reviews : generateReviews(product?.title || '')

  const inCart = product ? items.find(i => i.id === product.id) : null

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        return fetch('/api/products')
      })
      .then(r => r.json())
      .then(all => {
        if (product) setRelated(all.filter((p: Product) => p.category === product.category && p.id !== product.id).slice(0, 4))
        else setRelated(all.slice(0, 4))
      })
  }, [id])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-[#1a1a2e] flex items-center gap-1 mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={allImages[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === i ? 'border-[#e94560]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl font-bold text-[#1a1a2e] mt-1">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-gray-500">{avgRating} out of 5</span>
              <span className="text-sm text-gray-400">({reviewList.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <span className="text-4xl font-bold text-[#1a1a2e]">{product.price.toFixed(2)} DT</span>
              <span className="text-sm text-gray-400 ml-2">Free shipping</span>
            </div>

            {/* Description */}
            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="mt-6 space-y-2">
              {['Premium quality materials', 'Free shipping worldwide', '30-day return policy', '1 year warranty'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-green-500" />
                  {f}
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <div className="mt-8 flex items-center gap-4">
              <Button
                variant="accent"
                size="lg"
                className="flex-1"
                onClick={() => addItem({ id: product.id, title: product.title, price: product.price, image_url: product.image_url })}
              >
                <ShoppingBag size={18} />
                {inCart ? `Add Another (${inCart.quantity} in cart)` : 'Add to Cart'}
              </Button>
            </div>

            {/* Shipping info */}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 text-sm text-gray-500">
              Free shipping on orders over 50 DT. Estimated delivery: 5-8 business days.
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Customer Reviews</h2>
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-gray-50 inline-flex">
            <span className="text-3xl font-bold">{avgRating}</span>
            <div>
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-xs text-gray-400">{reviewList.length} global ratings</span>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            {reviewList.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.name}</span>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-sm text-gray-600 mt-2">{review.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/product/${p.id}`}>
                    <Card className="group overflow-hidden cursor-pointer hover:shadow-md transition-all">
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm truncate">{p.title}</h3>
                        <span className="font-semibold text-sm">{p.price.toFixed(2)} DT</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
