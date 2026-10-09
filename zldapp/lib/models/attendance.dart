import 'staff.dart';

class Attendance {
  final String id;
  final String staffId;
  final DateTime date;
  final String status; // present, absent, leave
  final DateTime? checkIn;
  final DateTime? checkOut;
  final DateTime createdAt;
  final Staff? staff;

  Attendance({
    required this.id,
    required this.staffId,
    required this.date,
    required this.status,
    this.checkIn,
    this.checkOut,
    required this.createdAt,
    this.staff,
  });

  factory Attendance.fromJson(Map<String, dynamic> j) => Attendance(
        id: j['id'],
        staffId: j['staff_id'],
        date: DateTime.parse(j['date']),
        status: j['status'] ?? 'present',
        checkIn: j['check_in'] != null ? DateTime.parse(j['check_in']) : null,
        checkOut: j['check_out'] != null ? DateTime.parse(j['check_out']) : null,
        createdAt: DateTime.parse(j['created_at']),
        staff: j['staff'] != null ? Staff.fromJson(j['staff']) : null,
      );
}
