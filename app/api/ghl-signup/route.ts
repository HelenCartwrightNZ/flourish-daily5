import { NextRequest, NextResponse } from 'next/server'

const GHL_SIGNUP_WEBHOOK_URL = process.env.GHL_SIGNUP_WEBHOOK_URL

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, fullName } = body

  const payload = {
    source: 'flourish-daily-5',
    event: 'app_signup',
    timestamp: new Date().toISOString(),
    email,
    fullName: fullName || '',
    firstName: fullName ? fullName.split(' ')[0] : '',
    lastName: fullName ? fullName.split(' ').slice(1).join(' ') : '',
    tags: ['flourish-app', 'free-member'],
  }

  console.log('[GHL Signup]', JSON.stringify(payload))

  if (!GHL_SIGNUP_WEBHOOK_URL) {
    console.warn('[GHL Signup] GHL_SIGNUP_WEBHOOK_URL not set. Payload logged above.')
    return NextResponse.json({ ok: true, sent: false, reason: 'GHL_SIGNUP_WEBHOOK_URL not configured' })
  }

  try {
    const res = await fetch(GHL_SIGNUP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[GHL Signup] Error response:', res.status, text)
      return NextResponse.json({ ok: false, status: res.status }, { status: 502 })
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (err) {
    console.error('[GHL Signup] Fetch failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
