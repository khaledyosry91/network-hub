'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NETWORK_TYPES = ['Portfolio', 'Co-investors', 'Lawyers', 'Advisors', 'Scouts', 'LPs', 'Media & PR', 'Government']
const SUBTYPES: Record<string, string[]> = {
  'Portfolio': ['Founder', 'Co-Founder', 'CEO', 'CTO', 'CFO', 'COO', 'Board Member'],
  'Co-investors': ['VC Fund', 'Angel', 'Family Office', 'CVC', 'Sovereign Fund', 'Accelerator', 'SPV Lead'],
  'Lawyers': ['Corporate', 'M&A', 'VC / Startup', 'IP / Patents', 'Employment', 'Regulatory', 'Tax'],
  'Advisors': ['Strategic', 'Technical', 'GTM', 'Finance', 'Ops', 'Domain Expert', 'Board Advisor', 'Mentor'],
  'Scouts': ['University Scout', 'Accelerator Scout', 'Community Scout', 'Operator Scout', 'Journalist'],
  'LPs': ['Family Office', 'HNW Individual', 'Sovereign Wealth', 'Pension Fund', 'Fund of Funds', 'Corporate LP'],
  'Media & PR': ['Journalist', 'Editor', 'Podcast Host', 'Newsletter Author', 'Analyst', 'Influencer'],
  'Government': ['Regulator', 'Policy Maker', 'Free Zone Authority', 'Economic Dev.', 'Minister', 'Diplomat'],
}
const STAGES: Record<string, string[]> = {
  'Portfolio': ['First Contact', 'Meeting Scheduled', 'Due Diligence', 'Term Sheet', 'Active Portfolio', 'Passed'],
  'Co-investors': ['Warm Lead', 'Intro Made', '1st Meeting', 'Active Diligence', 'Co-invested', 'Passed'],
  'Lawyers': ['In Network', 'Engaged', 'Active Matter', 'Retainer', 'Former'],
  'Advisors': ['In Network', 'Intro Made', 'Advisory Call', 'Formal Advisor', 'Active', 'Inactive'],
  'Scouts': ['In Network', 'Active', 'Deal Referred', 'Warm', 'Inactive'],
  'LPs': ['Prospect', 'Intro Made', '1st Meeting', 'Term Sheet', 'Committed', 'Current LP', 'Passed'],
  'Media & PR': ['In Network', 'Warm', 'Featured Us', 'Interview Scheduled', 'Ongoing Relationship'],
  'Government': ['In Network', 'Intro Made', 'Meeting Done', 'Active Relationship', 'MOU Signed'],
}
const SOURCES = ['Warm intro', 'Cold outreach', 'Conference / event', 'Scout referral', 'LinkedIn', 'Accelerator', 'Other']
const TYPE_COLORS: Record<string, {bg: string, text: string}> = {
  'Portfolio':    { bg: '#F0F4FF', text: '#2D4DB5' },
  'Co-investors': { bg: '#EEF5FF', text: '#1A5FA8' },
  'Lawyers':      { bg: '#F3F0FF', text: '#5B3DB5' },
  'Advisors':     { bg: '#FFF8F0', text: '#6B3D00' },
  'Scouts':       { bg: '#EDFAF4', text: '#0D6B3F' },
  'LPs':          { bg: '#FFF3E8', text: '#A84F00' },
  'Media & PR':   { bg: '#FFF0FB', text: '#8B006B' },
  'Government':   { bg: '#F5F5F3', text: '#444441' },
}

const label = (text: string) => (
  <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>{text}</label>
)

const inputStyle = { width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1A1A1A', background: '#FAFAF9', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const }

export default function AddPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    network_type: '', subtype: '', stage: '', priority: 'Medium',
    first_name: '', last_name: '', firm_name: '', role: '',
    email: '', phone: '', linkedin_url: '', geography: '',
    sector: '', focus: '', source: '', context: '',
    strengths: '', watchouts: '',
  })

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('firm_id').eq('id', user!.id).single()
    const { error } = await supabase.from('contacts').insert({ ...form, firm_id: profile?.firm_id, created_by: user!.id })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/hub')
  }

  const nav = (
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
        <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Add contact</a>
      </div>
    </nav>
  )

  const stepBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
      {[1,2,3].map(n => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: n === step ? '#1A1A1A' : n < step ? '#C9A96E' : '#E6E6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', color: n <= step ? '#FFFFFF' : '#888888' }}>
            {n < step ? '✓' : n}
          </div>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: n === step ? '#1A1A1A' : '#888888', fontWeight: n === step ? '500' : '400' }}>
            {n === 1 ? 'Type & identity' : n === 2 ? 'Details' : 'Context'}
          </span>
          {n < 3 && <div style={{ width: '32px', height: '0.5px', background: '#E6E6E4', margin: '0 4px' }} />}
        </div>
      ))}
    </div>
  )

  const card = (children: React.ReactNode) => (
    <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', padding: '28px' }}>
      {children}
    </div>
  )

  const tagBtn = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', border: active ? '1.5px solid #1A1A1A' : '0.5px solid #E6E6E4', background: active ? '#1A1A1A' : '#FFFFFF', color: active ? '#FFFFFF' : '#888888', cursor: 'pointer' }}>{label}</button>
  )

  const nextBtn = (text: string, onClick: () => void, disabled = false) => (
    <button onClick={onClick} disabled={disabled} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>{text}</button>
  )

  const backBtn = (onClick: () => void) => (
    <button onClick={onClick} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer' }}>Back</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      {nav}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '28px' }}>Add contact</h1>
        {stepBar}

        {step === 1 && card(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginBottom: '10px' }}>Network type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {NETWORK_TYPES.map(t => {
                  const tc = TYPE_COLORS[t]
                  const active = form.network_type === t
                  return (
                    <button key={t} onClick={() => upd('network_type', t)} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', padding: '8px 6px', borderRadius: '8px', border: active ? `1.5px solid ${tc.text}` : '0.5px solid #E6E6E4', background: active ? tc.bg : '#FFFFFF', color: active ? tc.text : '#888888', cursor: 'pointer' }}>{t}</button>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>{label('First name')}<input value={form.first_name} onChange={e => upd('first_name', e.target.value)} placeholder="Layla" style={inputStyle} /></div>
              <div>{label('Last name')}<input value={form.last_name} onChange={e => upd('last_name', e.target.value)} placeholder="Al-Rashid" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>{label('Firm')}<input value={form.firm_name} onChange={e => upd('firm_name', e.target.value)} placeholder="Firm name" style={inputStyle} /></div>
              <div>{label('Role')}<input value={form.role} onChange={e => upd('role', e.target.value)} placeholder="CEO" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>{label('Email')}<input value={form.email} onChange={e => upd('email', e.target.value)} placeholder="name@firm.com" style={inputStyle} /></div>
              <div>{label('Phone')}<input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+971 50 000 0000" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {nextBtn('Next: Details', () => setStep(2), !form.network_type || !form.first_name || !form.last_name)}
            </div>
          </div>
        )}

        {step === 2 && card(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginBottom: '10px' }}>Subtype</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(SUBTYPES[form.network_type] || []).map(s => tagBtn(s, form.subtype === s, () => upd('subtype', s)))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginBottom: '10px' }}>Stage</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(STAGES[form.network_type] || []).map(s => tagBtn(s, form.stage === s, () => upd('stage', s)))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', marginBottom: '10px' }}>Priority</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['High', 'Medium', 'Low'].map(p => tagBtn(p, form.priority === p, () => upd('priority', p)))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>{label('Geography')}<input value={form.geography} onChange={e => upd('geography', e.target.value)} placeholder="Dubai, UAE" style={inputStyle} /></div>
              <div>{label('Sector')}<input value={form.sector} onChange={e => upd('sector', e.target.value)} placeholder="Fintech" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {backBtn(() => setStep(1))}
              {nextBtn('Next: Context', () => setStep(3), !form.subtype || !form.stage)}
            </div>
          </div>
        )}

        {step === 3 && card(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              {label('How did we meet?')}
              <select value={form.source} onChange={e => upd('source', e.target.value)} style={{ ...inputStyle }}>
                <option value="">Select...</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              {label('Context / background')}
              <textarea value={form.context} onChange={e => upd('context', e.target.value)} rows={3} placeholder="Who they are, what they do, why relevant..." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              {label('Strengths & opportunity')}
              <textarea value={form.strengths} onChange={e => upd('strengths', e.target.value)} rows={2} placeholder="What excites us..." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              {label('Watch-outs')}
              <textarea value={form.watchouts} onChange={e => upd('watchouts', e.target.value)} rows={2} placeholder="Risks, concerns, open questions..." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            {error && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {backBtn(() => setStep(2))}
              <button onClick={handleSubmit} disabled={loading} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Saving...' : 'Add to network'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}