import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setError('Invalid credentials')
        return
      }
      const data = await res.json()
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/dashboard')
    } catch {
      setError('Connection error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4f0] to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <ShieldAlert size={40} className="mx-auto text-[#1a1a2e] mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your store</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <Input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="default" size="lg" className="w-full">Sign In</Button>
        </form>
      </motion.div>
    </div>
  )
}
