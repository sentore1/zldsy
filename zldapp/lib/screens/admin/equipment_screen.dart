import 'package:flutter/material.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class EquipmentScreen extends StatefulWidget {
  const EquipmentScreen({super.key});
  @override
  State<EquipmentScreen> createState() => _EquipmentScreenState();
}

class _EquipmentScreenState extends State<EquipmentScreen> {
  List<Equipment> _equipment = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getEquipment();
      if (mounted) setState(() { _equipment = data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _showForm([Equipment? e]) async {
    final name = TextEditingController(text: e?.name);
    final type = TextEditingController(text: e?.type);
    final reg = TextEditingController(text: e?.registrationNumber);
    final fuel = TextEditingController(text: e?.fuelCapacity?.toString());
    String status = e?.status ?? 'available';

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          title: Text(e == null ? 'Add Equipment' : 'Edit Equipment'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Name *')),
              const SizedBox(height: 12),
              TextField(controller: type, decoration: const InputDecoration(labelText: 'Type (e.g. Vehicle, Machine)')),
              const SizedBox(height: 12),
              TextField(controller: reg, decoration: const InputDecoration(labelText: 'Registration No.')),
              const SizedBox(height: 12),
              TextField(controller: fuel, decoration: const InputDecoration(labelText: 'Fuel Capacity (L)'), keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: status,
                decoration: const InputDecoration(labelText: 'Status'),
                items: ['available', 'in_use', 'maintenance'].map((s) => DropdownMenuItem(value: s, child: Text(statusLabel(s)))).toList(),
                onChanged: (v) => setSt(() => status = v!),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (name.text.isEmpty) return;
                final data = {'name': name.text, 'type': type.text.isEmpty ? null : type.text, 'registration_number': reg.text.isEmpty ? null : reg.text, 'fuel_capacity': double.tryParse(fuel.text), 'status': status, 'is_active': true};
                if (e == null) await SupabaseService.createEquipment(data);
                else await SupabaseService.updateEquipment(e.id, data);
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

  IconData _equipIcon(String? type) {
    if (type?.toLowerCase().contains('vehicle') == true) return Icons.directions_car_outlined;
    if (type?.toLowerCase().contains('machine') == true) return Icons.precision_manufacturing_outlined;
    return Icons.construction_outlined;
  }

  String statusLabel(String status) {
    switch (status) {
      case 'available': return 'Available';
      case 'in_use': return 'In Use';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  }

  Color statusColor(String status) {
    switch (status) {
      case 'available': return Colors.green;
      case 'in_use': return Colors.orange;
      case 'maintenance': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Equipment'),
      ),
      body: _loading
          ? const LoadingWidget()
          : _equipment.isEmpty
              ? const EmptyWidget(message: 'No equipment yet', icon: Icons.construction_outlined)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: _equipment.length,
                    itemBuilder: (_, i) {
                      final e = _equipment[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: statusColor(e.status).withOpacity(0.15),
                            child: Icon(_equipIcon(e.type), color: statusColor(e.status), size: 20),
                          ),
                          title: Text(e.name),
                          subtitle: Text('${e.type ?? 'Equipment'}${e.registrationNumber != null ? ' • ${e.registrationNumber}' : ''}'),
                          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                            StatusBadge(e.status),
                            IconButton(icon: const Icon(Icons.edit_outlined, size: 20), onPressed: () => _showForm(e)),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
