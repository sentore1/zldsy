import QRCode from 'qrcode'

/**
 * Generate QR code as data URL
 * @param text - Text/URL to encode in QR code
 * @param options - QR code options
 * @returns Data URL string of QR code image
 */
export async function generateQRCode(
  text: string,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<string | null> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error('QR Code generation error:', error)
    return null
  }
}

/**
 * Generate QR code as buffer (for PDF generation)
 * @param text - Text/URL to encode in QR code
 * @param options - QR code options
 * @returns Buffer of QR code image
 */
export async function generateQRCodeBuffer(
  text: string,
  options?: {
    width?: number
    margin?: number
  }
): Promise<Buffer | null> {
  try {
    const buffer = await QRCode.toBuffer(text, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      errorCorrectionLevel: 'M',
    })

    return buffer
  } catch (error) {
    console.error('QR Code buffer generation error:', error)
    return null
  }
}
