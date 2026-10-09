# Flutter App Updates Needed

## Summary
The Flutter app needs to be updated to match the recent changes made to the web application for consistency and role-based access control.

## Updates Required

### 1. ✅ Jobs Screen - Role-Based Filtering
**Status:** ❌ NOT IMPLEMENTED

**What's needed:**
- Staff users should only see jobs they're assigned to (not all jobs)
- Hide "View Details & Costs" button for staff users
- Hide "Add Job" button for staff users

**Current state:**
- Shows all jobs to everyone
- Everyone can see cost details
- Everyone can see the add job button

**Files to update:**
- `lib/screens/admin/jobs_screen.dart`

**Implementation:**
```dart
// Add user role check in initState
String _userRole = 'staff';
String? _staffId;

@override
void initState() {
  super.initState();
  _loadUserRole();
  _load();
}

Future<void> _loadUserRole() async {
  final role = await SupabaseService.getUserRole();
  setState(() => _userRole = role);
  
  // If staff, get their staff ID
  if (role == 'staff') {
    final email = SupabaseService.currentUser?.email;
    if (email != null) {
      final staffData = await supabase
        .from('staff')
        .select('id')
        .eq('email', email)
        .single();
      setState(() => _staffId = staffData['id']);
    }
  }
}

// Update getJobs to filter by staff
static Future<List<Job>> getJobs({String? staffId}) async {
  if (staffId != null) {
    // Get job IDs for this staff member
    final assignments = await supabase
      .from('job_staff')
      .select('job_id')
      .eq('staff_id', staffId);
    
    final jobIds = (assignments as List).map((a) => a['job_id'] as String).toList();
    
    if (jobIds.isEmpty) return [];
    
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

// Hide "View Details & Costs" button for staff
if (_userRole != 'staff')
  SizedBox(
    width: double.infinity,
    child: ElevatedButton.icon(
      onPressed: () => Navigator.push(...),
      icon: const Icon(Icons.assessment),
      label: const Text('View Details & Costs'),
    ),
  ),

// Hide FAB for staff
floatingActionButton: _userRole != 'staff' 
  ? FloatingActionButton.extended(...)
  : null,
```

---

### 2. ❌ WhatsApp Sharing - Send to Customer
**Status:** ❌ NOT IMPLEMENTED

**What's needed:**
- WhatsApp share should send invoice/quotation to CUSTOMER's phone number
- Not to business owner's phone

**Current state:**
- No WhatsApp sharing feature in Flutter app yet

**Files to create/update:**
- Create `lib/utils/whatsapp_helper.dart`

**Implementation:**
```dart
import 'package:url_launcher/url_launcher.dart';

class WhatsAppHelper {
  static Future<void> shareInvoice({
    required String invoiceId,
    required String invoiceNumber,
    required String customerName,
    required String? customerPhone,
    required double totalAmount,
  }) async {
    if (customerPhone == null || customerPhone.isEmpty) {
      throw Exception('Customer phone number not available');
    }
    
    final message = '''
*Invoice from ZLD Hub* 🧾

Hello $customerName,

Your invoice is ready!

📄 *Invoice Number:* $invoiceNumber
💰 *Amount:* RWF ${totalAmount.toStringAsFixed(0)}

View your invoice here:
[Invoice Link]

Please make payment at your earliest convenience.

Thank you for choosing ZLD Hub! 🙏

_For support, contact us at: +250 790 002 669_
''';
    
    final phone = customerPhone.replaceAll(RegExp(r'[^\d]'), '');
    final encodedMessage = Uri.encodeComponent(message);
    final url = 'https://wa.me/$phone?text=$encodedMessage';
    
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }
  
  static Future<void> shareQuotation({
    required String quotationId,
    required String quotationNumber,
    required String customerName,
    required String? customerPhone,
    required double totalAmount,
    required String validUntil,
  }) async {
    if (customerPhone == null || customerPhone.isEmpty) {
      throw Exception('Customer phone number not available');
    }
    
    final message = '''
*Quotation from ZLD Hub* 📋

Hello $customerName,

Your service quotation is ready!

📄 *Quotation Number:* $quotationNumber
💰 *Estimated Cost:* RWF ${totalAmount.toStringAsFixed(0)}
⏰ *Valid Until:* $validUntil

View your quotation here:
[Quotation Link]

Please review and accept to proceed with booking.

Thank you for choosing ZLD Hub! 🙏

_Questions? Contact us at: +250 790 002 669_
''';
    
    final phone = customerPhone.replaceAll(RegExp(r'[^\d]'), '');
    final encodedMessage = Uri.encodeComponent(message);
    final url = 'https://wa.me/$phone?text=$encodedMessage';
    
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }
}
```

**Add to pubspec.yaml:**
```yaml
dependencies:
  url_launcher: ^6.2.0
```

---

### 3. ❌ Dashboard - Hide for Staff
**Status:** ❌ NOT IMPLEMENTED

**What's needed:**
- Staff users should NOT see the dashboard
- Redirect them to Jobs screen instead
- Only show Jobs option in navigation

**Current state:**
- Staff can see dashboard

**Files to update:**
- `lib/screens/admin/admin_shell.dart`
- Check navigation drawer/bottom nav

**Implementation:**
- Check `admin_shell.dart` for role-based menu items
- Redirect staff users from dashboard to jobs
- Hide dashboard menu item for staff

---

### 4. ✅ Customer/Service Name Fields
**Status:** ✅ LIKELY CORRECT (uses Supabase models)

**Check:**
- Customer model should use single `name` field (not first_name/last_name)
- This should already be correct if using the same database

---

### 5. ❌ Invoice Sorting
**Status:** ❌ CHECK NEEDED

**What's needed:**
- Invoices should be sorted by due_date (newest first)

**Current implementation:**
- Sorted by created_at (may need to change to due_date)

**Files to update:**
- `lib/services/supabase_service.dart` - getInvoices method

**Change:**
```dart
// From:
.order('created_at', ascending: false);

// To:
.order('due_date', ascending: false);
```

---

## Priority Order

1. **HIGH**: Jobs screen role-based filtering (security issue)
2. **HIGH**: Hide dashboard for staff (user experience)
3. **MEDIUM**: WhatsApp sharing feature (nice to have)
4. **LOW**: Invoice sorting (cosmetic)

---

## Testing Checklist

After implementing updates:

- [ ] Staff user can only see their assigned jobs
- [ ] Staff user cannot see cost information
- [ ] Staff user cannot access dashboard
- [ ] Admin/Manager can see all jobs and costs
- [ ] WhatsApp share sends to customer phone (if implemented)
- [ ] Invoice sorting shows newest first

---

## Database Schema Notes

The Flutter app uses the SAME Supabase database as the web app, so:
- ✅ Customer table has single `name` field
- ✅ `job_staff` table links jobs to staff members
- ✅ `user_roles` table stores user roles
- ✅ All APIs work the same way

---

## Questions?

If you need help implementing any of these updates, just ask!
