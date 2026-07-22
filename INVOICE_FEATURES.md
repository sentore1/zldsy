# Invoice Features Guide

## Overview
The invoice system includes PDF generation, QR codes, and public shareable links for seamless customer interaction.

## Features

### 1. **PDF Invoice Generation**
- Click "Download PDF" button on any invoice
- Professional PDF format with company branding
- Includes all invoice details, customer info, and line items
- QR code embedded for easy mobile access
- File name: `[Invoice Number].pdf` (e.g., `INV-1234567890.pdf`)

### 2. **QR Code Integration**
- Each invoice has a unique QR code
- QR code links to the public invoice view page
- Customers can scan with their phone to:
  - View invoice details
  - Download PDF copy
  - Share the invoice link

### 3. **Public Invoice View (No Login Required)**
- URL format: `https://yourdomain.com/invoice/[invoice-id]`
- Accessible without authentication
- Features:
  - Clean, professional invoice layout
  - All invoice details visible
  - Payment status indicator
  - QR code for sharing
  - Download PDF button
  - Copy link button

### 4. **Share Invoice Link**
- Click the "Share" button (📤 icon) on any invoice
- Automatically copies the public URL to clipboard
- Share via:
  - Email
  - SMS/WhatsApp
  - Any messaging platform

## How to Use

### Creating an Invoice
1. Go to **Invoices** page
2. Click **Create Invoice**
3. Select a job from the dropdown
4. Enter amounts (total, tax, discount)
5. Set due date
6. Click **Create Invoice**

### Downloading Invoice PDF
1. Find the invoice in the list
2. Click the **Download** button (⬇️ icon)
3. PDF will download automatically with QR code embedded

### Sharing with Customers
1. Find the invoice in the list
2. Click the **Share** button (📤 icon)
3. Link is copied to clipboard
4. Send the link to customer via:
   - **Email**: Paste link in email body
   - **SMS**: Text the link
   - **WhatsApp**: Share in chat

### Customer Experience
When customer receives the link:
1. Click the link (no login needed)
2. View complete invoice details
3. Options available:
   - Download PDF copy
   - Scan QR code to share
   - Copy link to save/forward

## Technical Details

### PDF Generation
- Library: `jspdf`
- Format: A4, Portrait
- Contents:
  - Company header
  - Invoice number & dates
  - Customer billing information
  - Service details & job number
  - Itemized charges (service, tax, discount)
  - Total amount
  - Payment status
  - QR code (bottom right)
  - Footer message

### QR Code
- Library: `qrcode`
- Contains: Full URL to public invoice page
- Size: 200x200 pixels
- Margin: 2px
- Color: Black on white

### Public Invoice Route
- Path: `/invoice/[id]`
- No authentication required
- Responsive design (mobile-friendly)
- Includes:
  - Invoice header with status badge
  - Company & customer information
  - Invoice details (dates, job number)
  - Service breakdown with pricing
  - QR code for sharing
  - Download & share buttons

## Security Considerations

1. **Public Access**: Invoice pages are publicly accessible via URL
   - Anyone with the link can view the invoice
   - No sensitive data should be included beyond what's on the invoice
   - Invoice IDs are UUIDs (hard to guess)

2. **Data Exposed**:
   - ✅ Invoice number, amounts, dates
   - ✅ Customer name, address, contact info
   - ✅ Service details
   - ❌ No internal notes
   - ❌ No payment method details
   - ❌ No staff assignments

3. **Best Practices**:
   - Only share links with intended recipients
   - Use email/SMS instead of public posting
   - Monitor invoice access if needed
   - Update invoice status promptly when paid

## Customization

### Company Information
Update in: `/app/invoice/[id]/page.tsx` and `/app/admin/invoices/page.tsx`

```typescript
// Current default:
doc.text("Premier Service Management", 20, 35);
doc.text("100 Business Park Drive, Suite 200", 20, 40);
doc.text("New York, NY 10001", 20, 45);
doc.text("Phone: +1-555-0100", 20, 50);
```

### PDF Styling
Modify in the `handleDownloadInvoice` function:
- Colors: `doc.setTextColor()`, `doc.setFillColor()`
- Fonts: `doc.setFont()`, `doc.setFontSize()`
- Layout: Adjust x, y coordinates
- Logo: Add with `doc.addImage()`

### QR Code Settings
```typescript
await QRCode.toDataURL(invoiceUrl, {
  width: 200,      // Size in pixels
  margin: 2,       // White border
  color: {
    dark: "#000000",   // QR code color
    light: "#FFFFFF",  // Background color
  },
});
```

## Future Enhancements

Potential additions:
- [ ] Email invoice directly from admin panel
- [ ] Payment gateway integration on public page
- [ ] Invoice templates (multiple designs)
- [ ] Bulk invoice generation
- [ ] Invoice reminders (automated emails)
- [ ] Customer portal (view all their invoices)
- [ ] Print-optimized view
- [ ] Invoice comments/notes (internal only)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify invoice exists in database
3. Ensure QR code libraries are installed
4. Test in different browsers
5. Check network requests in DevTools

## Dependencies

```json
{
  "jspdf": "^2.x.x",
  "qrcode": "^1.x.x"
}
```

Install with:
```bash
npm install jspdf qrcode
```
