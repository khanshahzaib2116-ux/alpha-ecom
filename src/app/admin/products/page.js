import { Client, Databases } from 'appwrite'
import AdminProductsTable from './AdminProductsTable'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'

export default async function AdminProductsPage() {
  let products = []
  try {
    const client = new Client().setEndpoint(endpoint).setProject(projectId)
    const databases = new Databases(client)
    const result = await databases.listDocuments(databaseId, productsCol, [])
    if (result?.documents) products = result.documents
  } catch {}

  return <AdminProductsTable products={products} />
}
