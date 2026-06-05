'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import DeleteProductButton from './DeleteProductButton'

export default function AdminProductsTable({ products }) {
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Product</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden sm:table-cell">Price</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden md:table-cell">Stock</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs uppercase tracking-widest text-ash">
                  {search ? 'No products match your search' : 'No products yet'}
                </td>
              </tr>
            )}
            {filtered.map((product) => (
              <tr key={product['$id']} className="border-b border-black/5 hover:bg-ivory/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-ivory flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ash text-[8px] uppercase">N/A</div>
                      )}
                    </div>
                    <span className="font-medium text-black text-sm">{product.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-ash text-sm hidden sm:table-cell">
                  {product.sale_price && product.sale_price < product.price
                    ? <span>Rs {product.sale_price.toFixed(2)}</span>
                    : <span>Rs {product.price.toFixed(2)}</span>}
                </td>
                <td className="py-3 px-4 text-sm hidden md:table-cell">
                  <span className={
                    product.stock_count === 0 ? 'text-ash' :
                    product.stock_count <= 5 ? 'text-red-500 font-medium' :
                    'text-black'
                  }>{product.stock_count}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product['$id']}`}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-ivory text-ash hover:text-black transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product['$id']} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
