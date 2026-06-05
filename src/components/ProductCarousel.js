'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCarousel({ products }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (!products || products.length === 0) return null

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-ivory transition-colors opacity-0 group-hover:opacity-100 -ml-5"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-ivory transition-colors opacity-0 group-hover:opacity-100 -mr-5"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <Link
            key={product.id || product.$id}
            href={`/product/${product.id || product.$id}`}
            className="flex-shrink-0 w-64 group/card"
          >
            <div className="aspect-[4/5] bg-white overflow-hidden mb-3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center') }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ash text-[10px] uppercase bg-white">No Image</div>
              )}
            </div>
            <h3 className="text-sm font-medium text-black truncate">{product.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {product.sale_price && product.sale_price < product.price ? (
                <>
                  <span className="text-sm font-semibold text-black">Rs {product.sale_price.toFixed(2)}</span>
                  <span className="text-xs text-ash line-through">Rs {product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-black">Rs {product.price.toFixed(2)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
