/**
 * Service Categories for ZLD Hub
 * 
 * Main Service Categories:
 * 1. Cleaning and Fumigation Services
 * 2. Maintenance and Renovations Services
 * 3. Gardening and Landscaping
 * 4. Moving and Property Management
 */

export const SERVICE_CATEGORIES = {
  CLEANING_FUMIGATION: 'Cleaning and Fumigation',
  MAINTENANCE_RENOVATIONS: 'Maintenance and Renovations',
  GARDENING_LANDSCAPING: 'Gardening and Landscaping',
  MOVING_PROPERTY: 'Moving and Property Management',
} as const;

export const SERVICE_CATEGORY_DESCRIPTIONS = {
  [SERVICE_CATEGORIES.CLEANING_FUMIGATION]: 'Professional cleaning, fumigation, pest control, and disinfection services',
  [SERVICE_CATEGORIES.MAINTENANCE_RENOVATIONS]: 'Property maintenance, repairs, renovations, and general upkeep services',
  [SERVICE_CATEGORIES.GARDENING_LANDSCAPING]: 'Garden design, landscaping, lawn care, and outdoor maintenance services',
  [SERVICE_CATEGORIES.MOVING_PROPERTY]: 'Moving services, property management, and relocation assistance',
} as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];

/**
 * Example services under each category:
 * 
 * Cleaning and Fumigation:
 * - Residential/Commercial Fumigation
 * - Pest Control (General, Rodents, Termites, Garden)
 * - Deep Cleaning Service
 * - Disinfection Service
 * 
 * Maintenance and Renovations:
 * - General Maintenance and Repairs
 * - Plumbing Services
 * - Electrical Services
 * - Painting and Finishing
 * - Carpentry Services
 * 
 * Gardening and Landscaping:
 * - Garden Design and Installation
 * - Lawn Maintenance
 * - Tree Trimming and Pruning
 * - Irrigation System Installation
 * 
 * Moving and Property Management:
 * - Residential Moving Services
 * - Office Relocation
 * - Property Inspection Services
 * - Property Cleaning for Move-in/Move-out
 */
