'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Truck } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    if (items.length === 0) {
      router.push('/')
      return
    }
    if (user?.email) {
      setForm(prev => ({ ...prev, email: user.email }))
    }
  }, [user, items, router])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const shippingCost = totalPrice >= 50 ? 0 : 5.99
  const grandTotal = totalPrice + shippingCost

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const addressLines = [
      form.address,
      form.apartment && `Apt ${form.apartment}`,
      `${form.city}, ${form.state} ${form.zip}`,
      form.country,
    ].filter(Boolean).join(', ')

    let order
    try {
      order = await databases.createDocument(DATABASE_ID, COLLECTIONS.orders, ID.unique(), {
        user_id: user.$id,
        total_amount: grandTotal,
        status: 'pending',
        shipping_address: addressLines,
      })
    } catch {
      setError('Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    const orderItems = items.map(item => ({
      order_id: order.$id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.sale_price || item.price,
    }))

    for (const orderItem of orderItems) {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.orderItems, ID.unique(), orderItem)
    }

    for (const item of items) {
      try {
        const current = await databases.getDocument(DATABASE_ID, COLLECTIONS.products, item.id)
        const available = current.stock_count ?? 0
        if (available < item.quantity) {
          for (const oi of orderItems) {
            try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.orderItems, oi.order_id) } catch {}
          }
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.orders, order.$id)
          setError(`Insufficient stock for "${item.title}". Only ${available} left.`)
          setLoading(false)
          return
        }
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.products, item.id, {
          stock_count: available - item.quantity,
        })
      } catch {}
    }

    clearCart()
    router.push(`/checkout/confirmation?id=${order.$id}`)
  }

  if (!user || items.length === 0) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ash hover:text-black transition-colors mb-8">
        <ArrowLeft size={14} />
        Back to Cart
      </button>

      <h1 className="text-2xl font-semibold tracking-tight mb-10">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">First Name *</label>
                  <input type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Last Name *</label>
                  <input type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Address *</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" placeholder="Street address" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Apartment, suite, etc. (optional)</label>
                  <input type="text" value={form.apartment} onChange={e => update('apartment', e.target.value)} className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">City *</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">State *</label>
                    <input type="text" value={form.state} onChange={e => update('state', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">ZIP Code *</label>
                    <input type="text" value={form.zip} onChange={e => update('zip', e.target.value)} required className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-ash mb-1">Country *</label>
                  <select value={form.country} onChange={e => update('country', e.target.value)} className="w-full px-4 py-2.5 bg-ivory text-sm focus:outline-none focus:ring-1 focus:ring-black">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Payment Method</h2>
              <div className="bg-ivory p-4 flex items-center gap-3">
                <input type="radio" checked readOnly className="accent-black" />
                <Truck size={18} />
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-[10px] text-ash uppercase tracking-wider">Pay when you receive</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-ivory p-6 sticky top-28">
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-ash truncate mr-2">{item.title} × {item.quantity}</span>
                    <span className="text-black font-medium whitespace-nowrap">Rs {((item.sale_price || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Subtotal</span>
                  <span>Rs {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-700">Free</span> : `Rs ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-black/10 pt-2">
                  <span>Total</span>
                  <span>Rs {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-6 bg-black text-white text-sm uppercase tracking-widest font-medium hover:bg-charcoal transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Place Order — Rs ${grandTotal.toFixed(2)}`}
              </button>
              <p className="text-[10px] text-ash text-center mt-2 uppercase tracking-wider">Pay with cash on delivery</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
