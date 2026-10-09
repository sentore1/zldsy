import 'customer.dart';
import 'service.dart';

class Booking {
  final String id;
  final String customerId;
  final String serviceId;
  final DateTime bookingDate;
  final DateTime? preferredDate;
  final String status; // pending, confirmed, cancelled
  final String? notes;
  final DateTime createdAt;
  final Customer? customer;
  final Service? service;

  Booking({
    required this.id,
    required this.customerId,
    required this.serviceId,
    required this.bookingDate,
    this.preferredDate,
    required this.status,
    this.notes,
    required this.createdAt,
    this.customer,
    this.service,
  });

  factory Booking.fromJson(Map<String, dynamic> j) => Booking(
        id: j['id'],
        customerId: j['customer_id'],
        serviceId: j['service_id'],
        bookingDate: DateTime.parse(j['booking_date']),
        preferredDate: j['preferred_date'] != null ? DateTime.parse(j['preferred_date']) : null,
        status: j['status'] ?? 'pending',
        notes: j['notes'],
        createdAt: DateTime.parse(j['created_at']),
        customer: j['customers'] != null ? Customer.fromJson(j['customers']) : null,
        service: j['services'] != null ? Service.fromJson(j['services']) : null,
      );

  Map<String, dynamic> toJson() => {
        'customer_id': customerId,
        'service_id': serviceId,
        'booking_date': bookingDate.toIso8601String(),
        'preferred_date': preferredDate?.toIso8601String(),
        'status': status,
        'notes': notes,
      };
}
