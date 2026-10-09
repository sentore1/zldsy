# Service Categories Implementation Guide

## Overview

ZLD Hub services are now organized into **4 main categories** to make it easier for customers to find and book the services they need.

---

## The 4 Service Categories

### 1. 🧹 Cleaning and Fumigation Services
**Description:** Professional cleaning, fumigation, pest control, and disinfection services

**Example Services:**
- Residential Fumigation
- Commercial Fumigation
- Pest Control (General)
- Rodent Control
- Termite Treatment
- Garden Pest Control
- Deep Cleaning Service
- Disinfection Service
- Office Cleaning
- Post-Construction Cleaning

**Target Customers:**
- Homeowners
- Property managers
- Business owners
- Landlords

---

### 2. 🔧 Maintenance and Renovations Services
**Description:** Property maintenance, repairs, renovations, and general upkeep services

**Example Services:**
- General Maintenance and Repairs
- Plumbing Services
- Electrical Services
- Painting and Finishing
- Carpentry Services
- Roofing Repairs
- Floor Installation
- Door and Window Repairs
- Wall Repairs and Plastering
- HVAC Maintenance

**Target Customers:**
- Property owners
- Facility managers
- Real estate companies
- Hotels and guesthouses

---

### 3. 🌳 Gardening and Landscaping
**Description:** Garden design, landscaping, lawn care, and outdoor maintenance services

**Example Services:**
- Garden Design and Installation
- Lawn Maintenance and Mowing
- Tree Trimming and Pruning
- Hedge Trimming
- Irrigation System Installation
- Garden Pest Control
- Flower Bed Design
- Outdoor Lighting Installation
- Patio and Walkway Installation
- Seasonal Garden Care

**Target Customers:**
- Residential homeowners
- Commercial properties
- Hotels and resorts
- Parks and recreational facilities

---

### 4. 📦 Moving and Property Management
**Description:** Moving services, property management, and relocation assistance

**Example Services:**
- Residential Moving Services
- Office Relocation
- Packing and Unpacking Services
- Property Inspection Services
- Property Cleaning for Move-in/Move-out
- Furniture Assembly/Disassembly
- Property Maintenance Management
- Rental Property Management
- Security Services
- Storage Solutions

**Target Customers:**
- Families relocating
- Businesses moving offices
- Property investors
- Landlords and tenants

---

## How to Use Service Categories

### For Administrators

#### When Creating a New Service:
```typescript
// Web App Example
const newService = {
  name: "Deep Cleaning",
  category: "Cleaning and Fumigation", // Use exact category name
  description: "Professional deep cleaning...",
  basePrice: 100,
  // ... other fields
};
```

```dart
// Mobile App Example
final service = Service(
  name: 'Deep Cleaning',
  category: ServiceCategories.cleaningFumigation, // Use constant
  description: 'Professional deep cleaning...',
  basePrice: 100,
  // ... other fields
);
```

#### When Filtering Services:
```typescript
// Web App
import { SERVICE_CATEGORIES } from '@/lib/constants/service-categories';

const cleaningServices = allServices.filter(
  s => s.category === SERVICE_CATEGORIES.CLEANING_FUMIGATION
);
```

```dart
// Mobile App
import 'package:app/config/service_categories.dart';

final cleaningServices = allServices.where(
  (s) => s.category == ServiceCategories.cleaningFumigation
).toList();
```

---

### For UI Implementation

#### Category Navigation Menu:
```tsx
// Web App Example
const categories = [
  {
    name: SERVICE_CATEGORIES.CLEANING_FUMIGATION,
    icon: '🧹',
    description: SERVICE_CATEGORY_DESCRIPTIONS[SERVICE_CATEGORIES.CLEANING_FUMIGATION]
  },
  {
    name: SERVICE_CATEGORIES.MAINTENANCE_RENOVATIONS,
    icon: '🔧',
    description: SERVICE_CATEGORY_DESCRIPTIONS[SERVICE_CATEGORIES.MAINTENANCE_RENOVATIONS]
  },
  // ... etc
];
```

#### Category Cards Display:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {Object.values(SERVICE_CATEGORIES).map(category => (
    <CategoryCard
      key={category}
      name={category}
      description={SERVICE_CATEGORY_DESCRIPTIONS[category]}
      serviceCount={getServiceCount(category)}
    />
  ))}
</div>
```

---

## Database Schema

### Existing Services Table
No changes required to the database schema. The `category` field already exists:

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- Use new category names here
  base_price DECIMAL(10, 2),
  -- ... other fields
);
```

### Updating Existing Services

#### SQL Migration (Optional):
```sql
-- Update existing services to use new categories
UPDATE services 
SET category = 'Cleaning and Fumigation'
WHERE category IN ('Fumigation', 'Pest Control', 'Cleaning');

UPDATE services 
SET category = 'Maintenance and Renovations'
WHERE category IN ('Maintenance', 'Repairs', 'Renovation');

UPDATE services 
SET category = 'Gardening and Landscaping'
WHERE category IN ('Landscaping', 'Garden', 'Lawn Care');

UPDATE services 
SET category = 'Moving and Property Management'
WHERE category IN ('Moving', 'Property Management', 'Relocation');
```

---

## Customer-Facing Features

### 1. Browse Services by Category
Allow customers to filter services by category:

```
🧹 Cleaning & Fumigation (15 services)
🔧 Maintenance & Renovations (12 services)
🌳 Gardening & Landscaping (8 services)
📦 Moving & Property Management (6 services)
```

### 2. Category Landing Pages
Create dedicated pages for each category:
- `/customer/services/cleaning-fumigation`
- `/customer/services/maintenance-renovations`
- `/customer/services/gardening-landscaping`
- `/customer/services/moving-property`

### 3. Quick Book by Category
Add quick booking shortcuts:
```
"Need pest control?" → Quick book from Cleaning & Fumigation
"Planning a move?" → Quick book from Moving & Property
```

---

## Marketing & SEO Benefits

### Category-Based Content
Each category can have:
- Dedicated landing pages
- Category-specific blog posts
- FAQ sections
- Customer testimonials
- Service packages/bundles

### SEO Keywords
- Cleaning and fumigation services Kigali
- Property maintenance Rwanda
- Landscaping services Kigali
- Moving services Rwanda

### Social Media
Create category-specific content:
- #CleaningTips #PestControl
- #HomeMaintenance #PropertyCare
- #GardenDesign #Landscaping
- #MovingTips #Relocation

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Define service categories
- ✅ Create constants files
- ✅ Update Terms & Conditions
- ⏳ Update admin UI to use categories

### Phase 2 (Next)
- Add category filtering in customer app
- Create category landing pages
- Add category icons and branding
- Implement category-based search

### Phase 3 (Future)
- Service bundles by category
- Category-specific pricing tiers
- Seasonal promotions per category
- Category performance analytics

---

## Best Practices

### ✅ DO:
- Use the constants from the imported files (don't hardcode strings)
- Be consistent across web and mobile apps
- Keep category names clear and customer-friendly
- Group related services logically

### ❌ DON'T:
- Create new categories without discussion
- Use abbreviations or acronyms in category names
- Duplicate services across multiple categories
- Make categories too granular (stick to 4-6 max)

---

## Constants Reference

### Web App (`lib/constants/service-categories.ts`)
```typescript
export const SERVICE_CATEGORIES = {
  CLEANING_FUMIGATION: 'Cleaning and Fumigation',
  MAINTENANCE_RENOVATIONS: 'Maintenance and Renovations',
  GARDENING_LANDSCAPING: 'Gardening and Landscaping',
  MOVING_PROPERTY: 'Moving and Property Management',
} as const;
```

### Mobile App (`zldapp/lib/config/service_categories.dart`)
```dart
class ServiceCategories {
  static const String cleaningFumigation = 'Cleaning and Fumigation';
  static const String maintenanceRenovations = 'Maintenance and Renovations';
  static const String gardeningLandscaping = 'Gardening and Landscaping';
  static const String movingProperty = 'Moving and Property Management';
}
```

---

## Support

For questions about implementing service categories:
1. Review this guide
2. Check the constants files
3. Review existing service implementations
4. Contact the development team

**Last Updated:** January 2025
