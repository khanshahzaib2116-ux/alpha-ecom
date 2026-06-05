'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statusStyles = {
  pending: 'text-ash',
  confirmed: 'text-black',
  shipped: 'text-black font-semibold',
  delivered: 'text-green-700 font-semibold',
  cancelled: 'text-red-500',
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth'); return }

    databases.listDocuments(DATABASE_ID, COLLECTIONS.orders, [
      Query.equal('user_id', user.$id),
      Query.orderDesc('$createdAt'),
    ]).then(({ documents }) => {
      if (documents) setOrders(documents)
      setLoading(false)
    })
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-smoke mb-4" />
          <p className="text-sm text-ash uppercase tracking-widest mb-4">No orders yet</p>
          <Link href="/" className="text-xs uppercase tracking-widest bg-black text-white px-6 py-3 inline-block hover:bg-charcoal transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.$id}
              href={`/orders/${order.$id}`}
              className="block bg-ivory p-5 hover:bg-ivory/80 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-ash">#{order.$id.slice(0, 8)}</p>
                  <p className="text-sm font-medium text-black">
                    Rs {parseFloat(order.total_amount).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-ash uppercase tracking-wider">
                    {new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className={`text-[10px] uppercase tracking-wider ${statusStyles[order.status] || 'text-ash'}`}>
                    {order.status}
                  </p>
                  <ArrowRight size={16} className="text-ash group-hover:text-black transition-colors ml-auto" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
