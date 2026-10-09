class Equipment {
  final String id;
  final String name;
  final String? type;
  final String? registrationNumber;
  final String status; // available, in_use, maintenance
  final double? fuelCapacity;
  final bool isActive;
  final DateTime createdAt;

  Equipment({
    required this.id,
    required this.name,
    this.type,
    this.registrationNumber,
    required this.status,
    this.fuelCapacity,
    required this.isActive,
    required this.createdAt,
  });

  factory Equipment.fromJson(Map<String, dynamic> j) => Equipment(
        id: j['id'],
        name: j['name'],
        type: j['type'],
        registrationNumber: j['registration_number'],
        status: j['status'] ?? 'available',
        fuelCapacity: j['fuel_capacity'] != null ? (j['fuel_capacity'] as num).toDouble() : null,
        isActive: j['is_active'] ?? true,
        createdAt: DateTime.parse(j['created_at']),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'type': type,
        'registration_number': registrationNumber,
        'status': status,
        'fuel_capacity': fuelCapacity,
        'is_active': isActive,
      };
}
