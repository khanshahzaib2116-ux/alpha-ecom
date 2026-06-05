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

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Users</h1>

      {error && (
        <p className="text-xs text-red-500 mb-4">Error loading users: {error}</p>
      )}

      <div className="bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Name</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden sm:table-cell">Email</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden md:table-cell">Joined</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Verified</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Labels</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-xs uppercase tracking-widest text-ash">No users found</td></tr>
            )}
            {users.map(u => (
              <tr key={u.$id} className="border-b border-black/5 hover:bg-ivory/50 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-black">{u.name || '—'}</span>
                </td>
                <td className="py-3 px-4 text-xs text-ash hidden sm:table-cell">{u.email}</td>
                <td className="py-3 px-4 text-xs text-ash hidden md:table-cell">
                  {new Date(u.$createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] uppercase tracking-wider ${u.emailVerification ? 'text-green-700' : 'text-ash'}`}>
                    {u.emailVerification ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 flex-wrap">
                    {u.labels?.length > 0
                      ? u.labels.map(l => (
                          <span key={l} className="text-[10px] uppercase tracking-wider bg-black/5 text-ash px-1.5 py-0.5">{l}</span>
                        ))
                      : <span className="text-[10px] text-ash">—</span>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ash mt-4">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
