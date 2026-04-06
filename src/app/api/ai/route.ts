import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, contacts } = await req.json()

  const contactSummary = contacts.map((c: any) =>
    `${c.first_name} ${c.last_name} | ${c.network_type} | ${c.subtype || ''} | ${c.stage || ''} | ${c.priority || ''} | ${c.firm_name || ''} | ${c.role || ''} | ${c.geography || ''} | Context: ${c.context || ''} | Strengths: ${c.strengths || ''} | Watchouts: ${c.watchouts || ''}`
  ).join('\n')

  const systemPrompt = `You are a sharp, senior private equity and venture capital analyst assistant for Wabil Capital. You have full access to the firm's network database.

Here is the complete contact list:
${contactSummary}

Your capabilities:
1. Summarize any contact and suggest specific next steps
2. Analyze the network for gaps — missing geographies, sectors, or relationship types
3. Draft professional outreach emails — concise, warm, direct, in first person as Khaled from Wabil Capital
4. Answer any question about the contacts or network
5. Identify which contacts to prioritize this week

Rules:
- Be concise and specific — no generic advice
- When drafting emails, write in first person as Khaled from Wabil Capital
- For gap analysis, be specific about what is missing and why it matters
- Always end with a clear action item`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages,
    })

    return NextResponse.json({ content: response.content[0].type === 'text' ? response.content[0].text : '' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}