'use client'

import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPanel() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
  const { user } = useAuth()
  const [imgErrors, setImgErrors] = useState({})

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 cart-enter shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span className="text-sm font-medium">Cart ({totalItems})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-ash hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <ShoppingBag size={40} className="text-smoke mb-4" />
              <p className="text-sm text-ash uppercase tracking-widest">
                Your cart is empty
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-black/5">
                    <div className="w-20 h-24 bg-ivory flex-shrink-0 overflow-hidden">
                      {item.image_url && !imgErrors[item.id] ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ash text-[10px] uppercase">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-black truncate">
                        {item.title}
                      </h4>
                      <p className="text-sm font-semibold text-black mt-1">
                        Rs {(item.sale_price || item.price).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-ash hover:text-black transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-ash hover:text-black transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-ash hover:text-black self-start transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/5 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider text-ash">Total</span>
                  <span className="text-lg font-semibold">Rs {totalPrice.toFixed(2)}</span>
                </div>
                <Link
                  href={user ? '/checkout' : '/auth'}
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-black text-white text-center text-sm uppercase tracking-widest font-medium hover:bg-charcoal transition-colors"
                >
                  {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-ivory text-ash text-center text-xs uppercase tracking-widest font-medium hover:text-black transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
