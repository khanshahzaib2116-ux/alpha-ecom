import { Client, Databases, Query } from 'appwrite'
import ProductGrid from '@/components/ProductGrid'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'
const categoriesCol = '6a231e1610e5801f72b5'

const client = new Client().setEndpoint(endpoint).setProject(projectId)
const databases = new Databases(client)

export async function generateMetadata({ params }) {
  const { category } = await params
  const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${categoryName} — Noir & Alabaster`,
  }
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params

  const { documents: cats } = await databases.listDocuments(databaseId, categoriesCol, [
    Query.equal('slug', categorySlug)
  ])
  const category = cats[0]

  const { documents: products } = category
    ? await databases.listDocuments(databaseId, productsCol, [
        Query.equal('category_id', category.$id)
      ])
    : { documents: [] }

  const displayName = category?.name || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const mapped = (products || []).map(p => ({ ...p, id: p.$id }))

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>
        <p className="text-sm text-ash mt-1">
          {mapped.length} {mapped.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      <ProductGrid products={mapped} />
    </section>
  )
}
