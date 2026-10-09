import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});
  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  List<dynamic> _payments = [];
  bool _loading = true;
  double _total = 0;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final invoices = await SupabaseService.getInvoices();
      final allPayments = invoices.expand((inv) => inv.payments).toList();
      allPayments.sort((a, b) => b.paymentDate.compareTo(a.paymentDate));
      final total = allPayments.fold<double>(0, (sum, p) => sum + p.amount);
      if (mounted) setState(() { _payments = allPayments; _total = total; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final dateFmt = DateFormat('d MMM yyyy');
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Implement record payment functionality
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Record Payment functionality coming soon')),
          );
        },
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Record Payment'),
      ),
      body: _loading
          ? const LoadingWidget()
          : Column(
              children: [
                Container(
                  width: double.infinity,
                  color: const Color(0xFF1E40AF),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Collected', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text(fmt.format(_total), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                Expanded(
                  child: _payments.isEmpty
                      ? const EmptyWidget(message: 'No payments yet', icon: Icons.payments_outlined)
                      : RefreshIndicator(
                          onRefresh: _load,
                          child: ListView.builder(
                            padding: const EdgeInsets.only(bottom: 80),
                            itemCount: _payments.length,
                            itemBuilder: (_, i) {
                              final p = _payments[i];
                              return ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: Color(0xFFDCFCE7),
                                  child: Icon(Icons.check_circle_outline, color: Color(0xFF16A34A)),
                                ),
                                title: Text(fmt.format(p.amount), style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${p.paymentMethod?.replaceAll('_', ' ').toUpperCase() ?? 'N/A'} • ${dateFmt.format(p.paymentDate)}'),
                                trailing: p.transactionReference != null
                                    ? Text(p.transactionReference!, style: const TextStyle(fontSize: 12, color: Colors.black45))
                                    : null,
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
