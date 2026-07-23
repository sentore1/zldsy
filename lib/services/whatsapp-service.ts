/**
 * WhatsApp Service
 * 
 * This is a template for WhatsApp messaging functionality.
 * Popular WhatsApp APIs:
 * 
 * 1. Twilio WhatsApp API (Recommended for global)
 *    - Install: npm install twilio
 *    - Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER to .env.local
 * 
 * 2. Meta WhatsApp Business API (Official)
 *    - Requires business verification
 *    - Add WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_ACCESS_TOKEN to .env.local
 * 
 * 3. WATI / AiSensy (For specific regions like Africa/India)
 */

// Example Twilio implementation (uncomment after installing twilio)
// import twilio from 'twilio'
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

interface WhatsAppMessage {
  to: string // Phone number in international format (e.g., +250788123456)
  message: string
  mediaUrl?: string // Optional image/document URL
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(options: WhatsAppMessage): Promise<boolean> {
  try {
    console.log('📱 WhatsApp message would be sent to:', options.to)
    console.log('   Message:', options.message.substring(0, 50) + '...')
    
    // Validate phone number format
    if (!options.to.startsWith('+')) {
      console.error('Phone number must be in international format (+XXX...)')
      return false
    }

    // TODO: Implement actual WhatsApp sending
    // Choose one of the methods below:

    // Method 1: Twilio WhatsApp
    /*
    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${options.to}`,
      body: options.message,
      mediaUrl: options.mediaUrl ? [options.mediaUrl] : undefined,
    })
    console.log('✅ WhatsApp sent:', message.sid)
    */

    // Method 2: Meta WhatsApp Business API
    /*
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: options.to,
          type: 'text',
          text: { body: options.message },
        }),
      }
    )
    const data = await response.json()
    console.log('✅ WhatsApp sent:', data)
    */

    console.log('✅ WhatsApp sent successfully (simulated)')
    return true
  } catch (error) {
    console.error('❌ WhatsApp sending failed:', error)
    return false
  }
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(booking: any): Promise<boolean> {
  const message = `
🎉 *Booking Confirmed!*

Dear ${booking.customer?.name || 'Customer'},

Thank you for booking with Premier Service Management.

📋 *Booking Details:*
Service: ${booking.service?.name || 'N/A'}
Date: ${booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'To be scheduled'}
Status: ${booking.status}

We will send you a quotation shortly.

Track your booking: ${process.env.NEXT_PUBLIC_APP_URL}/customer/track?booking=${booking.id}

For assistance, call: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: booking.customer?.phone || '',
    message,
  })
}

/**
 * Send quotation via WhatsApp
 */
export async function sendQuotationWhatsApp(quotation: any): Promise<boolean> {
  const message = `
💰 *Your Quotation is Ready!*

Dear ${quotation.booking?.customer?.name || 'Customer'},

Quotation #${quotation.quotation_number}

📋 *Service:* ${quotation.booking?.service?.name || 'N/A'}
💵 *Amount:* RWF ${quotation.final_amount?.toFixed(2)}
📅 *Valid Until:* ${new Date(quotation.valid_until).toLocaleDateString()}

View & Accept: ${process.env.NEXT_PUBLIC_APP_URL}/quotations/${quotation.id}

This quotation is valid for 7 days.

Questions? Call: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: quotation.booking?.customer?.phone || '',
    message,
  })
}

/**
 * Send job confirmation via WhatsApp
 */
export async function sendJobConfirmationWhatsApp(job: any): Promise<boolean> {
  const message = `
✅ *Job Scheduled!*

Dear ${job.booking?.customer?.name || 'Customer'},

Your service has been scheduled!

🔧 *Job #${job.job_number}*
Service: ${job.booking?.service?.name || 'N/A'}
Date: ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'To be confirmed'}
Status: ${job.status}

We'll notify you when our team is on the way.

Track progress: ${process.env.NEXT_PUBLIC_APP_URL}/customer/track

Contact us: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: job.booking?.customer?.phone || '',
    message,
  })
}

/**
 * Send invoice via WhatsApp
 */
export async function sendInvoiceWhatsApp(invoice: any): Promise<boolean> {
  const message = `
🧾 *Invoice Ready*

Dear ${invoice.job?.booking?.customer?.name || 'Customer'},

Your service is complete!

Invoice #${invoice.invoice_number}
💵 *Amount:* RWF ${invoice.final_amount?.toFixed(2)}
📅 *Due Date:* ${new Date(invoice.due_date).toLocaleDateString()}

Pay Now: ${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}/pay

Payment methods:
✓ Credit/Debit Card
✓ Bank Transfer
✓ Mobile Money

Questions? Call: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: invoice.job?.booking?.customer?.phone || '',
    message,
  })
}

/**
 * Send payment receipt via WhatsApp
 */
export async function sendPaymentReceiptWhatsApp(payment: any, invoice: any): Promise<boolean> {
  const message = `
✅ *Payment Received*

Dear ${invoice.job?.booking?.customer?.name || 'Customer'},

Thank you for your payment!

💰 *Amount:* RWF ${payment.amount?.toFixed(2)}
🧾 *Invoice:* ${invoice.invoice_number}
📅 *Date:* ${new Date(payment.payment_date).toLocaleString()}
🏦 *Method:* ${payment.payment_method}
📝 *Reference:* ${payment.transaction_reference}

Your receipt is available at:
${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}

Thank you for your business! 🙏

Contact: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: invoice.job?.booking?.customer?.phone || '',
    message,
  })
}

/**
 * Send service reminder (1 day before)
 */
export async function sendServiceReminderWhatsApp(job: any): Promise<boolean> {
  const message = `
⏰ *Service Reminder*

Dear ${job.booking?.customer?.name || 'Customer'},

This is a reminder that your service is scheduled for tomorrow!

🔧 *Job #${job.job_number}*
Service: ${job.booking?.service?.name || 'N/A'}
Date: ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Tomorrow'}
Time: ${job.scheduled_date ? new Date(job.scheduled_date).toLocaleTimeString() : 'TBD'}

Our team will arrive at the scheduled time.

Please ensure:
✓ Someone is available at the location
✓ The area is accessible
✓ Pets are secured (if applicable)

Need to reschedule? Call: +1-555-0100
  `.trim()

  return await sendWhatsAppMessage({
    to: job.booking?.customer?.phone || '',
    message,
  })
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminderWhatsApp(invoice: any): Promise<boolean> {
  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  const message = `
💰 *Payment Reminder*

Dear ${invoice.job?.booking?.customer?.name || 'Customer'},

${daysOverdue > 0 
  ? `Your payment is ${daysOverdue} day(s) overdue.` 
  : 'Your payment is due soon.'}

🧾 *Invoice #${invoice.invoice_number}*
Amount: RWF ${invoice.final_amount?.toFixed(2)}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

Pay Now: ${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}/pay

For assistance, contact us:
📞 +1-555-0100
📧 info@premierservice.com
  `.trim()

  return await sendWhatsAppMessage({
    to: invoice.job?.booking?.customer?.phone || '',
    message,
  })
}
