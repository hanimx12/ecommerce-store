import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, LogOut, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [token, setToken] = useState('')
  const [form, setForm] = useState({ title: '', description: '', price: '', image_url: '', category: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [orderCount, setOrderCount] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const navigate = useNavigate()

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  })

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (!t) { navigate('/admin'); return }
    setToken(t)
    fetchProducts(t)
    fetchOrders(t)
  }, [])

  const fetchProducts = async (t: string) => {
    const res = await fetch('/api/products')
    setProducts(await res.json())
  }

  const fetchOrders = async (t: string) => {
    const res = await fetch('/api/orders', { headers: { 'Authorization': `Bearer ${t}` } })
    const data = await res.json()
    setOrderCount(data.length)
    setRevenue(data.reduce((sum: number, o: any) => sum + o.total, 0))
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
      category: form.category || 'general',
    }
    if (editingId) {
      await fetch(`/api/products/${editingId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) })
    } else {
      await fetch('/api/products', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })
    }
    setForm({ title: '', description: '', price: '', image_url: '', category: '' })
    setEditingId(null)
    fetchProducts(token)
  }

  const handleEdit = (p: Product) => {
    setForm({ title: p.title, description: p.description, price: p.price.toString(), image_url: p.image_url, category: p.category })
    setEditingId(p.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: getHeaders() })
    fetchProducts(token)
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package size={28} className="text-[#1a1a2e]" />
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">Dashboard</h1>
              <p className="text-sm text-gray-400">Manage your store</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={() => navigate('/admin/orders')}>
              <ShoppingCart size={14} /> Orders ({orderCount})
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Products</p>
                <p className="text-2xl font-bold text-[#1a1a2e]">{products.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <ShoppingCart size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Orders</p>
                <p className="text-2xl font-bold text-[#1a1a2e]">{orderCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-[#1a1a2e]">${revenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Product Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={18} /> {editingId ? 'Edit Product' : 'Add Product'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <Input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                  <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  <div className="flex gap-2">
                    <Button type="submit" variant="default" className="flex-1">
                      {editingId ? 'Update' : 'Add Product'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm({ title: '', description: '', price: '', image_url: '', category: '' }) }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">${p.price.toFixed(2)} · {p.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(p.id)}>Delete</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
