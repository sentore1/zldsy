/**
 * Role-Based Access Control (RBAC) System
 * 3-Tier Staff Roles: Admin, Supervisor (Permanent Staff), Normal Staff
 */

export const STAFF_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  STAFF: 'staff',
} as const;

export const STAFF_ROLE_LABELS = {
  [STAFF_ROLES.ADMIN]: 'Administrator',
  [STAFF_ROLES.SUPERVISOR]: 'Supervisor / Permanent Staff',
  [STAFF_ROLES.STAFF]: 'Normal Staff',
} as const;

export const STAFF_ROLE_DESCRIPTIONS = {
  [STAFF_ROLES.ADMIN]: 'Full system access - manage all operations, staff, and settings',
  [STAFF_ROLES.SUPERVISOR]: 'Manage jobs and staff - view reports and oversee operations',
  [STAFF_ROLES.STAFF]: 'Limited access - view assigned jobs and clock in/out',
} as const;

export type StaffRole = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];

/**
 * Permissions for each role
 */
export const PERMISSIONS = {
  // Dashboard & Reports
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Bookings
  VIEW_BOOKINGS: 'view_bookings',
  CREATE_BOOKING: 'create_booking',
  EDIT_BOOKING: 'edit_booking',
  DELETE_BOOKING: 'delete_booking',
  
  // Jobs
  VIEW_ALL_JOBS: 'view_all_jobs',
  VIEW_ASSIGNED_JOBS: 'view_assigned_jobs',
  CREATE_JOB: 'create_job',
  EDIT_JOB: 'edit_job',
  DELETE_JOB: 'delete_job',
  ASSIGN_STAFF: 'assign_staff',
  CLOCK_IN_OUT: 'clock_in_out',
  
  // Customers
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMER: 'create_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  
  // Staff Management
  VIEW_ALL_STAFF: 'view_all_staff',
  CREATE_STAFF: 'create_staff',
  EDIT_STAFF: 'edit_staff',
  DELETE_STAFF: 'delete_staff',
  MANAGE_ROLES: 'manage_roles',
  
  // Services
  VIEW_SERVICES: 'view_services',
  CREATE_SERVICE: 'create_service',
  EDIT_SERVICE: 'edit_service',
  DELETE_SERVICE: 'delete_service',
  
  // Inventory
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  
  // Equipment
  VIEW_EQUIPMENT: 'view_equipment',
  CREATE_EQUIPMENT: 'create_equipment',
  EDIT_EQUIPMENT: 'edit_equipment',
  DELETE_EQUIPMENT: 'delete_equipment',
  
  // Quotations
  VIEW_QUOTATIONS: 'view_quotations',
  CREATE_QUOTATION: 'create_quotation',
  EDIT_QUOTATION: 'edit_quotation',
  DELETE_QUOTATION: 'delete_quotation',
  
  // Invoices
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICE: 'create_invoice',
  EDIT_INVOICE: 'edit_invoice',
  DELETE_INVOICE: 'delete_invoice',
  
  // Payments
  VIEW_PAYMENTS: 'view_payments',
  PROCESS_PAYMENT: 'process_payment',
  REFUND_PAYMENT: 'refund_payment',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role-Permission Mapping
 */
export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  // ADMIN: Full Access
  [STAFF_ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  // SUPERVISOR: Manage jobs, view reports, limited admin
  [STAFF_ROLES.SUPERVISOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.EDIT_BOOKING,
    
    PERMISSIONS.VIEW_ALL_JOBS,
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.ASSIGN_STAFF,
    PERMISSIONS.CLOCK_IN_OUT,
    
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    
    PERMISSIONS.VIEW_ALL_STAFF,
    
    PERMISSIONS.VIEW_SERVICES,
    
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    
    PERMISSIONS.VIEW_EQUIPMENT,
    PERMISSIONS.EDIT_EQUIPMENT,
    
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.EDIT_QUOTATION,
    
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENT,
  ],
  
  // STAFF: Limited to assigned jobs only
  [STAFF_ROLES.STAFF]: [
    PERMISSIONS.VIEW_ASSIGNED_JOBS,
    PERMISSIONS.CLOCK_IN_OUT,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: StaffRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: StaffRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user can access a route based on required permissions
 */
export function canAccessRoute(role: StaffRole, requiredPermissions: Permission[]): boolean {
  if (requiredPermissions.length === 0) return true;
  return hasAnyPermission(role, requiredPermissions);
}

/**
 * Navigation items visibility based on role
 */
export interface NavItem {
  label: string;
  path: string;
  requiredPermissions: Permission[];
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD],
  },
  {
    label: 'Bookings',
    path: '/admin/bookings',
    requiredPermissions: [PERMISSIONS.VIEW_BOOKINGS],
  },
  {
    label: 'Jobs',
    path: '/admin/jobs',
    requiredPermissions: [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.VIEW_ASSIGNED_JOBS],
  },
  {
    label: 'Customers',
    path: '/admin/customers',
    requiredPermissions: [PERMISSIONS.VIEW_CUSTOMERS],
  },
  {
    label: 'Staff',
    path: '/admin/staff',
    requiredPermissions: [PERMISSIONS.VIEW_ALL_STAFF],
  },
  {
    label: 'Services',
    path: '/admin/services',
    requiredPermissions: [PERMISSIONS.VIEW_SERVICES],
  },
  {
    label: 'Inventory',
    path: '/admin/inventory',
    requiredPermissions: [PERMISSIONS.VIEW_INVENTORY],
  },
  {
    label: 'Equipment',
    path: '/admin/equipment',
    requiredPermissions: [PERMISSIONS.VIEW_EQUIPMENT],
  },
  {
    label: 'Quotations',
    path: '/admin/quotations',
    requiredPermissions: [PERMISSIONS.VIEW_QUOTATIONS],
  },
  {
    label: 'Invoices',
    path: '/admin/invoices',
    requiredPermissions: [PERMISSIONS.VIEW_INVOICES],
  },
  {
    label: 'Payments',
    path: '/admin/payments',
    requiredPermissions: [PERMISSIONS.VIEW_PAYMENTS],
  },
  {
    label: 'Reports',
    path: '/admin/reports',
    requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    requiredPermissions: [PERMISSIONS.VIEW_SETTINGS],
  },
];

/**
 * Filter navigation items based on role permissions
 */
export function getVisibleNavItems(role: StaffRole, navItems: NavItem[] = ADMIN_NAV_ITEMS): NavItem[] {
  return navItems.filter(item => canAccessRoute(role, item.requiredPermissions));
}

/**
 * Employment Types
 */
export const EMPLOYMENT_TYPES = {
  PERMANENT: 'permanent',
  CASUAL: 'casual',
  CONTRACT: 'contract',
  PART_TIME: 'part_time',
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  [EMPLOYMENT_TYPES.PERMANENT]: 'Permanent Staff',
  [EMPLOYMENT_TYPES.CASUAL]: 'Casual Staff',
  [EMPLOYMENT_TYPES.CONTRACT]: 'Contract Staff',
  [EMPLOYMENT_TYPES.PART_TIME]: 'Part-Time Staff',
} as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[keyof typeof EMPLOYMENT_TYPES];
