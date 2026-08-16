import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

/**
 * Payment Processing API
 * 
 * This is a template for payment processing.
 * Integrate with your payment gateway (Stripe, PayPal, Flutterwave, etc.)
 * 
 * For Stripe integration:
 * 1. Install: npm install stripe
 * 2. Add STRIPE_SECRET_KEY to .env.local
 * 3. Uncomment Stripe code below
 */

// Example Stripe integration (uncomment after installing stripe)
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    
    const {
      invoice_id,
      amount,
      payment_method, // 'credit_card', 'bank_transfer', 'mobile_money', 'cash', 'check'
      transaction_reference,
      notes,
    } = body

    // Validate required fields
    if (!invoice_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'invoice_id, amount, and payment_method are required' },
        { status: 400 }
      )
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        job:jobs(
          *,
          booking:bookings(
            *,
            customer:customers(*)
          )
        )
      `)
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Validate amount
    const paymentAmount = Number(amount)
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Get existing payments for this invoice
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoice_id)

    const totalPaid = existingPayments?.reduce(
      (sum: number, payment: any) => sum + Number(payment.amount),
      0
    ) || 0

    const invoiceAmount = Number(invoice.final_amount)
    const remainingAmount = invoiceAmount - totalPaid

    // Check if payment amount exceeds remaining balance
    if (paymentAmount > remainingAmount) {
      return NextResponse.json(
        {
          error: 'Payment amount exceeds remaining balance',
          remaining: remainingAmount,
          attempted: paymentAmount,
        },
        { status: 400 }
      )
    }

    let transactionRef = transaction_reference

    // Process payment based on method
    switch (payment_method) {
      case 'credit_card':
      case 'debit_card':
        // TODO: Integrate with Stripe or other card processor
        // Example Stripe implementation:
        /*
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(paymentAmount * 100), // Amount in cents
            currency: 'usd', // Change to your currency
            metadata: {
              invoice_id,
              invoice_number: invoice.invoice_number,
              customer_id: invoice.job.booking.customer.id,
            },
          })
          
          transactionRef = paymentIntent.id
        } catch (stripeError: any) {
          return NextResponse.json(
            { error: `Payment failed: ${stripeError.message}` },
            { status: 400 }
          )
        }
        */
        
        // For now, generate a mock transaction reference
        if (!transactionRef) {
          transactionRef = `CARD-${Date.now()}-${Math.random().toString(36).substring(7)}`
        }
        break

      case 'mobile_money':
        // TODO: Integrate with mobile money provider (MTN, Airtel, etc.)
        if (!transactionRef) {
          transactionRef = `MM-${Date.now()}-${Math.random().toString(36).substring(7)}`
        }
        break

      case 'bank_transfer':
        // Bank transfers are usually manually verified
        if (!transactionRef) {
          return NextResponse.json(
            { error: 'transaction_reference is required for bank transfers' },
            { status: 400 }
          )
        }
        break

      case 'cash':
        // Cash payments are recorded immediately
        if (!transactionRef) {
          transactionRef = `CASH-${Date.now()}`
        }
        break

      case 'check':
        // Check payments need check number
        if (!transactionRef) {
          return NextResponse.json(
            { error: 'transaction_reference (check number) is required for check payments' },
            { status: 400 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id,
        amount: paymentAmount,
        payment_method,
        transaction_reference: transactionRef,
        payment_date: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment recording error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to record payment' },
        { status: 500 }
      )
    }

    // Calculate new total paid
    const newTotalPaid = totalPaid + paymentAmount
    const newRemainingAmount = invoiceAmount - newTotalPaid

    // Update invoice status
    let newInvoiceStatus = invoice.status
    let paidDate = invoice.paid_date

    if (newRemainingAmount <= 0.01) {
      // Fully paid (accounting for small rounding differences)
      newInvoiceStatus = 'paid'
      paidDate = new Date().toISOString()
    } else if (newTotalPaid > 0 && invoice.status === 'pending') {
      // Partially paid
      newInvoiceStatus = 'pending'
    }

    const { error: invoiceUpdateError } = await supabase
      .from('invoices')
      .update({
        status: newInvoiceStatus,
        paid_date: paidDate,
        payment_method: payment_method,
      })
      .eq('id', invoice_id)

    if (invoiceUpdateError) {
      console.error('Invoice update error:', invoiceUpdateError)
      // Don't fail the payment recording for this
    }

    console.log('✅ Payment recorded successfully')
    console.log('   Amount:', paymentAmount)
    console.log('   Method:', payment_method)
    console.log('   Transaction:', transactionRef)
    console.log('   Total Paid:', newTotalPaid)
    console.log('   Remaining:', newRemainingAmount)
    console.log('   Status:', newInvoiceStatus)

    // TODO: Send payment receipt email/WhatsApp
    // await sendPaymentReceiptEmail(payment, invoice)
    // await sendPaymentReceiptWhatsApp(payment, invoice)

    return NextResponse.json(
      {
        success: true,
        payment,
        invoice: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          total_amount: invoiceAmount,
          total_paid: newTotalPaid,
          remaining: newRemainingAmount,
          status: newInvoiceStatus,
          fully_paid: newRemainingAmount <= 0.01,
        },
        message: newRemainingAmount <= 0.01
          ? 'Payment successful. Invoice fully paid.'
          : `Payment successful. Remaining balance: ${newRemainingAmount.toFixed(2)}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get payment history for an invoice
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoice_id')

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoice_id is required' },
        { status: 400 }
      )
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Payments fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    const totalPaid = payments?.reduce(
      (sum: number, payment: any) => sum + Number(payment.amount),
      0
    ) || 0

    return NextResponse.json({
      payments: payments || [],
      total_paid: totalPaid,
      count: payments?.length || 0,
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
