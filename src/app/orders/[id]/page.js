'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle, Truck, Clock } from 'lucide-react'

const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered']

const statusIcons = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle,
}

const statusLabels = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth'); return }

    const load = async () => {
      try {
        const { documents: matches } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orders, [
          Query.equal('$id', params.id),
          Query.equal('user_id', user.$id),
        ])

        if (!matches || matches.length === 0) {
          router.push('/orders')
          return
        }

        const o = matches[0]
        setOrder(o)

        const { documents: orderItems } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orderItems, [
          Query.equal('order_id', o.$id),
        ])

        if (orderItems) {
          const enriched = await Promise.all(orderItems.map(async (item) => {
            if (item.product_id) {
              try {
                const product = await databases.getDocument(DATABASE_ID, COLLECTIONS.products, item.product_id)
                return { ...item, products: { title: product.title, image_url: product.image_url, price: product.price } }
              } catch {}
            }
            return { ...item, products: null }
          }))
          setItems(enriched)
        }
      } catch {
        router.push('/orders')
      }
      setLoading(false)
    }

    load()
  }, [params.id, user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const currentStep = statusFlow.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/orders" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ash hover:text-black transition-colors mb-8">
        <ArrowLeft size={14} />
        All Orders
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Order #{order.$id.slice(0, 8)}</h1>
        <p className="text-xs text-ash mt-1">
          Placed on {new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="bg-ivory p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          {statusFlow.map((status, index) => {
            const Icon = statusIcons[status]
            const isActive = index <= currentStep
            const isLast = index === statusFlow.length - 1

            return (
              <div key={status} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-black text-white' : 'bg-white text-ash border border-black/10'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider mt-1.5 ${isActive ? 'text-black font-medium' : 'text-ash'}`}>
                    {statusLabels[status]}
                  </p>
                </div>
                {!isLast && (
                  <div className={`w-8 sm:w-16 h-px mx-1 sm:mx-2 ${index < currentStep ? 'bg-black' : 'bg-black/10'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-ivory p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-ash mb-2">Shipping Address</h3>
          <p className="text-sm text-black">{order.shipping_address}</p>
        </div>
        <div className="bg-ivory p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-ash mb-2">Payment</h3>
          <p className="text-sm text-black">Cash on Delivery</p>
          <p className="text-sm font-semibold text-black mt-1">Rs {parseFloat(order.total_amount).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-ivory p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-ash mb-4">Items</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.$id} className="flex items-center gap-3">
              <div className="w-12 h-14 bg-white overflow-hidden flex-shrink-0">
                {item.products?.image_url ? (
                  <img src={item.products.image_url} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ash text-[8px] uppercase">N/A</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black truncate">{item.products?.title || 'Product'}</p>
                <p className="text-xs text-ash">Qty: {item.quantity} × Rs {parseFloat(item.price_at_purchase).toFixed(2)}</p>
              </div>
              <p className="text-sm font-medium">Rs {(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
