import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      print('📊 Fetching dashboard stats...');
      final stats = await SupabaseService.getDashboardStats();
      print('✅ Dashboard stats received: $stats');
      if (mounted) setState(() { _stats = stats; _loading = false; });
    } catch (e, stackTrace) {
      print('❌ Error loading dashboard stats: $e');
      print('Stack trace: $stackTrace');
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load dashboard data: $e'),
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

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final compactFmt = NumberFormat.currency(symbol: '', decimalDigits: 0); // No symbol, no decimals for compact display
    
    return RefreshIndicator(
      onRefresh: _load,
      child: _loading
          ? const LoadingWidget()
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('Welcome back!', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                Text(DateFormat('EEEE, d MMMM yyyy').format(DateTime.now()), style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 20),
                const SectionHeader(title: "Today's Overview"),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: [
                    StatCard(title: "Today's Jobs", value: '${_stats?['todaysJobs'] ?? 0}', icon: Icons.today, color: AppTheme.primaryColor, onTap: () => context.go('/admin/jobs')),
                    StatCard(title: 'Ongoing', value: '${_stats?['ongoingServices'] ?? 0}', icon: Icons.play_circle_outline, color: AppTheme.warningColor, onTap: () => context.go('/admin/jobs')),
                    StatCard(title: 'Tomorrow', value: '${_stats?['tomorrowSchedule'] ?? 0}', icon: Icons.event, color: AppTheme.secondaryColor, onTap: () => context.go('/admin/jobs')),
                    StatCard(
                      title: 'Net Profit', 
                      value: compactFmt.format(_stats?['netProfit'] ?? 0), 
                      icon: Icons.trending_up, 
                      color: AppTheme.successColor, 
                      onTap: () => context.go('/admin/reports'),
                      currencyPrefix: 'RWF',
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const SectionHeader(title: 'Financials'),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _FinRow(label: 'Total Revenue', value: fmt.format(_stats?['totalRevenue'] ?? 0), color: AppTheme.successColor),
                        const Divider(),
                        _FinRow(label: 'Total Expenses', value: fmt.format(_stats?['totalExpenses'] ?? 0), color: AppTheme.errorColor),
                        const Divider(),
                        _FinRow(label: 'Net Profit', value: fmt.format(_stats?['netProfit'] ?? 0), color: AppTheme.primaryColor, bold: true),
                        const Divider(),
                        _FinRow(label: 'Profit Margin', value: '${(_stats?['profitMargin'] ?? 0.0).toStringAsFixed(1)}%', color: AppTheme.primaryColor),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const SectionHeader(title: 'Quick Actions'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _QuickAction(label: 'New Booking', icon: Icons.add_circle_outline, onTap: () => context.go('/admin/bookings')),
                    _QuickAction(label: 'New Quotation', icon: Icons.request_quote_outlined, onTap: () => context.go('/admin/quotations')),
                    _QuickAction(label: 'View Jobs', icon: Icons.work_outline, onTap: () => context.go('/admin/jobs')),
                    _QuickAction(label: 'Invoices', icon: Icons.receipt_long_outlined, onTap: () => context.go('/admin/invoices')),
                  ],
                ),
              ],
            ),
    );
  }
}

class _FinRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final bool bold;
  const _FinRow({required this.label, required this.value, required this.color, this.bold = false});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal)),
            Text(value, style: TextStyle(color: color, fontWeight: bold ? FontWeight.bold : FontWeight.w600)),
          ],
        ),
      );
}

class _QuickAction extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  const _QuickAction({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) => ActionChip(
        avatar: Icon(icon, size: 18),
        label: Text(label),
        onPressed: onTap,
      );
}
