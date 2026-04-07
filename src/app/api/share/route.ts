import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contact_id, share_type, target_id } = await req.json()

  if (!contact_id || !share_type || !target_id)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  if (!['org', 'team', 'person'].includes(share_type))
    return NextResponse.json({ error: 'Invalid share type' }, { status: 400 })

  // Verify user owns this contact
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, created_by')
    .eq('id', contact_id)
    .single()

  if (!contact || contact.created_by !== user.id)
    return NextResponse.json({ error: 'You can only share contacts you created' }, { status: 403 })

  const { error } = await supabase
    .from('contact_shares')
    .insert({ contact_id, share_type, target_id, shared_by: user.id })

  if (error && error.code !== '23505')
    return NextResponse.json({ error: error.message }, { status: 400 })

  // Log activity
  await supabase.from('activity_log').insert({
    profile_id: user.id,
    contact_id,
    action: 'shared',
    detail: `Shared via ${share_type}`,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contact_id, share_type, target_id } = await req.json()

  const { error } = await supabase
    .from('contact_shares')
    .delete()
    .eq('contact_id', contact_id)
    .eq('share_type', share_type)
    .eq('target_id', target_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}