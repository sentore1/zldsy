import 'package:url_launcher/url_launcher.dart';

/// Helper class for sharing invoices and quotations via WhatsApp
class WhatsAppHelper {
  /// Share invoice details with customer via WhatsApp
  static Future<void> shareInvoice({
    required String invoiceId,
    required String invoiceNumber,
    required String customerName,
    required String? customerPhone,
    required double totalAmount,
  }) async {
    if (customerPhone == null || customerPhone.isEmpty) {
      throw Exception('Customer phone number not available');
    }
    
    final message = '''
*Invoice from ZLD Hub* 🧾

Hello $customerName,

Your invoice is ready!

📄 *Invoice Number:* $invoiceNumber
💰 *Amount:* RWF ${totalAmount.toStringAsFixed(0)}

View your invoice here:
[Link will be available in production]

Please make payment at your earliest convenience.

Thank you for choosing ZLD Hub! 🙏

_For support, contact us at: +250 790 002 669_
''';
    
    await _sendWhatsApp(customerPhone, message);
  }
  
  /// Share quotation details with customer via WhatsApp
  static Future<void> shareQuotation({
    required String quotationId,
    required String quotationNumber,
    required String customerName,
    required String? customerPhone,
    required double totalAmount,
    required String validUntil,
  }) async {
    if (customerPhone == null || customerPhone.isEmpty) {
      throw Exception('Customer phone number not available');
    }
    
    final message = '''
*Quotation from ZLD Hub* 📋

Hello $customerName,

Your service quotation is ready!

📄 *Quotation Number:* $quotationNumber
💰 *Estimated Cost:* RWF ${totalAmount.toStringAsFixed(0)}
⏰ *Valid Until:* $validUntil

View your quotation here:
[Link will be available in production]

Please review and accept to proceed with booking.

Thank you for choosing ZLD Hub! 🙏

_Questions? Contact us at: +250 790 002 669_
''';
    
    await _sendWhatsApp(customerPhone, message);
  }
  
  /// Share job completion notification with customer
  static Future<void> shareJobCompletion({
    required String jobNumber,
    required String customerName,
    required String? customerPhone,
    required String serviceName,
  }) async {
    if (customerPhone == null || customerPhone.isEmpty) {
      throw Exception('Customer phone number not available');
    }
    
    final message = '''
*Service Completed - ZLD Hub* ✅

Hello $customerName,

Your service has been completed!

🔧 *Service:* $serviceName
📋 *Job Number:* $jobNumber

Thank you for choosing ZLD Hub! We hope you're satisfied with our service.

_Need assistance? Contact us at: +250 790 002 669_
''';
    
    await _sendWhatsApp(customerPhone, message);
  }
  
  /// Internal method to send WhatsApp message
  static Future<void> _sendWhatsApp(String phone, String message) async {
    // Remove all non-digit characters from phone
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    // Encode message for URL
    final encodedMessage = Uri.encodeComponent(message);
    
    // Construct WhatsApp URL
    final url = 'https://wa.me/$cleanPhone?text=$encodedMessage';
    
    final uri = Uri.parse(url);
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw Exception('Could not launch WhatsApp. Please ensure WhatsApp is installed.');
    }
  }
}
