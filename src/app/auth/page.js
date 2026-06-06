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
  const [pendingEmail, setPendingEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

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

        if (!user.emailVerification) {
          await account.deleteSession('current')
          setError('Please verify your email before signing in. Check your inbox (including spam).')
          setPendingEmail(email)
          setLoading(false)
          return
        }

        router.push('/')
        router.refresh()
      } else {
        await account.create({ userId: ID.unique(), email, password, name })

        try {
          const origin = window.location.origin
          await account.createVerification(`${origin}/verify`)
        } catch (e) {
          setError('Account created but could not send verification email. Contact support.')
          setLoading(false)
          return
        }

        setPendingEmail(email)
        setVerificationSent(true)
        setLoading(false)
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
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setLoading(true)
    setError('')
    try {
      const origin = window.location.origin
      await account.createVerification(`${origin}/verify`)
      setVerificationSent(true)
    } catch {
      setError('Could not resend verification email. Try again later.')
    }
    setLoading(false)
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setVerificationSent(false)
    setPendingEmail('')
  }

  if (verificationSent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="w-full max-w-sm px-8 text-center">
          <div className="mb-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight mb-2">Check Your Email</h1>
            <p className="text-sm text-ash">
              We sent a verification link to <strong className="text-black">{pendingEmail}</strong>
            </p>
            <p className="text-xs text-ash mt-2">Click the link in the email to activate your account, then sign in.</p>
          </div>

          <div className="space-y-3">
            <button onClick={handleResend} disabled={loading}
              className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
            <button onClick={() => { setVerificationSent(false); setMode('login') }}
              className="w-full py-3 bg-ivory text-ash text-xs uppercase tracking-widest font-medium hover:text-black transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
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

          {error && pendingEmail && mode === 'login' && (
            <button onClick={handleResend} disabled={loading}
              className="w-full py-2.5 bg-ivory text-ash text-xs uppercase tracking-widest font-medium hover:text-black transition-colors disabled:opacity-50">
              Resend Verification Email
            </button>
          )}

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
