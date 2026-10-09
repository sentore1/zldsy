import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/subscription.dart';

class SubscriptionService {
  // Get all subscription plans
  static Future<List<SubscriptionPlan>> getSubscriptionPlans({
    String? billingCycle,
    bool? isActive,
    bool? isFeatured,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (billingCycle != null) queryParams['billing_cycle'] = billingCycle;
      if (isActive != null) queryParams['is_active'] = isActive.toString();
      if (isFeatured != null) queryParams['is_featured'] = isFeatured.toString();

      final uri = Uri.parse('${ApiConfig.baseUrl}/subscriptions/plans')
          .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => SubscriptionPlan.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load subscription plans');
      }
    } catch (e) {
      print('Error fetching subscription plans: $e');
      rethrow;
    }
  }

  // Get all customer subscriptions
  static Future<List<CustomerSubscription>> getSubscriptions({
    String? customerId,
    String? status,
    String? planId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (customerId != null) queryParams['customer_id'] = customerId;
      if (status != null) queryParams['status'] = status;
      if (planId != null) queryParams['plan_id'] = planId;

      final uri = Uri.parse('${ApiConfig.baseUrl}/subscriptions')
          .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CustomerSubscription.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load subscriptions');
      }
    } catch (e) {
      print('Error fetching subscriptions: $e');
      rethrow;
    }
  }

  // Get subscription by ID
  static Future<CustomerSubscription> getSubscriptionById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions/$id'),
      );

      if (response.statusCode == 200) {
        return CustomerSubscription.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load subscription');
      }
    } catch (e) {
      print('Error fetching subscription: $e');
      rethrow;
    }
  }

  // Create new subscription
  static Future<CustomerSubscription> createSubscription({
    required String customerId,
    required String subscriptionPlanId,
    String? startDate,
    String? paymentMethod,
    bool isTrial = false,
    String? trialEndDate,
    String? notes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'customer_id': customerId,
          'subscription_plan_id': subscriptionPlanId,
          'start_date': startDate ?? DateTime.now().toIso8601String(),
          'payment_method': paymentMethod,
          'is_trial': isTrial,
          'trial_end_date': trialEndDate,
          'notes': notes,
        }),
      );

      if (response.statusCode == 201) {
        return CustomerSubscription.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create subscription');
      }
    } catch (e) {
      print('Error creating subscription: $e');
      rethrow;
    }
  }

  // Update subscription
  static Future<CustomerSubscription> updateSubscription(
    String id, {
    String? status,
    String? paymentMethod,
    String? notes,
    String? adminNotes,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (status != null) body['status'] = status;
      if (paymentMethod != null) body['payment_method'] = paymentMethod;
      if (notes != null) body['notes'] = notes;
      if (adminNotes != null) body['admin_notes'] = adminNotes;

      final response = await http.patch(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        return CustomerSubscription.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to update subscription');
      }
    } catch (e) {
      print('Error updating subscription: $e');
      rethrow;
    }
  }

  // Cancel subscription
  static Future<Map<String, dynamic>> cancelSubscription(
    String id, {
    bool immediate = false,
    String? reason,
  }) async {
    try {
      final queryParams = <String, String>{
        'immediate': immediate.toString(),
      };
      if (reason != null) queryParams['reason'] = reason;

      final uri = Uri.parse('${ApiConfig.baseUrl}/subscriptions/$id')
          .replace(queryParameters: queryParams);

      final response = await http.delete(uri);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to cancel subscription');
      }
    } catch (e) {
      print('Error cancelling subscription: $e');
      rethrow;
    }
  }

  // Pause subscription
  static Future<Map<String, dynamic>> pauseSubscription(
    String id, {
    required String pauseStartDate,
    String? pauseEndDate,
    String? reason,
    bool billingSuspended = true,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions/$id/pause'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'pause_start_date': pauseStartDate,
          'pause_end_date': pauseEndDate,
          'reason': reason,
          'billing_suspended': billingSuspended,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to pause subscription');
      }
    } catch (e) {
      print('Error pausing subscription: $e');
      rethrow;
    }
  }

  // Resume subscription
  static Future<Map<String, dynamic>> resumeSubscription(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions/$id/pause'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to resume subscription');
      }
    } catch (e) {
      print('Error resuming subscription: $e');
      rethrow;
    }
  }

  // Get all contracts
  static Future<List<Contract>> getContracts({
    String? customerId,
    String? status,
    String? contractType,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (customerId != null) queryParams['customer_id'] = customerId;
      if (status != null) queryParams['status'] = status;
      if (contractType != null) queryParams['contract_type'] = contractType;

      final uri = Uri.parse('${ApiConfig.baseUrl}/contracts')
          .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Contract.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load contracts');
      }
    } catch (e) {
      print('Error fetching contracts: $e');
      rethrow;
    }
  }

  // Create contract
  static Future<Contract> createContract({
    required String customerId,
    String? subscriptionId,
    required String contractType,
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    double? totalValue,
    String? paymentTerms,
    String? termsAndConditions,
    bool autoRenewal = false,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/contracts'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'customer_id': customerId,
          'subscription_id': subscriptionId,
          'contract_type': contractType,
          'title': title,
          'description': description,
          'start_date': startDate,
          'end_date': endDate,
          'total_value': totalValue,
          'payment_terms': paymentTerms,
          'terms_and_conditions': termsAndConditions,
          'auto_renewal': autoRenewal,
        }),
      );

      if (response.statusCode == 201) {
        return Contract.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create contract');
      }
    } catch (e) {
      print('Error creating contract: $e');
      rethrow;
    }
  }

  // Process billing for subscription
  static Future<Map<String, dynamic>> processBilling({
    String? subscriptionId,
    String? paymentMethod,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (subscriptionId != null) body['subscription_id'] = subscriptionId;
      if (paymentMethod != null) body['payment_method'] = paymentMethod;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/subscriptions/billing/process'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to process billing');
      }
    } catch (e) {
      print('Error processing billing: $e');
      rethrow;
    }
  }

  // Get upcoming billing summary
  static Future<Map<String, dynamic>> getUpcomingBilling({int days = 7}) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/subscriptions/billing/process')
          .replace(queryParameters: {'days': days.toString()});

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load upcoming billing');
      }
    } catch (e) {
      print('Error fetching upcoming billing: $e');
      rethrow;
    }
  }
}
