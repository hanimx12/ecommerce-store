import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_address: form.address,
          items: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Order failed')
      }
      clearCart()
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
          <p className="text-gray-400 text-sm mb-6">Your order has been placed and will be shipped within 2 business days.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="default" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0 && !done) {
    navigate('/cart')
    return null
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/cart')} className="text-sm text-gray-400 hover:text-[#1a1a2e] flex items-center gap-1 mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-[#1a1a2e] mb-8">Checkout</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Shipping Address</label>
                <Textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, Country" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gray-50 p-6 sticky top-24">
              <h3 className="font-semibold text-[#1a1a2e] mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[200px]">{item.title} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-[#e94560]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
