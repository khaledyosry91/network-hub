'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function InviteForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    async function validateToken() {
      if (!token) { setError('Invalid invite link.'); setValidating(false); return }
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()

      console.log('invite data:', data, 'error:', error)

      if (error || !data) {
        setError('This invite link is invalid or has expired.')
      } else if (data.accepted) {
        setError('This invite has already been used.')
      } else {
        setEmail(data.email)
      }
      setValidating(false)
    }
    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    await supabase
      .from('invitations')
      .update({ accepted: true })
      .eq('token', token)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/verify?email=' + encodeURIComponent(email))
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Validating your invite...</p>
      </div>
    )
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md text-center">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs text-gray-400 mt-2">Contact your admin for a new invite.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Network Hub</div>
            <div className="text-xs text-gray-400">Accept your invitation</div>
          </div>
        </div>

        <h1 className="text-xl font-medium text-gray-900 mb-1">Set up your account</h1>
        <p className="text-sm text-gray-400 mb-6">You were invited as <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Khalid" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Last name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Yosry" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" minLength={8} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    }>
      <InviteForm />
    </Suspense>
  )
}