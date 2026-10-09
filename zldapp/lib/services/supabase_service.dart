import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/index.dart';
import '../models/expense.dart';

final supabase = Supabase.instance.client;

class SupabaseService {
  // Expose supabase client for debugging
  static SupabaseClient get supabase => Supabase.instance.client;
  
  // ── Auth ──────────────────────────────────────────────────────────────────
  static Future<AuthResponse> signIn(String email, String password) =>
      supabase.auth.signInWithPassword(email: email, password: password);

  static Future<void> signOut() => supabase.auth.signOut();

  static User? get currentUser => supabase.auth.currentUser;

  static Stream<AuthState> get authStream => supabase.auth.onAuthStateChange;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getDashboardStats() async {
    final today = DateTime.now();
    final todayStr = today.toIso8601String().substring(0, 10);
    final tomorrow = today.add(const Duration(days: 1));
    final tomorrowStr = tomorrow.toIso8601String().substring(0, 10);

    print('📅 Fetching jobs for today: $todayStr');
    final todayJobs = await supabase
        .from('jobs')
        .select('id')
        .gte('scheduled_date', '${todayStr}T00:00:00')
        .lte('scheduled_date', '${todayStr}T23:59:59');
    print('📋 Today jobs count: ${(todayJobs as List).length}');

    print('🔄 Fetching ongoing jobs...');
    final ongoingJobs = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'in_progress');
    print('🔄 Ongoing jobs count: ${(ongoingJobs as List).length}');

    print('📅 Fetching jobs for tomorrow: $tomorrowStr');
    final tomorrowJobs = await supabase
        .from('jobs')
        .select('id')
        .gte('scheduled_date', '${tomorrowStr}T00:00:00')
        .lte('scheduled_date', '${tomorrowStr}T23:59:59');
    print('📋 Tomorrow jobs count: ${(tomorrowJobs as List).length}');

    print('💰 Fetching invoices...');
    final invoices = await supabase
        .from('invoices')
        .select('final_amount, status');
    print('💰 Invoices count: ${(invoices as List).length}');

    print('💸 Fetching expenses...');
    final expenses = await supabase.from('expenses').select('amount');
    print('💸 Expenses count: ${(expenses as List).length}');

    double totalRevenue = 0;
    for (final inv in invoices) {
      if (inv['status'] == 'paid') {
        totalRevenue += (inv['final_amount'] as num).toDouble();
        print('💰 Added invoice: ${inv['final_amount']}');
      }
    }
    double totalExpenses = 0;
    for (final exp in expenses) {
      totalExpenses += (exp['amount'] as num).toDouble();
    }
    print('💰 Total Revenue: $totalRevenue');
    print('💸 Total Expenses: $totalExpenses');
    final netProfit = totalRevenue - totalExpenses;
    final profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0.0;

    return {
      'todaysJobs': (todayJobs as List).length,
      'ongoingServices': (ongoingJobs as List).length,
      'tomorrowSchedule': (tomorrowJobs as List).length,
      'totalRevenue': totalRevenue,
      'totalExpenses': totalExpenses,
      'netProfit': netProfit,
      'profitMargin': profitMargin,
    };
  }

  // ── Customers ─────────────────────────────────────────────────────────────
  static Future<List<Customer>> getCustomers() async {
    final data = await supabase.from('customers').select().order('created_at', ascending: false);
    return (data as List).map((j) => Customer.fromJson(j)).toList();
  }

  static Future<Customer> createCustomer(Map<String, dynamic> data) async {
    final res = await supabase.from('customers').insert(data).select().single();
    return Customer.fromJson(res);
  }

  static Future<Customer> updateCustomer(String id, Map<String, dynamic> data) async {
    final res = await supabase.from('customers').update(data).eq('id', id).select().single();
    return Customer.fromJson(res);
  }

  static Future<void> deleteCustomer(String id) =>
      supabase.from('customers').delete().eq('id', id);

  // ── Services ──────────────────────────────────────────────────────────────
  static Future<List<Service>> getServices({bool activeOnly = false}) async {
    var query = supabase.from('services').select();
    if (activeOnly) query = query.eq('is_active', true) as dynamic;
    final data = await query.order('name');
    return (data as List).map((j) => Service.fromJson(j)).toList();
  }

  static Future<Service> createService(Map<String, dynamic> data) async {
    final res = await supabase.from('services').insert(data).select().single();
    return Service.fromJson(res);
  }

  static Future<Service> updateService(String id, Map<String, dynamic> data) async {
    final res = await supabase.from('services').update(data).eq('id', id).select().single();
    return Service.fromJson(res);
  }

  static Future<void> deleteService(String id) =>
      supabase.from('services').delete().eq('id', id);

  // ── Bookings ──────────────────────────────────────────────────────────────
  static Future<List<Booking>> getBookings() async {
    final data = await supabase
        .from('bookings')
        .select('*, customers(*), services(*)')
        .order('created_at', ascending: false);
    return (data as List).map((j) => Booking.fromJson(j)).toList();
  }

  static Future<Booking> createBooking(Map<String, dynamic> data) async {
    final res = await supabase.from('bookings').insert(data).select('*, customers(*), services(*)').single();
    return Booking.fromJson(res);
  }

  static Future<Booking> updateBookingStatus(String id, String status) async {
    final res = await supabase
        .from('bookings')
        .update({'status': status})
        .eq('id', id)
        .select('*, customers(*), services(*)')
        .single();
    return Booking.fromJson(res);
  }

  // ── Quotations ────────────────────────────────────────────────────────────
  static Future<List<Quotation>> getQuotations() async {
    final data = await supabase
        .from('quotations')
        .select('*, quotation_items(*)')
        .order('created_at', ascending: false);
    return (data as List).map((j) => Quotation.fromJson(j)).toList();
  }

  static Future<Quotation> getQuotation(String id) async {
    final data = await supabase
        .from('quotations')
        .select('*, quotation_items(*)')
        .eq('id', id)
        .single();
    return Quotation.fromJson(data);
  }

  static Future<Quotation> acceptQuotation(String id) async {
    final res = await supabase
        .from('quotations')
        .update({'status': 'accepted', 'terms_accepted': true, 'terms_accepted_at': DateTime.now().toIso8601String()})
        .eq('id', id)
        .select('*, quotation_items(*)')
        .single();
    return Quotation.fromJson(res);
  }

  static Future<Quotation> createQuotation(Map<String, dynamic> data, List<Map<String, dynamic>> items) async {
    final res = await supabase.from('quotations').insert(data).select().single();
    final quotationId = res['id'];
    for (final item in items) {
      await supabase.from('quotation_items').insert({...item, 'quotation_id': quotationId});
    }
    return getQuotation(quotationId);
  }

  // ── Jobs ──────────────────────────────────────────────────────────────────
  static Future<List<Job>> getJobs({String? staffId}) async {
    // If staffId provided, filter to only show jobs assigned to this staff member
    if (staffId != null) {
      // First get job IDs assigned to this staff member
      final assignments = await supabase
          .from('job_staff')
          .select('job_id')
          .eq('staff_id', staffId);
      
      final jobIds = (assignments as List).map((a) => a['job_id'] as String).toList();
      
      // If no jobs assigned, return empty list
      if (jobIds.isEmpty) return [];
      
      // Fetch only assigned jobs
      final data = await supabase
          .from('jobs')
          .select('*, job_staff(*, staff(*))')
          .in_('id', jobIds)
          .order('scheduled_date', ascending: false);
      return (data as List).map((j) => Job.fromJson(j)).toList();
    }
    
    // Admin/Manager - get all jobs
    final data = await supabase
        .from('jobs')
        .select('*, job_staff(*, staff(*))')
        .order('scheduled_date', ascending: false);
    return (data as List).map((j) => Job.fromJson(j)).toList();
  }

  static Future<Job> updateJobStatus(String id, String status, {String? weatherCondition}) async {
    final update = <String, dynamic>{'status': status};
    if (weatherCondition != null) update['weather_condition'] = weatherCondition;
    if (status == 'in_progress') update['start_time'] = DateTime.now().toIso8601String();
    if (status == 'completed') update['end_time'] = DateTime.now().toIso8601String();
    final res = await supabase.from('jobs').update(update).eq('id', id).select('*, job_staff(*, staff(*))').single();
    return Job.fromJson(res);
  }

  static Future<Job> createJob(Map<String, dynamic> data) async {
    final res = await supabase.from('jobs').insert(data).select('*, job_staff(*, staff(*))').single();
    return Job.fromJson(res);
  }

  static Future<void> assignStaffToJob(String jobId, String staffId, String? role) =>
      supabase.from('job_staff').insert({'job_id': jobId, 'staff_id': staffId, 'role': role});

  static Future<Job> getJobDetail(String id) async {
    final data = await supabase
        .from('jobs')
        .select('''
          *,
          job_staff(*, staff(*)),
          job_materials(*, inventory(*)),
          job_equipment(*, equipment(*)),
          booking:bookings(*, service:services(*))
        ''')
        .eq('id', id)
        .single();
    return Job.fromJson(data);
  }

  static Future<void> addJobStaff(String jobId, String staffId, double hours, double laborCost) async {
    await supabase.from('job_staff').insert({
      'job_id': jobId,
      'staff_id': staffId,
      'hours_worked': hours,
      'labor_cost': laborCost,
    });
  }

  static Future<void> addJobMaterial(String jobId, String inventoryId, double quantity, double cost) async {
    await supabase.from('job_materials').insert({
      'job_id': jobId,
      'inventory_id': inventoryId,
      'quantity': quantity,
      'cost': cost,
    });
  }

  static Future<void> addJobEquipment(String jobId, String equipmentId, double fuelUsed, double fuelCost) async {
    await supabase.from('job_equipment').insert({
      'job_id': jobId,
      'equipment_id': equipmentId,
      'fuel_used': fuelUsed,
      'fuel_cost': fuelCost,
    });
  }

  static Future<void> deleteJobStaff(String id) async {
    await supabase.from('job_staff').delete().eq('id', id);
  }

  static Future<void> deleteJobMaterial(String id) async {
    await supabase.from('job_materials').delete().eq('id', id);
  }

  static Future<void> deleteJobEquipment(String id) async {
    await supabase.from('job_equipment').delete().eq('id', id);
  }

  // ── Staff ─────────────────────────────────────────────────────────────────
  static Future<List<Staff>> getStaff({bool activeOnly = false}) async {
    var query = supabase.from('staff').select();
    if (activeOnly) query = query.eq('is_active', true) as dynamic;
    final data = await query.order('name');
    return (data as List).map((j) => Staff.fromJson(j)).toList();
  }

  static Future<Staff> createStaff(Map<String, dynamic> data) async {
    final res = await supabase.from('staff').insert(data).select().single();
    return Staff.fromJson(res);
  }

  static Future<Staff> updateStaff(String id, Map<String, dynamic> data) async {
    final res = await supabase.from('staff').update(data).eq('id', id).select().single();
    return Staff.fromJson(res);
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  static Future<List<Inventory>> getInventory() async {
    final data = await supabase.from('inventory').select().order('name');
    return (data as List).map((j) => Inventory.fromJson(j)).toList();
  }

  static Future<Inventory> createInventory(Map<String, dynamic> data) async {
    final res = await supabase.from('inventory').insert(data).select().single();
    return Inventory.fromJson(res);
  }

  static Future<Inventory> updateInventory(String id, Map<String, dynamic> data) async {
    final res = await supabase.from('inventory').update(data).eq('id', id).select().single();
    return Inventory.fromJson(res);
  }

  // ── Equipment ─────────────────────────────────────────────────────────────
  static Future<List<Equipment>> getEquipment() async {
    final data = await supabase.from('equipment').select().order('name');
    return (data as List).map((j) => Equipment.fromJson(j)).toList();
  }

  static Future<Equipment> createEquipment(Map<String, dynamic> data) async {
    final res = await supabase.from('equipment').insert(data).select().single();
    return Equipment.fromJson(res);
  }

  static Future<Equipment> updateEquipment(String id, Map<String, dynamic> data) async {
    final res = await supabase.from('equipment').update(data).eq('id', id).select().single();
    return Equipment.fromJson(res);
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  static Future<List<Invoice>> getInvoices() async {
    final data = await supabase
        .from('invoices')
        .select('*, payments(*)')
        .order('due_date', ascending: false); // Sort by due date (newest first)
    return (data as List).map((j) => Invoice.fromJson(j)).toList();
  }

  static Future<Invoice> getInvoice(String id) async {
    final data = await supabase.from('invoices').select('*, payments(*)').eq('id', id).single();
    return Invoice.fromJson(data);
  }

  static Future<Invoice> recordPayment(String invoiceId, Map<String, dynamic> paymentData) async {
    await supabase.from('payments').insert({...paymentData, 'invoice_id': invoiceId});
    await supabase.from('invoices').update({'status': 'paid', 'paid_date': DateTime.now().toIso8601String()}).eq('id', invoiceId);
    return getInvoice(invoiceId);
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  static Future<List<Attendance>> getAttendance({DateTime? date}) async {
    final dateStr = (date ?? DateTime.now()).toIso8601String().substring(0, 10);
    final data = await supabase
        .from('attendance')
        .select('*, staff(*)')
        .eq('date', dateStr);
    return (data as List).map((j) => Attendance.fromJson(j)).toList();
  }

  static Future<void> markAttendance(String staffId, String status) async {
    final dateStr = DateTime.now().toIso8601String().substring(0, 10);
    await supabase.from('attendance').upsert({
      'staff_id': staffId,
      'date': dateStr,
      'status': status,
      'check_in': status == 'present' ? DateTime.now().toIso8601String() : null,
    }, onConflict: 'staff_id,date');
  }

  // ── Feedback ──────────────────────────────────────────────────────────────
  static Future<void> submitFeedback(Map<String, dynamic> data) =>
      supabase.from('feedback').insert(data);

  static Future<List<Feedback>> getFeedback() async {
    final data = await supabase.from('feedback').select().order('created_at', ascending: false);
    return (data as List).map((j) => Feedback.fromJson(j)).toList();
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getReports({DateTime? from, DateTime? to}) async {
    final fromStr = (from ?? DateTime.now().subtract(const Duration(days: 30))).toIso8601String();
    final toStr = (to ?? DateTime.now()).toIso8601String();

    final invoices = await supabase
        .from('invoices')
        .select('final_amount, status, created_at')
        .gte('created_at', fromStr)
        .lte('created_at', toStr);

    final expenses = await supabase
        .from('expenses')
        .select('amount, category, expense_date')
        .gte('expense_date', fromStr)
        .lte('expense_date', toStr);

    double revenue = 0;
    double expenseTotal = 0;
    for (final inv in invoices as List) {
      if (inv['status'] == 'paid') revenue += (inv['final_amount'] as num).toDouble();
    }
    for (final exp in expenses as List) {
      expenseTotal += (exp['amount'] as num).toDouble();
    }

    return {
      'revenue': revenue,
      'expenses': expenseTotal,
      'netProfit': revenue - expenseTotal,
      'profitMargin': revenue > 0 ? ((revenue - expenseTotal) / revenue) * 100 : 0.0,
      'invoiceList': invoices,
      'expenseList': expenses,
    };
  }

  // ── Expenses ──────────────────────────────────────────────────────────────
  static Future<List<Expense>> getExpenses() async {
    final data = await supabase.from('expenses').select().order('expense_date', ascending: false);
    return (data as List).map((j) => Expense.fromJson(j)).toList();
  }

  static Future<Expense> createExpense(Map<String, dynamic> data) async {
    final res = await supabase.from('expenses').insert(data).select().single();
    return Expense.fromJson(res);
  }

  static Future<void> deleteExpense(String id) =>
      supabase.from('expenses').delete().eq('id', id);

  // ── User Role ─────────────────────────────────────────────────────────────
  static Future<String> getUserRole() async {
    final userId = currentUser?.id;
    if (userId == null) return 'staff';
    try {
      final data = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
      return data['role'] ?? 'staff';
    } catch (_) {
      return 'staff';
    }
  }

  // Get staff ID by email (for staff users)
  static Future<String?> getStaffIdByEmail(String email) async {
    try {
      final data = await supabase.from('staff').select('id').eq('email', email).single();
      return data['id'];
    } catch (_) {
      return null;
    }
  }
}
