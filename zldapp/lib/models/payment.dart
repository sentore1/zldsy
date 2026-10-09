class Payment {
  final String id;
  final String invoiceId;
  final double amount;
  final String? paymentMethod;
  final String? transactionReference;
  final DateTime paymentDate;
  final String? notes;
  final DateTime createdAt;

  Payment({
    required this.id,
    required this.invoiceId,
    required this.amount,
    this.paymentMethod,
    this.transactionReference,
    required this.paymentDate,
    this.notes,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> j) => Payment(
        id: j['id'],
        invoiceId: j['invoice_id'],
        amount: (j['amount'] as num).toDouble(),
        paymentMethod: j['payment_method'],
        transactionReference: j['transaction_reference'],
        paymentDate: DateTime.parse(j['payment_date']),
        notes: j['notes'],
        createdAt: DateTime.parse(j['created_at']),
      );
}
