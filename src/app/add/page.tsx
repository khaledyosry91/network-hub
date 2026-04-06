'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

const SUBTYPES: Record<string, string[]> = {
  'Portfolio':          ['Founder', 'Co-Founder', 'CEO', 'CTO', 'CFO', 'COO', 'Board Member', 'Investor Relations'],
  'Co-investors':       ['VC Fund', 'Angel', 'Family Office', 'CVC', 'Sovereign Fund', 'Accelerator', 'SPV Lead', 'Club Deal'],
  'Lawyers':            ['Corporate', 'M&A', 'VC / Startup', 'IP / Patents', 'Employment', 'Regulatory', 'Tax', 'Compliance', 'Real Estate'],
  'Advisors':           ['Strategic', 'Technical', 'GTM', 'Finance', 'Ops', 'Domain Expert', 'Board Advisor', 'Mentor', 'Industry Expert'],
  'Scouts':             ['University Scout', 'Accelerator Scout', 'Community Scout', 'Operator Scout', 'Journalist', 'Event Organiser'],
  'LPs':                ['Family Office', 'HNW Individual', 'Sovereign Wealth', 'Pension Fund', 'Endowment', 'Fund of Funds', 'Corporate LP', 'Government LP'],
  'Media & PR':         ['Journalist', 'Editor', 'Podcast Host', 'Newsletter Author', 'Analyst', 'Researcher', 'Influencer', 'Event Organiser'],
  'Government':         ['Regulator', 'Policy Maker', 'Free Zone Authority', 'Economic Dev.', 'Minister', 'Embassy', 'Diplomat', 'Trade Body'],
  'Investment Banking': ['M&A Advisor', 'ECM', 'DCM', 'Coverage Banker', 'Restructuring', 'Placement Agent', 'Fairness Opinion', 'Buyside Advisor'],
  'Accountants':        ['Big 4 Partner', 'Audit', 'Tax Advisory', 'Transaction Services', 'Valuation', 'Forensics', 'CFO Advisory', 'Fund Admin'],
  'Family Offices':     ['Single Family Office', 'Multi Family Office', 'Principal', 'CIO', 'Investment Team', 'Operating Partner'],
  'PE Funds':           ['Managing Partner', 'Partner', 'Principal', 'Associate', 'Operating Partner', 'LP Relations', 'IR Team'],
  'Debt & Credit':      ['Direct Lender', 'Mezzanine', 'Unitranche', 'Asset-Based Lender', 'Trade Finance', 'Distressed Debt', 'Credit Fund', 'Bank'],
  'Headhunters':        ['Executive Search', 'Board Practice', 'C-Suite', 'CFO Practice', 'Operating Partner Search', 'Portfolio Talent', 'Interim'],
  'Board Members':      ['Independent Director', 'Non-Executive Director', 'Audit Committee', 'Remuneration Committee', 'Observer', 'Technical Advisor'],
  'Strategic Partners': ['Corporate Partner', 'JV Partner', 'Distribution Partner', 'Technology Partner', 'Channel Partner', 'Ecosystem Partner'],
}

const STAGES: Record<string, string[]> = {
  'Portfolio':          ['First Contact', 'Meeting Scheduled', 'Due Diligence', 'IC Review', 'Term Sheet', 'Active Portfolio', 'Board Observer', 'Exited', 'Passed'],
  'Co-investors':       ['Warm Lead', 'Intro Made', '1st Meeting', 'Active Diligence', 'Co-invested', 'Passed', 'Watch List'],
  'Lawyers':            ['In Network', 'Engaged', 'Active Matter', 'Retainer', 'Former', 'Referred'],
  'Advisors':           ['In Network', 'Intro Made', 'Advisory Call', 'Formal Advisor', 'Active', 'Inactive'],
  'Scouts':             ['In Network', 'Active', 'Deal Referred', 'Warm', 'Inactive'],
  'LPs':                ['Prospect', 'Intro Made', '1st Meeting', 'DD Started', 'Term Sheet', 'Committed', 'Current LP', 'Passed'],
  'Media & PR':         ['In Network', 'Warm', 'Featured Us', 'Interview Scheduled', 'Ongoing Relationship', 'Cold'],
  'Government':         ['In Network', 'Intro Made', 'Meeting Done', 'Active Relationship', 'MOU Signed', 'Former'],
  'Investment Banking': ['In Network', 'Intro Made', 'Mandate Discussion', 'Active Mandate', 'Deal Closed', 'Former'],
  'Accountants':        ['In Network', 'Engaged', 'Active Engagement', 'Retainer', 'Former'],
  'Family Offices':     ['Prospect', 'Intro Made', '1st Meeting', 'Active Discussion', 'Committed', 'Current Investor', 'Passed'],
  'PE Funds':           ['In Network', 'Intro Made', 'Active Relationship', 'Co-investment Discussion', 'Co-invested', 'Watch List'],
  'Debt & Credit':      ['In Network', 'Intro Made', 'Term Sheet', 'Credit Approved', 'Active Facility', 'Repaid', 'Passed'],
  'Headhunters':        ['In Network', 'Engaged', 'Active Search', 'Candidate Presented', 'Placed', 'Former'],
  'Board Members':      ['Prospective', 'Intro Made', 'Discussion', 'Appointed', 'Active', 'Former'],
  'Strategic Partners': ['In Network', 'Intro Made', 'Active Discussion', 'MOU Signed', 'Active Partnership', 'Inactive'],
}

const SOURCES = ['Warm intro', 'Cold outreach', 'Conference / event', 'Scout referral', 'LinkedIn', 'Accelerator', 'Existing portfolio', 'Other']

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

const Label = ({ text }: { text: string }) => (
  <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#888888', display: 'block', marginBottom: '6px' }}>{text}</label>
)

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
    const { error } = await supabase.from('contacts').insert({
      ...form, firm_id: profile?.firm_id, created_by: user!.id,
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/hub')
  }

  const TagBtn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', border: active ? '1.5px solid #1A1A1A' : '0.5px solid #E6E6E4', background: active ? '#1A1A1A' : '#FFFFFF', color: active ? '#FFFFFF' : '#888888', cursor: 'pointer' }}>{label}</button>
  )

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
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/hub" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', textDecoration: 'none' }}>Hub</a>
          <a href="/add" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none' }}>Add contact</a>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', letterSpacing: '-0.025em', color: '#1A1A1A', marginBottom: '28px' }}>Add contact</h1>

        {/* Step bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: n === step ? '#1A1A1A' : n < step ? '#C9A96E' : '#E6E6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', color: n <= step ? '#FFFFFF' : '#888888', flexShrink: 0 }}>
                {n < step ? '✓' : n}
              </div>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: n === step ? '#1A1A1A' : '#888888', fontWeight: n === step ? '500' : '400' }}>
                {n === 1 ? 'Type & identity' : n === 2 ? 'Details' : 'Context'}
              </span>
              {n < 3 && <div style={{ width: '24px', height: '0.5px', background: '#E6E6E4', margin: '0 4px' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: '0.5px solid #E6E6E4', borderRadius: '12px', padding: '24px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <Label text="Network type" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
                  {NETWORK_TYPES.map(t => {
                    const tc = TYPE_COLORS[t]
                    const active = form.network_type === t
                    return (
                      <button key={t} onClick={() => { upd('network_type', t); upd('subtype', ''); upd('stage', '') }} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: '500', padding: '8px 6px', borderRadius: '8px', border: active ? `1.5px solid ${tc.text}` : '0.5px solid #E6E6E4', background: active ? tc.bg : '#FFFFFF', color: active ? tc.text : '#888888', cursor: 'pointer', lineHeight: '1.3' }}>{t}</button>
                    )
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><Label text="First name" /><input value={form.first_name} onChange={e => upd('first_name', e.target.value)} placeholder="Layla" style={inputStyle} /></div>
                <div><Label text="Last name" /><input value={form.last_name} onChange={e => upd('last_name', e.target.value)} placeholder="Al-Rashid" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><Label text="Firm" /><input value={form.firm_name} onChange={e => upd('firm_name', e.target.value)} placeholder="Firm name" style={inputStyle} /></div>
                <div><Label text="Role" /><input value={form.role} onChange={e => upd('role', e.target.value)} placeholder="Managing Director" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><Label text="Email" /><input value={form.email} onChange={e => upd('email', e.target.value)} placeholder="name@firm.com" style={inputStyle} /></div>
                <div><Label text="Phone" /><input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+971 50 000 0000" style={inputStyle} /></div>
              </div>
              <div><Label text="LinkedIn" /><input value={form.linkedin_url} onChange={e => upd('linkedin_url', e.target.value)} placeholder="linkedin.com/in/..." style={inputStyle} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setStep(2)} disabled={!form.network_type || !form.first_name || !form.last_name} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', opacity: !form.network_type || !form.first_name || !form.last_name ? 0.4 : 1 }}>
                  Next: Details
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <Label text="Subtype" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(SUBTYPES[form.network_type] || []).map(s => <TagBtn key={s} label={s} active={form.subtype === s} onClick={() => upd('subtype', s)} />)}
                </div>
              </div>
              <div>
                <Label text="Stage" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(STAGES[form.network_type] || []).map(s => <TagBtn key={s} label={s} active={form.stage === s} onClick={() => upd('stage', s)} />)}
                </div>
              </div>
              <div>
                <Label text="Priority" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['High', 'Medium', 'Low'].map(p => <TagBtn key={p} label={p} active={form.priority === p} onClick={() => upd('priority', p)} />)}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><Label text="Geography" /><input value={form.geography} onChange={e => upd('geography', e.target.value)} placeholder="Dubai, UAE" style={inputStyle} /></div>
                <div><Label text="Sector focus" /><input value={form.sector} onChange={e => upd('sector', e.target.value)} placeholder="Fintech, Healthcare..." style={inputStyle} /></div>
              </div>
              <div><Label text="Specific focus / specialty" /><input value={form.focus} onChange={e => upd('focus', e.target.value)} placeholder="e.g. MENA growth equity, DIFC regulations..." style={inputStyle} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(1)} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} disabled={!form.subtype || !form.stage} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', opacity: !form.subtype || !form.stage ? 0.4 : 1 }}>
                  Next: Context
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Label text="How did we meet?" />
                <select value={form.source} onChange={e => upd('source', e.target.value)} style={inputStyle}>
                  <option value="">Select...</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label text="Context / background" />
                <textarea value={form.context} onChange={e => upd('context', e.target.value)} rows={3} placeholder="Who they are, what they do, why relevant to Wabil Capital..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <Label text="Strengths & opportunity" />
                <textarea value={form.strengths} onChange={e => upd('strengths', e.target.value)} rows={2} placeholder="What excites us, unique advantages, market timing..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <Label text="Watch-outs & open questions" />
                <textarea value={form.watchouts} onChange={e => upd('watchouts', e.target.value)} rows={2} placeholder="Risks, concerns, things to validate..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              {error && <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#B52D2D', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(2)} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888888', background: 'none', border: '0.5px solid #E6E6E4', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleSubmit} disabled={loading} type="button" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Saving...' : 'Add to network'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}