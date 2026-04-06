import { NextRequest, NextResponse } from 'next/server'

const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL

export async function POST(request: NextRequest) {
  const body = await request.json()

  const payload = {
    source: 'flourish-daily-5',
    timestamp: new Date().toISOString(),
    ...body,
  }

  // Log for debugging (visible in Vercel function logs)
  console.log('[GHL Webhook]', JSON.stringify(payload))

  if (!GHL_WEBHOOK_URL) {
    // Webhook not configured — log and return success so the app still works
    console.warn('[GHL Webhook] GHL_WEBHOOK_URL not set. Payload logged above.')
    return NextResponse.json({ ok: true, sent: false, reason: 'GHL_WEBHOOK_URL not configured' })
  }

  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[GHL Webhook] Error response:', res.status, text)
      return NextResponse.json({ ok: false, status: res.status }, { status: 502 })
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (err) {
    console.error('[GHL Webhook] Fetch failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
