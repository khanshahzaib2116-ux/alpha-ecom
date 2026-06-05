import { Client, Databases } from 'appwrite'
import NewProductForm from './NewProductForm'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const categoriesCol = '6a231e1610e5801f72b5'

export default async function NewProductPage() {
  const client = new Client().setEndpoint(endpoint).setProject(projectId)
  const databases = new Databases(client)

  let categories = []
  try {
    const { documents } = await databases.listDocuments(databaseId, categoriesCol, [])
    if (documents) {
      categories = documents.map(({ $id, name }) => ({ id: $id, name }))
    }
  } catch {}

  return <NewProductForm categories={categories} />
}
