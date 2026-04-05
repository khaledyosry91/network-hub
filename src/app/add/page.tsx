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
    strengths: '', watchouts: '', next_action: '',
  })

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles').select('firm_id').eq('id', user!.id).single()

    const { error } = await supabase.from('contacts').insert({
      ...form,
      firm_id: profile?.firm_id,
      created_by: user!.id,
    })

    if (error) { setError(error.message); setLoading(false) }
    else router.push('/hub')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span className="font-medium text-gray-900">Network Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/hub" className="text-sm text-gray-500 hover:text-gray-900">Hub</a>
          <a href="/add" className="text-sm font-medium text-gray-900">Add contact</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                n === step ? 'bg-black text-white' : n < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{n < step ? '✓' : n}</div>
              <span className={`text-sm ${n === step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                {n === 1 ? 'Type & identity' : n === 2 ? 'Details' : 'Context'}
              </span>
              {n < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Network type</label>
                <div className="grid grid-cols-4 gap-2">
                  {NETWORK_TYPES.map(t => (
                    <button key={t} type="button"
                      onClick={() => upd('network_type', t)}
                      className={`p-2 rounded-lg border text-xs font-medium text-left ${
                        form.network_type === t ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">First name</label>
                  <input value={form.first_name} onChange={e => upd('first_name', e.target.value)}
                    placeholder="Layla" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Last name</label>
                  <input value={form.last_name} onChange={e => upd('last_name', e.target.value)}
                    placeholder="Al-Rashid" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Firm</label>
                  <input value={form.firm_name} onChange={e => upd('firm_name', e.target.value)}
                    placeholder="Firm name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Role</label>
                  <input value={form.role} onChange={e => upd('role', e.target.value)}
                    placeholder="CEO" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input value={form.email} onChange={e => upd('email', e.target.value)}
                    placeholder="name@firm.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => upd('phone', e.target.value)}
                    placeholder="+971 50 000 0000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.network_type || !form.first_name || !form.last_name}
                className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40">
                Next: Details
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Subtype</label>
                <div className="flex flex-wrap gap-2">
                  {(SUBTYPES[form.network_type] || []).map(s => (
                    <button key={s} type="button" onClick={() => upd('subtype', s)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                        form.subtype === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {(STAGES[form.network_type] || []).map(s => (
                    <button key={s} type="button" onClick={() => upd('stage', s)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                        form.stage === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Priority</label>
                <div className="flex gap-2">
                  {['High', 'Medium', 'Low'].map(p => (
                    <button key={p} type="button" onClick={() => upd('priority', p)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
                        form.priority === p ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Geography</label>
                  <input value={form.geography} onChange={e => upd('geography', e.target.value)}
                    placeholder="Dubai, UAE" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Sector</label>
                  <input value={form.sector} onChange={e => upd('sector', e.target.value)}
                    placeholder="Fintech" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Back</button>
                <button onClick={() => setStep(3)} disabled={!form.subtype || !form.stage}
                  className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40">
                  Next: Context
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">How did we meet?</label>
                <select value={form.source} onChange={e => upd('source', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400">
                  <option value="">Select...</option>
                  {SOURCES.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Context / background</label>
                <textarea value={form.context} onChange={e => upd('context', e.target.value)}
                  rows={3} placeholder="Who they are, what they do, why relevant..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Strengths and opportunity</label>
                <textarea value={form.strengths} onChange={e => upd('strengths', e.target.value)}
                  rows={2} placeholder="What excites us..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Watch-outs</label>
                <textarea value={form.watchouts} onChange={e => upd('watchouts', e.target.value)}
                  rows={2} placeholder="Risks, concerns, open questions..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40">
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
