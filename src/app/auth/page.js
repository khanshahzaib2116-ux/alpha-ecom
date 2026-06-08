'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { account, ID } from '@/lib/appwrite'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.emailVerification) {
      router.push('/')
      router.refresh()
    }
  }, [user, router])

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
        const currentUser = await account.get()

        if (currentUser.labels?.includes('admin')) {
          await account.deleteSession('current')
          setError('Admins must sign in from the admin panel.')
          setLoading(false)
          return
        }

        if (!currentUser.emailVerification) {
          setError('Please verify your email before signing in. Check your inbox (including spam).')
          setPendingEmail(email)
          setLoading(false)
          return
        }

        await refreshUser()
        router.push('/')
        router.refresh()
      } else {
        await account.create({ userId: ID.unique(), email, password, name })

        try {
          const origin = window.location.origin
          await account.createVerification(`${origin}/verify`)
        } catch {
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

  const handleGoogleLogin = async () => {
    try {
      const origin = window.location.origin
      await account.createOAuth2Session('google', `${origin}/auth`, `${origin}/auth`)
    } catch {}
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
            <button onClick={async () => { try { await account.deleteSession('current') } catch {}; setVerificationSent(false); setMode('login'); setError('') }}
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[10px] uppercase tracking-widest text-ash">or continue with</span>
          </div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading}
          className="w-full py-3 border border-black/10 text-xs uppercase tracking-widest font-medium text-ash hover:text-black hover:border-black/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

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
