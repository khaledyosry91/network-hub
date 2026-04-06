'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [invitations, setInvitations] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.push('/hub'); return }
      setIsAdmin(true)
      const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false })
      setInvitations(data || [])
    }
    load()
  }, [])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error) }
    else {
      setSuccess(`Invite sent to ${email}`)
      setEmail('')
      setName('')
      const { data: invites } = await supabase.from('invitations').select('*').order('created_at', { ascending: false })
      setInvitations(invites || [])
    }
    setLoading(false)
  }

  if (!isAdmin) return null

  const inputStyle = { width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      <nav style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E6E6E4', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/wabil-icon.svg" alt="Wabil Capital" style={{ width: '32px', height: '32px' }} />
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', letterSpacing: '-0.02em', color: '#1A1A1A' }}>Wabil Capital</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '8px', letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>Network Hub</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Add contact</a>
          <a href="/settings" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Settings</a>
        </div>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '32px' }}>Team access</h1>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', marginBottom: '20px', letterSpacing: '-0.01em' }}>Invite a team member</h2>
          <form onSubmit={sendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Layla Al-Rashid" required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>Work email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="layla@wabilcapital.com" required style={inputStyle} />
              </div>
            </div>
            {error && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D', margin: 0 }}>{error}</p>}
            {success && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#0D6B3F', margin: 0 }}>{success}</p>}
            <div>
              <button type="submit" disabled={loading} style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E6E6E4' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.01em' }}>Invitations</h2>
          </div>
          {invitations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No invitations sent yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #E6E6E4' }}>
                  {['Email', 'Status', 'Sent', 'Expires'].map(h => (
                    <th key={h} style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: '500', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv: any) => (
                  <tr key={inv.id} style={{ borderBottom: '0.5px solid #F0F0EE' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A' }}>{inv.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px', background: inv.accepted ? '#EDFAF4' : '#FFFBE8', color: inv.accepted ? '#0D6B3F' : '#8B6A00' }}>
                        {inv.accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{new Date(inv.expires_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}