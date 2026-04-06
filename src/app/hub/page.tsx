import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, contact_updates(*)')
    .order('created_at', { ascending: false })

  const types = ['Portfolio','Co-investors','Lawyers','Advisors','Scouts','LPs','Media & PR','Government']
  const typeColors: Record<string, {bg: string, text: string}> = {
    'Portfolio':    { bg: '#F0F4FF', text: '#2D4DB5' },
    'Co-investors': { bg: '#EEF5FF', text: '#1A5FA8' },
    'Lawyers':      { bg: '#F3F0FF', text: '#5B3DB5' },
    'Advisors':     { bg: '#FFF8F0', text: '#6B3D00' },
    'Scouts':       { bg: '#EDFAF4', text: '#0D6B3F' },
    'LPs':          { bg: '#FFF3E8', text: '#A84F00' },
    'Media & PR':   { bg: '#FFF0FB', text: '#8B006B' },
    'Government':   { bg: '#F5F5F3', text: '#444441' },
  }
  const priorityColors: Record<string, {bg: string, text: string}> = {
    'High':   { bg: '#FFF0F0', text: '#B52D2D' },
    'Medium': { bg: '#FFFBE8', text: '#8B6A00' },
    'Low':    { bg: '#F5F5F3', text: '#888888' },
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Add contact</a>
          {profile?.is_admin && (
            <a href="/settings" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Settings</a>
          )}
          <form action="/api/logout" method="POST">
            <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '4px' }}>Network</h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>{contacts?.length || 0} contacts across all networks</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', marginBottom: '32px' }}>
          {types.map(t => {
            const count = contacts?.filter(c => c.network_type === t).length || 0
            const tc = typeColors[t]
            return (
              <div key={t} style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '10px', padding: '14px 12px' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: tc.text, background: tc.bg, padding: '2px 7px', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' }}>{t}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>{count}</div>
              </div>
            )
          })}
        </div>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E6E6E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>All contacts</span>
            <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none' }}>+ Add contact</a>
          </div>
          {!contacts || contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#888888', marginBottom: '16px' }}>No contacts yet</p>
              <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none' }}>Add your first contact</a>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #E6E6E4' }}>
                  {['Contact', 'Network type', 'Stage', 'Priority', 'Location', 'Last update'].map(h => (
                    <th key={h} style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: '500', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => {
                  const tc = typeColors[c.network_type] || { bg: '#F5F5F3', text: '#444441' }
                  const pc = priorityColors[c.priority] || priorityColors['Medium']
                  const initials = ((c.first_name?.[0] || '') + (c.last_name?.[0] || '')).toUpperCase()
                  const lastUpdate = c.contact_updates?.[0]
                  return (
                    <tr key={c.id} style={{ borderBottom: '0.5px solid #F0F0EE' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: '400', color: tc.text, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginTop: '1px' }}>{c.role} · {c.firm_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: tc.bg, color: tc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.network_type}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888' }}>{c.stage || '—'}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: pc.bg, color: pc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.priority}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{c.geography || '—'}</td>
                      <td style={{ padding: '13px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastUpdate ? lastUpdate.body : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}