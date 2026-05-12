import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// App Router reads raw body via request.text() — no config needed
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  // Verify this is genuinely from Stripe
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // We care about two events:
  // checkout.session.completed — one-time or first subscription payment
  // customer.subscription.created — subscription confirmed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email = session.customer_details?.email ?? session.customer_email ?? ''
    const name = session.customer_details?.name ?? ''
    const firstName = name.split(' ')[0] ?? ''
    const lastName = name.split(' ').slice(1).join(' ') ?? ''
    const customerId = typeof session.customer === 'string' ? session.customer : ''
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : ''

    if (email) {
      await notifyGHL({ email, name, firstName, lastName, customerId, subscriptionId })
    }
  }

  // Always return 200 so Stripe doesn't retry
  return NextResponse.json({ received: true })
}

async function notifyGHL({
  email, name, firstName, lastName, customerId, subscriptionId,
}: {
  email: string
  name: string
  firstName: string
  lastName: string
  customerId: string
  subscriptionId: string
}) {
  const webhookUrl = process.env.GHL_PAID_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('GHL_PAID_WEBHOOK_URL not set — skipping GHL notification')
    return
  }

  const payload = {
    source: 'brighter-tomorrows-stripe',
    event: 'membership_purchased',
    timestamp: new Date().toISOString(),
    email,
    name,
    firstName,
    lastName,
    customerId,
    subscriptionId,
    tags: ['paid-member', 'brighter-tomorrows-membership'],
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('GHL webhook failed:', res.status, await res.text())
    } else {
      console.log('GHL notified of new paid member:', email)
    }
  } catch (err) {
    console.error('GHL webhook error:', err)
  }
}
