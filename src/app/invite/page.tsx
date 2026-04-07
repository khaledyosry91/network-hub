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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError('Invalid invite link.')
        setValidating(false)
        return
      }

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('accepted', false)
        .gt('expires_at', now)
        .single()

      if (error || !data) {
        setError('This invite link is invalid or has expired. Please contact your admin for a new one.')
      } else {
        setEmail(data.email)
      }
      setValidating(false)
    }
    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      router.push('/auth/verify?email=' + encodeURIComponent(email))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
    color: '#1A1A1A',
    background: '#FAFAF9',
    border: '0.5px solid #E6E6E4',
    borderRadius: '8px',
    padding: '10px 14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  if (validating) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>Validating your invite...</p>
      </div>
    )
  }

  if (error && !email) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/wabil-icon.svg" alt="Wabil Capital" style={{ width: '48px', height: '48px', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>Wabil Capital</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px', letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>Network Hub</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#FFF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px' }}>✕</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', color: '#1A1A1A', marginBottom: '10px' }}>Invite invalid</h2>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/wabil-icon.svg" alt="Wabil Capital" style={{ width: '48px', height: '48px', margin: '0 auto 12px' }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>Wabil Capital</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px', letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>Network Hub</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '32px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '400', color: '#1A1A1A', marginBottom: '6px', letterSpacing: '-0.02em' }}>Set up your account</h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', marginBottom: '24px' }}>
            Invited as <strong style={{ color: '#1A1A1A' }}>{email}</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>First name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Layla" required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>Last name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Al-Rashid" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>Confirm password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required style={inputStyle} />
            </div>
            {error && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '11px', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', textAlign: 'center', marginTop: '20px' }}>
          This invite expires 7 days after it was sent.
        </p>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>Loading...</p>
      </div>
    }>
      <InviteForm />
    </Suspense>
  )
}