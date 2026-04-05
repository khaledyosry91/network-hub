'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const token = otp.join('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    })
    if (error) {
      setError('Incorrect code. Please try again.')
      setLoading(false)
    } else {
      router.push('/hub')
    }
  }

  async function handleResend() {
    await supabase.auth.resend({ type: 'signup', email })
    setError('')
    alert('New code sent — check your inbox.')
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
            <div className="text-xs text-gray-400">Email verification</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="13" rx="2" stroke="#185FA5" strokeWidth="1.3"/>
              <path d="M2 8l9 6 9-6" stroke="#185FA5" strokeWidth="1.3"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">Check your inbox</h1>
          <p className="text-sm text-gray-400">We sent a 6-digit code to</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{email}</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className="w-11 h-12 text-center text-xl font-medium border border-gray-200 rounded-lg outline-none focus:border-gray-900"
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Didn't receive it?{' '}
          <button onClick={handleResend} className="text-gray-900 font-medium underline">
            Resend code
          </button>
        </p>
      </div>
    </div>
  )
}