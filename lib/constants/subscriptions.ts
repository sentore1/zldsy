/**
 * Subscription and Contract Management System
 * Support for recurring services and permanent contracts
 */

export const SUBSCRIPTION_TYPES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
} as const;

export const CONTRACT_TYPES = {
  PERMANENT: 'permanent',
  FIXED_TERM: 'fixed_term',
  ONE_TIME: 'one_time',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
} as const;

export type SubscriptionType = typeof SUBSCRIPTION_TYPES[keyof typeof SUBSCRIPTION_TYPES];
export type ContractType = typeof CONTRACT_TYPES[keyof typeof CONTRACT_TYPES];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

export const SUBSCRIPTION_TYPE_LABELS = {
  [SUBSCRIPTION_TYPES.WEEKLY]: 'Weekly Service',
  [SUBSCRIPTION_TYPES.MONTHLY]: 'Monthly Service',
  [SUBSCRIPTION_TYPES.YEARLY]: 'Yearly Service',
  [SUBSCRIPTION_TYPES.CUSTOM]: 'Custom Schedule',
} as const;

export const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.PERMANENT]: 'Permanent Contract',
  [CONTRACT_TYPES.FIXED_TERM]: 'Fixed Term Contract',
  [CONTRACT_TYPES.ONE_TIME]: 'One-Time Service',
} as const;

export const SUBSCRIPTION_STATUS_LABELS = {
  [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
  [SUBSCRIPTION_STATUS.PAUSED]: 'Paused',
  [SUBSCRIPTION_STATUS.CANCELLED]: 'Cancelled',
  [SUBSCRIPTION_STATUS.EXPIRED]: 'Expired',
  [SUBSCRIPTION_STATUS.PENDING]: 'Pending',
} as const;

/**
 * Discount rates for subscriptions
 */
export const SUBSCRIPTION_DISCOUNTS = {
  [SUBSCRIPTION_TYPES.WEEKLY]: 0, // No discount for weekly
  [SUBSCRIPTION_TYPES.MONTHLY]: 10, // 10% discount
  [SUBSCRIPTION_TYPES.YEARLY]: 20, // 20% discount
  [SUBSCRIPTION_TYPES.CUSTOM]: 5, // 5% discount
} as const;

/**
 * Billing cycles for subscriptions
 */
export const BILLING_CYCLES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  UPFRONT: 'upfront',
} as const;

export type BillingCycle = typeof BILLING_CYCLES[keyof typeof BILLING_CYCLES];

export const BILLING_CYCLE_LABELS = {
  [BILLING_CYCLES.WEEKLY]: 'Weekly Billing',
  [BILLING_CYCLES.MONTHLY]: 'Monthly Billing',
  [BILLING_CYCLES.QUARTERLY]: 'Quarterly Billing',
  [BILLING_CYCLES.YEARLY]: 'Yearly Billing',
  [BILLING_CYCLES.UPFRONT]: 'Pay Upfront',
} as const;

/**
 * Calculate subscription price with discount
 */
export function calculateSubscriptionPrice(
  basePrice: number,
  subscriptionType: SubscriptionType,
  customDiscount?: number
): number {
  const discount = customDiscount ?? SUBSCRIPTION_DISCOUNTS[subscriptionType];
  const discountAmount = (basePrice * discount) / 100;
  return basePrice - discountAmount;
}

/**
 * Calculate total contract value
 */
export function calculateContractValue(
  pricePerService: number,
  frequency: number, // services per period
  durationMonths: number
): number {
  return pricePerService * frequency * durationMonths;
}

/**
 * Get next service date based on subscription type
 */
export function getNextServiceDate(
  lastServiceDate: Date,
  subscriptionType: SubscriptionType,
  customDays?: number
): Date {
  const next = new Date(lastServiceDate);
  
  switch (subscriptionType) {
    case SUBSCRIPTION_TYPES.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case SUBSCRIPTION_TYPES.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case SUBSCRIPTION_TYPES.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    case SUBSCRIPTION_TYPES.CUSTOM:
      next.setDate(next.getDate() + (customDays || 7));
      break;
  }
  
  return next;
}

/**
 * Check if subscription is due for renewal
 */
export function isSubscriptionDue(
  nextServiceDate: Date,
  bufferDays: number = 3
): boolean {
  const now = new Date();
  const dueDate = new Date(nextServiceDate);
  dueDate.setDate(dueDate.getDate() - bufferDays);
  return now >= dueDate;
}

/**
 * Calculate remaining services in subscription
 */
export function calculateRemainingServices(
  totalServices: number,
  completedServices: number
): number {
  return Math.max(0, totalServices - completedServices);
}

/**
 * Get subscription features by type
 */
export const SUBSCRIPTION_FEATURES = {
  [SUBSCRIPTION_TYPES.WEEKLY]: [
    'Service every week',
    'Consistent schedule',
    'Quick turnaround',
    'Ideal for high-traffic areas',
  ],
  [SUBSCRIPTION_TYPES.MONTHLY]: [
    'Service once per month',
    '10% discount applied',
    'Cost-effective for regular maintenance',
    'Perfect for residential properties',
  ],
  [SUBSCRIPTION_TYPES.YEARLY]: [
    'Annual service contract',
    '20% discount applied',
    'Best value for money',
    'Priority scheduling',
    'Dedicated account manager',
  ],
  [SUBSCRIPTION_TYPES.CUSTOM]: [
    'Flexible scheduling',
    'Customizable frequency',
    '5% discount applied',
    'Tailored to your needs',
  ],
} as const;

/**
 * Contract renewal reminders (days before expiry)
 */
export const RENEWAL_REMINDER_DAYS = {
  FIRST_REMINDER: 30, // 1 month before
  SECOND_REMINDER: 14, // 2 weeks before
  FINAL_REMINDER: 7, // 1 week before
  URGENT_REMINDER: 3, // 3 days before
} as const;

/**
 * Auto-renewal settings
 */
export interface AutoRenewalSettings {
  enabled: boolean;
  notify_before_days: number;
  payment_method?: string;
  max_failed_attempts: number;
}

export const DEFAULT_AUTO_RENEWAL: AutoRenewalSettings = {
  enabled: false,
  notify_before_days: 7,
  max_failed_attempts: 3,
};
