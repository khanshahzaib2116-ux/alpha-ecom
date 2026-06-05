import { Client, Databases } from 'appwrite'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const productsCol = '6a231e182905825b878a'
const categoriesCol = '6a231e1610e5801f72b5'

const client = new Client().setEndpoint(endpoint).setProject(projectId)
const databases = new Databases(client)

export default async function AdminDashboardPage() {
  const { documents: products } = await databases.listDocuments(databaseId, productsCol, [])
  const { documents: categories } = await databases.listDocuments(databaseId, categoriesCol, [])

  const totalProducts = products?.length || 0
  const totalStock = products?.reduce((sum, p) => sum + (p.stock_count || 0), 0) || 0
  const outOfStock = products?.filter(p => !p.stock_count || p.stock_count === 0).length || 0
  const onSale = products?.filter(p => p.sale_price && p.sale_price < p.price).length || 0
  const totalCategories = categories?.length || 0
  const totalValue = products?.reduce((sum, p) => sum + (p.sale_price || p.price) * (p.stock_count || 0), 0) || 0
  const lowStockCount = products?.filter(p => p.stock_count > 0 && p.stock_count <= 5).length || 0

  const stats = [
    { label: 'Total Products', value: totalProducts },
    { label: 'Total Stock', value: totalStock },
    { label: 'Low Stock (≤5)', value: lowStockCount },
    { label: 'Out of Stock', value: outOfStock },
    { label: 'On Sale', value: onSale },
    { label: 'Categories', value: totalCategories },
    { label: 'Inventory Value', value: `Rs ${totalValue.toLocaleString()}` },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-widest text-ash mb-2">{stat.label}</p>
            <p className="text-2xl font-semibold text-black">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
