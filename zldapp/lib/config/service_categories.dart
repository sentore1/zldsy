/// Service Categories for ZLD Hub
/// 
/// Main Service Categories:
/// 1. Cleaning and Fumigation Services
/// 2. Maintenance and Renovations Services
/// 3. Gardening and Landscaping
/// 4. Moving and Property Management

class ServiceCategories {
  static const String cleaningFumigation = 'Cleaning and Fumigation';
  static const String maintenanceRenovations = 'Maintenance and Renovations';
  static const String gardeningLandscaping = 'Gardening and Landscaping';
  static const String movingProperty = 'Moving and Property Management';

  static const List<String> all = [
    cleaningFumigation,
    maintenanceRenovations,
    gardeningLandscaping,
    movingProperty,
  ];

  static const Map<String, String> descriptions = {
    cleaningFumigation: 'Professional cleaning, fumigation, pest control, and disinfection services',
    maintenanceRenovations: 'Property maintenance, repairs, renovations, and general upkeep services',
    gardeningLandscaping: 'Garden design, landscaping, lawn care, and outdoor maintenance services',
    movingProperty: 'Moving services, property management, and relocation assistance',
  };

  /// Returns a user-friendly category name
  static String getDisplayName(String category) {
    return category;
  }

  /// Returns the description for a category
  static String getDescription(String category) {
    return descriptions[category] ?? '';
  }

  /// Checks if a category is valid
  static bool isValid(String category) {
    return all.contains(category);
  }
}

/// Example services under each category:
/// 
/// Cleaning and Fumigation:
/// - Residential/Commercial Fumigation
/// - Pest Control (General, Rodents, Termites, Garden)
/// - Deep Cleaning Service
/// - Disinfection Service
/// 
/// Maintenance and Renovations:
/// - General Maintenance and Repairs
/// - Plumbing Services
/// - Electrical Services
/// - Painting and Finishing
/// - Carpentry Services
/// 
/// Gardening and Landscaping:
/// - Garden Design and Installation
/// - Lawn Maintenance
/// - Tree Trimming and Pruning
/// - Irrigation System Installation
/// 
/// Moving and Property Management:
/// - Residential Moving Services
/// - Office Relocation
/// - Property Inspection Services
/// - Property Cleaning for Move-in/Move-out
