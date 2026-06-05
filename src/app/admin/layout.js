'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { account } from '@/lib/appwrite'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    if (!account) {
      router.push('/admin/login')
      return
    }
    account.get()
      .then((user) => {
        const isAdmin = user.labels?.includes('admin')
        if (!isAdmin) {
          setUnauthorized(true)
          setLoading(false)
          return
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/admin/login')
      })
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Access Denied</h1>
          <p className="text-sm text-ash mb-6">You don&apos;t have admin privileges.</p>
          <button
            onClick={() => { account.deleteSession('current'); router.push('/admin/login') }}
            className="text-xs uppercase tracking-widest bg-black text-white px-6 py-3 inline-block hover:bg-charcoal transition-colors"
          >
            Sign in as Admin
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-ash">Loading</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 bg-ivory">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
