import 'package:flutter/material.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});
  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  List<Customer> _all = [], _filtered = [];
  bool _loading = true;
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
    _search.addListener(_filter);
  }

  @override
  void dispose() { _search.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      print('👥 Fetching customers...');
      final data = await SupabaseService.getCustomers();
      print('✅ Customers received: ${data.length} customers');
      if (mounted) setState(() { _all = data; _filtered = data; _loading = false; });
    } catch (e, stackTrace) {
      print('❌ Error loading customers: $e');
      print('Stack trace: $stackTrace');
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load customers: $e'),
            backgroundColor: AppTheme.errorColor,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: _load,
            ),
          ),
        );
      }
    }
  }

  void _filter() {
    final q = _search.text.toLowerCase();
    setState(() => _filtered = _all.where((c) =>
      c.name.toLowerCase().contains(q) ||
      c.phone.contains(q) ||
      (c.email?.toLowerCase().contains(q) ?? false)).toList());
  }

  Future<void> _showForm([Customer? c]) async {
    final name = TextEditingController(text: c?.name);
    final phone = TextEditingController(text: c?.phone);
    final email = TextEditingController(text: c?.email);
    final address = TextEditingController(text: c?.address);
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(c == null ? 'Add Customer' : 'Edit Customer'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Name *')),
            const SizedBox(height: 12),
            TextField(controller: phone, decoration: const InputDecoration(labelText: 'Phone *'), keyboardType: TextInputType.phone),
            const SizedBox(height: 12),
            TextField(controller: email, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 12),
            TextField(controller: address, decoration: const InputDecoration(labelText: 'Address'), maxLines: 2),
          ]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context, rootNavigator: true).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (name.text.isEmpty || phone.text.isEmpty) return;
              final data = {'name': name.text, 'phone': phone.text, 'email': email.text.isEmpty ? null : email.text, 'address': address.text.isEmpty ? null : address.text};
              try {
                if (c == null) await SupabaseService.createCustomer(data);
                else await SupabaseService.updateCustomer(c.id, data);
                Navigator.of(context, rootNavigator: true).pop(true);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Customer c) async {
    final ok = await ConfirmDialog.show(context, 'Delete Customer', 'Delete ${c.name}?');
    if (ok) { await SupabaseService.deleteCustomer(c.id); _load(); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _search,
              decoration: const InputDecoration(
                hintText: 'Search customers...',
                prefixIcon: Icon(Icons.search),
                isDense: true,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const LoadingWidget()
                : _filtered.isEmpty
                    ? const EmptyWidget(message: 'No customers found', icon: Icons.people_outline)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final c = _filtered[i];
                            return ListTile(
                              leading: CircleAvatar(child: Text(c.name[0].toUpperCase())),
                              title: Text(c.name),
                              subtitle: Text('${c.phone}${c.email != null ? ' • ${c.email}' : ''}'),
                              trailing: PopupMenuButton<String>(
                                onSelected: (v) {
                                  if (v == 'edit') _showForm(c);
                                  else _delete(c);
                                },
                                itemBuilder: (_) => const [
                                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                                  PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: Colors.red))),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Customer'),
      ),
    );
  }
}
