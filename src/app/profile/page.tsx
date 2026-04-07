import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myContacts } = await supabase
    .from('contacts')
    .select('*, contact_shares(*)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const { data: sharedWithMe } = await supabase
    .from('contacts')
    .select('*, profiles!created_by(first_name, last_name)')
    .neq('created_by', user.id)
    .order('created_at', { ascending: false })

  const { data: myOrgs } = await supabase
    .from('org_members')
    .select('*, organisations(*)')
    .eq('profile_id', user.id)

  const { data: activity } = await supabase
    .from('activity_log')
    .select('*, contacts(first_name, last_name, network_type)')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const TYPE_COLORS: Record<string, {bg: string, text: string}> = {
    'Portfolio':          { bg: '#F0F4FF', text: '#2D4DB5' },
    'Co-investors':       { bg: '#EEF5FF', text: '#1A5FA8' },
    'Lawyers':            { bg: '#F3F0FF', text: '#5B3DB5' },
    'Advisors':           { bg: '#FFF8F0', text: '#6B3D00' },
    'Scouts':             { bg: '#EDFAF4', text: '#0D6B3F' },
    'LPs':                { bg: '#FFF3E8', text: '#A84F00' },
    'Media & PR':         { bg: '#FFF0FB', text: '#8B006B' },
    'Government':         { bg: '#F5F5F3', text: '#444441' },
    'Investment Banking': { bg: '#FFF9E8', text: '#7A5800' },
    'Accountants':        { bg: '#F0FFF4', text: '#1A6B3D' },
    'Family Offices':     { bg: '#FFF0F0', text: '#8B1A1A' },
    'PE Funds':           { bg: '#F0F0FF', text: '#3D1A8B' },
    'Debt & Credit':      { bg: '#FFF4F0', text: '#8B3D1A' },
    'Headhunters':        { bg: '#F0FFFA', text: '#1A6B5B' },
    'Board Members':      { bg: '#FFFBF0', text: '#6B5B1A' },
    'Strategic Partners': { bg: '#F5F0FF', text: '#5B1A8B' },
  }

  const initials = ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')).toUpperCase()

  const typeBreakdown: Record<string, number> = {}
  myContacts?.forEach((c: any) => {
    typeBreakdown[c.network_type] = (typeBreakdown[c.network_type] || 0) + 1
  })

  const actionLabels: Record<string, string> = {
    created: 'Added contact',
    updated: 'Updated contact',
    shared: 'Shared contact',
    note_added: 'Added a note to',
    stage_changed: 'Changed stage of',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      <nav style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E6E6E4', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/wabil-icon.svg" alt="Wabil Capital" style={{ width: '32px', height: '32px' }} />
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', letterSpacing: '-0.02em', color: '#1A1A1A' }}>Wabil Capital</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '8px', letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>Network Hub</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Add contact</a>
          <a href="/orgs" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Organisations</a>
          <a href="/profile" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Profile</a>
          <form action="/api/logout" method="POST">
            <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Profile header */}
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '24px', color: '#FFFFFF', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '4px' }}>{profile?.first_name} {profile?.last_name}</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', marginBottom: '8px' }}>{user.email}</div>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: profile?.is_admin ? '#1A1A1A' : '#F5F5F3', color: profile?.is_admin ? '#FFFFFF' : '#888888', padding: '3px 10px', borderRadius: '20px' }}>
              {profile?.is_admin ? 'Admin' : 'Member'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>{myContacts?.length || 0}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888' }}>My contacts</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>{sharedWithMe?.length || 0}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888' }}>Shared with me</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>{myOrgs?.length || 0}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888' }}>Organisations</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Network breakdown */}
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.01em' }}>My network breakdown</div>
            {Object.keys(typeBreakdown).length === 0 ? (
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No contacts yet</p>
            ) : Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const tc = TYPE_COLORS[type] || { bg: '#F5F5F3', text: '#444441' }
              const pct = Math.round((count / (myContacts?.length || 1)) * 100)
              return (
                <div key={type} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: tc.text, background: tc.bg, padding: '2px 8px', borderRadius: '20px' }}>{type}</span>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{count}</span>
                  </div>
                  <div style={{ height: '3px', background: '#F0F0EE', borderRadius: '2px' }}>
                    <div style={{ height: '3px', background: tc.text, borderRadius: '2px', width: `${pct}%`, opacity: 0.6 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Organisations */}
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.01em' }}>My organisations</div>
            {!myOrgs || myOrgs.length === 0 ? (
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>Not a member of any organisation</p>
            ) : myOrgs.map((om: any) => (
              <div key={om.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                <div>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{om.organisations?.name}</div>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginTop: '2px' }}>{om.organisations?.description}</div>
                </div>
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: om.role === 'admin' ? '#1A1A1A' : '#F5F5F3', color: om.role === 'admin' ? '#FFFFFF' : '#888888', padding: '3px 10px', borderRadius: '20px' }}>{om.role}</span>
              </div>
            ))}
            <a href="/orgs" style={{ display: 'block', marginTop: '14px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#C9A96E', textDecoration: 'none' }}>Manage organisations →</a>
          </div>
        </div>

        {/* My contacts */}
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E6E6E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.01em' }}>My contacts</div>
            <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none' }}>+ Add</a>
          </div>
          {!myContacts || myContacts.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No contacts yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #E6E6E4' }}>
                  {['Contact', 'Type', 'Stage', 'Shared with'].map(h => (
                    <th key={h} style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: '500', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myContacts.map((c: any) => {
                  const tc = TYPE_COLORS[c.network_type] || { bg: '#F5F5F3', text: '#444441' }
                  const initials = ((c.first_name?.[0] || '') + (c.last_name?.[0] || '')).toUpperCase()
                  const shareCount = c.contact_shares?.length || 0
                  return (
                    <tr key={c.id} style={{ borderBottom: '0.5px solid #F0F0EE' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '11px', color: tc.text, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888' }}>{c.role} · {c.firm_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: tc.bg, color: tc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.network_type}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{c.stage || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {shareCount === 0 ? (
                          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', background: '#F5F5F3', padding: '3px 8px', borderRadius: '20px' }}>Private</span>
                        ) : (
                          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', color: '#0D6B3F', background: '#EDFAF4', padding: '3px 8px', borderRadius: '20px' }}>{shareCount} share{shareCount > 1 ? 's' : ''}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity feed */}
        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.01em' }}>Recent activity</div>
          {!activity || activity.length === 0 ? (
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No activity yet</p>
          ) : activity.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid #F0F0EE' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, marginTop: '5px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A' }}>
                  {actionLabels[a.action] || a.action}{' '}
                  <strong>{a.contacts?.first_name} {a.contacts?.last_name}</strong>
                </div>
                {a.detail && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', marginTop: '2px' }}>{a.detail}</div>}
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#BEBEBE', marginTop: '3px' }}>
                  {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}