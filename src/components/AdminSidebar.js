'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Tags, ShoppingBag, Image, FileText, Users, UserCircle, LogOut } from 'lucide-react'
import { account } from '@/lib/appwrite'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/slides', label: 'Slides', icon: Image },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try { await account.deleteSession('current') } catch {}
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href) => {
    if (href === '/admin/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="px-6 py-8">
        <Link href="/admin/dashboard" className="text-lg font-semibold tracking-tight">
          NOIR & ALABASTER
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded transition-colors ${
              isActive(href) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded w-full transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
