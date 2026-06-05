import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Navbar from '@/components/Navbar'
import CartPanel from '@/components/CartPanel'
import './globals.css'

export const metadata = {
  title: 'Noir & Alabaster — Premium Monochrome',
  description: 'Premium minimalist apparel store with cash on delivery across all locations.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-black antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <CartPanel />
              <footer className="border-t border-black/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight mb-3">NOIR & ALABASTER</h3>
                      <p className="text-xs text-ash leading-relaxed">
                        Premium monochrome apparel crafted for the modern minimalist.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-medium mb-3">Quick Links</h3>
                      <div className="space-y-2">
                        <a href="/shop/t-shirts" className="block text-xs text-ash hover:text-black transition-colors">T-Shirts</a>
                        <a href="/shop/caps" className="block text-xs text-ash hover:text-black transition-colors">Caps</a>
                        <a href="/orders" className="block text-xs text-ash hover:text-black transition-colors">My Orders</a>
                        <a href="/wishlist" className="block text-xs text-ash hover:text-black transition-colors">Wishlist</a>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-medium mb-3">Support</h3>
                      <div className="space-y-2">
                        <p className="text-xs text-ash">Cash on Delivery</p>
                        <p className="text-xs text-ash">Free Shipping on orders Rs 50+</p>
                        <p className="text-xs text-ash">7-Day Easy Returns</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-black/5 pt-8 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ash">
                      &copy; 2026 Noir &amp; Alabaster. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
