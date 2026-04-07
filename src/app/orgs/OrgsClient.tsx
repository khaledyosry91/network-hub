'use client'
import { useState } from 'react'

export default function OrgsClient({ myOrgs, allProfiles, myContacts, teams, profile, userId }: {
  myOrgs: any[]
  allProfiles: any[]
  myContacts: any[]
  teams: any[]
  profile: any
  userId: string
}) {
  const [activeOrg, setActiveOrg] = useState<any>(myOrgs[0]?.organisations || null)
  const [sharing, setSharing] = useState<any>(null)
  const [shareType, setShareType] = useState('org')
  const [shareTarget, setShareTarget] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
  const [shareSuccess, setShareSuccess] = useState('')
  const [shareError, setShareError] = useState('')
  const [creatingOrg, setCreatingOrg] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDesc, setNewOrgDesc] = useState('')
  const [orgLoading, setOrgLoading] = useState(false)

  const isAdmin = profile?.is_admin

  const activeOrgMembers = myOrgs
    .find(o => o.organisations?.id === activeOrg?.id)
    ?.organisations?.org_members || []

  const orgTeams = teams.filter(t => t.org_id === activeOrg?.id)

  async function handleShare() {
    if (!shareTarget || !sharing) return
    setShareLoading(true)
    setShareError('')
    setShareSuccess('')

    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: sharing.id,
        share_type: shareType,
        target_id: shareTarget,
      })
    })
    const data = await res.json()
    if (data.error) {
      setShareError(data.error)
    } else {
      setShareSuccess('Contact shared successfully')
      setTimeout(() => { setSharing(null); setShareSuccess('') }, 1500)
    }
    setShareLoading(false)
  }

  async function handleUnshare(contact_id: string, share_type: string, target_id: string) {
    await fetch('/api/share', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id, share_type, target_id })
    })
    window.location.reload()
  }

  async function createOrg() {
    if (!newOrgName.trim()) return
    setOrgLoading(true)
    const res = await fetch('/api/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newOrgName, description: newOrgDesc })
    })
    const data = await res.json()
    if (!data.error) {
      setCreatingOrg(false)
      setNewOrgName('')
      setNewOrgDesc('')
      window.location.reload()
    }
    setOrgLoading(false)
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
          <a href="/orgs" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Organisations</a>
          <a href="/profile" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Profile</a>
          <form action="/api/logout" method="POST">
            <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>

        {/* Left sidebar — org list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>Organisations</h1>
            {isAdmin && (
              <button onClick={() => setCreatingOrg(true)} style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>+ New</button>
            )}
          </div>

          {creatingOrg && (
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>New organisation</div>
              <input value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="Name" style={{ ...inputStyle, marginBottom: '8px' }} />
              <input value={newOrgDesc} onChange={e => setNewOrgDesc(e.target.value)} placeholder="Description (optional)" style={{ ...inputStyle, marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCreatingOrg(false)} style={{ flex: 1, fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', background: 'none', border: '0.5px solid #E6E6E4', borderRadius: '6px', padding: '7px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={createOrg} disabled={orgLoading} style={{ flex: 1, fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '6px', padding: '7px', cursor: 'pointer' }}>Create</button>
              </div>
            </div>
          )}

          {myOrgs.map(om => (
            <div key={om.id} onClick={() => setActiveOrg(om.organisations)} style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', marginBottom: '6px', background: activeOrg?.id === om.organisations?.id ? '#1A1A1A' : '#FFFFFF', border: `0.5px solid ${activeOrg?.id === om.organisations?.id ? '#1A1A1A' : '#E6E6E4'}` }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: activeOrg?.id === om.organisations?.id ? '#FFFFFF' : '#1A1A1A' }}>{om.organisations?.name}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: activeOrg?.id === om.organisations?.id ? '#C9A96E' : '#888888', marginTop: '2px' }}>{om.organisations?.org_members?.length || 0} members · {om.role}</div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {activeOrg ? (
          <div>
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '6px' }}>{activeOrg.name}</h2>
              {activeOrg.description && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', marginBottom: '16px' }}>{activeOrg.description}</p>}

              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeOrgMembers.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '12px', color: '#888888' }}>
                      {((m.profiles?.first_name?.[0] || '') + (m.profiles?.last_name?.[0] || '')).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{m.profiles?.first_name} {m.profiles?.last_name}</div>
                    </div>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: m.role === 'admin' ? '#1A1A1A' : '#F5F5F3', color: m.role === 'admin' ? '#FFFFFF' : '#888888', padding: '2px 8px', borderRadius: '20px' }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams */}
            {orgTeams.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Teams</div>
                {orgTeams.map((t: any) => (
                  <div key={t.id} style={{ padding: '10px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', marginBottom: '4px' }}>{t.name}</div>
                    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{t.team_members?.length || 0} members</div>
                  </div>
                ))}
              </div>
            )}

            {/* Share contacts */}
            <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px', padding: '24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.01em' }}>Share a contact</div>

              {myContacts.length === 0 ? (
                <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>You have no contacts to share yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>Select contact</label>
                    <select value={sharing?.id || ''} onChange={e => setSharing(myContacts.find(c => c.id === e.target.value) || null)} style={inputStyle}>
                      <option value="">Choose a contact...</option>
                      {myContacts.map(c => (
                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name} · {c.network_type}</option>
                      ))}
                    </select>
                  </div>

                  {sharing && (
                    <>
                      <div>
                        <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '5px' }}>Share with</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                          {['org', 'team', 'person'].map(t => (
                            <button key={t} onClick={() => { setShareType(t); setShareTarget('') }} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', border: shareType === t ? '1.5px solid #1A1A1A' : '0.5px solid #E6E6E4', background: shareType === t ? '#1A1A1A' : '#FFFFFF', color: shareType === t ? '#FFFFFF' : '#888888', cursor: 'pointer' }}>
                              {t === 'org' ? 'Entire org' : t === 'team' ? 'A team' : 'A person'}
                            </button>
                          ))}
                        </div>

                        {shareType === 'org' && (
                          <select value={shareTarget} onChange={e => setShareTarget(e.target.value)} style={inputStyle}>
                            <option value="">Select organisation...</option>
                            {myOrgs.map(om => (
                              <option key={om.organisations?.id} value={om.organisations?.id}>{om.organisations?.name}</option>
                            ))}
                          </select>
                        )}

                        {shareType === 'team' && (
                          <select value={shareTarget} onChange={e => setShareTarget(e.target.value)} style={inputStyle}>
                            <option value="">Select team...</option>
                            {orgTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        )}

                        {shareType === 'person' && (
                          <select value={shareTarget} onChange={e => setShareTarget(e.target.value)} style={inputStyle}>
                            <option value="">Select person...</option>
                            {activeOrgMembers.filter((m: any) => m.profile_id !== userId).map((m: any) => (
                              <option key={m.profile_id} value={m.profile_id}>{m.profiles?.first_name} {m.profiles?.last_name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {shareError && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D', margin: 0 }}>{shareError}</p>}
                      {shareSuccess && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#0D6B3F', margin: 0 }}>{shareSuccess}</p>}

                      <button onClick={handleShare} disabled={shareLoading || !shareTarget} style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#C9A96E', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', opacity: shareLoading || !shareTarget ? 0.5 : 1 }}>
                        {shareLoading ? 'Sharing...' : 'Share contact'}
                      </button>

                      {sharing.contact_shares?.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginBottom: '6px' }}>Currently shared with:</div>
                          {sharing.contact_shares.map((s: any) => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#1A1A1A' }}>{s.share_type} · {s.target_id.slice(0, 8)}...</span>
                              <button onClick={() => handleUnshare(sharing.id, s.share_type, s.target_id)} style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#B52D2D', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '14px' }}>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>Select an organisation to manage it</p>
          </div>
        )}
      </div>
    </div>
  )
}