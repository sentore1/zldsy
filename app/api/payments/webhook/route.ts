import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

/**
 * Payment Webhook Handler
 * 
 * This endpoint receives webhook notifications from payment providers
 * (Stripe, PayPal, Flutterwave, etc.)
 * 
 * Configure your payment provider to send webhooks to:
 * https://yourdomain.com/api/payments/webhook
 */

// Example Stripe webhook handling (uncomment after installing stripe)
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    
    // Get raw body for webhook signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''
    
    // Determine webhook provider based on headers or URL params
    const provider = request.nextUrl.searchParams.get('provider') || 'stripe'

    switch (provider) {
      case 'stripe':
        return await handleStripeWebhook(body, signature, supabase)
      
      case 'paypal':
        return await handlePayPalWebhook(body, supabase)
      
      case 'flutterwave':
        return await handleFlutterwaveWebhook(body, supabase)
      
      default:
        return NextResponse.json(
          { error: 'Unknown payment provider' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle Stripe webhooks
 */
async function handleStripeWebhook(
  body: string,
  signature: string,
  supabase: any
) {
  try {
    // TODO: Uncomment after installing Stripe
    /*
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Stripe webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent, supabase)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handleFailedPayment(failedPayment, supabase)
        break

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge
        await handleRefund(refund, supabase)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }
    */

    // Temporary mock response
    console.log('⚠️  Stripe webhook received but Stripe SDK not installed')
    console.log('   Install with: npm install stripe')
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Stripe webhook processing failed' },
      { status: 400 }
    )
  }
}

/**
 * Handle PayPal webhooks
 */
async function handlePayPalWebhook(body: string, supabase: any) {
  try {
    const event = JSON.parse(body)
    
    console.log('PayPal webhook event:', event.event_type)

    // TODO: Verify PayPal webhook signature
    // TODO: Handle PayPal events

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'PayPal webhook processing failed' },
      { status: 400 }
    )
  }
}

/**
 * Handle Flutterwave webhooks
 */
async function handleFlutterwaveWebhook(body: string, supabase: any) {
  try {
    const event = JSON.parse(body)
    
    console.log('Flutterwave webhook event:', event.event)

    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
    // TODO: Verify signature

    // Handle successful payment
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const { tx_ref, amount, customer } = event.data
      
      // Extract invoice_id from tx_ref (should be formatted as "INV-{timestamp}-{invoice_id}")
      const invoiceId = tx_ref.split('-').pop()
      
      if (invoiceId) {
        await supabase.from('payments').insert({
          invoice_id: invoiceId,
          amount,
          payment_method: 'credit_card',
          transaction_reference: tx_ref,
          payment_date: new Date().toISOString(),
          notes: `Flutterwave payment from ${customer.email}`,
        })

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Flutterwave webhook error:', error)
    return NextResponse.json(
      { error: 'Flutterwave webhook processing failed' },
      { status: 400 }
    )
  }
}

/**
 * Handle successful payment from Stripe
 */
async function handleSuccessfulPayment(paymentIntent: any, supabase: any) {
  try {
    const invoiceId = paymentIntent.metadata.invoice_id
    const amount = paymentIntent.amount / 100 // Convert from cents

    if (!invoiceId) {
      console.error('No invoice_id in payment metadata')
      return
    }

    // Record payment
    const { error: paymentError } = await supabase.from('payments').insert({
      invoice_id: invoiceId,
      amount,
      payment_method: 'credit_card',
      transaction_reference: paymentIntent.id,
      payment_date: new Date().toISOString(),
      notes: 'Stripe payment',
    })

    if (paymentError) {
      console.error('Failed to record payment:', paymentError)
      return
    }

    // Update invoice status
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: 'credit_card',
      })
      .eq('id', invoiceId)

    if (invoiceError) {
      console.error('Failed to update invoice:', invoiceError)
      return
    }

    console.log('✅ Payment processed successfully via webhook')
    console.log('   Invoice:', invoiceId)
    console.log('   Amount:', amount)
    console.log('   Transaction:', paymentIntent.id)

    // TODO: Send payment confirmation email
    // await sendPaymentConfirmationEmail(invoiceId)
  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

/**
 * Handle failed payment from Stripe
 */
async function handleFailedPayment(paymentIntent: any, supabase: any) {
  try {
    const invoiceId = paymentIntent.metadata.invoice_id
    
    if (!invoiceId) {
      console.error('No invoice_id in payment metadata')
      return
    }

    console.log('❌ Payment failed via webhook')
    console.log('   Invoice:', invoiceId)
    console.log('   Error:', paymentIntent.last_payment_error?.message)

    // TODO: Send payment failed notification
    // await sendPaymentFailedEmail(invoiceId, paymentIntent.last_payment_error?.message)
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

/**
 * Handle refund from Stripe
 */
async function handleRefund(charge: any, supabase: any) {
  try {
    // TODO: Record refund in database
    // TODO: Update invoice status
    // TODO: Send refund notification

    console.log('💰 Refund processed via webhook')
    console.log('   Charge:', charge.id)
    console.log('   Amount:', charge.amount_refunded / 100)
  } catch (error) {
    console.error('Error handling refund:', error)
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Webhook endpoint is active',
    supported_providers: ['stripe', 'paypal', 'flutterwave'],
    usage: 'POST webhook events to this endpoint with ?provider=<name>',
  })
}
