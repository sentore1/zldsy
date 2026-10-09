// Subscription and Contract Management Types

export type BillingCycle = 'weekly' | 'monthly' | 'yearly' | 'permanent';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';

export type ContractType = 'subscription' | 'permanent' | 'fixed_term' | 'maintenance';

export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'completed' | 'terminated' | 'expired';

export type BillingStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'missed';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  service_id?: string;
  
  // Billing configuration
  billing_cycle: BillingCycle;
  price: number;
  setup_fee: number;
  
  // Plan features
  included_visits?: number | null; // NULL for unlimited
  visit_duration?: number;
  priority_level: string;
  
  // Discounts
  discount_percentage: number;
  promotional_price?: number;
  promotion_valid_until?: string;
  
  // Contract terms
  minimum_commitment_months: number;
  cancellation_notice_days: number;
  auto_renewal: boolean;
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  
  created_at: string;
  updated_at: string;
}

export interface CustomerSubscription {
  id: string;
  customer_id: string;
  subscription_plan_id: string;
  
  // Status
  status: SubscriptionStatus;
  
  // Dates
  start_date: string;
  end_date?: string | null;
  next_billing_date?: string | null;
  last_billing_date?: string | null;
  
  // Cancellation
  cancelled_at?: string | null;
  cancelled_by?: string;
  cancellation_reason?: string;
  cancellation_effective_date?: string | null;
  
  // Pricing
  current_price: number;
  discount_applied: number;
  
  // Usage
  visits_used: number;
  visits_remaining?: number | null;
  
  // Payment
  payment_method?: string;
  payment_reference?: string;
  
  // Trial
  is_trial: boolean;
  trial_end_date?: string | null;
  
  // Notes
  notes?: string;
  admin_notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  subscription_plan?: SubscriptionPlan;
  customer?: any;
}

export interface Contract {
  id: string;
  contract_number: string;
  customer_id: string;
  subscription_id?: string | null;
  
  // Type
  contract_type: ContractType;
  
  // Details
  title: string;
  description?: string;
  
  // Dates
  start_date: string;
  end_date?: string | null;
  signed_date?: string | null;
  
  // Parties
  signatory_name?: string;
  signatory_title?: string;
  witness_name?: string;
  
  // Terms
  terms_and_conditions?: string;
  special_clauses?: string;
  
  // Financials
  total_value?: number;
  payment_terms?: string;
  
  // Status
  status: ContractStatus;
  
  // Documents
  pdf_url?: string;
  digital_signature_url?: string;
  
  // Renewal
  auto_renewal: boolean;
  renewal_notice_days: number;
  renewed_from_contract_id?: string | null;
  
  // Termination
  terminated_at?: string | null;
  termination_reason?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  customer?: any;
  subscription?: CustomerSubscription;
}

export interface SubscriptionBilling {
  id: string;
  subscription_id: string;
  invoice_id?: string | null;
  
  // Billing details
  billing_date: string;
  billing_period_start: string;
  billing_period_end: string;
  
  // Amounts
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Status
  status: BillingStatus;
  
  // Payment
  payment_method?: string;
  transaction_id?: string;
  payment_date?: string | null;
  
  // Retry
  retry_count: number;
  next_retry_date?: string | null;
  failure_reason?: string;
  
  // Prorations
  is_prorated: boolean;
  proration_details?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  subscription?: CustomerSubscription;
  invoice?: any;
}

export interface SubscriptionSchedule {
  id: string;
  subscription_id: string;
  job_id?: string | null;
  
  // Schedule
  scheduled_date: string;
  scheduled_time_slot?: string;
  duration_minutes?: number;
  
  // Status
  status: ScheduleStatus;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_rule?: string;
  occurrence_number: number;
  
  // Completion
  completed_at?: string | null;
  completion_notes?: string;
  
  // Rescheduling
  rescheduled_from_id?: string | null;
  rescheduled_to_id?: string | null;
  reschedule_reason?: string;
  
  // Service
  service_type?: string;
  special_instructions?: string;
  
  // Notifications
  reminder_sent: boolean;
  reminder_sent_at?: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  subscription?: CustomerSubscription;
  job?: any;
}

export interface SubscriptionAddon {
  id: string;
  name: string;
  description?: string;
  
  // Pricing
  price: number;
  billing_type: 'one_time' | 'recurring' | 'per_use';
  
  // Compatibility
  applies_to_plans?: string[]; // Array of plan IDs
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionAddonUsage {
  id: string;
  subscription_id: string;
  addon_id: string;
  
  // Usage
  quantity: number;
  price_at_addition: number;
  
  // Status
  is_active: boolean;
  added_at: string;
  removed_at?: string | null;
  
  created_at: string;
  
  // Relations
  addon?: SubscriptionAddon;
}

export interface SubscriptionPause {
  id: string;
  subscription_id: string;
  
  // Pause details
  pause_start_date: string;
  pause_end_date?: string | null;
  reason?: string;
  
  // Status
  status: 'active' | 'completed' | 'cancelled';
  
  // Billing
  billing_suspended: boolean;
  pro_rata_credit: number;
  
  requested_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsageLog {
  id: string;
  subscription_id: string;
  job_id?: string | null;
  
  // Event
  event_type: string;
  event_date: string;
  
  // Quantity
  quantity_used: number;
  unit?: string;
  
  // Details
  description?: string;
  metadata?: Record<string, any>;
  
  created_at: string;
}

// Extended types with relations
export interface SubscriptionPlanWithDetails extends SubscriptionPlan {
  service?: any;
  active_subscriptions_count?: number;
}

export interface CustomerSubscriptionWithDetails extends CustomerSubscription {
  subscription_plan: SubscriptionPlan;
  customer: any;
  schedules?: SubscriptionSchedule[];
  billing_history?: SubscriptionBilling[];
  addons?: SubscriptionAddonUsage[];
  pauses?: SubscriptionPause[];
  contract?: Contract;
}

// Request/Response types
export interface CreateSubscriptionRequest {
  customer_id: string;
  subscription_plan_id: string;
  start_date?: string;
  payment_method?: string;
  is_trial?: boolean;
  trial_end_date?: string;
  notes?: string;
}

export interface UpdateSubscriptionRequest {
  status?: SubscriptionStatus;
  payment_method?: string;
  notes?: string;
  admin_notes?: string;
}

export interface CancelSubscriptionRequest {
  cancellation_reason?: string;
  cancellation_effective_date?: string;
  immediate?: boolean;
}

export interface PauseSubscriptionRequest {
  pause_start_date: string;
  pause_end_date?: string;
  reason?: string;
  billing_suspended?: boolean;
}

export interface CreateContractRequest {
  customer_id: string;
  subscription_id?: string;
  contract_type: ContractType;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  total_value?: number;
  payment_terms?: string;
  terms_and_conditions?: string;
  auto_renewal?: boolean;
}

export interface ProcessBillingRequest {
  subscription_id: string;
  billing_period_start: string;
  billing_period_end: string;
  payment_method?: string;
}

// Dashboard/Analytics types
export interface SubscriptionMetrics {
  total_active: number;
  total_revenue_mrr: number; // Monthly Recurring Revenue
  total_revenue_arr: number; // Annual Recurring Revenue
  churn_rate: number;
  new_this_month: number;
  cancelled_this_month: number;
  by_billing_cycle: {
    weekly: number;
    monthly: number;
    yearly: number;
    permanent: number;
  };
  by_status: {
    active: number;
    paused: number;
    cancelled: number;
    expired: number;
  };
}

export interface UpcomingBilling {
  subscription_id: string;
  customer_name: string;
  plan_name: string;
  next_billing_date: string;
  amount: number;
  payment_method?: string;
}

export interface ExpiringContract {
  contract_id: string;
  contract_number: string;
  customer_name: string;
  end_date: string;
  days_remaining: number;
  auto_renewal: boolean;
}
