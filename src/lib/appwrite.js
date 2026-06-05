import { Client, Account, Databases, ID } from 'appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

let client
try {
  client = new Client().setEndpoint(endpoint).setProject(projectId)
} catch {
  client = null
}

export const account = client ? new Account(client) : null
export const databases = client ? new Databases(client) : null
export { ID }

export const COLLECTIONS = {
  categories: '6a231e1610e5801f72b5',
  products: '6a231e182905825b878a',
  profiles: '6a231e2771168692a4a2',
  orders: '6a231e29804b3440e710',
  orderItems: '6a231e2fea025325d045',
  carouselSlides: '6a231e3467528f571c88',
  blogs: '6a231e38657068173625',
}

export const DATABASE_ID = databaseId

export const PERMISSIONS = {
  readAny: ['read("any")'],
  writeAny: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
}
