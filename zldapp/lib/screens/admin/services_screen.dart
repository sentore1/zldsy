import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});
  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  List<Service> _services = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      print('🔧 Fetching services...');
      final data = await SupabaseService.getServices();
      print('✅ Services received: ${data.length} services');
      if (mounted) setState(() { _services = data; _loading = false; });
    } catch (e, stackTrace) {
      print('❌ Error loading services: $e');
      print('Stack trace: $stackTrace');
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load services: $e'),
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

  Future<void> _showForm([Service? s]) async {
    final name = TextEditingController(text: s?.name);
    final desc = TextEditingController(text: s?.description);
    final price = TextEditingController(text: s?.basePrice.toString());
    final unit = TextEditingController(text: s?.unit ?? 'per visit');
    bool active = s?.isActive ?? true;

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          title: Text(s == null ? 'Add Service' : 'Edit Service'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Service Name *')),
              const SizedBox(height: 12),
              TextField(controller: desc, decoration: const InputDecoration(labelText: 'Description'), maxLines: 2),
              const SizedBox(height: 12),
              TextField(controller: price, decoration: const InputDecoration(labelText: 'Base Price (RWF) *'), keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              TextField(controller: unit, decoration: const InputDecoration(labelText: 'Unit')),
              const SizedBox(height: 8),
              SwitchListTile(title: const Text('Active'), value: active, onChanged: (v) => setSt(() => active = v), contentPadding: EdgeInsets.zero),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (name.text.isEmpty || price.text.isEmpty) return;
                final data = {'name': name.text, 'description': desc.text.isEmpty ? null : desc.text, 'base_price': double.tryParse(price.text) ?? 0, 'unit': unit.text, 'is_active': active};
                if (s == null) await SupabaseService.createService(data);
                else await SupabaseService.updateService(s.id, data);
                if (ctx.mounted) Navigator.pop(ctx, true);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Service s) async {
    final ok = await ConfirmDialog.show(context, 'Delete Service', 'Delete "${s.name}"?');
    if (ok) { await SupabaseService.deleteService(s.id); _load(); }
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
        label: const Text('Add Service'),
      ),
      body: _loading
          ? const LoadingWidget()
          : _services.isEmpty
              ? const EmptyWidget(message: 'No services yet', icon: Icons.design_services_outlined)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: _services.length,
                    itemBuilder: (_, i) {
                      final s = _services[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: s.isActive ? const Color(0xFF1E40AF) : Colors.grey,
                            child: const Icon(Icons.design_services, color: Colors.white, size: 20),
                          ),
                          title: Text(s.name),
                          subtitle: Text('${fmt.format(s.basePrice)} / ${s.unit ?? 'visit'}'),
                          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                            if (!s.isActive) const Chip(label: Text('Inactive', style: TextStyle(fontSize: 11)), padding: EdgeInsets.zero),
                            PopupMenuButton<String>(
                              onSelected: (v) { if (v == 'edit') _showForm(s); else _delete(s); },
                              itemBuilder: (_) => const [
                                PopupMenuItem(value: 'edit', child: Text('Edit')),
                                PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: Colors.red))),
                              ],
                            ),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
