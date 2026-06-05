'use client'

import { useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Trash2 } from 'lucide-react'

export default function DeleteProductButton({ id }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.products, id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="p-1.5 text-ash hover:text-black transition-colors" title="Delete">
      <Trash2 size={14} />
    </button>
  )
}
