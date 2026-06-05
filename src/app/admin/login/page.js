'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await account.createEmailPasswordSession({ email, password })
      const user = await account.get()

      const isAdmin = user.labels?.includes('admin')

      if (!isAdmin) {
        await account.deleteSession('current')
        setError('Unauthorized — admin access only')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-10">
          <h1 className="text-xl font-semibold tracking-tight">NOIR & ALABASTER</h1>
          <p className="text-[10px] uppercase tracking-widest text-ash mt-1">
            Admin Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
