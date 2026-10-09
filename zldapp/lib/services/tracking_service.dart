import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';

class TrackingService {
  /// Track bookings by phone number via the web API.
  /// Returns `{ customer: {...}, bookings: [...] }`.
  static Future<Map<String, dynamic>> trackByPhone(String phone) async {
    try {
      final uri = Uri.parse(AppConstants.trackEndpoint)
          .replace(queryParameters: {'phone': phone.trim()});

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else if (response.statusCode == 400) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Invalid request');
      } else {
        throw Exception('Failed to track bookings (${response.statusCode})');
      }
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }

  /// Submit customer feedback via the web API `/api/feedback`.
  ///
  /// [bookingNumber] — booking ID or reference (optional)
  /// [service]       — service name (optional)
  /// [customerName]  — customer name (optional)
  /// [rating]        — 1–5 (required)
  /// [feedback]      — free-text comment (optional)
  static Future<void> submitFeedback({
    String? bookingNumber,
    String? service,
    String? customerName,
    required int rating,
    String? feedback,
  }) async {
    if (rating < 1 || rating > 5) {
      throw Exception('Rating must be between 1 and 5.');
    }

    try {
      final response = await http.post(
        Uri.parse(AppConstants.feedbackEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'booking_number': bookingNumber,
          'service': service,
          'customer_name': customerName,
          'rating': rating,
          'feedback': feedback,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // success
        return;
      }

      final body = jsonDecode(response.body);
      throw Exception(
          body['error'] ?? 'Failed to submit feedback (${response.statusCode})');
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }
}
