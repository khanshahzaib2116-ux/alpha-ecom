import { Client, Databases } from 'appwrite'
import EditForm from './EditForm'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'
const categoriesCol = '6a231e1610e5801f72b5'

export default async function EditProductPage({ params }) {
  const { id } = await params

  let product = null
  let categories = []

  try {
    const client = new Client().setEndpoint(endpoint).setProject(projectId)
    const databases = new Databases(client)
    const [prod, { documents: cats }] = await Promise.all([
      databases.getDocument(databaseId, productsCol, id),
      databases.listDocuments(databaseId, categoriesCol, []),
    ])
    product = {
      title: prod.title || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      sale_price: prod.sale_price?.toString() || '',
      stock_count: prod.stock_count?.toString() || '0',
      category_id: prod.category_id || '',
      image_url: prod.image_url || '',
    }
    if (cats) {
      categories = cats.map(({ $id, name }) => ({ id: $id, name }))
    }
  } catch {}

  return <EditForm product={product} categories={categories} id={id} />
}
