'use client'

import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { useState, useEffect } from 'react'

export default function ClientProductDetail({ product }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const [imgError, setImgError] = useState(false)
  const [related, setRelated] = useState([])

  const enriched = { ...product, id: product.$id }

  useEffect(() => {
    if (product.category_id) {
      databases.listDocuments(DATABASE_ID, COLLECTIONS.products, [
        Query.equal('category_id', product.category_id),
        Query.notEqual('$id', product.$id),
        Query.limit(4),
      ]).then(({ documents }) => { if (documents) setRelated(documents) })
    }
  }, [product.category_id, product.$id])

  const isOnSale = product.sale_price && product.sale_price < product.price
  const inStock = product.stock_count > 0
  const lowStock = product.stock_count > 0 && product.stock_count <= 5
  const wishlisted = isWishlisted(product.$id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ash hover:text-black transition-colors mb-10"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="aspect-[4/5] bg-ivory overflow-hidden relative">
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-ivory text-ash">
              <svg className="w-16 h-16 mb-3 text-ash/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs uppercase tracking-wider">No Image</span>
            </div>
          )}
          <button
            onClick={() => toggleItem(enriched)}
            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              className={wishlisted ? 'fill-black text-black' : 'text-ash'}
            />
          </button>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            {product.title}
          </h1>

          <div className="flex items-center gap-3 mt-4">
            {isOnSale ? (
              <>
                <span className="text-2xl font-semibold text-black">
                  Rs {product.sale_price.toFixed(2)}
                </span>
                <span className="text-lg text-ash line-through">
                  Rs {product.price.toFixed(2)}
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-black text-white px-2 py-0.5 font-medium">
                  Sale
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-black">
                Rs {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-2">
            {inStock ? (
              lowStock ? (
                <span className="text-xs uppercase tracking-wider text-ash">
                  Only {product.stock_count} left — Low Stock
                </span>
              ) : (
                <span className="text-xs uppercase tracking-wider text-black/60">
                  In Stock ({product.stock_count} available)
                </span>
              )
            ) : (
              <span className="text-xs uppercase tracking-wider text-ash">
                Out of Stock
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-sm text-ash leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-6 text-xs text-ash uppercase tracking-wider">
            Free shipping on orders Rs 50+ &bull; Cash on Delivery
          </div>

          <button
            onClick={() => addItem(enriched)}
            disabled={!inStock}
            className={`mt-6 w-full py-3.5 text-sm uppercase tracking-widest font-medium transition-colors ${
              inStock
                ? 'bg-black text-white hover:bg-charcoal'
                : 'bg-smoke text-ash cursor-not-allowed'
            }`}
          >
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {related.map((r) => (
              <Link key={r.$id} href={`/product/${r.$id}`} className="group">
                <div className="aspect-[4/5] bg-ivory overflow-hidden mb-3">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center') }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ash text-[10px] uppercase">No Image</div>
                  )}
                </div>
                <h3 className="text-xs font-medium text-black truncate">{r.title}</h3>
                <p className="text-xs font-semibold text-black mt-1">
                  Rs {(r.sale_price || r.price).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
