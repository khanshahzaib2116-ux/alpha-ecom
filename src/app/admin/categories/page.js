'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { Trash2, Plus } from 'lucide-react'

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    databases.listDocuments(DATABASE_ID, COLLECTIONS.categories, [])
      .then(({ documents }) => { if (documents) setCategories(documents); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.categories, ID.unique(), { name: name.trim(), slug })
      setName('')
      setLoading(false)
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.categories, id)
    const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.categories, [])
    if (documents) setCategories(documents)
  }

  if (fetching) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-ash">Loading</p>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category name"
          className="flex-1 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        <button type="submit" disabled={loading || !name.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
          <Plus size={14} /> Add
        </button>
      </form>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      <div className="bg-white divide-y divide-black/5">
        {categories.length === 0 && (
          <p className="py-8 text-center text-xs uppercase tracking-widest text-ash">No categories</p>
        )}
        {categories.map((cat) => (
          <div key={cat.$id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-black">{cat.name}</p>
              <p className="text-[10px] text-ash uppercase tracking-wider">{cat.slug}</p>
            </div>
            <button onClick={() => handleDelete(cat.$id)} className="p-1.5 text-ash hover:text-black transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
