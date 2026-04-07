import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, firm_id')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin)
    return NextResponse.json({ error: 'Only admins can send invites' }, { status: 403 })

  const { email, name } = await req.json()

  if (!email || !name)
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email))
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })

  // Check for existing pending invite
  const { data: existing } = await supabase
    .from('invitations')
    .select('id, accepted, expires_at')
    .eq('email', email)
    .single()

  if (existing && !existing.accepted && new Date(existing.expires_at) > new Date())
    return NextResponse.json({ error: 'A pending invite already exists for this email' }, { status: 400 })

  // Check rate limit — max 10 invites per day per admin
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('invitations')
    .select('id', { count: 'exact' })
    .eq('invited_by', user.id)
    .gte('created_at', oneDayAgo)

  if ((count || 0) >= 10)
    return NextResponse.json({ error: 'Rate limit reached — max 10 invites per day' }, { status: 429 })

  const { data: invite, error: inviteError } = await supabase
    .from('invitations')
    .insert({ email, firm_id: profile.firm_id, invited_by: user.id })
    .select()
    .single()

  if (inviteError)
    return NextResponse.json({ error: inviteError.message }, { status: 400 })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invite.token}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `You've been invited to Wabil Capital Network Hub`,
    html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#FAFAF9;">
        <div style="margin-bottom:32px;">
          <div style="font-size:20px;font-weight:400;color:#1A1A1A;letter-spacing:-0.02em;">Wabil Capital</div>
          <div style="font-size:10px;letter-spacing:0.18em;color:#C9A96E;text-transform:uppercase;font-family:Arial,sans-serif;">Network Hub</div>
        </div>
        <h2 style="font-size:22px;font-weight:400;color:#1A1A1A;margin-bottom:12px;letter-spacing:-0.02em;">Hi ${name},</h2>
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#444;line-height:1.7;margin-bottom:24px;">
          You've been invited to join the Wabil Capital Network Hub — our private platform for managing relationships across our investment network.
        </p>
        <a href="${inviteUrl}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-family:Arial,sans-serif;font-size:13px;font-weight:500;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Accept invitation
        </a>
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:32px;line-height:1.6;">
          This link expires in 7 days. If you weren't expecting this invitation, you can ignore this email.
        </p>
        <div style="margin-top:40px;padding-top:24px;border-top:0.5px solid #E6E6E4;font-family:Arial,sans-serif;font-size:11px;color:#888;">
          Wabil Capital · hub.wabilcapital.com
        </div>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}