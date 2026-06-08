'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Search, Trash2 } from 'lucide-react'

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchOrders = async () => {
    try {
      const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orders, [])
      if (documents) setOrders(documents)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.orders, id, { status })
    } catch {}
    fetchOrders()
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Delete this order? This cannot be undone.')) return
    setDeleting(orderId)
    try {
      const { documents: items } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orderItems, [
        /* query by order_id would go here if indexed */
      ])
      const toDelete = items.filter(i => i.order_id === orderId)
      for (const item of toDelete) {
        try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.orderItems, item.$id) } catch {}
      }
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.orders, orderId)
      setOrders(prev => prev.filter(o => o.$id !== orderId))
    } catch {}
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  const filtered = orders.filter(o =>
    !search || o['$id'].toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Orders</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Order</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Date</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Customer</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Total</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Status</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-xs uppercase tracking-widest text-ash">{search ? 'No orders match your search' : 'No orders yet'}</td></tr>
            )}
            {filtered.map(order => (
              <tr key={order['$id']} className="border-b border-black/5 hover:bg-ivory/50 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono text-xs text-ash">#{order['$id'].slice(0, 8)}</span>
                </td>
                <td className="py-3 px-4 text-xs text-ash">
                  {new Date(order['$createdAt']).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-xs text-ash max-w-[120px] truncate">
                  {order.shipping_address?.split(',')[0] || '—'}
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                  Rs {parseFloat(order.total_amount).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order['$id'], e.target.value)}
                    className={`text-xs px-2 py-1 border border-black/10 focus:outline-none focus:ring-1 focus:ring-black ${
                      order.status === 'delivered' ? 'text-green-700' :
                      order.status === 'cancelled' ? 'text-red-500' :
                      order.status === 'shipped' ? 'text-black font-medium' : 'text-ash'
                    }`}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s} className="text-black">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(order['$id'])}
                    disabled={deleting === order['$id']}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-30"
                    title="Delete order"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
