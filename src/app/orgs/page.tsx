import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrgsClient from './OrgsClient'

export default async function OrgsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myOrgs } = await supabase
    .from('org_members')
    .select('*, organisations(*, org_members(*, profiles(*)))')
    .eq('profile_id', user.id)

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')

  const { data: myContacts } = await supabase
    .from('contacts')
    .select('*, contact_shares(*)')
    .eq('created_by', user.id)

  const { data: teams } = await supabase
    .from('teams')
    .select('*, team_members(*, profiles(*))')

  return (
    <OrgsClient
      myOrgs={myOrgs || []}
      allProfiles={allProfiles || []}
      myContacts={myContacts || []}
      teams={teams || []}
      profile={profile}
      userId={user.id}
    />
  )
}