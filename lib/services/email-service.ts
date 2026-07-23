/**
 * Email Service
 * 
 * This is a template for email functionality.
 * Choose one of these email providers and implement:
 * 
 * 1. SendGrid (Recommended)
 *    - Install: npm install @sendgrid/mail
 *    - Add SENDGRID_API_KEY to .env.local
 * 
 * 2. Nodemailer (SMTP)
 *    - Install: npm install nodemailer
 *    - Add SMTP credentials to .env.local
 * 
 * 3. Resend (Modern alternative)
 *    - Install: npm install resend
 *    - Add RESEND_API_KEY to .env.local
 */

// Example SendGrid implementation (uncomment after installing @sendgrid/mail)
// import sgMail from '@sendgrid/mail'
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Nodemailer implementation (Gmail SMTP)
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email to:', options.to)
    console.log('   Subject:', options.subject)
    
    // Method 2: Nodemailer (Gmail SMTP)
    await transporter.sendMail({
      from: options.from || process.env.COMPANY_EMAIL || 'noreply@company.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })

    console.log('✅ Email sent successfully')
    return true
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return false
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(booking: any): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #09ACAD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { background-color: #09ACAD; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${booking.customer?.name || 'Customer'},</p>
            <p>Thank you for booking with us. Your service request has been received.</p>
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Service:</strong> ${booking.service?.name || 'N/A'}</li>
              <li><strong>Preferred Date:</strong> ${booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'To be scheduled'}</li>
              <li><strong>Status:</strong> ${booking.status}</li>
            </ul>
            <p>We will send you a quotation shortly.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/track?booking=${booking.id}" class="button">Track Your Booking</a>
          </div>
          <div class="footer">
            <p>Premier Service Management</p>
            <p>info@premierservice.com | +1-555-0100</p>
          </div>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: booking.customer?.email || '',
    subject: 'Booking Confirmation - Premier Service Management',
    html,
  })
}

/**
 * Send quotation email
 */
export async function sendQuotationEmail(quotation: any): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #09ACAD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .price { font-size: 32px; color: #09ACAD; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { background-color: #09ACAD; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Quotation is Ready!</h1>
          </div>
          <div class="content">
            <p>Dear ${quotation.booking?.customer?.name || 'Customer'},</p>
            <p>Thank you for your interest. Here's your quotation:</p>
            <h3>Quotation #${quotation.quotation_number}</h3>
            <p><strong>Service:</strong> ${quotation.booking?.service?.name || 'N/A'}</p>
            <div class="price">RWF ${quotation.final_amount?.toFixed(2)}</div>
            <p><strong>Valid Until:</strong> ${new Date(quotation.valid_until).toLocaleDateString()}</p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/quotations/${quotation.id}" class="button">View & Accept Quotation</a>
            </p>
            <p style="font-size: 12px; color: #666;">This quotation is valid for 7 days from the date of issue.</p>
          </div>
          <div class="footer">
            <p>Premier Service Management</p>
            <p>info@premierservice.com | +1-555-0100</p>
          </div>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: quotation.booking?.customer?.email || '',
    subject: `Quotation #${quotation.quotation_number} - Premier Service Management`,
    html,
  })
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(invoice: any): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #09ACAD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .amount { font-size: 32px; color: #09ACAD; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { background-color: #09ACAD; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice Ready</h1>
          </div>
          <div class="content">
            <p>Dear ${invoice.job?.booking?.customer?.name || 'Customer'},</p>
            <p>Your service has been completed. Here's your invoice:</p>
            <h3>Invoice #${invoice.invoice_number}</h3>
            <div class="amount">RWF ${invoice.final_amount?.toFixed(2)}</div>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}/pay" class="button">Pay Now</a>
            </p>
            <p>Payment can be made via:</p>
            <ul>
              <li>Credit/Debit Card (online)</li>
              <li>Bank Transfer</li>
              <li>Mobile Money</li>
            </ul>
          </div>
          <div class="footer">
            <p>Premier Service Management</p>
            <p>info@premierservice.com | +1-555-0100</p>
          </div>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: invoice.job?.booking?.customer?.email || '',
    subject: `Invoice #${invoice.invoice_number} - Premier Service Management`,
    html,
  })
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(payment: any, invoice: any): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #09ACAD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .success { color: #22C55E; font-size: 24px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received</h1>
          </div>
          <div class="content">
            <div class="success">✓ Payment Successful</div>
            <p>Dear ${invoice.job?.booking?.customer?.name || 'Customer'},</p>
            <p>Thank you for your payment!</p>
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Amount:</strong> RWF ${payment.amount?.toFixed(2)}</li>
              <li><strong>Invoice:</strong> ${invoice.invoice_number}</li>
              <li><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleString()}</li>
              <li><strong>Method:</strong> ${payment.payment_method}</li>
              <li><strong>Reference:</strong> ${payment.transaction_reference}</li>
            </ul>
            <p>A copy of your receipt has been attached.</p>
          </div>
          <div class="footer">
            <p>Premier Service Management</p>
            <p>info@premierservice.com | +1-555-0100</p>
          </div>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: invoice.job?.booking?.customer?.email || '',
    subject: `Payment Receipt - Invoice #${invoice.invoice_number}`,
    html,
  })
}
