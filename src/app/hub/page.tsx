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
          <a href="/hub" className="text-sm font-medium text-gray-900">Hub</a>
          <a href="/add" className="text-sm text-gray-500 hover:text-gray-900">Add contact</a>
          {profile?.is_admin && (
            <a href="/settings" className="text-sm text-gray-500 hover:text-gray-900">Settings</a>
          )}
          <form action="/api/logout" method="POST">
            <button className="text-sm text-gray-400 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900">Network</h1>
          <p className="text-sm text-gray-400 mt-1">
            {contacts?.length || 0} contacts across all networks
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {!contacts || contacts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No contacts yet.</p>
              <a href="/add" className="mt-4 inline-block bg-black text-white text-sm px-4 py-2 rounded-lg">
                Add your first contact
              </a>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Contact</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Type</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Stage</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Priority</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{c.first_name} {c.last_name}</div>
                      <div className="text-xs text-gray-400">{c.role} · {c.firm_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{c.network_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{c.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        c.priority === 'High' ? 'bg-red-50 text-red-700' :
                        c.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.geography || '—'}</td>
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