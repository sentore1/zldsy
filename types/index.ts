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
  discount: number;
  tax: number;
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
  role?: string;
  hourly_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  tax: number;
  discount: number;
  final_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
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
