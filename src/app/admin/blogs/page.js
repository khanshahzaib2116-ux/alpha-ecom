'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { Trash2, Plus } from 'lucide-react'

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [fetching, setFetching] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    databases.listDocuments(DATABASE_ID, COLLECTIONS.blogs, [])
      .then(({ documents }) => { if (documents) setBlogs(documents); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    setError('')
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.blogs, ID.unique(), {
        title: title.trim(),
        slug,
        content: content.trim(),
      })
      setTitle(''); setContent('')
      setLoading(false)
      const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.blogs, [])
      if (documents) setBlogs(documents)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.blogs, id)
    const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.blogs, [])
    if (documents) setBlogs(documents)
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
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Blog Posts</h1>

      <form onSubmit={handleAdd} className="max-w-lg mb-10 space-y-4 p-6 bg-white">
        <p className="text-xs uppercase tracking-widest text-ash font-medium">New Post</p>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Content *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
            className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={loading || !title.trim() || !content.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50">
          <Plus size={14} /> Publish
        </button>
      </form>

      <div className="bg-white divide-y divide-black/5">
        {blogs.length === 0 && (
          <p className="py-12 text-center text-xs uppercase tracking-widest text-ash">No posts yet</p>
        )}
        {blogs.map(post => (
          <div key={post.$id} className="flex items-start justify-between px-4 py-4 group">
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-sm font-medium text-black">{post.title}</p>
              <p className="text-[10px] text-ash mt-0.5 uppercase tracking-wider">{post.slug}</p>
              <p className="text-xs text-ash mt-1 line-clamp-2">{post.content}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-ash whitespace-nowrap">
                {post.$createdAt ? new Date(post.$createdAt).toLocaleDateString() : ''}
              </span>
              <button onClick={() => handleDelete(post.$id)}
                className="p-1.5 text-ash hover:text-black transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
