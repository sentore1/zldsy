import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ─── Brand colours ────────────────────────────────────────────────────────────
const BRAND_R = 40
const BRAND_G = 168
const BRAND_B = 172 // #28A8AC

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a public-path image to a base64 data-URL (client-side only) */
async function loadImageAsBase64(publicPath: string): Promise<string | null> {
  try {
    const response = await fetch(publicPath)
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Generate a QR-code data URL for the given text (client-side, lazy import) */
async function makeQRDataUrl(text: string): Promise<string | null> {
  try {
    const QRCode = (await import('qrcode')).default
    return await QRCode.toDataURL(text, { width: 160, margin: 1 })
  } catch {
    return null
  }
}

/**
 * Draw the branded header band at the top of the first page.
 * Returns the Y position immediately after the header.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────┐  ← y=0
 *   │  [logo]          COMPANY NAME          [QR code band]   │
 *   │                  tagline / contact                       │
 *   └──────────────────────────────────────────────────────────┘  ← y=HEADER_H
 *
 * The QR code sits in a white rounded box on the RIGHT side of the header.
 */
async function drawHeader(
  pdf: jsPDF,
  docTitle: string,
  qrUrl: string | null
): Promise<number> {
  const HEADER_H = 42
  const PAGE_W = 210

  // Background band
  pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
  pdf.rect(0, 0, PAGE_W, HEADER_H, 'F')

  // Horizontal accent stripe (slightly darker) at bottom of header
  pdf.setFillColor(24, 138, 142)
  pdf.rect(0, HEADER_H - 3, PAGE_W, 3, 'F')

  // ── Logo (white version) ───────────────────────────────────────────────────
  const logoData = await loadImageAsBase64('/logowhite.png')
  if (logoData) {
    // Keep aspect, max height = 20 mm, max width = 40 mm
    pdf.addImage(logoData, 'PNG', 6, 8, 36, 16, undefined, 'FAST')
  } else {
    // Fallback text logo
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.setTextColor(255, 255, 255)
    pdf.text('Premier', 8, 18)
    pdf.setFontSize(8)
    pdf.text('Service Management', 8, 24)
  }

  // ── Company name + contact (centre) ───────────────────────────────────────
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(255, 255, 255)
  pdf.text('Premier Service Management', PAGE_W / 2, 14, { align: 'center' })

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(220, 245, 246)
  pdf.text('info@premierservice.com  |  +250 788 000 000', PAGE_W / 2, 20, { align: 'center' })
  pdf.text('KG 123 St, Kigali, Rwanda', PAGE_W / 2, 25, { align: 'center' })

  // ── QR code (right side of header) ────────────────────────────────────────
  const qrData = qrUrl ? await makeQRDataUrl(qrUrl) : null

  if (qrData) {
    // Shrink QR so it fits comfortably inside the 42 mm header
    const QR_DISPLAY = 22          // render size (was 26)
    const QR_LABEL_H = 5           // space for "Scan to verify" text
    const BOX_W = QR_DISPLAY + 4
    const BOX_H = QR_DISPLAY + QR_LABEL_H + 2  // tight fit, stays within header
    const qrX = PAGE_W - BOX_W - 4
    const qrY = (HEADER_H - BOX_H) / 2          // vertically centred in header

    // White background pill behind QR
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(qrX, qrY, BOX_W, BOX_H, 2, 2, 'F')

    pdf.addImage(qrData, 'PNG', qrX + 2, qrY + 1, QR_DISPLAY, QR_DISPLAY, undefined, 'FAST')

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(5)
    pdf.setTextColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.text('Scan to verify', qrX + BOX_W / 2, qrY + QR_DISPLAY + 4, { align: 'center' })
  }

  // ── Document type badge (below header, left) ───────────────────────────────
  pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
  pdf.roundedRect(14, HEADER_H + 3, 50, 9, 2, 2, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(255, 255, 255)
  pdf.text(docTitle, 39, HEADER_H + 9, { align: 'center' })

  // Reset text colour
  pdf.setTextColor(0, 0, 0)

  return HEADER_H + 16 // first usable Y position below header
}

/** Draw a thin coloured footer at the bottom of every page */
function drawFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  const PAGE_W = 210
  const PAGE_H = 297

  pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
  pdf.rect(0, PAGE_H - 10, PAGE_W, 10, 'F')

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(255, 255, 255)
  pdf.text('Thank you for your business!', PAGE_W / 2, PAGE_H - 4, { align: 'center' })
  pdf.text(`Page ${pageNumber} of ${totalPages}`, PAGE_W - 8, PAGE_H - 4, { align: 'right' })
}

// ─── Public utilities ─────────────────────────────────────────────────────────

/**
 * Generate PDF from HTML element
 */
export async function generatePDFFromHTML(
  elementId: string,
  filename: string
): Promise<Blob | null> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Element not found:', elementId)
      return null
    }

    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf.output('blob')
  } catch (error) {
    console.error('PDF generation error:', error)
    return null
  }
}

/**
 * Trigger a browser download for a Blob
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Quotation PDF ────────────────────────────────────────────────────────────

export async function generateQuotationPDF(quotation: any): Promise<Blob | null> {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Build QR URL
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const qrUrl = `${origin}/quotations/${quotation.id}`

    // Header
    let yPos = await drawHeader(pdf, 'QUOTATION', qrUrl)

    // ── Quotation meta ─────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(80, 80, 80)

    // Left column – quotation info
    const metaLeft = [
      ['Quotation #:', quotation.quotation_number || '—'],
      ['Date:', new Date(quotation.created_at).toLocaleDateString()],
      ['Valid Until:', new Date(quotation.valid_until).toLocaleDateString()],
    ]
    let metaY = yPos
    for (const [label, value] of metaLeft) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, 20, metaY)
      pdf.setFont('helvetica', 'normal')
      pdf.text(String(value), 55, metaY)
      metaY += 6
    }

    // Status badge (right)
    const statusColours: Record<string, [number, number, number]> = {
      sent: [59, 130, 246],
      accepted: [34, 197, 94],
      rejected: [239, 68, 68],
      expired: [107, 114, 128],
    }
    const [sr, sg, sb] = statusColours[quotation.status] ?? [107, 114, 128]
    pdf.setFillColor(sr, sg, sb)
    pdf.roundedRect(148, yPos - 4, 42, 8, 2, 2, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    pdf.text((quotation.status ?? 'sent').toUpperCase(), 169, yPos + 1.5, { align: 'center' })
    pdf.setTextColor(0, 0, 0)

    yPos = metaY + 4

    // Divider
    pdf.setDrawColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.setLineWidth(0.4)
    pdf.line(20, yPos, 190, yPos)
    yPos += 6

    // ── Bill To ────────────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.text('BILL TO', 20, yPos)
    yPos += 5

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(30, 30, 30)

    if (quotation.booking?.customer) {
      const c = quotation.booking.customer
      if (c.name)    { pdf.setFont('helvetica', 'bold'); pdf.text(c.name, 20, yPos); yPos += 5; pdf.setFont('helvetica', 'normal') }
      if (c.email)   { pdf.text(c.email, 20, yPos); yPos += 5 }
      if (c.phone)   { pdf.text(c.phone, 20, yPos); yPos += 5 }
      if (c.address) { pdf.text(c.address, 20, yPos, { maxWidth: 90 }); yPos += 8 }
    } else {
      pdf.text('N/A', 20, yPos); yPos += 5
    }

    // Service name (right side of bill-to)
    if (quotation.booking?.service?.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text('Service:', 130, yPos - 15)
      pdf.setFont('helvetica', 'normal')
      pdf.text(quotation.booking.service.name, 155, yPos - 15)
    }

    yPos += 4

    // ── Service table ──────────────────────────────────────────────────────
    pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.rect(20, yPos, 170, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('Description', 25, yPos + 5.5)
    pdf.text('Qty', 115, yPos + 5.5, { align: 'center' })
    pdf.text('Unit Price', 152, yPos + 5.5, { align: 'right' })
    pdf.text('Amount', 182, yPos + 5.5, { align: 'right' })
    yPos += 8

    pdf.setTextColor(30, 30, 30)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    // Alternating row bg
    pdf.setFillColor(245, 250, 251)
    pdf.rect(20, yPos, 170, 7, 'F')

    const serviceName = quotation.booking?.service?.name || 'Service'
    pdf.text(serviceName, 25, yPos + 5)
    pdf.text('1', 115, yPos + 5, { align: 'center' })
    pdf.text(`RWF ${(quotation.total_amount ?? 0).toFixed(2)}`, 152, yPos + 5, { align: 'right' })
    pdf.text(`RWF ${(quotation.total_amount ?? 0).toFixed(2)}`, 182, yPos + 5, { align: 'right' })
    yPos += 7

    // Row border
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.2)
    pdf.line(20, yPos, 190, yPos)
    yPos += 6

    // ── Totals ─────────────────────────────────────────────────────────────
    const col1 = 130
    const col2 = 182

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(60, 60, 60)

    pdf.text('Subtotal:', col1, yPos)
    pdf.text(`RWF ${(quotation.total_amount ?? 0).toFixed(2)}`, col2, yPos, { align: 'right' })
    yPos += 6

    const taxRate = quotation.total_amount > 0
      ? ((quotation.tax / quotation.total_amount) * 100).toFixed(0)
      : '0'
    pdf.text(`Tax (${taxRate}%):`, col1, yPos)
    pdf.text(`RWF ${(quotation.tax ?? 0).toFixed(2)}`, col2, yPos, { align: 'right' })
    yPos += 6

    if ((quotation.discount ?? 0) > 0) {
      pdf.setTextColor(34, 197, 94)
      pdf.text('Discount:', col1, yPos)
      pdf.text(`-RWF ${quotation.discount.toFixed(2)}`, col2, yPos, { align: 'right' })
      yPos += 6
    }

    // Total band
    pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.roundedRect(118, yPos - 1, 74, 10, 2, 2, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(255, 255, 255)
    pdf.text('TOTAL:', col1, yPos + 6.5)
    pdf.text(`RWF ${(quotation.final_amount ?? 0).toFixed(2)}`, col2, yPos + 6.5, { align: 'right' })
    yPos += 16

    // ── Terms ──────────────────────────────────────────────────────────────
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('Terms & Conditions:', 20, yPos)
    yPos += 5
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(80, 80, 80)
    const terms = [
      '1. This quotation is valid for the period stated above.',
      '2. Payment is due upon completion of service.',
      '3. Prices are inclusive of applicable taxes.',
      '4. Please quote the quotation number in all correspondence.',
    ]
    for (const line of terms) {
      pdf.text(line, 20, yPos)
      yPos += 5
    }

    // Footer
    drawFooter(pdf, 1, 1)

    return pdf.output('blob')
  } catch (error) {
    console.error('Quotation PDF generation error:', error)
    return null
  }
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(invoice: any): Promise<Blob | null> {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const qrUrl = `${origin}/invoice/${invoice.id}`

    // Header
    let yPos = await drawHeader(pdf, 'INVOICE', qrUrl)

    // ── Invoice meta ───────────────────────────────────────────────────────
    const metaLeft = [
      ['Invoice #:', invoice.invoice_number || '—'],
      ['Date:', new Date(invoice.created_at).toLocaleDateString()],
      ['Due Date:', new Date(invoice.due_date).toLocaleDateString()],
    ]
    let metaY = yPos
    pdf.setFontSize(9)
    for (const [label, value] of metaLeft) {
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(80, 80, 80)
      pdf.text(label, 20, metaY)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(30, 30, 30)
      pdf.text(String(value), 55, metaY)
      metaY += 6
    }

    // Status badge
    const statusColours: Record<string, [number, number, number]> = {
      paid: [34, 197, 94],
      pending: [234, 179, 8],
      overdue: [239, 68, 68],
    }
    const [sr, sg, sb] = statusColours[invoice.status] ?? [107, 114, 128]
    pdf.setFillColor(sr, sg, sb)
    pdf.roundedRect(148, yPos - 4, 42, 8, 2, 2, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    pdf.text((invoice.status ?? 'pending').toUpperCase(), 169, yPos + 1.5, { align: 'center' })
    pdf.setTextColor(0, 0, 0)

    yPos = metaY + 4

    // Divider
    pdf.setDrawColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.setLineWidth(0.4)
    pdf.line(20, yPos, 190, yPos)
    yPos += 6

    // ── Bill To ────────────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.text('BILL TO', 20, yPos)
    yPos += 5

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(30, 30, 30)

    const customer = invoice.job?.booking?.customer
    if (customer) {
      if (customer.name)    { pdf.setFont('helvetica', 'bold'); pdf.text(customer.name, 20, yPos); yPos += 5; pdf.setFont('helvetica', 'normal') }
      if (customer.email)   { pdf.text(customer.email, 20, yPos); yPos += 5 }
      if (customer.phone)   { pdf.text(customer.phone, 20, yPos); yPos += 5 }
      if (customer.address) { pdf.text(customer.address, 20, yPos, { maxWidth: 90 }); yPos += 8 }
    } else {
      pdf.text('N/A', 20, yPos); yPos += 5
    }

    // Job number right side
    if (invoice.job?.job_number) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text('Job #:', 130, yPos - 15)
      pdf.setFont('helvetica', 'normal')
      pdf.text(invoice.job.job_number, 148, yPos - 15)
    }

    yPos += 4

    // ── Services table ─────────────────────────────────────────────────────
    pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.rect(20, yPos, 170, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('Description', 25, yPos + 5.5)
    pdf.text('Amount', 182, yPos + 5.5, { align: 'right' })
    yPos += 8

    pdf.setTextColor(30, 30, 30)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    const rows: [string, number][] = []
    const serviceName = invoice.job?.booking?.service?.name
    if (serviceName) rows.push([serviceName, invoice.total_amount ?? 0])

    rows.forEach(([desc, amount], i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(245, 250, 251)
        pdf.rect(20, yPos, 170, 7, 'F')
      }
      pdf.text(desc, 25, yPos + 5)
      pdf.text(`RWF ${amount.toFixed(2)}`, 182, yPos + 5, { align: 'right' })
      yPos += 7
    })

    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.2)
    pdf.line(20, yPos, 190, yPos)
    yPos += 6

    // ── Totals ─────────────────────────────────────────────────────────────
    const col1 = 130
    const col2 = 182

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(60, 60, 60)

    pdf.text('Subtotal:', col1, yPos)
    pdf.text(`RWF ${(invoice.total_amount ?? 0).toFixed(2)}`, col2, yPos, { align: 'right' })
    yPos += 6

    pdf.text('Tax:', col1, yPos)
    pdf.text(`RWF ${(invoice.tax ?? 0).toFixed(2)}`, col2, yPos, { align: 'right' })
    yPos += 6

    if ((invoice.discount ?? 0) > 0) {
      pdf.setTextColor(34, 197, 94)
      pdf.text('Discount:', col1, yPos)
      pdf.text(`-RWF ${invoice.discount.toFixed(2)}`, col2, yPos, { align: 'right' })
      yPos += 6
    }

    pdf.setFillColor(BRAND_R, BRAND_G, BRAND_B)
    pdf.roundedRect(118, yPos - 1, 74, 10, 2, 2, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(255, 255, 255)
    pdf.text('TOTAL DUE:', col1, yPos + 6.5)
    pdf.text(`RWF ${(invoice.final_amount ?? 0).toFixed(2)}`, col2, yPos + 6.5, { align: 'right' })
    yPos += 16

    // ── Payment instructions ───────────────────────────────────────────────
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('Payment Instructions:', 20, yPos)
    yPos += 5
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(80, 80, 80)
    pdf.text('Bank: Premier Bank  |  Account: 1234567890  |  Branch: Kigali', 20, yPos)
    yPos += 5
    pdf.text('Mobile Money: +250 788 000 000', 20, yPos)
    yPos += 5
    pdf.text('Or scan the QR code in the header for online payment.', 20, yPos)

    // Footer
    drawFooter(pdf, 1, 1)

    return pdf.output('blob')
  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return null
  }
}
