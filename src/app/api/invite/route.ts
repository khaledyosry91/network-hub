import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { email, name } = await req.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, firm_id')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin)
    return NextResponse.json({ error: 'Only admins can send invites' }, { status: 403 })

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
    subject: `You've been invited to Network Hub`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <div style="margin-bottom:24px;">
          <strong style="font-size:18px;">Network Hub</strong>
        </div>
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px;">Hi ${name},</h2>
        <p style="color:#666;margin-bottom:24px;">
          You've been invited to join your team's Network Hub —
          a private tool for managing VC relationships and deal flow.
        </p>
        <a href="${inviteUrl}"
          style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
          Accept invitation
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          This link expires in 7 days. If you weren't expecting this, ignore this email.
        </p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}