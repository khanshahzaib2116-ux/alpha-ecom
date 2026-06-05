'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, User, Heart, Package, LogOut } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ categories = [] }) {
  const { totalItems, setIsOpen } = useCart()
  const { user, profile, signOut } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold tracking-tight text-black">
            NOIR & ALABASTER
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.slug ? `/shop/${cat.slug}` : '/'}
                className="text-sm uppercase tracking-widest text-ash hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              className="relative p-2 text-ash hover:text-black transition-colors hidden md:block"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-black text-white text-xs font-medium flex items-center justify-center hover:bg-charcoal transition-colors"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/5 shadow-lg">
                    <div className="px-4 py-3 border-b border-black/5">
                      <p className="text-xs font-medium text-black truncate">{profile?.full_name || user.email}</p>
                      <p className="text-[10px] text-ash truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-ash hover:text-black hover:bg-ivory transition-colors"
                    >
                      <Package size={14} />
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-ash hover:text-black hover:bg-ivory transition-colors"
                    >
                      <Heart size={14} />
                      Wishlist
                    </Link>
                    {profile?.is_admin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-black font-medium hover:bg-ivory transition-colors border-t border-black/5"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-ash hover:text-black hover:bg-ivory transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="p-2 text-ash hover:text-black transition-colors"
              >
                <User size={20} />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-ash hover:text-black transition-colors"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-ash hover:text-black"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="px-4 py-4 space-y-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.slug ? `/shop/${cat.slug}` : '/'}
                onClick={() => setMobileOpen(false)}
                className="block text-sm uppercase tracking-widest text-ash hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <hr className="border-black/5" />
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-ash hover:text-black transition-colors"
            >
              Wishlist ({wishlistCount})
            </Link>
            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-ash hover:text-black transition-colors"
                >
                  My Orders
                </Link>
                {profile?.is_admin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-black font-medium hover:text-black transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="block text-sm text-ash hover:text-black transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-ash hover:text-black transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
