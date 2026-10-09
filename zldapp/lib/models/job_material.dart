import 'inventory.dart';

class JobMaterial {
  final String id;
  final String jobId;
  final String inventoryId;
  final double quantity;
  final double cost;
  final Inventory? inventory;

  JobMaterial({
    required this.id,
    required this.jobId,
    required this.inventoryId,
    required this.quantity,
    required this.cost,
    this.inventory,
  });

  factory JobMaterial.fromJson(Map<String, dynamic> j) => JobMaterial(
        id: j['id'],
        jobId: j['job_id'],
        inventoryId: j['inventory_id'],
        quantity: (j['quantity'] as num).toDouble(),
        cost: (j['cost'] as num).toDouble(),
        inventory: j['inventory'] != null ? Inventory.fromJson(j['inventory']) : null,
      );

  Map<String, dynamic> toJson() => {
        'job_id': jobId,
        'inventory_id': inventoryId,
        'quantity': quantity,
        'cost': cost,
      };
}
