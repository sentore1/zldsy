export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  unit?: string;
  is_active: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  preferred_date?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  service?: Service;
}

export interface BookingPhoto {
  id: string;
  booking_id: string;
  photo_url: string;
  description?: string;
  uploaded_at: string;
}

export interface Quotation {
  id: string;
  booking_id: string;
  quotation_number: string;
  total_amount: number;
  subtotal?: number; // Amount before tax
  discount: number;
  tax: number;
  tax_amount?: number; // Calculated tax amount
  tax_rate?: number; // Tax rate percentage
  tax_type?: 'vat' | 'withholding' | 'excise' | 'none';
  business_tin?: string; // Business Tax ID
  final_amount: number;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  qr_code?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
  booking?: Booking;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string; // Job role (technician, driver, etc.)
  system_role?: 'admin' | 'supervisor' | 'staff'; // System access role
  employment_type?: 'permanent' | 'casual' | 'contract' | 'part_time';
  hourly_rate?: number;
  date_hired?: string;
  date_terminated?: string;
  can_login?: boolean;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  service_id: string;
  subscription_type: 'weekly' | 'monthly' | 'yearly' | 'custom';
  contract_type: 'permanent' | 'fixed_term' | 'one_time';
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  next_service_date?: string;
  custom_frequency_days?: number;
  base_price: number;
  discount_percentage?: number;
  discounted_price?: number;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'upfront';
  total_services?: number;
  completed_services: number;
  remaining_services?: number;
  payment_method?: string;
  auto_renewal: boolean;
  auto_renewal_notify_days?: number;
  notes?: string;
  terms_accepted: boolean;
  terms_accepted_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  // Relations
  customer?: Customer;
  service?: Service;
}

export interface SubscriptionHistory {
  id: string;
  subscription_id: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  service_date?: string;
  job_id?: string;
  amount_charged?: number;
  payment_status?: string;
  notes?: string;
  performed_by?: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  job_id?: string;
  booking_id?: string;
  customer_id: string;
  service_id?: string;
  rating: number;
  service_quality_rating?: number;
  staff_professionalism_rating?: number;
  timeliness_rating?: number;
  value_for_money_rating?: number;
  review_title?: string;
  review_text?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  would_recommend?: boolean;
  photo_urls?: string[];
  company_response?: string;
  company_response_date?: string;
  company_response_by?: string;
  status: 'pending' | 'approved' | 'flagged' | 'hidden';
  is_public: boolean;
  is_featured: boolean;
  submitted_at: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  service?: Service;
  job?: Job;
}

export interface Job {
  id: string;
  booking_id?: string;
  quotation_id?: string;
  job_number: string;
  scheduled_date?: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  weather_condition?: 'dry' | 'wet' | 'rain';
  notes?: string;
  created_at: string;
  updated_at: string;
  booking?: Booking;
  quotation?: Quotation;
  staff?: JobStaff[];
  materials?: JobMaterial[];
  equipment?: JobEquipment[];
}

export interface JobStaff {
  id: string;
  job_id: string;
  staff_id: string;
  role?: string;
  hours_worked?: number;
  labor_cost?: number;
  created_at: string;
  staff?: Staff;
}

export interface Inventory {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  unit_cost?: number;
  reorder_level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobMaterial {
  id: string;
  job_id: string;
  inventory_id: string;
  quantity: number;
  cost?: number;
  created_at: string;
  inventory?: Inventory;
}

export interface Equipment {
  id: string;
  name: string;
  type?: string;
  registration_number?: string;
  status: 'available' | 'in_use' | 'maintenance';
  fuel_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobEquipment {
  id: string;
  job_id: string;
  equipment_id: string;
  fuel_used?: number;
  fuel_cost?: number;
  created_at: string;
  equipment?: Equipment;
}

export interface Invoice {
  id: string;
  job_id?: string;
  invoice_number: string;
  total_amount: number;
  subtotal?: number; // Amount before tax
  tax: number;
  tax_amount?: number; // Calculated tax amount
  tax_rate?: number; // Tax rate percentage
  tax_type?: 'vat' | 'withholding' | 'excise' | 'none';
  business_tin?: string; // Business Tax ID
  discount: number;
  final_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  due_date?: string;
  paid_date?: string;
  payment_method?: string;
  qr_code?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method?: string;
  transaction_reference?: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  job_id?: string;
  customer_id?: string;
  rating: number;
  comment?: string;
  google_review_submitted: boolean;
  created_at: string;
  customer?: Customer;
  job?: Job;
}

export interface Expense {
  id: string;
  job_id?: string;
  category?: string;
  description?: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  staff_id: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  check_in?: string;
  check_out?: string;
  created_at: string;
  staff?: Staff;
}

export interface DashboardStats {
  todaysJobs: number;
  ongoingServices: number;
  tomorrowSchedule: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

// Tax Configuration
export interface TaxConfiguration {
  id: string;
  enabled: boolean;
  rate: number;
  tax_type: 'vat' | 'withholding' | 'excise' | 'none';
  tax_id?: string; // Business TIN (Tax Identification Number)
  company_name?: string;
  apply_to_services: boolean;
  apply_to_materials: boolean;
  apply_to_labor: boolean;
  apply_to_equipment: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
