'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/hub')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/wabil-icon.svg" alt="Wabil Capital" style={{ width: '56px', height: '56px', margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '4px' }}>Wabil Capital</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>Network Hub</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '36px 32px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '400', color: '#1A1A1A', marginBottom: '6px', letterSpacing: '-0.02em' }}>Sign in</h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', marginBottom: '28px' }}>Access is by invitation only</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@wabilcapital.com"
                required
                style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D', margin: '0' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '11px', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '4px' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', textAlign: 'center', marginTop: '20px' }}>
          Don't have access? Contact your admin.
        </p>
      </div>
    </div>
  )
}