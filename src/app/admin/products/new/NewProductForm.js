'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite'

export default function NewProductForm({ categories = [] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '', sale_price: '',
    stock_count: '0', category_id: '', image_url: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock_count: parseInt(form.stock_count, 10),
      category_id: form.category_id || null,
      image_url: form.image_url || null,
    }

    if (payload.sale_price && payload.sale_price >= payload.price) {
      payload.sale_price = null
    }

    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.products, ID.unique(), payload)
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)} required
            className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
            className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Price (Rs)</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={e => update('price', e.target.value)} required
              className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Sale Price (Rs)</label>
            <input type="number" step="0.01" min="0" value={form.sale_price} onChange={e => update('sale_price', e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Stock Count</label>
            <input type="number" min="0" value={form.stock_count} onChange={e => update('stock_count', e.target.value)} required
              className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Category</label>
            <select value={form.category_id} onChange={e => update('category_id', e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1.5">Image URL</label>
          <input type="url" value={form.image_url} onChange={e => update('image_url', e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" placeholder="https://..." />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')}
            className="px-6 py-2.5 bg-ivory text-ash text-xs uppercase tracking-widest font-medium hover:text-black transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
