'use client'

import { useState, useEffect } from 'react'
import { account } from '@/lib/appwrite'
import { User, Mail, Tag, Shield, Calendar } from 'lucide-react'

export default function AdminProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    account.get()
      .then((u) => { setUser(u); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-ash">Loading</p>
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-ash">Not logged in.</p>
  }

  const fields = [
    { label: 'Name', value: user.name || '—', icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'ID', value: user.$id, icon: Tag },
    { label: 'Labels', value: user.labels?.join(', ') || 'None', icon: Shield },
    { label: 'Email Verified', value: user.emailVerification ? 'Yes' : 'No', icon: Shield },
    { label: 'Registered', value: new Date(user.$createdAt).toLocaleDateString(), icon: Calendar },
  ]

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">My Profile</h1>

      <div className="bg-white divide-y divide-black/5">
        {fields.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4">
            <Icon size={16} className="text-ash flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-ash">{label}</p>
              <p className="text-sm text-black mt-0.5 break-all">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
