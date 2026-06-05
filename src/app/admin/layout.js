'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { account } from '@/lib/appwrite'
import AdminSidebar from '@/components/AdminSidebar'
import { Menu, X } from 'lucide-react'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
      <div className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform md:relative md:translate-x-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4 md:hidden">
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <AdminSidebar />
      </div>
      <div className="flex-1 bg-ivory min-w-0">
        <div className="sticky top-0 z-30 bg-ivory border-b border-black/5 px-4 py-3 md:hidden flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-ash hover:text-black transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-xs uppercase tracking-widest text-ash font-medium">Admin Panel</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
