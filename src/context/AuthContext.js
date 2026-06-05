'use client'

import { createContext, useContext, useState, useEffect } from 'react'
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
