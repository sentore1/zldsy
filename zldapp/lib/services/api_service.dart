import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

/// Generic API service for making HTTP requests
class ApiService {
  /// Make a GET request
  static Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final url = '${ApiConfig.baseUrl}$endpoint';
      print('🌐 GET: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('📥 Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      print('❌ API GET Error: $e');
      rethrow;
    }
  }

  /// Make a POST request
  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    try {
      final url = '${ApiConfig.baseUrl}$endpoint';
      print('🌐 POST: $url');

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('📥 Response status: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      print('❌ API POST Error: $e');
      rethrow;
    }
  }

  /// Make a PATCH request
  static Future<Map<String, dynamic>> patch(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    try {
      final url = '${ApiConfig.baseUrl}$endpoint';
      print('🌐 PATCH: $url');

      final response = await http.patch(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('📥 Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      print('❌ API PATCH Error: $e');
      rethrow;
    }
  }

  /// Make a DELETE request
  static Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final url = '${ApiConfig.baseUrl}$endpoint';
      print('🌐 DELETE: $url');

      final response = await http.delete(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('📥 Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      print('❌ API DELETE Error: $e');
      rethrow;
    }
  }
}
