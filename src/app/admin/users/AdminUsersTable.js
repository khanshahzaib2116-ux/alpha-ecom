'use client'

import { useState } from 'react'
import { Trash2, Search } from 'lucide-react'

export default function AdminUsersTable({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName || userId}"? This cannot be undone.`)) return
    setDeleting(userId)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
        setDeleting(null)
        return
      }
      setUsers(prev => prev.filter(u => u.$id !== userId))
    } catch {
      alert('Failed to delete user')
    }
    setDeleting(null)
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Name</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden sm:table-cell">Email</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium hidden md:table-cell">Joined</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Verified</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Labels</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-ash font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-xs uppercase tracking-widest text-ash">{search ? 'No users match your search' : 'No users found'}</td></tr>
            )}
            {filtered.map(u => (
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
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(u.$id, u.name)}
                    disabled={deleting === u.$id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-30"
                    title="Delete user"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
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
