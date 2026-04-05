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
      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.push('/hub'); return }
      setIsAdmin(true)
      const { data } = await supabase
        .from('invitations').select('*').order('created_at', { ascending: false })
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
    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(`Invite sent to ${email}`)
      setEmail('')
      setName('')
      const { data: invites } = await supabase
        .from('invitations').select('*').order('created_at', { ascending: false })
      setInvitations(invites || [])
    }
    setLoading(false)
  }

  if (!isAdmin) return null

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
          <a href="/add" className="text-sm text-gray-500 hover:text-gray-900">Add contact</a>
          <a href="/settings" className="text-sm font-medium text-gray-900">Settings</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Team access</h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Invite a team member</h2>
          <form onSubmit={sendInvite} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Layla Al-Rashid" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Work email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="layla@fund.vc" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-600">{success}</p>}
            <button type="submit" disabled={loading}
              className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40">
              {loading ? 'Sending...' : 'Send invite'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Invitations</h2>
          </div>
          {invitations.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">No invitations sent yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Email</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Status</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Sent</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Expires</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{inv.email}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        inv.accepted ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {inv.accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
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