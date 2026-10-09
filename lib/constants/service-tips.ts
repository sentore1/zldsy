/**
 * Service Tips and Advice
 * Provide maintenance tips to customers based on service type
 */

export interface ServiceTip {
  id: string;
  category: string;
  title: string;
  description: string;
  tips: string[];
  icon?: string;
  priority?: number;
}

/**
 * Tips organized by service category
 */
export const SERVICE_TIPS: Record<string, ServiceTip[]> = {
  // Cleaning and Fumigation Services
  'Cleaning and Fumigation': [
    {
      id: 'cleaning-maintenance',
      category: 'Cleaning and Fumigation',
      title: 'Maintaining a Clean Home',
      description: 'Keep your home fresh and clean between professional services',
      icon: '🧹',
      priority: 1,
      tips: [
        'Vacuum carpets and rugs at least twice a week to prevent dust buildup',
        'Wipe down kitchen counters and surfaces daily with a damp cloth',
        'Clean spills immediately to prevent stains from setting',
        'Use doormats at all entrances to reduce dirt tracked inside',
        'Empty trash bins daily to prevent odors and pest attraction',
        'Open windows regularly for fresh air circulation',
        'Deep clean bathrooms weekly with appropriate disinfectants',
        'Dust ceiling fans, light fixtures, and high surfaces monthly',
      ],
    },
    {
      id: 'fumigation-prevention',
      category: 'Cleaning and Fumigation',
      title: 'Preventing Pest Infestations',
      description: 'Simple steps to keep insects and pests away',
      icon: '🐛',
      priority: 1,
      tips: [
        'Store food in airtight containers to prevent pest access',
        'Keep kitchen counters clean and free of food crumbs',
        'Take out garbage regularly and use bins with tight-fitting lids',
        'Fix any water leaks immediately - pests are attracted to moisture',
        'Seal cracks and gaps around windows, doors, and pipes',
        'Remove standing water from plant saucers and drains',
        'Keep pet food in sealed containers and clean bowls daily',
        'Store firewood away from the house exterior',
        'Trim bushes and trees away from the house',
        'Schedule regular professional fumigation every 3-6 months',
      ],
    },
    {
      id: 'fumigation-safety',
      category: 'Cleaning and Fumigation',
      title: 'Post-Fumigation Care',
      description: 'What to do after fumigation service',
      icon: '⚠️',
      priority: 2,
      tips: [
        'Wait the recommended time (usually 2-4 hours) before re-entering',
        'Ventilate the property by opening windows and doors for 30 minutes',
        'Wipe down food preparation surfaces before use',
        'Wash any exposed dishes, utensils, or cookware',
        'Keep children and pets away until fully ventilated',
        'Monitor for dead pests and dispose of them properly',
        'Contact us immediately if you experience any unusual symptoms',
        'Schedule follow-up treatment if recommended',
      ],
    },
    {
      id: 'disinfection-tips',
      category: 'Cleaning and Fumigation',
      title: 'Daily Disinfection Practices',
      description: 'Stay healthy with proper disinfection',
      icon: '🦠',
      priority: 3,
      tips: [
        'Disinfect high-touch surfaces daily (doorknobs, light switches, phones)',
        'Use EPA-approved disinfectants for best results',
        'Allow disinfectant to sit for the recommended contact time',
        'Wash hands frequently with soap and water for 20 seconds',
        'Clean and disinfect bathrooms regularly',
        'Change bed linens and towels weekly',
        'Sanitize kitchen sponges by microwaving or replacing weekly',
        'Use separate cutting boards for raw meat and vegetables',
      ],
    },
  ],

  // Maintenance and Renovations Services
  'Maintenance and Renovations': [
    {
      id: 'maintenance-schedule',
      category: 'Maintenance and Renovations',
      title: 'Home Maintenance Schedule',
      description: 'Regular maintenance prevents costly repairs',
      icon: '🔧',
      priority: 1,
      tips: [
        'Check and clean gutters every 3 months to prevent water damage',
        'Test smoke detectors and carbon monoxide alarms monthly',
        'Replace HVAC filters every 1-3 months for efficiency',
        'Inspect plumbing for leaks and drips monthly',
        'Check electrical outlets and switches for proper function',
        'Seal cracks in walls and foundations to prevent water intrusion',
        'Service your water heater annually',
        'Inspect roof for damaged or missing shingles twice yearly',
        'Clean dryer vents every 6 months to prevent fire hazards',
        'Lubricate door hinges and locks annually',
      ],
    },
    {
      id: 'plumbing-care',
      category: 'Maintenance and Renovations',
      title: 'Plumbing Maintenance Tips',
      description: 'Prevent plumbing problems before they start',
      icon: '🚰',
      priority: 2,
      tips: [
        'Never pour grease or oil down drains',
        'Use drain strainers to catch hair and debris',
        'Run water for a few seconds after using garbage disposal',
        'Avoid flushing non-biodegradable items down toilets',
        'Check for slow drains and address them early',
        'Know where your main water shut-off valve is located',
        'Insulate pipes in cold areas to prevent freezing',
        'Watch for signs of leaks (water stains, musty odors, mold)',
        'Don't overtighten faucet handles',
        'Schedule professional drain cleaning annually',
      ],
    },
    {
      id: 'electrical-safety',
      category: 'Maintenance and Renovations',
      title: 'Electrical Safety Tips',
      description: 'Keep your home electrically safe',
      icon: '⚡',
      priority: 2,
      tips: [
        'Never overload electrical outlets or power strips',
        'Replace frayed or damaged electrical cords immediately',
        'Use the correct wattage bulbs in light fixtures',
        'Install GFCI outlets in bathrooms, kitchens, and outdoor areas',
        'Keep electrical devices away from water sources',
        'Unplug appliances during thunderstorms',
        'Have a licensed electrician inspect your home every 10 years',
        'Test circuit breakers annually',
        'Never attempt electrical repairs unless qualified',
        'Install surge protectors for sensitive electronics',
      ],
    },
    {
      id: 'painting-care',
      category: 'Maintenance and Renovations',
      title: 'Maintaining Your Paint Job',
      description: 'Keep walls looking fresh longer',
      icon: '🎨',
      priority: 3,
      tips: [
        'Clean walls gently with a damp cloth and mild soap',
        'Touch up small scratches and chips promptly',
        'Avoid placing furniture directly against freshly painted walls',
        'Use proper ventilation to prevent moisture damage',
        'Keep paint samples for future touch-ups',
        'Repaint high-traffic areas every 3-5 years',
        'Address water damage immediately to prevent staining',
        'Use washable paint in kitchens and bathrooms',
      ],
    },
  ],

  // Gardening and Landscaping
  'Gardening and Landscaping': [
    {
      id: 'lawn-care',
      category: 'Gardening and Landscaping',
      title: 'Lawn Care Basics',
      description: 'Maintain a healthy, green lawn',
      icon: '🌱',
      priority: 1,
      tips: [
        'Water lawn early in the morning for best absorption',
        'Mow regularly but never cut more than 1/3 of grass height',
        'Keep mower blades sharp for clean cuts',
        'Leave grass clippings on lawn as natural fertilizer',
        'Aerate lawn annually to improve soil health',
        'Apply fertilizer according to grass type and season',
        'Reseed bare patches promptly',
        'Control weeds early before they spread',
        'Water deeply but less frequently to encourage deep roots',
        'Adjust watering based on rainfall',
      ],
    },
    {
      id: 'plant-care',
      category: 'Gardening and Landscaping',
      title: 'Garden Plant Care',
      description: 'Help your plants thrive',
      icon: '🌺',
      priority: 2,
      tips: [
        'Water plants in the morning or evening to reduce evaporation',
        'Mulch around plants to retain moisture and prevent weeds',
        'Deadhead flowers regularly to encourage more blooms',
        'Prune dead or diseased branches promptly',
        'Fertilize plants according to their specific needs',
        'Rotate annual plants to prevent soil depletion',
        'Check plants regularly for pests and diseases',
        'Group plants with similar water needs together',
        'Use compost to improve soil quality',
        'Protect tender plants from frost',
      ],
    },
    {
      id: 'tree-care',
      category: 'Gardening and Landscaping',
      title: 'Tree and Shrub Maintenance',
      description: 'Keep trees healthy and beautiful',
      icon: '🌳',
      priority: 2,
      tips: [
        'Water trees deeply during dry periods',
        'Apply mulch around tree base but not touching trunk',
        'Prune dead or crossing branches to maintain structure',
        'Remove suckers and water sprouts regularly',
        'Inspect trees for signs of disease or pest damage',
        'Avoid damaging tree bark with lawn equipment',
        'Stake young trees only if necessary',
        'Fertilize trees in early spring',
        'Have large trees inspected by professionals annually',
        'Never top trees - use proper pruning techniques',
      ],
    },
    {
      id: 'pest-control-garden',
      category: 'Gardening and Landscaping',
      title: 'Garden Pest Management',
      description: 'Protect your garden naturally',
      icon: '🐞',
      priority: 3,
      tips: [
        'Encourage beneficial insects like ladybugs and lacewings',
        'Use companion planting to deter pests naturally',
        'Remove diseased plants promptly to prevent spread',
        'Hand-pick large pests like caterpillars when possible',
        'Use organic pesticides as a last resort',
        'Maintain healthy soil for stronger, pest-resistant plants',
        'Rotate crops in vegetable gardens',
        'Keep garden clean and free of debris',
        'Use row covers to protect vulnerable plants',
        'Monitor plants regularly for early pest detection',
      ],
    },
  ],

  // Moving and Property Management
  'Moving and Property Management': [
    {
      id: 'moving-checklist',
      category: 'Moving and Property Management',
      title: 'Moving Day Checklist',
      description: 'Make your move smooth and organized',
      icon: '📦',
      priority: 1,
      tips: [
        'Start packing non-essential items 2-3 weeks before move',
        'Label all boxes with contents and destination room',
        'Keep important documents and valuables with you',
        'Take photos of electronic connections before disconnecting',
        'Pack a "first day" box with essentials',
        'Notify utilities, post office, and banks of address change',
        'Clean your old home thoroughly after moving out',
        'Inspect furniture for damage before moving',
        'Confirm moving company details 24 hours before',
        'Keep inventory list of all boxes and items',
      ],
    },
    {
      id: 'property-security',
      category: 'Moving and Property Management',
      title: 'Home Security Basics',
      description: 'Keep your property safe and secure',
      icon: '🔒',
      priority: 2,
      tips: [
        'Install deadbolt locks on all exterior doors',
        'Ensure windows have proper locks and use them',
        'Install motion-sensor lighting around property',
        'Trim bushes and trees near windows and doors',
        'Never hide spare keys outside',
        'Install a security system or cameras',
        'Get to know your neighbors',
        'Don't advertise vacations on social media',
        'Use timers on lights when away',
        'Keep garage doors closed and locked',
      ],
    },
    {
      id: 'property-inspection',
      category: 'Moving and Property Management',
      title: 'Regular Property Inspections',
      description: 'Catch problems early with regular checks',
      icon: '🔍',
      priority: 3,
      tips: [
        'Walk around property exterior monthly',
        'Check for signs of water damage or leaks',
        'Inspect foundation for cracks',
        'Test all locks and security features',
        'Check attic and basement for moisture or pests',
        'Inspect roof from ground level',
        'Test all smoke and CO detectors',
        'Check HVAC system performance',
        'Look for signs of pest activity',
        'Document any issues with photos and dates',
      ],
    },
  ],
};

/**
 * Get tips for a specific service category
 */
export function getTipsByCategory(category: string): ServiceTip[] {
  return SERVICE_TIPS[category] || [];
}

/**
 * Get all tips across all categories
 */
export function getAllTips(): ServiceTip[] {
  return Object.values(SERVICE_TIPS).flat();
}

/**
 * Search tips by keyword
 */
export function searchTips(keyword: string): ServiceTip[] {
  const lowerKeyword = keyword.toLowerCase();
  return getAllTips().filter(
    (tip) =>
      tip.title.toLowerCase().includes(lowerKeyword) ||
      tip.description.toLowerCase().includes(lowerKeyword) ||
      tip.tips.some((t) => t.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get featured tips (high priority)
 */
export function getFeaturedTips(): ServiceTip[] {
  return getAllTips()
    .filter((tip) => tip.priority === 1)
    .sort((a, b) => (a.category.localeCompare(b.category)));
}

/**
 * Get tips relevant to completed service
 */
export function getTipsForService(serviceCategory: string): ServiceTip[] {
  const categoryTips = getTipsByCategory(serviceCategory);
  // Return high priority tips first
  return categoryTips.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}
