import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/tracking_service.dart';
import '../../theme.dart';

// ── Update to your actual Google Maps business review link ──────────────────
const _kGoogleReviewUrl =
    'https://www.google.com/maps/search/?api=1&query=ZldHub+Service';
// ─────────────────────────────────────────────────────────────────────────────

/// Standalone feedback screen — navigated to from outside the track screen
/// (e.g. a post-job notification link). Accepts an optional [bookingId].
class FeedbackScreen extends StatefulWidget {
  final String? bookingId;

  /// Legacy support: jobId-based navigation still works
  final String? jobId;

  const FeedbackScreen({super.key, this.bookingId, this.jobId});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  int _rating = 0;
  final _comment = TextEditingController();
  bool _loading = false;
  bool _submitted = false;
  String? _error;

  String get _refId => widget.bookingId ?? widget.jobId ?? '';

  Future<void> _submit() async {
    if (_rating == 0) {
      setState(() => _error = 'Please select a star rating before submitting.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await TrackingService.submitFeedback(
        bookingNumber: _refId.isEmpty ? null : _refId,
        rating: _rating,
        feedback:
            _comment.text.trim().isEmpty ? null : _comment.text.trim(),
      );
      if (mounted) setState(() { _submitted = true; _loading = false; });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Could not submit feedback. Please try again.';
          _loading = false;
        });
      }
    }
  }

  Future<void> _openGoogleReview() async {
    final uri = Uri.parse(_kGoogleReviewUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _ratingLabel(int r) {
    const labels = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent!'];
    return r >= 1 && r <= 5 ? labels[r] : '';
  }

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Feedback'),
        leading: BackButton(onPressed: () => context.go('/customer')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: _submitted ? _thankYouView() : _formView(),
      ),
    );
  }

  // ── Thank-you state ─────────────────────────────────────────────────────────
  Widget _thankYouView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: 40),
        const Icon(Icons.check_circle_rounded,
            size: 80, color: AppTheme.successColor),
        const SizedBox(height: 16),
        const Text(
          'Thank you for your feedback!',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          'We really appreciate you taking the time\nto share your experience.',
          style: TextStyle(color: Colors.black54, fontSize: 14),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),

        // Google Review — always visible after submit
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.5)),
          ),
          child: Column(
            children: [
              const Icon(Icons.star_rounded,
                  size: 36, color: Color(0xFFFBBF24)),
              const SizedBox(height: 8),
              const Text(
                'Enjoying our service?',
                style:
                    TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 4),
              const Text(
                'A Google review takes less than a minute\nand helps others find us.',
                style: TextStyle(color: Colors.black54, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _openGoogleReview,
                  icon: const Icon(Icons.open_in_new_rounded),
                  label: const Text('Write a Google Review'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF28A8AC),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        TextButton(
          onPressed: () => context.go('/customer'),
          child: const Text('Back to Home'),
        ),
      ],
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  Widget _formView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 8),
        const Text(
          'How was our service?',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'Your feedback helps us improve.',
          style: TextStyle(color: Colors.black54, fontSize: 14),
        ),
        const SizedBox(height: 28),

        // ── Star rating ──
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(5, (i) {
            final star = i + 1;
            return GestureDetector(
              onTap: () => setState(() => _rating = star),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Icon(
                  star <= _rating
                      ? Icons.star_rounded
                      : Icons.star_border_rounded,
                  size: 52,
                  color: star <= _rating
                      ? const Color(0xFFFBBF24)
                      : Colors.grey.shade400,
                ),
              ),
            );
          }),
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: _rating > 0
              ? Padding(
                  key: ValueKey(_rating),
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    _ratingLabel(_rating),
                    style: const TextStyle(
                        color: Colors.black54, fontSize: 14),
                  ),
                )
              : const SizedBox(key: ValueKey(0), height: 26),
        ),
        const SizedBox(height: 24),

        // ── Comment field ──
        TextField(
          controller: _comment,
          decoration: InputDecoration(
            labelText: 'Comments (optional)',
            hintText: 'Tell us about your experience…',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            contentPadding: const EdgeInsets.all(16),
          ),
          maxLines: 4,
          maxLength: 1000,
        ),

        // ── Error ──
        if (_error != null) ...[
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline,
                    color: Colors.red, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(_error!,
                      style: const TextStyle(
                          color: Colors.red, fontSize: 13)),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 20),

        // ── Submit feedback ──
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _loading ? null : _submit,
            icon: _loading
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.send_rounded),
            label: Text(_loading ? 'Submitting…' : 'Submit Feedback'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF28A8AC),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // ── Google review (always visible) ──
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _openGoogleReview,
            icon: const Icon(Icons.star_rounded,
                color: Color(0xFFFBBF24)),
            label: const Text('Add a Google Review'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFFBBF24), width: 1.5),
              foregroundColor: const Color(0xFF92400E),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'A Google review takes less than a minute\nand helps others find us.',
          style: TextStyle(fontSize: 11, color: Colors.black45),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
