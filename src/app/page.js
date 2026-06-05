import { Client, Databases } from 'appwrite'
import HeroSlider from '@/components/HeroSlider'
import ProductGrid from '@/components/ProductGrid'
import ProductCarousel from '@/components/ProductCarousel'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'
const categoriesCol = '6a231e1610e5801f72b5'

const client = new Client().setEndpoint(endpoint).setProject(projectId)
const databases = new Databases(client)

export default async function HomePage() {
  const { documents: products } = await databases.listDocuments(databaseId, productsCol, [])
  const { documents: categories } = await databases.listDocuments(databaseId, categoriesCol, [])

  const mapped = (products || []).map(p => ({ ...p, id: p.$id }))
  const featured = mapped.filter(p => p.is_featured)
  const onSale = mapped.filter(p => p.sale_price && p.sale_price < p.price).slice(0, 10)

  return (
    <>
      <HeroSlider />

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
            <p className="text-sm text-ash mt-1">Curated picks for you</p>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {onSale.length > 0 && (
        <section className="bg-ivory py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold tracking-tight">On Sale</h2>
              <p className="text-sm text-ash mt-1">Best deals, don&apos;t miss out</p>
            </div>
            <ProductCarousel products={onSale} />
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight">All Products</h2>
          <p className="text-sm text-ash mt-1">Discover our latest drops</p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <a
                key={cat.$id}
                href={`/shop/${cat.slug}`}
                className="flex-shrink-0 px-5 py-2 text-xs uppercase tracking-widest bg-black text-white hover:bg-charcoal transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        <ProductGrid products={mapped} />
      </section>

      <section className="bg-ivory py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold tracking-tight mb-3">Free Shipping on Orders Rs 50+</h2>
          <p className="text-sm text-ash mb-8">All orders are delivered with Cash on Delivery.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white p-6">
              <p className="text-sm font-semibold mb-1">Free Shipping</p>
              <p className="text-xs text-ash">On orders over Rs 50</p>
            </div>
            <div className="bg-white p-6">
              <p className="text-sm font-semibold mb-1">Cash on Delivery</p>
              <p className="text-xs text-ash">Pay when you receive</p>
            </div>
            <div className="bg-white p-6">
              <p className="text-sm font-semibold mb-1">Easy Returns</p>
              <p className="text-xs text-ash">7-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
