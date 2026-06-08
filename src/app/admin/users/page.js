import AdminUsersTable from './AdminUsersTable'

export const dynamic = 'force-dynamic'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = 'standard_6ce565e29a8f2c36a1c86ec4b3e2e81fee01e4cafec6170d3037dd8f17706a09275830ede25fe9f6256357d6c639273046914b9052a870189f4a89f5dbe4f861b8ec7d06dbe4e7430f1a1c21afcb9354ec7560bb51427d62e204015f99784e2d643ae7b679684fd732e5460fffae43b578317a13464433d1de259adaf98dfdfe'

async function fetchUsers() {
  const res = await fetch(`${endpoint}/users`, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Response-Format': '1.6.0',
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.users || []
}

export default async function AdminUsersPage() {
  let users = []
  let error = null
  try {
    users = await fetchUsers()
  } catch (e) {
    error = e.message
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-8">Users</h1>
        <p className="text-xs text-red-500 mb-4">Error loading users: {error}</p>
      </div>
    )
  }

  return <AdminUsersTable users={users} />
}
