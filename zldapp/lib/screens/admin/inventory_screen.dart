import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});
  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  List<Inventory> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getInventory();
      if (mounted) setState(() { _items = data; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool _isLow(Inventory item) =>
      item.reorderLevel != null && item.quantity <= item.reorderLevel!;

  // ── Add / Edit form ──────────────────────────────────────────────────────────
  Future<void> _showForm([Inventory? item]) async {
    final name = TextEditingController(text: item?.name);
    final cat = TextEditingController(text: item?.category);
    final unit = TextEditingController(text: item?.unit);
    final qty =
        TextEditingController(text: item?.quantity.toString());
    final cost =
        TextEditingController(text: item?.unitCost?.toString());
    final reorder =
        TextEditingController(text: item?.reorderLevel?.toString());

    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(item == null ? 'Add Item' : 'Edit Item'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(
                controller: name,
                decoration:
                    const InputDecoration(labelText: 'Name *')),
            const SizedBox(height: 12),
            TextField(
                controller: cat,
                decoration:
                    const InputDecoration(labelText: 'Category')),
            const SizedBox(height: 12),
            TextField(
                controller: unit,
                decoration: const InputDecoration(
                    labelText: 'Unit (e.g. litre, kg)')),
            const SizedBox(height: 12),
            TextField(
                controller: qty,
                decoration:
                    const InputDecoration(labelText: 'Quantity *'),
                keyboardType: TextInputType.number),
            const SizedBox(height: 12),
            TextField(
                controller: cost,
                decoration: const InputDecoration(
                    labelText: 'Unit Cost (RWF)'),
                keyboardType: TextInputType.number),
            const SizedBox(height: 12),
            TextField(
                controller: reorder,
                decoration: const InputDecoration(
                    labelText: 'Reorder Level'),
                keyboardType: TextInputType.number),
          ]),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (name.text.isEmpty || qty.text.isEmpty) return;
              final data = {
                'name': name.text,
                'category': cat.text.isEmpty ? null : cat.text,
                'unit': unit.text.isEmpty ? null : unit.text,
                'quantity': double.tryParse(qty.text) ?? 0,
                'unit_cost': double.tryParse(cost.text),
                'reorder_level': double.tryParse(reorder.text),
                'is_active': true,
              };
              if (item == null) {
                await SupabaseService.createInventory(data);
              } else {
                await SupabaseService.updateInventory(item.id, data);
              }
                  if (context.mounted) Navigator.pop(context, true);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (saved == true) _load();
  }

  // ── Restock dialog ───────────────────────────────────────────────────────────
  Future<void> _showRestockDialog(Inventory item) async {
    final controller = TextEditingController();
    final fmt = NumberFormat('#,##0.##');
    bool saving = false;

    final confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) {
          final addQty = double.tryParse(controller.text) ?? 0;
          final newQty = item.quantity + addQty;

          return AlertDialog(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14)),
            title: Row(children: [
              Icon(Icons.inventory_2_outlined,
                  color: AppTheme.primaryColor, size: 22),
              const SizedBox(width: 8),
              const Text('Restock Item'),
            ]),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Item info card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 4),
                      Row(children: [
                        const Text('Current stock: ',
                            style: TextStyle(
                                fontSize: 13, color: Colors.black54)),
                        Text(
                          '${fmt.format(item.quantity)} ${item.unit ?? 'units'}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _isLow(item)
                                ? Colors.orange
                                : AppTheme.primaryColor,
                          ),
                        ),
                        if (_isLow(item)) ...[
                          const SizedBox(width: 6),
                          const Icon(Icons.warning_amber_rounded,
                              size: 16, color: Colors.orange),
                        ],
                      ]),
                      if (item.reorderLevel != null)
                        Text(
                          'Reorder level: ${fmt.format(item.reorderLevel!)} ${item.unit ?? 'units'}',
                          style: const TextStyle(
                              fontSize: 12, color: Colors.black45),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller,
                  autofocus: true,
                  keyboardType: const TextInputType.numberWithOptions(
                      decimal: true),
                  decoration: InputDecoration(
                    labelText: 'Quantity to add *',
                    hintText: 'e.g. 50',
                    suffixText: item.unit ?? 'units',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                  ),
                  onChanged: (_) => setSt(() {}),
                ),
                if (addQty > 0) ...[
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('New quantity:',
                          style: TextStyle(fontSize: 13)),
                      Text(
                        '${fmt.format(newQty)} ${item.unit ?? 'units'}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed:
                    saving ? null : () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                ),
                onPressed: saving || addQty <= 0
                    ? null
                    : () async {
                        setSt(() => saving = true);
                        try {
                          final newQuantity = item.quantity + addQty;
                          await SupabaseService.updateInventory(
                            item.id,
                            {'quantity': newQuantity},
                          );
                          if (ctx.mounted) Navigator.pop(ctx, true);
                        } catch (e) {
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              SnackBar(
                                content: Text('Failed to restock: $e'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                          setSt(() => saving = false);
                        }
                      },
                icon: saving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.add_circle_outline, size: 18),
                label: Text(saving ? 'Saving…' : 'Restock'),
              ),
            ],
          );
        },
      ),
    );

    if (confirmed == true) {
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${item.name} restocked successfully!'),
            backgroundColor: AppTheme.primaryColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final lowStock = _items.where(_isLow).length;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Inventory'),
      ),
      body: _loading
          ? const LoadingWidget()
          : Column(
              children: [
                // Low-stock banner
                if (lowStock > 0)
                  Container(
                    width: double.infinity,
                    color:
                        const Color(0xFF41AEB4).withOpacity(0.1),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    child: Row(children: [
                      const Icon(Icons.warning_amber,
                          color: Color(0xFF41AEB4), size: 18),
                      const SizedBox(width: 8),
                      Text(
                        '$lowStock item(s) low on stock',
                        style: const TextStyle(
                            color: Color(0xFF41AEB4),
                            fontWeight: FontWeight.w600),
                      ),
                    ]),
                  ),
                Expanded(
                  child: _items.isEmpty
                      ? const EmptyWidget(
                          message: 'No inventory items',
                          icon: Icons.inventory_2_outlined)
                      : RefreshIndicator(
                          onRefresh: _load,
                          child: ListView.builder(
                            padding:
                                const EdgeInsets.only(bottom: 80),
                            itemCount: _items.length,
                            itemBuilder: (_, i) {
                              final item = _items[i];
                              final low = _isLow(item);
                              return Card(
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 4),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 4, vertical: 2),
                                  child: ListTile(
                                    leading: CircleAvatar(
                                      backgroundColor: low
                                          ? Colors.orange.withOpacity(0.2)
                                          : AppTheme.primaryColor
                                              .withOpacity(0.1),
                                      child: Icon(
                                        Icons.inventory_2_outlined,
                                        color: low
                                            ? Colors.orange
                                            : AppTheme.primaryColor,
                                        size: 20,
                                      ),
                                    ),
                                    title: Row(children: [
                                      Expanded(child: Text(item.name)),
                                      if (low)
                                        Container(
                                          padding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Colors.orange
                                                .withOpacity(0.15),
                                            borderRadius:
                                                BorderRadius.circular(4),
                                          ),
                                          child: const Text(
                                            'LOW STOCK',
                                            style: TextStyle(
                                              fontSize: 9,
                                              color: Colors.orange,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                    ]),
                                    subtitle: Text(
                                      '${item.quantity} ${item.unit ?? 'units'}'
                                      '${item.category != null ? ' • ${item.category}' : ''}',
                                    ),
                                    // Action buttons
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        if (item.unitCost != null)
                                          Padding(
                                            padding:
                                                const EdgeInsets.only(right: 4),
                                            child: Text(
                                              fmt.format(item.unitCost!),
                                              style: const TextStyle(
                                                  fontWeight:
                                                      FontWeight.w600,
                                                  fontSize: 12),
                                            ),
                                          ),
                                        // Restock button (shown for ALL items)
                                        Tooltip(
                                          message: 'Restock',
                                          child: InkWell(
                                            borderRadius:
                                                BorderRadius.circular(6),
                                            onTap: () =>
                                                _showRestockDialog(item),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 7,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                color: AppTheme.primaryColor
                                                    .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                                border: Border.all(
                                                  color: AppTheme.primaryColor
                                                      .withOpacity(0.4),
                                                  width: 0.8,
                                                ),
                                              ),
                                              child: const Icon(
                                                Icons.add_circle_outline,
                                                size: 16,
                                                color: AppTheme.primaryColor,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 2),
                                        // Edit button
                                        IconButton(
                                          icon: const Icon(
                                              Icons.edit_outlined,
                                              size: 18),
                                          color: Colors.grey.shade600,
                                          padding: EdgeInsets.zero,
                                          constraints:
                                              const BoxConstraints(
                                                  minWidth: 32,
                                                  minHeight: 32),
                                          onPressed: () => _showForm(item),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
    );
  }
}
