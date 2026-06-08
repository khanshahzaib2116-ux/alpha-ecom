import { NextResponse } from 'next/server'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = 'standard_6ce565e29a8f2c36a1c86ec4b3e2e81fee01e4cafec6170d3037dd8f17706a09275830ede25fe9f6256357d6c639273046914b9052a870189f4a89f5dbe4f861b8ec7d06dbe4e7430f1a1c21afcb9354ec7560bb51427d62e204015f99784e2d643ae7b679684fd732e5460fffae43b578317a13464433d1de259adaf98dfdfe'

export async function POST(request) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const res = await fetch(`${endpoint}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'X-Appwrite-Response-Format': '1.6.0',
      },
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err || 'Failed to delete user' }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
