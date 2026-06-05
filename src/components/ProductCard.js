'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const [imgError, setImgError] = useState(false)

  const isOnSale = product.sale_price && product.sale_price < product.price
  const inStock = product.stock_count > 0
  const lowStock = product.stock_count > 0 && product.stock_count <= 5
  const wishlisted = isWishlisted(product.id)

  return (
    <div className="group bg-white animate-slide-up relative">
      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product) }}
        className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={16}
          className={wishlisted ? 'fill-black text-black' : 'text-ash'}
        />
      </button>

      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-[4/5] bg-ivory overflow-hidden">
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-ivory text-ash">
              <svg className="w-10 h-10 mb-2 text-ash/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">No Image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="pt-4 pb-6 space-y-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm text-black tracking-wide">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="text-sm font-semibold text-black">
                Rs {product.sale_price.toFixed(2)}
              </span>
              <span className="text-xs text-ash line-through">
                Rs {product.price.toFixed(2)}
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-black text-white px-1.5 py-0.5 font-medium">
                Sale
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-black">
              Rs {product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {inStock ? (
            lowStock ? (
              <span className="text-[10px] uppercase tracking-wider text-ash">
                Low Stock
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-black/60">
                In Stock
              </span>
            )
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-ash">
              Out of Stock
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            if (inStock) addItem(product)
          }}
          disabled={!inStock}
          className={`w-full py-2.5 text-xs uppercase tracking-widest font-medium transition-colors ${
            inStock
              ? 'bg-black text-white hover:bg-charcoal'
              : 'bg-smoke text-ash cursor-not-allowed'
          }`}
        >
          {inStock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  )
}
