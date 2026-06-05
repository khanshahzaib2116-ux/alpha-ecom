'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Query } from 'appwrite'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const load = async () => {
      try {
        const o = await databases.getDocument(DATABASE_ID, COLLECTIONS.orders, orderId)
        setOrder(o)

        const { documents: orderItems } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orderItems, [
          Query.equal('order_id', o.$id),
        ])

        if (orderItems) {
          const enriched = await Promise.all(orderItems.map(async (item) => {
            if (item.product_id) {
              try {
                const product = await databases.getDocument(DATABASE_ID, COLLECTIONS.products, item.product_id)
                return { ...item, products: { title: product.title, image_url: product.image_url } }
              } catch {}
            }
            return { ...item, products: null }
          }))
          setItems(enriched)
        }
      } catch {}
      setLoading(false)
    }

    load()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Package size={48} className="text-smoke mb-4" />
        <h1 className="text-xl font-semibold mb-2">Order not found</h1>
        <Link href="/" className="text-xs uppercase tracking-widest text-ash hover:text-black transition-colors">Back to store</Link>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-sm text-ash mb-6">
          Thank you for your order. You&apos;ll pay <strong>Rs {parseFloat(order.total_amount).toFixed(2)}</strong> in cash upon delivery.
        </p>

        <div className="bg-ivory p-6 text-left mb-6 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ash">Order Number</p>
            <p className="text-sm font-mono text-black break-all">{order.$id}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ash">Status</p>
            <p className="text-sm font-medium capitalize text-black">{order.status}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ash">Shipping Address</p>
            <p className="text-sm text-black">{order.shipping_address}</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="bg-ivory p-6 text-left mb-6">
            <p className="text-[10px] uppercase tracking-widest text-ash mb-3">Items</p>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.$id} className="flex justify-between text-sm">
                  <span className="text-ash truncate mr-2">{item.products?.title || 'Product'} × {item.quantity}</span>
                  <span className="text-black font-medium">Rs {parseFloat(item.price_at_purchase).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href={`/orders/${order.$id}`}
            className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-charcoal transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="w-full py-3 bg-ivory text-ash text-xs uppercase tracking-widest font-medium hover:text-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
