import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HubClient from './HubClient'

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
    <HubClient
      contacts={contacts || []}
      profile={profile}
      userName={profile?.first_name + ' ' + profile?.last_name}
    />
  )
}