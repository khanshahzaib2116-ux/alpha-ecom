'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { account, ID } from '@/lib/appwrite'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        await account.createEmailPasswordSession({ email, password })
        const user = await account.get()
        if (user.labels?.includes('admin')) {
          await account.deleteSession('current')
          setError('Admins must sign in from the admin panel.')
          setLoading(false)
          return
        }
        router.push('/')
        router.refresh()
      } else {
        await account.create({ userId: ID.unique(), email, password, name })
        await account.createEmailPasswordSession({ email, password })

        try {
          const origin = window.location.origin
          await account.createVerification(`${origin}/verify`)
          setVerificationSent(true)
        } catch {
          // verification template might not be configured yet
        }

        router.push('/')
        router.refresh()
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already exists')) {
        setError('An account with this email already exists. Please sign in.')
      } else if (msg.includes('Invalid credentials')) {
        setError('Invalid email or password.')
      } else if (msg.includes('at least 8')) {
        setError('Password must be at least 8 characters.')
      } else {
        setError(msg || 'Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setVerificationSent(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-10">
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-xs text-ash mt-1 uppercase tracking-widest">
            {mode === 'login' ? 'Welcome back' : 'Join Noir & Alabaster'}
          </p>
        </div>

        {verificationSent && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-center">
            <p className="text-xs text-green-700 font-medium mb-1">Account created!</p>
            <p className="text-[10px] text-green-600">Check your email to verify your account.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Jane Doe" />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
              className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="••••••••" />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-ivory text-sm text-black placeholder:text-ash/50 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="••••••••" />
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={switchMode}
            className="text-xs text-ash hover:text-black uppercase tracking-widest transition-colors">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[10px] text-ash hover:text-black uppercase tracking-widest transition-colors">
            &larr; Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
