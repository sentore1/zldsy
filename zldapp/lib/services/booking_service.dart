import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';

class BookingService {
  /// Create a new booking via the API endpoint
  /// This bypasses RLS by using the service role on the backend
  static Future<Map<String, dynamic>> createBooking({
    required String serviceId,
    required String preferredDate,
    String? notes,
    required Map<String, dynamic> customerInfo,
  }) async {
    print('📡 BookingService.createBooking called');
    print('🔗 Endpoint: ${AppConstants.bookingsEndpoint}');
    print('📦 Payload: service_id=$serviceId, preferred_date=$preferredDate');
    
    try {
      print('🌐 Making HTTP POST request...');
      final response = await http.post(
        Uri.parse(AppConstants.bookingsEndpoint),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'service_id': serviceId,
          'preferred_date': preferredDate,
          'notes': notes,
          'customer_info': customerInfo,
        }),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          print('⏱️ Request timed out after 30 seconds');
          throw Exception('Connection timeout - please check your internet connection');
        },
      );

      print('📥 Response status code: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      if (response.statusCode == 201) {
        // Success
        print('✅ Booking created successfully');
        final data = jsonDecode(response.body);
        return data['booking'];
      } else {
        // Error
        print('❌ Server error: ${response.statusCode}');
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Failed to create booking');
      }
    } catch (e) {
      print('💥 Exception caught: $e');
      if (e.toString().contains('SocketException') || 
          e.toString().contains('Failed host lookup')) {
        throw Exception('Cannot connect to server. Please check:\n'
            '1. Your internet connection\n'
            '2. The server is running\n'
            '3. Your device can reach ${AppConstants.apiBaseUrl}');
      }
      throw Exception('Network error: ${e.toString()}');
    }
  }

  /// Get bookings for a customer
  static Future<List<Map<String, dynamic>>> getBookings({
    String? status,
    String? customerId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (status != null) queryParams['status'] = status;
      if (customerId != null) queryParams['customer_id'] = customerId;

      final uri = Uri.parse(AppConstants.bookingsEndpoint)
          .replace(queryParameters: queryParams);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['bookings']);
      } else {
        throw Exception('Failed to fetch bookings');
      }
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }

  /// Get a single booking by ID
  static Future<Map<String, dynamic>> getBookingById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.bookingsEndpoint}/$id'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['booking'];
      } else {
        throw Exception('Failed to fetch booking');
      }
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }
}
