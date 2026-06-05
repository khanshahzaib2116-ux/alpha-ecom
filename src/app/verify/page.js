'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    if (!userId || !secret) {
      setStatus('error')
      setError('Invalid verification link.')
      return
    }

    account.updateVerification(userId, secret)
      .then(() => {
        setStatus('success')
        setTimeout(() => router.push('/'), 3000)
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message || 'Verification failed. The link may have expired.')
      })
  }, [searchParams, router])

  if (status === 'verifying') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-ash">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
          <h1 className="text-xl font-semibold tracking-tight mb-2">Email Verified!</h1>
          <p className="text-sm text-ash mb-6">Your email has been verified successfully. Redirecting you back...</p>
          <Link href="/" className="text-xs uppercase tracking-widest bg-black text-white px-6 py-3 inline-block hover:bg-charcoal transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <XCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h1 className="text-xl font-semibold tracking-tight mb-2">Verification Failed</h1>
        <p className="text-sm text-ash mb-6">{error}</p>
        <Link href="/" className="text-xs uppercase tracking-widest bg-black text-white px-6 py-3 inline-block hover:bg-charcoal transition-colors">
          Back to Store
        </Link>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
