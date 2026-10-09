class Staff {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? role;
  final double? hourlyRate;
  final bool isActive;
  final DateTime createdAt;

  Staff({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.role,
    this.hourlyRate,
    required this.isActive,
    required this.createdAt,
  });

  factory Staff.fromJson(Map<String, dynamic> j) => Staff(
        id: j['id'],
        name: j['name'],
        email: j['email'],
        phone: j['phone'],
        role: j['role'],
        hourlyRate: j['hourly_rate'] != null ? (j['hourly_rate'] as num).toDouble() : null,
        isActive: j['is_active'] ?? true,
        createdAt: DateTime.parse(j['created_at']),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'hourly_rate': hourlyRate,
        'is_active': isActive,
      };
}
