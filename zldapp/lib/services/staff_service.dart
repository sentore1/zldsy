import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/index.dart';

class StaffService {
  static const String _baseUrl = '${AppConstants.apiBaseUrl}/api/staff';

  /// Create staff member (with optional password for login access)
  /// If password is provided, creates auth user and links to staff record
  static Future<Staff> createStaff(Map<String, dynamic> data) async {
    try {
      print('📤 Creating staff via API: ${data['name']}');
      
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      if (response.statusCode == 201) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        print('✅ Staff created successfully');
        return Staff.fromJson(jsonResponse['staff']);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to create staff');
      }
    } catch (e) {
      print('❌ Error creating staff: $e');
      rethrow;
    }
  }

  /// Get all staff members
  static Future<List<Staff>> getStaff({String? role, bool? isActive}) async {
    try {
      final queryParams = <String, String>{};
      if (role != null) queryParams['role'] = role;
      if (isActive != null) queryParams['is_active'] = isActive.toString();

      final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        final List<dynamic> staffList = jsonResponse['staff'];
        return staffList.map((json) => Staff.fromJson(json)).toList();
      } else {
        throw Exception('Failed to fetch staff');
      }
    } catch (e) {
      print('❌ Error fetching staff: $e');
      rethrow;
    }
  }

  /// Update staff member
  static Future<Staff> updateStaff(String id, Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('$_baseUrl/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return Staff.fromJson(jsonResponse['staff']);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to update staff');
      }
    } catch (e) {
      print('❌ Error updating staff: $e');
      rethrow;
    }
  }

  /// Delete staff member
  static Future<void> deleteStaff(String id) async {
    try {
      final response = await http.delete(Uri.parse('$_baseUrl/$id'));

      if (response.statusCode != 200 && response.statusCode != 204) {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to delete staff');
      }
    } catch (e) {
      print('❌ Error deleting staff: $e');
      rethrow;
    }
  }
}
