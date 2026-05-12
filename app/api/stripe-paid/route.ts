import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  // Verify this is genuinely from Stripe
  let event: ReturnType<typeof stripe.webhooks.constructEvent>
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

  // We care about checkout.session.completed — fires when payment succeeds
  if (event.type === 'checkout.session.completed') {
    // Use loose typing to stay compatible across Stripe SDK versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any

    const email: string = session.customer_details?.email ?? session.customer_email ?? ''
    const name: string = session.customer_details?.name ?? ''
    const firstName = name.split(' ')[0] ?? ''
    const lastName = name.split(' ').slice(1).join(' ') ?? ''
    const customerId: string = typeof session.customer === 'string' ? session.customer : ''
    const subscriptionId: string = typeof session.subscription === 'string' ? session.subscription : ''

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
