class QuotationItem {
  final String id;
  final String quotationId;
  final String description;
  final double quantity;
  final double unitPrice;
  final double totalPrice;

  QuotationItem({
    required this.id,
    required this.quotationId,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory QuotationItem.fromJson(Map<String, dynamic> j) => QuotationItem(
        id: j['id'],
        quotationId: j['quotation_id'],
        description: j['description'],
        quantity: (j['quantity'] as num).toDouble(),
        unitPrice: (j['unit_price'] as num).toDouble(),
        totalPrice: (j['total_price'] as num).toDouble(),
      );
}

class Quotation {
  final String id;
  final String bookingId;
  final String quotationNumber;
  final double totalAmount;
  final double discount;
  final double tax;
  final double finalAmount;
  final String status; // sent, accepted, rejected, expired
  final DateTime? validUntil;
  final bool termsAccepted;
  final DateTime? termsAcceptedAt;
  final String? qrCode;
  final DateTime createdAt;
  final List<QuotationItem> items;

  Quotation({
    required this.id,
    required this.bookingId,
    required this.quotationNumber,
    required this.totalAmount,
    required this.discount,
    required this.tax,
    required this.finalAmount,
    required this.status,
    this.validUntil,
    required this.termsAccepted,
    this.termsAcceptedAt,
    this.qrCode,
    required this.createdAt,
    this.items = const [],
  });

  factory Quotation.fromJson(Map<String, dynamic> j) => Quotation(
        id: j['id'],
        bookingId: j['booking_id'],
        quotationNumber: j['quotation_number'],
        totalAmount: (j['total_amount'] as num).toDouble(),
        discount: (j['discount'] as num? ?? 0).toDouble(),
        tax: (j['tax'] as num? ?? 0).toDouble(),
        finalAmount: (j['final_amount'] as num).toDouble(),
        status: j['status'] ?? 'sent',
        validUntil: j['valid_until'] != null ? DateTime.parse(j['valid_until']) : null,
        termsAccepted: j['terms_accepted'] ?? false,
        termsAcceptedAt: j['terms_accepted_at'] != null ? DateTime.parse(j['terms_accepted_at']) : null,
        qrCode: j['qr_code'],
        createdAt: DateTime.parse(j['created_at']),
        items: (j['quotation_items'] as List<dynamic>? ?? [])
            .map((i) => QuotationItem.fromJson(i))
            .toList(),
      );
}
