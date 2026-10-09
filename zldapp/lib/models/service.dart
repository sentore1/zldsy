class Service {
  final String id;
  final String name;
  final String? description;
  final double basePrice;
  final String? unit;
  final bool isActive;
  final String? category;
  final String? imageUrl;
  final DateTime createdAt;

  Service({
    required this.id,
    required this.name,
    this.description,
    required this.basePrice,
    this.unit,
    required this.isActive,
    this.category,
    this.imageUrl,
    required this.createdAt,
  });

  factory Service.fromJson(Map<String, dynamic> j) => Service(
        id: j['id'],
        name: j['name'],
        description: j['description'],
        basePrice: (j['base_price'] as num).toDouble(),
        unit: j['unit'],
        isActive: j['is_active'] ?? true,
        category: j['category'],
        imageUrl: j['image_url'],
        createdAt: DateTime.parse(j['created_at']),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'base_price': basePrice,
        'unit': unit,
        'is_active': isActive,
        'category': category,
      };
}
