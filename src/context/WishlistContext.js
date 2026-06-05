'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch { }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  const toggleItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.filter(i => i.id !== product.id)
      return [...prev, { id: product.id, title: product.title, price: product.price, sale_price: product.sale_price, image_url: product.image_url }]
    })
  }, [])

  const isWishlisted = useCallback((id) => items.some(i => i.id === id), [items])
  const count = items.length

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isWishlisted, count }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
