import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/index.dart';
import '../../services/tracking_service.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

// ── Update to your actual Google Maps business review link ──────────────────
const _kGoogleReviewUrl =
    'https://www.google.com/search?q=zld+hub+cleaning+services&sca_esv=77e44e7688afd311&sxsrf=APpeQnstBb5KmhV8SpB2moc3oKvqGp2uRw%3A1786893135224&ei=T9OBapyHDZz_7_UP2LLzuQQ&biw=1366&bih=607&oq=zld+hub+cleaning+servoce&gs_lp=Egxnd3Mtd2l6LXNlcnAiGHpsZCBodWIgY2xlYW5pbmcgc2Vydm9jZSoCCAAyBBAhGBUyBRAhGJIDMgUQIRiSAzIFECEYkgMyBRAhGJIDMgUQIRiSAzIFECEYkgNIo0hQ5gNY1DBwAXgAkAEAmAGKBKAB-zWqAQoyLTIuMTIuNC4xuAEByAEA-AEBmAISoAKkMcICCxAAGIAEGKIEGLADwgIIEAAYgAQYogTCAggQABiJBRiiBMICBRAhGKABwgIFEAAY7wXCAgcQIRgKGKABmAMAiAYBkAYEkgcKMS4wLjIuMTEuNKAHzyuyBwgyLTIuMTEuNLgHnDHCBwgwLjQuMTMuMcgHV4AIAQ&sclient=gws-wiz-serp#lrd=0x19dca589476ae027:0x50f61abdae096d0,3,,,,';
// ─────────────────────────────────────────────────────────────────────────────

class TrackScreen extends StatefulWidget {
  const TrackScreen({super.key});
  @override
  State<TrackScreen> createState() => _TrackScreenState();
}

class _TrackScreenState extends State<TrackScreen> {
  final _phone = TextEditingController();
  List<Booking> _bookings = [];
  String? _customerName;
  bool _loading = false;
  bool _searched = false;

  Future<void> _search() async {
    if (_phone.text.isEmpty) return;
    setState(() {
      _loading = true;
      _searched = false;
    });
    try {
      final result =
          await TrackingService.trackByPhone(_phone.text.trim());
      final bookingsData = (result['bookings'] as List?) ?? [];
      final bookings = bookingsData
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();
      final customer = result['customer'] as Map<String, dynamic>?;
      if (mounted) {
        setState(() {
          _bookings = bookings;
          _customerName = customer?['name'] as String?;
          _loading = false;
          _searched = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _bookings = [];
          _customerName = null;
          _loading = false;
          _searched = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('d MMM yyyy');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Track My Booking'),
        leading: BackButton(onPressed: () => context.go('/customer')),
      ),
      body: Column(
        children: [
          // ── Search bar ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _phone,
                      decoration: const InputDecoration(
                        hintText: 'Enter your phone number',
                        prefixIcon: Icon(Icons.phone),
                      ),
                      keyboardType: TextInputType.phone,
                      onSubmitted: (_) => _search(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                onPressed: _loading ? null : _search,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Search'),
              ),
            ]),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.only(left: 4),
              child: Text(
                'Use format: +250 7XX XXX XXX for tracking',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[600],
                ),
              ),
            ),
          ],
            ),
          ),

          // ── Results ─────────────────────────────────────────────────────
          Expanded(
            child: !_searched
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.track_changes,
                            size: 64, color: Colors.black26),
                        SizedBox(height: 12),
                        Text(
                          'Enter your phone number\nto track your bookings',
                          style: TextStyle(color: Colors.black45),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  )
                : _bookings.isEmpty
                    ? const EmptyWidget(
                        message: 'No bookings found for this number')
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 24),
                        itemCount: _bookings.length,
                        itemBuilder: (_, i) {
                          final b = _bookings[i];
                          return _BookingCard(
                            booking: b,
                            customerName: _customerName,
                            fmt: fmt,
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

// ── Individual booking card with inline feedback section ─────────────────────

class _BookingCard extends StatefulWidget {
  final Booking booking;
  final String? customerName;
  final DateFormat fmt;

  const _BookingCard({
    required this.booking,
    required this.customerName,
    required this.fmt,
  });

  @override
  State<_BookingCard> createState() => _BookingCardState();
}

class _BookingCardState extends State<_BookingCard> {
  bool _expanded = false;

  // Feedback state
  int _rating = 0;
  int _hoverRating = 0; // tracked via focus for accessibility
  final _feedbackCtrl = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;
  String? _feedbackError;

  bool get _isCompleted =>
      widget.booking.status == 'completed';

  @override
  void dispose() {
    _feedbackCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    if (_rating == 0) {
      setState(() =>
          _feedbackError = 'Please select a star rating first.');
      return;
    }
    setState(() {
      _submitting = true;
      _feedbackError = null;
    });
    try {
      await TrackingService.submitFeedback(
        bookingNumber: widget.booking.id,
        service: widget.booking.service?.name,
        customerName: widget.customerName,
        rating: _rating,
        feedback: _feedbackCtrl.text.trim().isEmpty
            ? null
            : _feedbackCtrl.text.trim(),
      );
      if (mounted) setState(() { _submitted = true; _submitting = false; });
    } catch (e) {
      if (mounted) {
        setState(() {
          _feedbackError = 'Could not submit. Please try again.';
          _submitting = false;
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

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;
    final fmt = widget.fmt;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        children: [
          // ── Header row ────────────────────────────────────────────────
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor:
                        statusColor(b.status).withOpacity(0.15),
                    child: Icon(Icons.work_outline,
                        color: statusColor(b.status)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          b.service?.name ?? 'Service',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Booked: ${fmt.format(b.bookingDate)}',
                          style: const TextStyle(
                              fontSize: 12, color: Colors.black54),
                        ),
                        if (b.preferredDate != null)
                          Text(
                            'Preferred: ${fmt.format(b.preferredDate!)}',
                            style: const TextStyle(
                                fontSize: 12, color: Colors.black54),
                          ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      StatusBadge(b.status),
                      const SizedBox(height: 4),
                      Icon(
                        _expanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        color: Colors.black38,
                        size: 20,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Expanded details ──────────────────────────────────────────
          if (_expanded) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Basic info rows
                  _InfoRow(
                      icon: Icons.confirmation_number_outlined,
                      label: 'Booking ID',
                      value: b.id.length > 8
                          ? '…${b.id.substring(b.id.length - 8)}'
                          : b.id),
                  if (b.notes != null && b.notes!.isNotEmpty)
                    _InfoRow(
                        icon: Icons.notes,
                        label: 'Notes',
                        value: b.notes!),
                  const SizedBox(height: 16),

                  // ── Feedback & Review section ──────────────────────
                  _isCompleted
                      ? _FeedbackSection(
                          submitted: _submitted,
                          submitting: _submitting,
                          rating: _rating,
                          feedbackCtrl: _feedbackCtrl,
                          feedbackError: _feedbackError,
                          onRatingChanged: (r) =>
                              setState(() => _rating = r),
                          onSubmit: _submitFeedback,
                          onGoogleReview: _openGoogleReview,
                        )
                      : _ReviewPromptBanner(
                          status: b.status,
                          onGoogleReview: _openGoogleReview,
                        ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Feedback form (shown when booking is completed) ──────────────────────────

class _FeedbackSection extends StatelessWidget {
  final bool submitted;
  final bool submitting;
  final int rating;
  final TextEditingController feedbackCtrl;
  final String? feedbackError;
  final ValueChanged<int> onRatingChanged;
  final VoidCallback onSubmit;
  final VoidCallback onGoogleReview;

  const _FeedbackSection({
    required this.submitted,
    required this.submitting,
    required this.rating,
    required this.feedbackCtrl,
    required this.feedbackError,
    required this.onRatingChanged,
    required this.onSubmit,
    required this.onGoogleReview,
  });

  static const _labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF28A8AC).withOpacity(0.3)),
      ),
      child: submitted
          // ── Thank-you state ──
          ? Column(
              children: [
                const Icon(Icons.thumb_up_rounded,
                    size: 48, color: Color(0xFF28A8AC)),
                const SizedBox(height: 8),
                const Text(
                  'Thank you for your feedback!',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                const Text(
                  'We appreciate you taking the time.',
                  style: TextStyle(color: Colors.black54, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: onGoogleReview,
                    icon: const Icon(Icons.star_rounded),
                    label: const Text('Leave a Google Review'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF28A8AC),
                    ),
                  ),
                ),
              ],
            )
          // ── Form state ──
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Color(0xFF28A8AC),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.rate_review,
                          color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Rate Your Experience',
                      style: TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Star rating
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) {
                    final star = i + 1;
                    return GestureDetector(
                      onTap: () => onRatingChanged(star),
                      child: Padding(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 4),
                        child: Icon(
                          star <= rating
                              ? Icons.star_rounded
                              : Icons.star_border_rounded,
                          size: 40,
                          color: star <= rating
                              ? const Color(0xFFFBBF24)
                              : Colors.grey.shade400,
                        ),
                      ),
                    );
                  }),
                ),
                if (rating > 0)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        _labels[rating],
                        style: const TextStyle(
                            color: Colors.black54, fontSize: 13),
                      ),
                    ),
                  ),
                const SizedBox(height: 14),

                // Comment field
                TextField(
                  controller: feedbackCtrl,
                  decoration: InputDecoration(
                    hintText:
                        'Share your experience (optional)…',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                  maxLines: 3,
                  maxLength: 1000,
                ),

                // Error
                if (feedbackError != null) ...[
                  const SizedBox(height: 4),
                  Text(feedbackError!,
                      style: const TextStyle(
                          color: Colors.red, fontSize: 12)),
                ],
                const SizedBox(height: 12),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: submitting ? null : onSubmit,
                    icon: submitting
                        ? const SizedBox(
                            height: 16,
                            width: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white),
                          )
                        : const Icon(Icons.send_rounded),
                    label: Text(
                        submitting ? 'Submitting…' : 'Submit Feedback'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF28A8AC)),
                  ),
                ),
                const SizedBox(height: 8),

                // Google review button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onGoogleReview,
                    icon: const Icon(Icons.star_rounded,
                        color: Color(0xFFFBBF24)),
                    label: const Text('Add a Google Review'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFFBBF24)),
                      foregroundColor: const Color(0xFF92400E),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'A Google review takes less than a minute and helps others find us.',
                  style: TextStyle(fontSize: 11, color: Colors.black45),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
    );
  }
}

// ── Banner shown for non-completed bookings when expanded ─────────────────────

class _ReviewPromptBanner extends StatelessWidget {
  final String status;
  final VoidCallback onGoogleReview;

  const _ReviewPromptBanner(
      {required this.status, required this.onGoogleReview});

  @override
  Widget build(BuildContext context) {
    final isActive =
        status == 'in_progress' || status == 'confirmed' || status == 'scheduled';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                isActive
                    ? Icons.pending_actions_rounded
                    : Icons.info_outline,
                color: Colors.black38,
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isActive
                      ? 'Feedback will be available once your service is completed.'
                      : 'Service not yet completed.',
                  style: const TextStyle(
                      fontSize: 13, color: Colors.black54),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onGoogleReview,
              icon: const Icon(Icons.star_rounded,
                  color: Color(0xFFFBBF24)),
              label: const Text('Add a Google Review'),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFBBF24)),
                foregroundColor: const Color(0xFF92400E),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Small helper ─────────────────────────────────────────────────────────────

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.black38),
          const SizedBox(width: 8),
          Text('$label: ',
              style: const TextStyle(
                  fontSize: 13, color: Colors.black54)),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
