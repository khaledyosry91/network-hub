'use client'
import { useState } from 'react'

const NETWORK_TYPES = [
  'Portfolio', 'Co-investors', 'Lawyers', 'Advisors', 'Scouts', 'LPs',
  'Media & PR', 'Government', 'Investment Banking', 'Accountants',
  'Family Offices', 'PE Funds', 'Debt & Credit', 'Headhunters',
  'Board Members', 'Strategic Partners'
]

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

const PRIORITY_COLORS: Record<string, {bg: string, text: string}> = {
  'High':   { bg: '#FFF0F0', text: '#B52D2D' },
  'Medium': { bg: '#FFFBE8', text: '#8B6A00' },
  'Low':    { bg: '#F5F5F3', text: '#888888' },
}

export default function HubClient({ contacts, profile, userName }: { contacts: any[], profile: any, userName: string }) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<{role: string, content: string}[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filtered = contacts.filter(c => {
    if (activeType && c.network_type !== activeType) return false
    if (search) {
      const q = search.toLowerCase()
      const str = `${c.first_name} ${c.last_name} ${c.firm_name} ${c.role} ${c.geography}`.toLowerCase()
      if (!str.includes(q)) return false
    }
    return true
  })

  async function sendAiMessage() {
    if (!aiInput.trim()) return
    const userMsg = { role: 'user', content: aiInput }
    const newMessages = [...aiMessages, userMsg]
    setAiMessages(newMessages)
    setAiInput('')
    setAiLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          contacts: contacts,
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setAiMessages([...newMessages, { role: 'assistant', content: data.content }])
    } catch (err: any) {
      setAiMessages([...newMessages, { role: 'assistant', content: 'Error: ' + err.message }])
    }
    setAiLoading(false)
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-nav">
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Add contact</a>
          {profile?.is_admin && <a href="/settings" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Settings</a>}
          <button onClick={() => setAiOpen(!aiOpen)} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#FFFFFF', background: '#C9A96E', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>
            AI Assistant
          </button>
          <form action="/api/logout" method="POST">
            <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }} className="mobile-menu-btn">
          <div style={{ width: '22px', height: '1.5px', background: '#1A1A1A' }} />
          <div style={{ width: '22px', height: '1.5px', background: '#1A1A1A' }} />
          <div style={{ width: '22px', height: '1.5px', background: '#1A1A1A' }} />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div style={{ background: '#FFFFFF', borderBottom: '0.5px solid #E6E6E4', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#888888', textDecoration: 'none' }}>Add contact</a>
          {profile?.is_admin && <a href="/settings" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#888888', textDecoration: 'none' }}>Settings</a>}
          <button onClick={() => { setAiOpen(!aiOpen); setMobileMenuOpen(false) }} style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#FFFFFF', background: '#C9A96E', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', textAlign: 'left' }}>
            AI Assistant
          </button>
          <form action="/api/logout" method="POST">
            <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#888888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
          </form>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .contacts-table { display: none !important; }
          .contacts-cards { display: flex !important; }
          .page-pad { padding: 20px 16px !important; }
          .ai-panel { width: 100% !important; min-width: 100% !important; position: fixed !important; top: 56px !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 50 !important; }
        }
      `}</style>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="page-pad">

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '4px' }}>Network</h1>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>
                {contacts.length} contacts · {NETWORK_TYPES.filter(t => contacts.some(c => c.network_type === t)).length} network types active
              </p>
            </div>
            <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>+ Add contact</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }} className="metrics-grid">
            {NETWORK_TYPES.map(t => {
              const count = contacts.filter(c => c.network_type === t).length
              const tc = TYPE_COLORS[t]
              const active = activeType === t
              return (
                <div key={t} onClick={() => setActiveType(active ? null : t)} style={{ background: active ? tc.bg : '#FFFFFF', border: `${active ? '1.5px' : '0.5px'} solid ${active ? tc.text : '#E6E6E4'}`, borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: '500', color: tc.text, marginBottom: '6px' }}>{t}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '-0.02em' }}>{count}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, firm, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '9px 14px', outline: 'none' }}
            />
            {activeType && (
              <button onClick={() => setActiveType(null)} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', background: '#F5F5F3', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer' }}>
                Clear filter ×
              </button>
            )}
          </div>

          <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', overflow: 'hidden' }} className="contacts-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #E6E6E4' }}>
                  {['Contact', 'Network type', 'Stage', 'Priority', 'Location', 'Last update'].map(h => (
                    <th key={h} style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: '500', color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No contacts found</td></tr>
                ) : filtered.map((c: any) => {
                  const tc = TYPE_COLORS[c.network_type] || { bg: '#F5F5F3', text: '#444441' }
                  const pc = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS['Medium']
                  const initials = ((c.first_name?.[0] || '') + (c.last_name?.[0] || '')).toUpperCase()
                  const lastUpdate = c.contact_updates?.[c.contact_updates.length - 1]
                  return (
                    <tr key={c.id} style={{ borderBottom: '0.5px solid #F0F0EE' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '11px', color: tc.text, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginTop: '1px' }}>{c.role} · {c.firm_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: tc.bg, color: tc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.network_type}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{c.stage || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: pc.bg, color: pc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.priority}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888' }}>{c.geography || '—'}</td>
                      <td style={{ padding: '13px 16px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastUpdate ? lastUpdate.body : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'none', flexDirection: 'column', gap: '10px' }} className="contacts-cards">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888' }}>No contacts found</div>
            ) : filtered.map((c: any) => {
              const tc = TYPE_COLORS[c.network_type] || { bg: '#F5F5F3', text: '#444441' }
              const pc = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS['Medium']
              const initials = ((c.first_name?.[0] || '') + (c.last_name?.[0] || '')).toUpperCase()
              return (
                <div key={c.id} style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: tc.text, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>{c.first_name} {c.last_name}</div>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', marginTop: '2px' }}>{c.role} · {c.firm_name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: tc.bg, color: tc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.network_type}</span>
                    {c.stage && <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', background: '#F5F5F3', padding: '3px 8px', borderRadius: '20px' }}>{c.stage}</span>}
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', background: pc.bg, color: pc.text, padding: '3px 8px', borderRadius: '20px' }}>{c.priority}</span>
                    {c.geography && <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', background: '#F5F5F3', padding: '3px 8px', borderRadius: '20px' }}>{c.geography}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {aiOpen && (
          <div style={{ width: '360px', minWidth: '360px', background: '#FFFFFF', borderLeft: '0.5px solid #E6E6E4', display: 'flex', flexDirection: 'column', height: '100%' }} className="ai-panel">
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E6E6E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A1A1A', letterSpacing: '-0.01em' }}>AI Assistant</div>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#C9A96E', marginTop: '2px' }}>Powered by Claude</div>
              </div>
              <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888888', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiMessages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Try asking:</div>
                  {[
                    'Summarize my network and find the biggest gaps',
                    'Which contacts should I follow up with this week?',
                    'Draft an intro email to my top LP prospect',
                    'Who are my highest priority contacts right now?',
                    'Analyze my portfolio pipeline stage by stage',
                  ].map(s => (
                    <button key={s} onClick={() => setAiInput(s)} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
                  ))}
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '90%', fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.6', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.role === 'user' ? '#1A1A1A' : '#F5F5F3', color: m.role === 'user' ? '#FFFFFF' : '#1A1A1A', whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: '#F5F5F3', color: '#888888' }}>Thinking...</div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '0.5px solid #E6E6E4', display: 'flex', gap: '8px' }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage() } }}
                placeholder="Ask anything about your network..."
                style={{ flex: 1, fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '9px 12px', outline: 'none' }}
              />
              <button onClick={sendAiMessage} disabled={aiLoading || !aiInput.trim()} style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#C9A96E', border: 'none', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', opacity: aiLoading || !aiInput.trim() ? 0.5 : 1 }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}