import 'dart:io';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../models/index.dart';

// ── Brand colours ─────────────────────────────────────────────────────────────
const _brand = PdfColor.fromInt(0xFF28A8AC);
const _brandDark = PdfColor.fromInt(0xFF1E8C90);
const _white = PdfColors.white;

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Load a Flutter asset as raw bytes for use in the pdf package.
Future<Uint8List?> _loadAsset(String path) async {
  try {
    final data = await rootBundle.load(path);
    return data.buffer.asUint8List();
  } catch (_) {
    return null;
  }
}

/// Build the branded header widget for every PDF.
///
/// [title]  – e.g. "QUOTATION" or "INVOICE"
/// [qrData] – URL string to encode in the QR; pass null to skip QR
Future<pw.Widget> _buildHeader(
  String title, {
  String? qrData,
  pw.Font? boldFont,
  pw.Font? regularFont,
}) async {
  final logoBytes = await _loadAsset('assets/images/logowhite.png');
  final logoImg = logoBytes != null ? pw.MemoryImage(logoBytes) : null;

  return pw.Column(
    crossAxisAlignment: pw.CrossAxisAlignment.stretch,
    children: [
      // ── Main header band ──────────────────────────────────────────────────
      pw.Container(
        color: _brand,
        padding: const pw.EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        child: pw.Row(
          crossAxisAlignment: pw.CrossAxisAlignment.center,
          children: [
            // Logo
            if (logoImg != null)
              pw.Image(logoImg, width: 55, height: 24)
            else
              pw.Text(
                'Premier',
                style: pw.TextStyle(
                  font: boldFont,
                  fontSize: 14,
                  color: _white,
                ),
              ),
            pw.Expanded(
              child: pw.Column(
                children: [
                  pw.Text(
                    'Premier Service Management',
                    textAlign: pw.TextAlign.center,
                    style: pw.TextStyle(
                      font: boldFont,
                      fontSize: 13,
                      color: _white,
                    ),
                  ),
                  pw.SizedBox(height: 3),
                  pw.Text(
                    'info@premierservice.com  |  +250 788 000 000',
                    textAlign: pw.TextAlign.center,
                    style: pw.TextStyle(
                      font: regularFont,
                      fontSize: 7.5,
                      color: const PdfColor(0.85, 0.97, 0.97),
                    ),
                  ),
                  pw.Text(
                    'KG 123 St, Kigali, Rwanda',
                    textAlign: pw.TextAlign.center,
                    style: pw.TextStyle(
                      font: regularFont,
                      fontSize: 7.5,
                      color: const PdfColor(0.85, 0.97, 0.97),
                    ),
                  ),
                ],
              ),
            ),
            // QR Code
            if (qrData != null)
              pw.Container(
                width: 68,
                padding: const pw.EdgeInsets.all(4),
                decoration: pw.BoxDecoration(
                  color: _white,
                  borderRadius: pw.BorderRadius.circular(4),
                ),
                child: pw.Column(
                  children: [
                    pw.BarcodeWidget(
                      barcode: pw.Barcode.qrCode(),
                      data: qrData,
                      width: 58,
                      height: 58,
                    ),
                    pw.SizedBox(height: 2),
                    pw.Text(
                      'Scan to verify',
                      textAlign: pw.TextAlign.center,
                      style: pw.TextStyle(
                        font: regularFont,
                        fontSize: 5.5,
                        color: _brand,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
      // ── Accent stripe ─────────────────────────────────────────────────────
      pw.Container(height: 3, color: _brandDark),
      // ── Document type badge ───────────────────────────────────────────────
      pw.Padding(
        padding: const pw.EdgeInsets.only(top: 8, left: 14),
        child: pw.Container(
          padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: pw.BoxDecoration(
            color: _brand,
            borderRadius: pw.BorderRadius.circular(4),
          ),
          child: pw.Text(
            title,
            style: pw.TextStyle(font: boldFont, fontSize: 11, color: _white),
          ),
        ),
      ),
    ],
  );
}

/// Thin branded footer with page number.
pw.Widget _buildFooter(pw.Context context) {
  return pw.Container(
    color: _brand,
    padding: const pw.EdgeInsets.symmetric(horizontal: 18, vertical: 5),
    child: pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
      children: [
        pw.Text(
          'Thank you for your business!',
          style: pw.TextStyle(
            fontSize: 8,
            color: _white,
            fontStyle: pw.FontStyle.italic,
          ),
        ),
        pw.Text(
          'Page ${context.pageNumber} of ${context.pagesCount}',
          style: const pw.TextStyle(fontSize: 8, color: _white),
        ),
      ],
    ),
  );
}

/// Write bytes to a temp file and share/save via share_plus.
Future<void> _savePdf(Uint8List bytes, String filename) async {
  final dir = await getTemporaryDirectory();
  final file = File('${dir.path}/$filename');
  await file.writeAsBytes(bytes);
  await Share.shareXFiles(
    [XFile(file.path, mimeType: 'application/pdf')],
    subject: filename.replaceAll('.pdf', ''),
  );
}

// ── Public: Quotation PDF ─────────────────────────────────────────────────────

Future<void> downloadQuotationPdf(
  Quotation quotation, {
  String appUrl = 'https://premierservice.rw',
}) async {
  final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
  final dateFmt = DateFormat('d MMM yyyy');
  final qrUrl = '$appUrl/quotations/${quotation.id}';

  // Load fonts
  final bold = pw.Font.helveticaBold();
  final regular = pw.Font.helvetica();

  final doc = pw.Document();

  final header = await _buildHeader('QUOTATION',
      qrData: qrUrl, boldFont: bold, regularFont: regular);

  // Status colour
  PdfColor statusBg;
  switch (quotation.status) {
    case 'accepted':
      statusBg = const PdfColor(0.13, 0.77, 0.37);
      break;
    case 'rejected':
      statusBg = const PdfColor(0.94, 0.27, 0.27);
      break;
    case 'expired':
      statusBg = const PdfColor(0.42, 0.45, 0.50);
      break;
    default:
      statusBg = const PdfColor(0.23, 0.51, 0.96); // sent = blue
  }

  doc.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.zero,
      build: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          header,
          // ── Body ───────────────────────────────────────────────────────
          pw.Expanded(
            child: pw.Padding(
              padding: const pw.EdgeInsets.fromLTRB(18, 12, 18, 0),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                children: [
                  // Meta row: quotation info + status badge
                  pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Expanded(
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            _metaRow('Quotation #:', quotation.quotationNumber,
                                bold: bold, regular: regular),
                            _metaRow(
                                'Date:',
                                dateFmt.format(quotation.createdAt),
                                bold: bold,
                                regular: regular),
                            if (quotation.validUntil != null)
                              _metaRow(
                                  'Valid Until:',
                                  dateFmt.format(quotation.validUntil!),
                                  bold: bold,
                                  regular: regular),
                          ],
                        ),
                      ),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: pw.BoxDecoration(
                          color: statusBg,
                          borderRadius: pw.BorderRadius.circular(4),
                        ),
                        child: pw.Text(
                          quotation.status.toUpperCase(),
                          style: pw.TextStyle(
                              font: bold, fontSize: 9, color: _white),
                        ),
                      ),
                    ],
                  ),
                  pw.Divider(color: _brand, thickness: 0.5),
                  pw.SizedBox(height: 6),
                  // Items table
                  pw.Text('SERVICE DETAILS',
                      style: pw.TextStyle(
                          font: bold, fontSize: 10, color: _brand)),
                  pw.SizedBox(height: 4),
                  _tableHeader(
                      ['Description', 'Qty', 'Unit Price', 'Amount'],
                      bold: bold,
                      fixedWidths: {1: 30, 2: 70, 3: 70}),
                  ...quotation.items.asMap().entries.map((e) {
                    final item = e.value;
                    final isEven = e.key.isEven;
                    return pw.Container(
                      color: isEven
                          ? const PdfColor(0.96, 0.99, 0.99)
                          : _white,
                      padding: const pw.EdgeInsets.symmetric(
                          horizontal: 8, vertical: 5),
                      child: pw.Row(
                        children: [
                          pw.Expanded(
                              flex: 3,
                              child: pw.Text(item.description,
                                  style: pw.TextStyle(
                                      font: regular, fontSize: 9))),
                          pw.SizedBox(
                              width: 30,
                              child: pw.Text(
                                  item.quantity
                                      .toStringAsFixed(
                                          item.quantity % 1 == 0 ? 0 : 2),
                                  style: pw.TextStyle(
                                      font: regular, fontSize: 9))),
                          pw.SizedBox(
                              width: 70,
                              child: pw.Text(fmt.format(item.unitPrice),
                                  style: pw.TextStyle(
                                      font: regular, fontSize: 9))),
                          pw.SizedBox(
                              width: 70,
                              child: pw.Text(fmt.format(item.totalPrice),
                                  textAlign: pw.TextAlign.right,
                                  style: pw.TextStyle(
                                      font: regular, fontSize: 9))),
                        ],
                      ),
                    );
                  }),
                  pw.Divider(color: PdfColors.grey300),
                  pw.SizedBox(height: 4),
                  // Totals
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.end,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          _totalRow('Subtotal:',
                              fmt.format(quotation.totalAmount),
                              bold: bold,
                              regular: regular),
                          _totalRow(
                              'Tax:',
                              fmt.format(quotation.tax),
                              bold: bold,
                              regular: regular),
                          if (quotation.discount > 0)
                            _totalRow(
                                'Discount:',
                                '-${fmt.format(quotation.discount)}',
                                bold: bold,
                                regular: regular,
                                valueColor:
                                    const PdfColor(0.13, 0.77, 0.37)),
                          pw.SizedBox(height: 2),
                          pw.Container(
                            color: _brand,
                            padding: const pw.EdgeInsets.symmetric(
                                horizontal: 12, vertical: 5),
                            child: pw.Row(
                              children: [
                                pw.Text('TOTAL:',
                                    style: pw.TextStyle(
                                        font: bold,
                                        fontSize: 11,
                                        color: _white)),
                                pw.SizedBox(width: 16),
                                pw.Text(fmt.format(quotation.finalAmount),
                                    style: pw.TextStyle(
                                        font: bold,
                                        fontSize: 11,
                                        color: _white)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  pw.SizedBox(height: 16),
                  // Terms
                  pw.Text('Terms & Conditions',
                      style: pw.TextStyle(
                          font: bold, fontSize: 9, color: _brand)),
                  pw.SizedBox(height: 4),
                  ...[
                    '1. This quotation is valid for the period stated above.',
                    '2. Payment is due upon completion of service.',
                    '3. Prices are inclusive of applicable taxes.',
                    '4. Please quote the quotation number in all correspondence.',
                  ].map((t) => pw.Padding(
                        padding: const pw.EdgeInsets.only(bottom: 2),
                        child: pw.Text(t,
                            style: pw.TextStyle(
                                font: regular,
                                fontSize: 8,
                                color: PdfColors.grey700)),
                      )),
                ],
              ),
            ),
          ),
          _buildFooter(ctx),
        ],
      ),
    ),
  );

  final bytes = await doc.save();
  await _savePdf(bytes, '${quotation.quotationNumber}.pdf');
}

// ── Public: Invoice PDF ───────────────────────────────────────────────────────

Future<void> downloadInvoicePdf(
  Invoice invoice, {
  String appUrl = 'https://premierservice.rw',
  // Optional extra detail fields not stored on Invoice model
  String? customerName,
  String? customerEmail,
  String? customerPhone,
  String? serviceName,
  String? jobNumber,
}) async {
  final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
  final dateFmt = DateFormat('d MMM yyyy');
  final qrUrl = '$appUrl/invoice/${invoice.id}';

  final bold = pw.Font.helveticaBold();
  final regular = pw.Font.helvetica();

  final doc = pw.Document();

  final header = await _buildHeader('INVOICE',
      qrData: qrUrl, boldFont: bold, regularFont: regular);

  PdfColor statusBg;
  switch (invoice.status) {
    case 'paid':
      statusBg = const PdfColor(0.13, 0.77, 0.37);
      break;
    case 'overdue':
      statusBg = const PdfColor(0.94, 0.27, 0.27);
      break;
    default:
      statusBg = const PdfColor(0.92, 0.70, 0.03); // pending = amber
  }

  doc.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.zero,
      build: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          header,
          pw.Expanded(
            child: pw.Padding(
              padding: const pw.EdgeInsets.fromLTRB(18, 12, 18, 0),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                children: [
                  // Meta row
                  pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Expanded(
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            _metaRow('Invoice #:', invoice.invoiceNumber,
                                bold: bold, regular: regular),
                            _metaRow(
                                'Date:',
                                dateFmt.format(invoice.createdAt),
                                bold: bold,
                                regular: regular),
                            if (invoice.dueDate != null)
                              _metaRow('Due Date:',
                                  dateFmt.format(invoice.dueDate!),
                                  bold: bold, regular: regular),
                            if (jobNumber != null)
                              _metaRow('Job #:', jobNumber,
                                  bold: bold, regular: regular),
                          ],
                        ),
                      ),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: pw.BoxDecoration(
                          color: statusBg,
                          borderRadius: pw.BorderRadius.circular(4),
                        ),
                        child: pw.Text(
                          invoice.status.toUpperCase(),
                          style: pw.TextStyle(
                              font: bold, fontSize: 9, color: _white),
                        ),
                      ),
                    ],
                  ),
                  pw.Divider(color: _brand, thickness: 0.5),
                  // Bill To
                  pw.Text('BILL TO',
                      style: pw.TextStyle(
                          font: bold, fontSize: 10, color: _brand)),
                  pw.SizedBox(height: 4),
                  if (customerName != null)
                    pw.Text(customerName,
                        style:
                            pw.TextStyle(font: bold, fontSize: 9)),
                  if (customerEmail != null)
                    pw.Text(customerEmail,
                        style: pw.TextStyle(
                            font: regular,
                            fontSize: 9,
                            color: PdfColors.grey700)),
                  if (customerPhone != null)
                    pw.Text(customerPhone,
                        style: pw.TextStyle(
                            font: regular,
                            fontSize: 9,
                            color: PdfColors.grey700)),
                  pw.SizedBox(height: 8),
                  // Services table
                  pw.Text('SERVICES & CHARGES',
                      style: pw.TextStyle(
                          font: bold, fontSize: 10, color: _brand)),
                  pw.SizedBox(height: 4),
                  _tableHeader(
                      ['Description', 'Amount'],
                      bold: bold,
                      fixedWidths: {1: 90}),
                  pw.Container(
                    color: const PdfColor(0.96, 0.99, 0.99),
                    padding: const pw.EdgeInsets.symmetric(
                        horizontal: 8, vertical: 5),
                    child: pw.Row(
                      children: [
                        pw.Expanded(
                          child: pw.Text(
                            serviceName ?? 'Service Fee',
                            style:
                                pw.TextStyle(font: regular, fontSize: 9),
                          ),
                        ),
                        pw.SizedBox(
                          width: 90,
                          child: pw.Text(
                            fmt.format(invoice.totalAmount),
                            textAlign: pw.TextAlign.right,
                            style:
                                pw.TextStyle(font: regular, fontSize: 9),
                          ),
                        ),
                      ],
                    ),
                  ),
                  pw.Divider(color: PdfColors.grey300),
                  pw.SizedBox(height: 4),
                  // Totals
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.end,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          _totalRow('Subtotal:',
                              fmt.format(invoice.totalAmount),
                              bold: bold, regular: regular),
                          if (invoice.tax > 0)
                            _totalRow('Tax:', fmt.format(invoice.tax),
                                bold: bold, regular: regular),
                          if (invoice.discount > 0)
                            _totalRow('Discount:',
                                '-${fmt.format(invoice.discount)}',
                                bold: bold,
                                regular: regular,
                                valueColor:
                                    const PdfColor(0.13, 0.77, 0.37)),
                          pw.SizedBox(height: 2),
                          pw.Container(
                            color: _brand,
                            padding: const pw.EdgeInsets.symmetric(
                                horizontal: 12, vertical: 5),
                            child: pw.Row(
                              children: [
                                pw.Text('TOTAL DUE:',
                                    style: pw.TextStyle(
                                        font: bold,
                                        fontSize: 11,
                                        color: _white)),
                                pw.SizedBox(width: 16),
                                pw.Text(fmt.format(invoice.finalAmount),
                                    style: pw.TextStyle(
                                        font: bold,
                                        fontSize: 11,
                                        color: _white)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (invoice.paidDate != null) ...[
                    pw.SizedBox(height: 10),
                    pw.Row(children: [
                      pw.Text('Paid on: ',
                          style: pw.TextStyle(
                              font: bold,
                              fontSize: 9,
                              color: const PdfColor(0.13, 0.77, 0.37))),
                      pw.Text(dateFmt.format(invoice.paidDate!),
                          style: pw.TextStyle(
                              font: regular,
                              fontSize: 9,
                              color: const PdfColor(0.13, 0.77, 0.37))),
                    ]),
                  ],
                  pw.SizedBox(height: 16),
                  // Payment instructions
                  pw.Text('Payment Instructions',
                      style: pw.TextStyle(
                          font: bold, fontSize: 9, color: _brand)),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'Bank: Premier Bank  |  Account: 1234567890  |  Branch: Kigali\n'
                    'Mobile Money: +250 788 000 000\n'
                    'Or scan the QR code in the header for online payment.',
                    style: pw.TextStyle(
                        font: regular,
                        fontSize: 8,
                        color: PdfColors.grey700),
                  ),
                ],
              ),
            ),
          ),
          _buildFooter(ctx),
        ],
      ),
    ),
  );

  final bytes = await doc.save();
  await _savePdf(bytes, '${invoice.invoiceNumber}.pdf');
}

// ── Small reusable PDF widgets ────────────────────────────────────────────────

pw.Widget _metaRow(String label, String value,
    {required pw.Font bold, required pw.Font regular}) {
  return pw.Padding(
    padding: const pw.EdgeInsets.only(bottom: 3),
    child: pw.Row(
      children: [
        pw.Text(label,
            style: pw.TextStyle(
                font: bold, fontSize: 9, color: PdfColors.grey700)),
        pw.SizedBox(width: 6),
        pw.Text(value,
            style: pw.TextStyle(font: regular, fontSize: 9)),
      ],
    ),
  );
}

/// [fixedWidths] is an optional map of column-index → fixed width in pts.
/// Columns not in the map are Expanded (flex).
pw.Widget _tableHeader(
    List<String> cols, {
    required pw.Font bold,
    Map<int, double> fixedWidths = const {},
}) {
  return pw.Container(
    color: _brand,
    padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 5),
    child: pw.Row(
      children: List.generate(cols.length, (i) {
        final isLast = i == cols.length - 1;
        final child = pw.Text(
          cols[i],
          textAlign: isLast ? pw.TextAlign.right : pw.TextAlign.left,
          style: pw.TextStyle(font: bold, fontSize: 9, color: _white),
        );
        final fixedW = fixedWidths[i];
        if (fixedW != null) return pw.SizedBox(width: fixedW, child: child);
        return pw.Expanded(child: child);
      }),
    ),
  );
}

pw.Widget _totalRow(String label, String value,
    {required pw.Font bold,
    required pw.Font regular,
    PdfColor? valueColor}) {
  return pw.Padding(
    padding: const pw.EdgeInsets.only(bottom: 3),
    child: pw.Row(
      mainAxisSize: pw.MainAxisSize.min,
      children: [
        pw.SizedBox(
          width: 80,
          child: pw.Text(label,
              textAlign: pw.TextAlign.right,
              style: pw.TextStyle(
                  font: regular,
                  fontSize: 9,
                  color: PdfColors.grey700)),
        ),
        pw.SizedBox(width: 8),
        pw.SizedBox(
          width: 90,
          child: pw.Text(value,
              textAlign: pw.TextAlign.right,
              style: pw.TextStyle(
                font: regular,
                fontSize: 9,
                color: valueColor ?? PdfColors.black,
              )),
        ),
      ],
    ),
  );
}
