'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { account } from '@/lib/appwrite'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    account.get()
      .then((u) => {
        setUser(u)
        setProfile({ full_name: u.name || '', is_admin: u.labels?.includes('admin') || false })
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const signOut = async () => {
    try {
      await account.deleteSession('current')
    } catch {}
    setUser(null)
    setProfile(null)
  }

  const refreshUser = async () => {
    try {
      const u = await account.get()
      setUser(u)
      setProfile({ full_name: u.name || '', is_admin: u.labels?.includes('admin') || false })
    } catch {
      setUser(null)
      setProfile(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (user.emailVerification) return
    if (pathname === '/auth' || pathname === '/verify') return
    router.push('/auth')
  }, [user, loading, pathname, router])

  return <>{children}</>
}
