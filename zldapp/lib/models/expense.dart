class Expense {
  final String id;
  final String? jobId;
  final String? category;
  final String? description;
  final double amount;
  final DateTime expenseDate;
  final DateTime createdAt;

  Expense({
    required this.id,
    this.jobId,
    this.category,
    this.description,
    required this.amount,
    required this.expenseDate,
    required this.createdAt,
  });

  factory Expense.fromJson(Map<String, dynamic> j) => Expense(
        id: j['id'],
        jobId: j['job_id'],
        category: j['category'],
        description: j['description'],
        amount: (j['amount'] as num).toDouble(),
        expenseDate: DateTime.parse(j['expense_date']),
        createdAt: DateTime.parse(j['created_at']),
      );
}
