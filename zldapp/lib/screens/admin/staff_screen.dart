import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../services/staff_service.dart'; // New API service
import '../../widgets/common.dart';
import '../../theme.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});
  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  List<Staff> _staff = [];
  List<Attendance> _attendance = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([SupabaseService.getStaff(), SupabaseService.getAttendance()]);
      if (mounted) setState(() {
        _staff = results[0] as List<Staff>;
        _attendance = results[1] as List<Attendance>;
        _loading = false;
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  String _attendanceStatus(String staffId) {
    final a = _attendance.where((a) => a.staffId == staffId).firstOrNull;
    return a?.status ?? 'absent';
  }

  Future<void> _showForm([Staff? s]) async {
    final name = TextEditingController(text: s?.name);
    final phone = TextEditingController(text: s?.phone);
    final email = TextEditingController(text: s?.email);
    final rate = TextEditingController(text: s?.hourlyRate?.toString());
    final password = TextEditingController(); // Password field for new staff
    String selectedRole = s?.role ?? 'staff'; // Default to staff role

    final saved = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(s == null ? 'Add Staff' : 'Edit Staff'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(
              controller: name, 
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: email, 
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ), 
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phone, 
              decoration: const InputDecoration(
                labelText: 'Phone',
                border: OutlineInputBorder(),
              ), 
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            // Role Dropdown
            StatefulBuilder(
              builder: (context, setState) => DropdownButtonFormField<String>(
                value: selectedRole,
                decoration: const InputDecoration(
                  labelText: 'System Role',
                  border: OutlineInputBorder(),
                ),
                isExpanded: true, // Prevent overflow
                items: const [
                  DropdownMenuItem(
                    value: 'admin',
                    child: Text('Admin', overflow: TextOverflow.ellipsis),
                  ),
                  DropdownMenuItem(
                    value: 'manager',
                    child: Text('Manager', overflow: TextOverflow.ellipsis),
                  ),
                  DropdownMenuItem(
                    value: 'staff',
                    child: Text('Staff', overflow: TextOverflow.ellipsis),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => selectedRole = value);
                  }
                },
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: rate, 
              decoration: const InputDecoration(
                labelText: 'Hourly Rate (RWF)',
                border: OutlineInputBorder(),
              ), 
              keyboardType: TextInputType.number,
            ),
            // Password field - only for new staff
            if (s == null) ...[
              const SizedBox(height: 12),
              TextField(
                controller: password,
                decoration: const InputDecoration(
                  labelText: 'Password (Optional)',
                  border: OutlineInputBorder(),
                  helperText: 'Set password to allow app login',
                ),
                obscureText: true,
              ),
            ],
          ]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false), 
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final data = {
                  'name': name.text, 
                  'email': email.text,
                  'phone': phone.text.isEmpty ? null : phone.text, 
                  'role': selectedRole,
                  'hourly_rate': double.tryParse(rate.text), 
                  'is_active': true,
                };
                
                if (s == null) {
                  // Add password if provided
                  if (password.text.isNotEmpty) {
                    data['password'] = password.text;
                  }
                  
                  try {
                    // Try API service first (supports password)
                    await StaffService.createStaff(data);
                  } catch (e) {
                    // If API fails, fall back to direct Supabase (no password)
                    if (password.text.isNotEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('API server unavailable. Staff created without login access.'),
                          duration: Duration(seconds: 3),
                          backgroundColor: Colors.orange,
                        ),
                      );
                    }
                    // Remove password and create via Supabase
                    data.remove('password');
                    await SupabaseService.createStaff(data);
                  }
                } else {
                  await SupabaseService.updateStaff(s.id, data);
                }
                
                if (dialogContext.mounted) Navigator.of(dialogContext).pop(true);
              } catch (e) {
                if (dialogContext.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (saved == true) _load();
  }

  Future<void> _markAttendance(Staff s) async {
    final status = await showDialog<String>(
      context: context,
      builder: (dialogContext) => SimpleDialog(
        title: Text('Attendance - ${s.name}'),
        children: ['present', 'absent', 'leave'].map((st) => SimpleDialogOption(
          onPressed: () => Navigator.of(dialogContext).pop(st),
          child: Text(st.toUpperCase()),
        )).toList(),
      ),
    );
    if (status != null) { await SupabaseService.markAttendance(s.id, status); _load(); }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Staff'),
      ),
      body: _loading
          ? const LoadingWidget()
          : _staff.isEmpty
              ? const EmptyWidget(message: 'No staff yet', icon: Icons.badge_outlined)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: _staff.length,
                    itemBuilder: (_, i) {
                      final s = _staff[i];
                      final att = _attendanceStatus(s.id);
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(child: Text(s.name[0].toUpperCase())),
                          title: Text(s.name),
                          subtitle: Text('${s.role ?? 'Staff'}${s.hourlyRate != null ? ' • ${fmt.format(s.hourlyRate!)}/hr' : ''}'),
                          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                            GestureDetector(
                              onTap: () => _markAttendance(s),
                              child: StatusBadge(att),
                            ),
                            IconButton(icon: const Icon(Icons.edit_outlined, size: 20), onPressed: () => _showForm(s)),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
