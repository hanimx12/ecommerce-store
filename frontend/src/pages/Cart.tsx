import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-[#1a1a2e] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/products">
            <Button variant="default">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/products" className="text-sm text-gray-400 hover:text-[#1a1a2e] flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">{totalItems} items</p>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1a1a2e] truncate">{item.title}</h3>
                      <p className="text-sm font-semibold text-[#e94560] mt-1">{(item.price * item.quantity).toFixed(2)} DT</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-[#1a1a2e] text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-2xl font-bold">{totalPrice.toFixed(2)} DT</span>
          </div>
          <p className="text-xs text-gray-400 mb-6">Shipping calculated at checkout</p>
          <Link to="/checkout">
            <Button variant="accent" size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
