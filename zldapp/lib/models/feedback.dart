class Feedback {
  final String id;
  final String? jobId;
  final String? customerId;
  final int rating;
  final String? comment;
  final bool googleReviewSubmitted;
  final DateTime createdAt;

  Feedback({
    required this.id,
    this.jobId,
    this.customerId,
    required this.rating,
    this.comment,
    required this.googleReviewSubmitted,
    required this.createdAt,
  });

  factory Feedback.fromJson(Map<String, dynamic> j) => Feedback(
        id: j['id'],
        jobId: j['job_id'],
        customerId: j['customer_id'],
        rating: j['rating'],
        comment: j['comment'],
        googleReviewSubmitted: j['google_review_submitted'] ?? false,
        createdAt: DateTime.parse(j['created_at']),
      );
}
