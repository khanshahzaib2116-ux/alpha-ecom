'use client'

import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function WishlistPage() {
  const { items, toggleItem } = useWishlist()
  const { addItem } = useCart()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ash hover:text-black transition-colors mb-8">
        <ArrowLeft size={14} />
        Back to Store
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight mb-8">Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={40} className="mx-auto text-smoke mb-4" />
          <p className="text-sm text-ash uppercase tracking-widest mb-4">Your wishlist is empty</p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map(product => (
            <div key={product.id} className="group bg-white">
              <Link href={`/product/${product.id}`} className="block relative">
                <div className="aspect-[4/5] bg-ivory overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ash text-[10px] uppercase">No Image</div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleItem(product) }}
                  className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors"
                >
                  <Heart size={16} className="fill-black text-black" />
                </button>
              </Link>
              <div className="pt-4 pb-6 space-y-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium text-sm text-black tracking-wide">{product.title}</h3>
                </Link>
                <p className="text-sm font-semibold text-black">
                  Rs {(product.sale_price || product.price).toFixed(2)}
                </p>
                <button
                  onClick={() => addItem(product)}
                  className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
