import 'staff.dart';
import 'job_material.dart';
import 'job_equipment.dart';

class JobStaff {
  final String id;
  final String jobId;
  final String staffId;
  final String? role;
  final double? hoursWorked;
  final double? laborCost;
  final Staff? staff;

  JobStaff({
    required this.id,
    required this.jobId,
    required this.staffId,
    this.role,
    this.hoursWorked,
    this.laborCost,
    this.staff,
  });

  factory JobStaff.fromJson(Map<String, dynamic> j) => JobStaff(
        id: j['id'],
        jobId: j['job_id'],
        staffId: j['staff_id'],
        role: j['role'],
        hoursWorked: j['hours_worked'] != null ? (j['hours_worked'] as num).toDouble() : null,
        laborCost: j['labor_cost'] != null ? (j['labor_cost'] as num).toDouble() : null,
        staff: j['staff'] != null ? Staff.fromJson(j['staff']) : null,
      );
}

class Job {
  final String id;
  final String? bookingId;
  final String? quotationId;
  final String jobNumber;
  final DateTime? scheduledDate;
  final DateTime? startTime;
  final DateTime? endTime;
  final String status; // pending, scheduled, in_progress, completed, cancelled
  final String? weatherCondition; // dry, wet, rain
  final String? notes;
  final DateTime createdAt;
  final List<JobStaff> staff;
  final List<JobMaterial> materials;
  final List<JobEquipment> equipment;
  final double? servicePrice;

  Job({
    required this.id,
    this.bookingId,
    this.quotationId,
    required this.jobNumber,
    this.scheduledDate,
    this.startTime,
    this.endTime,
    required this.status,
    this.weatherCondition,
    this.notes,
    required this.createdAt,
    this.staff = const [],
    this.materials = const [],
    this.equipment = const [],
    this.servicePrice,
  });

  factory Job.fromJson(Map<String, dynamic> j) => Job(
        id: j['id'],
        bookingId: j['booking_id'],
        quotationId: j['quotation_id'],
        jobNumber: j['job_number'],
        scheduledDate: j['scheduled_date'] != null ? DateTime.parse(j['scheduled_date']) : null,
        startTime: j['start_time'] != null ? DateTime.parse(j['start_time']) : null,
        endTime: j['end_time'] != null ? DateTime.parse(j['end_time']) : null,
        status: j['status'] ?? 'pending',
        weatherCondition: j['weather_condition'],
        notes: j['notes'],
        createdAt: DateTime.parse(j['created_at']),
        staff: (j['job_staff'] as List<dynamic>? ?? [])
            .map((s) => JobStaff.fromJson(s))
            .toList(),
        materials: (j['job_materials'] as List<dynamic>? ?? [])
            .map((m) => JobMaterial.fromJson(m))
            .toList(),
        equipment: (j['job_equipment'] as List<dynamic>? ?? [])
            .map((e) => JobEquipment.fromJson(e))
            .toList(),
        servicePrice: j['booking']?['service']?['base_price'] != null
            ? (j['booking']['service']['base_price'] as num).toDouble()
            : null,
      );

  double get totalLaborCost => staff.fold(0, (sum, s) => sum + (s.laborCost ?? 0));
  double get totalMaterialsCost => materials.fold(0, (sum, m) => sum + m.cost);
  double get totalEquipmentCost => equipment.fold(0, (sum, e) => sum + e.fuelCost);
  double get totalCosts => totalLaborCost + totalMaterialsCost + totalEquipmentCost;
  double get grossProfit => (servicePrice ?? 0) - totalCosts;
  double get profitMargin => servicePrice != null && servicePrice! > 0 
      ? (grossProfit / servicePrice!) * 100 
      : 0;

  Map<String, dynamic> toJson() => {
        'booking_id': bookingId,
        'quotation_id': quotationId,
        'job_number': jobNumber,
        'scheduled_date': scheduledDate?.toIso8601String(),
        'status': status,
        'weather_condition': weatherCondition,
        'notes': notes,
      };
}
