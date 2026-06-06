import { notFound } from 'next/navigation'
import ClientProductDetail from './ClientProductDetail'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'

async function fetchProduct(id) {
  const res = await fetch(`${endpoint}/databases/${databaseId}/collections/${productsCol}/documents/${id}`, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Response-Format': '1.6.0',
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data
}

export async function generateMetadata({ params }) {
  const { id } = await params
  let product = null
  try { product = await fetchProduct(id) } catch {}
  return {
    title: product ? `${product.title} — Noir & Alabaster` : 'Product — Noir & Alabaster',
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params
  let product = null
  try { product = await fetchProduct(id) } catch {}
  if (!product) notFound()
  return <ClientProductDetail product={product} />
}
