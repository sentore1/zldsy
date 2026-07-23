import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate PDF from HTML element
 * @param elementId - ID of HTML element to convert
 * @param filename - Name of PDF file
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

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add new pages if content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Return as blob
    return pdf.output('blob')
  } catch (error) {
    console.error('PDF generation error:', error)
    return null
  }
}

/**
 * Download PDF
 * @param blob - PDF blob
 * @param filename - Name of file
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

/**
 * Generate Quotation PDF
 */
export async function generateQuotationPDF(quotation: any): Promise<Blob | null> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Set font
    pdf.setFont('helvetica')

    // Header
    pdf.setFontSize(20)
    pdf.setTextColor(9, 172, 173) // #09ACAD
    pdf.text('QUOTATION', 105, 20, { align: 'center' })

    // Company Info (get from settings)
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Premier Service Management', 105, 30, { align: 'center' })
    pdf.text('info@premierservice.com | +1-555-0100', 105, 35, { align: 'center' })

    // Quotation Details
    pdf.setFontSize(12)
    pdf.text(`Quotation #: ${quotation.quotation_number}`, 20, 50)
    pdf.text(`Date: ${new Date(quotation.created_at).toLocaleDateString()}`, 20, 57)
    pdf.text(`Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`, 20, 64)

    // Customer Details
    pdf.text('BILL TO:', 20, 75)
    pdf.setFontSize(10)
    if (quotation.booking?.customer) {
      const customer = quotation.booking.customer
      pdf.text(customer.name || 'N/A', 20, 82)
      pdf.text(customer.email || '', 20, 87)
      pdf.text(customer.phone || '', 20, 92)
      pdf.text(customer.address || '', 20, 97, { maxWidth: 80 })
    }

    // Service Details
    pdf.setFontSize(12)
    pdf.text('SERVICE DETAILS:', 20, 115)
    
    // Table header
    pdf.setFillColor(9, 172, 173)
    pdf.rect(20, 120, 170, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text('Description', 25, 125)
    pdf.text('Amount', 170, 125, { align: 'right' })

    // Service item
    pdf.setTextColor(0, 0, 0)
    pdf.text(quotation.booking?.service?.name || 'Service', 25, 135)
    pdf.text(`RWF ${quotation.total_amount?.toFixed(2)}`, 185, 135, { align: 'right' })

    // Totals
    let yPos = 150
    pdf.line(20, yPos, 190, yPos)
    yPos += 7
    
    pdf.text('Subtotal:', 130, yPos)
    pdf.text(`RWF ${quotation.total_amount?.toFixed(2)}`, 185, yPos, { align: 'right' })
    yPos += 7
    
    pdf.text(`Tax (${(quotation.tax / quotation.total_amount * 100).toFixed(0)}%):`, 130, yPos)
    pdf.text(`RWF ${quotation.tax?.toFixed(2)}`, 185, yPos, { align: 'right' })
    yPos += 7
    
    if (quotation.discount > 0) {
      pdf.text('Discount:', 130, yPos)
      pdf.text(`-RWF ${quotation.discount?.toFixed(2)}`, 185, yPos, { align: 'right' })
      yPos += 7
    }
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TOTAL:', 130, yPos)
    pdf.text(`RWF ${quotation.final_amount?.toFixed(2)}`, 185, yPos, { align: 'right' })

    // Terms & Conditions
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    yPos += 15
    pdf.text('Terms & Conditions:', 20, yPos)
    yPos += 5
    pdf.setFontSize(9)
    pdf.text('1. This quotation is valid for 7 days from the date of issue.', 20, yPos)
    yPos += 5
    pdf.text('2. Payment is due upon completion of service.', 20, yPos)
    yPos += 5
    pdf.text('3. Prices are inclusive of applicable taxes.', 20, yPos)

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text('Thank you for your business!', 105, 280, { align: 'center' })

    return pdf.output('blob')
  } catch (error) {
    console.error('Quotation PDF generation error:', error)
    return null
  }
}

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(invoice: any): Promise<Blob | null> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Set font
    pdf.setFont('helvetica')

    // Header
    pdf.setFontSize(20)
    pdf.setTextColor(9, 172, 173) // #09ACAD
    pdf.text('INVOICE', 105, 20, { align: 'center' })

    // Company Info
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Premier Service Management', 105, 30, { align: 'center' })
    pdf.text('info@premierservice.com | +1-555-0100', 105, 35, { align: 'center' })

    // Invoice Details
    pdf.setFontSize(12)
    pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, 50)
    pdf.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 57)
    pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 64)
    
    // Status badge
    const statusColors: Record<string, number[]> = {
      paid: [34, 197, 94],
      pending: [234, 179, 8],
      overdue: [239, 68, 68],
    }
    const color = statusColors[invoice.status] || [128, 128, 128]
    pdf.setFillColor(color[0], color[1], color[2])
    pdf.roundedRect(150, 48, 35, 8, 2, 2, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(invoice.status.toUpperCase(), 167.5, 53, { align: 'center' })

    // Customer Details
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.text('BILL TO:', 20, 75)
    pdf.setFontSize(10)
    if (invoice.job?.booking?.customer) {
      const customer = invoice.job.booking.customer
      pdf.text(customer.name || 'N/A', 20, 82)
      pdf.text(customer.email || '', 20, 87)
      pdf.text(customer.phone || '', 20, 92)
      pdf.text(customer.address || '', 20, 97, { maxWidth: 80 })
    }

    // Service Details
    pdf.setFontSize(12)
    pdf.text('SERVICES & CHARGES:', 20, 115)
    
    // Table header
    pdf.setFillColor(9, 172, 173)
    pdf.rect(20, 120, 170, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text('Description', 25, 125)
    pdf.text('Amount', 170, 125, { align: 'right' })

    // Items
    let yPos = 135
    pdf.setTextColor(0, 0, 0)
    
    // Service charge
    if (invoice.job?.booking?.service) {
      pdf.text(invoice.job.booking.service.name, 25, yPos)
      pdf.text(`RWF ${invoice.total_amount?.toFixed(2)}`, 185, yPos, { align: 'right' })
      yPos += 7
    }

    // Totals
    yPos += 10
    pdf.line(20, yPos, 190, yPos)
    yPos += 7
    
    pdf.text('Subtotal:', 130, yPos)
    pdf.text(`RWF ${invoice.total_amount?.toFixed(2)}`, 185, yPos, { align: 'right' })
    yPos += 7
    
    pdf.text(`Tax:`, 130, yPos)
    pdf.text(`RWF ${invoice.tax?.toFixed(2)}`, 185, yPos, { align: 'right' })
    yPos += 7
    
    if (invoice.discount > 0) {
      pdf.text('Discount:', 130, yPos)
      pdf.text(`-RWF ${invoice.discount?.toFixed(2)}`, 185, yPos, { align: 'right' })
      yPos += 7
    }
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TOTAL DUE:', 130, yPos)
    pdf.text(`RWF ${invoice.final_amount?.toFixed(2)}`, 185, yPos, { align: 'right' })

    // Payment Instructions
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    yPos += 15
    pdf.text('Payment Instructions:', 20, yPos)
    yPos += 5
    pdf.setFontSize(9)
    pdf.text('Bank: Premier Bank | Account: 1234567890', 20, yPos)
    yPos += 5
    pdf.text('Mobile Money: +1-555-0100', 20, yPos)
    yPos += 5
    pdf.text('Or scan QR code for online payment', 20, yPos)

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text('Thank you for your business!', 105, 280, { align: 'center' })
    pdf.text('Payment terms: Net 30 days', 105, 285, { align: 'center' })

    return pdf.output('blob')
  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return null
  }
}
