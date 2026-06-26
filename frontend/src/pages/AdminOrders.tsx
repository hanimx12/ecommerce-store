import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, LogOut, Package, Mail, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CartItem {
  id: number
  title: string
  price: number
  quantity: number
}

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_address: string
  total: number
  items: string
  status: string
  created_at: string
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { navigate('/admin'); return }
    fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setOrders)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart size={28} className="text-[#1a1a2e]" />
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">Orders</h1>
              <p className="text-sm text-gray-400">{orders.length} total orders</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>Products</Button>
            <Button variant="ghost" onClick={handleLogout}><LogOut size={16} /> Logout</Button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                No orders yet
              </CardContent>
            </Card>
          )}

          {orders.map(order => {
            const items: CartItem[] = JSON.parse(order.items)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  {/* Order Header */}
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center font-bold text-sm">
                          #{order.id}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a1a2e]">{order.customer_name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1"><Mail size={11} /> {order.customer_email}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-[#e94560]">{order.total.toFixed(2)} DT</p>
                          <p className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="flex items-start gap-2 text-sm mb-4 p-3 rounded-lg bg-gray-50">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-0.5">Shipping Address</p>
                        <p className="text-gray-600">{order.customer_address || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Items Purchased</p>
                      <div className="rounded-lg overflow-hidden border border-gray-100">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-gray-500 text-xs">Product</th>
                              <th className="text-center px-3 py-2 font-medium text-gray-500 text-xs">Qty</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">Unit Price</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => (
                              <tr key={i} className="border-t border-gray-50">
                                <td className="px-3 py-2.5 font-medium">{item.title}</td>
                                <td className="px-3 py-2.5 text-center text-gray-500">{item.quantity}</td>
                                <td className="px-3 py-2.5 text-right text-gray-500">{item.price.toFixed(2)} DT</td>
                                <td className="px-3 py-2.5 text-right font-semibold">{(item.price * item.quantity).toFixed(2)} DT</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t border-gray-100">
                            <tr>
                              <td colSpan={3} className="px-3 py-2.5 text-right font-medium text-gray-600">Total</td>
                              <td className="px-3 py-2.5 text-right font-bold text-[#e94560]">{order.total.toFixed(2)} DT</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                      <span>Order #{order.id} · {new Date(order.created_at).toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{order.status}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
