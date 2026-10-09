import 'equipment.dart';

class JobEquipment {
  final String id;
  final String jobId;
  final String equipmentId;
  final double fuelUsed;
  final double fuelCost;
  final Equipment? equipment;

  JobEquipment({
    required this.id,
    required this.jobId,
    required this.equipmentId,
    required this.fuelUsed,
    required this.fuelCost,
    this.equipment,
  });

  factory JobEquipment.fromJson(Map<String, dynamic> j) => JobEquipment(
        id: j['id'],
        jobId: j['job_id'],
        equipmentId: j['equipment_id'],
        fuelUsed: (j['fuel_used'] as num?)?.toDouble() ?? 0,
        fuelCost: (j['fuel_cost'] as num?)?.toDouble() ?? 0,
        equipment: j['equipment'] != null ? Equipment.fromJson(j['equipment']) : null,
      );

  Map<String, dynamic> toJson() => {
        'job_id': jobId,
        'equipment_id': equipmentId,
        'fuel_used': fuelUsed,
        'fuel_cost': fuelCost,
      };
}
