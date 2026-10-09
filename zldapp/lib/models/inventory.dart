class Inventory {
  final String id;
  final String name;
  final String? category;
  final String? unit;
  final double quantity;
  final double? unitCost;
  final double? reorderLevel;
  final bool isActive;
  final DateTime createdAt;

  Inventory({
    required this.id,
    required this.name,
    this.category,
    this.unit,
    required this.quantity,
    this.unitCost,
    this.reorderLevel,
    required this.isActive,
    required this.createdAt,
  });

  factory Inventory.fromJson(Map<String, dynamic> j) => Inventory(
        id: j['id'],
        name: j['name'],
        category: j['category'],
        unit: j['unit'],
        quantity: (j['quantity'] as num).toDouble(),
        unitCost: j['unit_cost'] != null ? (j['unit_cost'] as num).toDouble() : null,
        reorderLevel: j['reorder_level'] != null ? (j['reorder_level'] as num).toDouble() : null,
        isActive: j['is_active'] ?? true,
        createdAt: DateTime.parse(j['created_at']),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'category': category,
        'unit': unit,
        'quantity': quantity,
        'unit_cost': unitCost,
        'reorder_level': reorderLevel,
        'is_active': isActive,
      };
}
