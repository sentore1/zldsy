import 'payment.dart';

class Invoice {
  final String id;
  final String? jobId;
  final String invoiceNumber;
  final double totalAmount;
  final double tax;
  final double discount;
  final double finalAmount;
  final String status; // pending, paid, overdue, cancelled
  final DateTime? dueDate;
  final DateTime? paidDate;
  final String? paymentMethod;
  final String? qrCode;
  final DateTime createdAt;
  final List<Payment> payments;

  Invoice({
    required this.id,
    this.jobId,
    required this.invoiceNumber,
    required this.totalAmount,
    required this.tax,
    required this.discount,
    required this.finalAmount,
    required this.status,
    this.dueDate,
    this.paidDate,
    this.paymentMethod,
    this.qrCode,
    required this.createdAt,
    this.payments = const [],
  });

  factory Invoice.fromJson(Map<String, dynamic> j) => Invoice(
        id: j['id'],
        jobId: j['job_id'],
        invoiceNumber: j['invoice_number'],
        totalAmount: (j['total_amount'] as num).toDouble(),
        tax: (j['tax'] as num? ?? 0).toDouble(),
        discount: (j['discount'] as num? ?? 0).toDouble(),
        finalAmount: (j['final_amount'] as num).toDouble(),
        status: j['status'] ?? 'pending',
        dueDate: j['due_date'] != null ? DateTime.parse(j['due_date']) : null,
        paidDate: j['paid_date'] != null ? DateTime.parse(j['paid_date']) : null,
        paymentMethod: j['payment_method'],
        qrCode: j['qr_code'],
        createdAt: DateTime.parse(j['created_at']),
        payments: (j['payments'] as List<dynamic>? ?? [])
            .map((p) => Payment.fromJson(p))
            .toList(),
      );
}
