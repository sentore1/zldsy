import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});
  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  DateTime _from = DateTime.now().subtract(const Duration(days: 30));
  DateTime _to = DateTime.now();

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getReports(from: _from, to: _to);
      if (mounted) setState(() { _data = data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _pickDate(bool isFrom) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isFrom ? _from : _to,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() { if (isFrom) _from = picked; else _to = picked; });
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final dateFmt = DateFormat('d MMM yyyy');
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            Expanded(child: OutlinedButton.icon(
              onPressed: () => _pickDate(true),
              icon: const Icon(Icons.calendar_today, size: 16),
              label: Text(dateFmt.format(_from)),
            )),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('to')),
            Expanded(child: OutlinedButton.icon(
              onPressed: () => _pickDate(false),
              icon: const Icon(Icons.calendar_today, size: 16),
              label: Text(dateFmt.format(_to)),
            )),
          ]),
        ),
        Expanded(
          child: _loading
              ? const LoadingWidget()
              : _data == null
                  ? const EmptyWidget(message: 'No data available')
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        const SectionHeader(title: 'Financial Summary'),
                        const SizedBox(height: 12),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.4,
                          children: [
                            StatCard(title: 'Revenue', value: fmt.format(_data!['revenue']), icon: Icons.trending_up, color: AppTheme.successColor),
                            StatCard(title: 'Expenses', value: fmt.format(_data!['expenses']), icon: Icons.trending_down, color: AppTheme.errorColor),
                            StatCard(title: 'Net Profit', value: fmt.format(_data!['netProfit']), icon: Icons.account_balance_wallet_outlined, color: AppTheme.primaryColor),
                            StatCard(title: 'Margin', value: '${(_data!['profitMargin'] as double).toStringAsFixed(1)}%', icon: Icons.pie_chart_outline, color: AppTheme.warningColor),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const SectionHeader(title: 'Recent Invoices'),
                        const SizedBox(height: 8),
                        ...(_data!['invoiceList'] as List).take(10).map((inv) => ListTile(
                          dense: true,
                          title: Text(dateFmt.format(DateTime.parse(inv['created_at']))),
                          trailing: Text(fmt.format((inv['final_amount'] as num).toDouble()),
                              style: TextStyle(color: inv['status'] == 'paid' ? AppTheme.successColor : AppTheme.warningColor, fontWeight: FontWeight.w600)),
                          subtitle: StatusBadge(inv['status']),
                        )),
                      ],
                    ),
        ),
      ],
    );
  }
}
