'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { Trash2, Plus } from 'lucide-react'

export default function AdminSlidesPage() {
  const router = useRouter()
  const [slides, setSlides] = useState([])
  const [fetching, setFetching] = useState(true)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('/')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    databases.listDocuments(DATABASE_ID, COLLECTIONS.carouselSlides, [])
      .then(({ documents }) => { if (documents) setSlides(documents); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!imageUrl.trim()) return
    setLoading(true)
    setError('')
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.carouselSlides, ID.unique(), {
        title: title.trim(),
        subtitle: subtitle.trim(),
        redirect_url: redirectUrl.trim() || '/',
        image_url: imageUrl.trim(),
      })
      setTitle(''); setSubtitle(''); setRedirectUrl('/'); setImageUrl('')
      setLoading(false)
      const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.carouselSlides, [])
      if (documents) setSlides(documents)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.carouselSlides, id)
    const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.carouselSlides, [])
    if (documents) setSlides(documents)
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Hero Slides</h1>

      <form onSubmit={handleAdd} className="max-w-lg mb-10 space-y-4 p-6 bg-white">
        <p className="text-xs uppercase tracking-widest text-ash font-medium">Add New Slide</p>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Premium T-Shirts"
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Subtitle</label>
          <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Crafted for the modern minimalist"
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Redirect URL</label>
          <input type="text" value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="/shop/t-shirts"
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Image URL *</label>
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required placeholder="https://..."
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={loading || !imageUrl.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
          <Plus size={14} /> Add Slide
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slides.length === 0 && (
          <p className="col-span-full py-12 text-center text-xs uppercase tracking-widest text-ash">No slides yet</p>
        )}
        {slides.map(slide => (
          <div key={slide.$id} className="bg-white overflow-hidden group">
            <div className="aspect-[16/9] bg-ivory overflow-hidden">
              {slide.image_url ? (
                <img src={slide.image_url} alt={slide.title || ''} className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ash text-[10px] uppercase">No Image</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-medium text-black truncate">{slide.title || 'Untitled'}</p>
                  {slide.subtitle && <p className="text-xs text-ash truncate mt-0.5">{slide.subtitle}</p>}
                  <p className="text-[10px] text-ash mt-1 truncate">{slide.redirect_url || '/'}</p>
                </div>
                <button onClick={() => handleDelete(slide.$id)} className="p-1.5 text-ash hover:text-black transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
