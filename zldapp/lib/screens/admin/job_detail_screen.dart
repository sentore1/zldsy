import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  Job? _job;
  bool _loading = true;
  List<Staff> _availableStaff = [];
  List<Inventory> _availableInventory = [];
  List<Equipment> _availableEquipment = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final job = await SupabaseService.getJobDetail(widget.jobId);
      final staff = await SupabaseService.getStaff();
      final inventory = await SupabaseService.getInventory();
      final equipment = await SupabaseService.getEquipment();
      
      if (mounted) {
        setState(() {
          _job = job;
          _availableStaff = staff;
          _availableInventory = inventory;
          _availableEquipment = equipment;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading job: $e')),
        );
      }
    }
  }

  Future<void> _addStaff() async {
    if (_availableStaff.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No staff available')),
      );
      return;
    }

    String? selectedStaffId;
    double hours = 0;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Staff'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Select Staff'),
                value: selectedStaffId,
                items: _availableStaff.map((s) => DropdownMenuItem(
                  value: s.id,
                  child: Text('${s.name} (RWF ${s.hourlyRate}/h)'),
                )).toList(),
                onChanged: (v) => setState(() => selectedStaffId = v),
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Hours Worked'),
                keyboardType: TextInputType.number,
                onChanged: (v) => hours = double.tryParse(v) ?? 0,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, {
                'staff_id': selectedStaffId,
                'hours': hours,
              }),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == null || result['staff_id'] == null || result['hours'] <= 0) return;

    final staff = _availableStaff.firstWhere((s) => s.id == result['staff_id']);
    final laborCost = (staff.hourlyRate ?? 0.0) * (result['hours'] as num).toDouble();

    try {
      await SupabaseService.addJobStaff(
        widget.jobId,
        result['staff_id'],
        (result['hours'] as num).toDouble(),
        laborCost,
      );
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Staff added successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding staff: $e')),
        );
      }
    }
  }

  Future<void> _addMaterial() async {
    if (_availableInventory.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No materials available')),
      );
      return;
    }

    String? selectedInventoryId;
    double quantity = 0;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Material'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Select Material'),
                value: selectedInventoryId,
                items: _availableInventory.map((i) => DropdownMenuItem(
                  value: i.id,
                  child: Text('${i.name} (RWF ${i.unitCost}/${i.unit})'),
                )).toList(),
                onChanged: (v) => setState(() => selectedInventoryId = v),
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Quantity Used'),
                keyboardType: TextInputType.number,
                onChanged: (v) => quantity = double.tryParse(v) ?? 0,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, {
                'inventory_id': selectedInventoryId,
                'quantity': quantity,
              }),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == null || result['inventory_id'] == null || result['quantity'] <= 0) return;

    final inventory = _availableInventory.firstWhere((i) => i.id == result['inventory_id']);
    final cost = (inventory.unitCost ?? 0.0) * (result['quantity'] as num).toDouble();

    try {
      await SupabaseService.addJobMaterial(
        widget.jobId,
        result['inventory_id'],
        (result['quantity'] as num).toDouble(),
        cost,
      );
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Material added successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding material: $e')),
        );
      }
    }
  }

  Future<void> _addEquipment() async {
    if (_availableEquipment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No equipment available')),
      );
      return;
    }

    String? selectedEquipmentId;
    double fuelUsed = 0;
    double fuelCost = 0;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Equipment'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Select Equipment'),
                  value: selectedEquipmentId,
                  items: _availableEquipment.map((e) => DropdownMenuItem(
                    value: e.id,
                    child: Text('${e.name} (${e.type})'),
                  )).toList(),
                  onChanged: (v) => setState(() => selectedEquipmentId = v),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Fuel Used (L)'),
                  keyboardType: TextInputType.number,
                  onChanged: (v) => fuelUsed = double.tryParse(v) ?? 0,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Fuel Cost (RWF)'),
                  keyboardType: TextInputType.number,
                  onChanged: (v) => fuelCost = double.tryParse(v) ?? 0,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, {
                'equipment_id': selectedEquipmentId,
                'fuel_used': fuelUsed,
                'fuel_cost': fuelCost,
              }),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == null || result['equipment_id'] == null) return;

    try {
      await SupabaseService.addJobEquipment(
        widget.jobId,
        result['equipment_id'],
        result['fuel_used'],
        result['fuel_cost'],
      );
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Equipment added successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding equipment: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Job Details')),
        body: const LoadingWidget(),
      );
    }

    if (_job == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Job Details')),
        body: const Center(child: Text('Job not found')),
      );
    }

    final currencyFormat = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final isProfit = _job!.grossProfit >= 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(_job!.jobNumber),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profitability Overview
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Profitability Overview',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const Divider(),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Revenue', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text(
                                currencyFormat.format(_job!.servicePrice ?? 0),
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Costs', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text(
                                currencyFormat.format(_job!.totalCosts),
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    isProfit ? Icons.trending_up : Icons.trending_down,
                                    color: isProfit ? Colors.green : Colors.red,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 4),
                                  const Text('Profit', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                ],
                              ),
                              Text(
                                currencyFormat.format(_job!.grossProfit),
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isProfit ? Colors.green : Colors.red,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Margin', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text(
                                '${_job!.profitMargin.toStringAsFixed(1)}%',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isProfit ? Colors.green : Colors.red,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Staff Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.people, color: Colors.indigo),
                            SizedBox(width: 8),
                            Text('Staff', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(
                          currencyFormat.format(_job!.totalLaborCost),
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                        ),
                      ],
                    ),
                    const Divider(),
                    if (_job!.staff.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Text('No staff assigned', style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._job!.staff.map((s) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(s.staff?.name ?? 'Unknown'),
                        subtitle: Text('${s.hoursWorked}h @ ${currencyFormat.format(s.staff?.hourlyRate ?? 0)}/h'),
                        trailing: Text(
                          currencyFormat.format(s.laborCost ?? 0),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      )),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _addStaff,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Staff'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Materials Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.inventory_2, color: Colors.green),
                            SizedBox(width: 8),
                            Text('Materials', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(
                          currencyFormat.format(_job!.totalMaterialsCost),
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ],
                    ),
                    const Divider(),
                    if (_job!.materials.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Text('No materials used', style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._job!.materials.map((m) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(m.inventory?.name ?? 'Unknown'),
                        subtitle: Text('${m.quantity} ${m.inventory?.unit ?? ''} @ ${currencyFormat.format(m.inventory?.unitCost ?? 0)}/${m.inventory?.unit ?? ''}'),
                        trailing: Text(
                          currencyFormat.format(m.cost),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      )),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _addMaterial,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Material'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Equipment Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.local_shipping, color: Colors.purple),
                            SizedBox(width: 8),
                            Text('Equipment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(
                          currencyFormat.format(_job!.totalEquipmentCost),
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.purple),
                        ),
                      ],
                    ),
                    const Divider(),
                    if (_job!.equipment.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Text('No equipment used', style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._job!.equipment.map((e) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(e.equipment?.name ?? 'Unknown'),
                        subtitle: Text('${e.equipment?.type ?? ''} | Fuel: ${e.fuelUsed}L'),
                        trailing: Text(
                          currencyFormat.format(e.fuelCost),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      )),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _addEquipment,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Equipment'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
