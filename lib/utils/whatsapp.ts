/**
 * WhatsApp Share Utilities
 * Functions for sharing invoices and quotations via WhatsApp
 */

export interface WhatsAppShareOptions {
  phoneNumber?: string;
  message: string;
}

/**
 * Opens WhatsApp with a pre-filled message
 * Works on both mobile and desktop (WhatsApp Web)
 */
export function shareViaWhatsApp({ phoneNumber, message }: WhatsAppShareOptions): void {
  // Format phone number (remove spaces, dashes, etc.)
  const formattedPhone = phoneNumber
    ? phoneNumber.replace(/\D/g, '')
    : '';

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // Construct WhatsApp URL
  // If phone number is provided, use direct chat, otherwise open WhatsApp with message
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  // Open in new window
  window.open(whatsappUrl, '_blank');
}

/**
 * Generate WhatsApp message for Invoice
 */
export function generateInvoiceWhatsAppMessage(invoice: {
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  invoice_link: string;
}): string {
  return `*Invoice from ZLD Hub* 🧾

Hello ${invoice.customer_name},

Your invoice is ready!

📄 *Invoice Number:* ${invoice.invoice_number}
💰 *Amount:* RWF ${invoice.total_amount.toLocaleString()}

View your invoice here:
${invoice.invoice_link}

Please make payment at your earliest convenience.

Thank you for choosing ZLD Hub! 🙏

_For support, contact us at: +250 790 002 669_`;
}

/**
 * Generate WhatsApp message for Quotation
 */
export function generateQuotationWhatsAppMessage(quotation: {
  quotation_number: string;
  customer_name: string;
  total_amount: number;
  quotation_link: string;
  valid_until?: string;
}): string {
  const validityText = quotation.valid_until
    ? `\n⏰ *Valid Until:* ${new Date(quotation.valid_until).toLocaleDateString()}`
    : '';

  return `*Quotation from ZLD Hub* 📋

Hello ${quotation.customer_name},

Your service quotation is ready!

📄 *Quotation Number:* ${quotation.quotation_number}
💰 *Estimated Cost:* RWF ${quotation.total_amount.toLocaleString()}${validityText}

View your quotation here:
${quotation.quotation_link}

Please review and accept to proceed with booking.

Thank you for choosing ZLD Hub! 🙏

_Questions? Contact us at: +250 790 002 669_`;
}

/**
 * Generate WhatsApp message for Job Completion
 */
export function generateJobCompletionWhatsAppMessage(job: {
  job_number: string;
  customer_name: string;
  service_name: string;
  feedback_link?: string;
}): string {
  const feedbackText = job.feedback_link
    ? `\n\n📝 We'd love to hear your feedback:\n${job.feedback_link}`
    : '';

  return `*Service Completed - ZLD Hub* ✅

Hello ${job.customer_name},

Your service has been completed!

🔧 *Service:* ${job.service_name}
📋 *Job Number:* ${job.job_number}${feedbackText}

Thank you for choosing ZLD Hub! We hope you're satisfied with our service.

_Need assistance? Contact us at: +250 790 002 669_`;
}

/**
 * Copy text to clipboard (fallback for older browsers)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share invoice via WhatsApp
 */
export function shareInvoiceViaWhatsApp(invoice: {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
}): void {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const invoiceLink = `${baseUrl}/invoice/${invoice.id}`;

  const message = generateInvoiceWhatsAppMessage({
    ...invoice,
    invoice_link: invoiceLink,
  });

  shareViaWhatsApp({
    phoneNumber: invoice.customer_phone,
    message,
  });
}

/**
 * Share quotation via WhatsApp
 */
export function shareQuotationViaWhatsApp(quotation: {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  valid_until?: string;
}): void {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const quotationLink = `${baseUrl}/customer/quotations/${quotation.id}`;

  const message = generateQuotationWhatsAppMessage({
    ...quotation,
    quotation_link: quotationLink,
  });

  shareViaWhatsApp({
    phoneNumber: quotation.customer_phone,
    message,
  });
}
