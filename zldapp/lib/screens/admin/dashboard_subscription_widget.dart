import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/subscription_service.dart';
import '../../theme.dart';

/// Widget to display subscription metrics on the dashboard
class DashboardSubscriptionWidget extends StatefulWidget {
  const DashboardSubscriptionWidget({Key? key}) : super(key: key);

  @override
  State<DashboardSubscriptionWidget> createState() =>
      _DashboardSubscriptionWidgetState();
}

class _DashboardSubscriptionWidgetState
    extends State<DashboardSubscriptionWidget> {
  int _activeCount = 0;
  double _mrr = 0;
  double _arr = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSubscriptionStats();
  }

  Future<void> _loadSubscriptionStats() async {
    try {
      final subscriptions = await SubscriptionService.getSubscriptions(
        status: 'active',
      );
      final plans = await SubscriptionService.getSubscriptionPlans(
        isActive: true,
      );

      // Calculate MRR
      double mrr = 0;
      for (var sub in subscriptions) {
        final plan = plans.firstWhere(
          (p) => p.id == sub.subscriptionPlanId,
          orElse: () => plans.first,
        );

        switch (plan.billingCycle) {
          case 'weekly':
            mrr += sub.currentPrice * 4.33; // Average weeks per month
            break;
          case 'monthly':
            mrr += sub.currentPrice;
            break;
          case 'yearly':
            mrr += sub.currentPrice / 12;
            break;
          case 'permanent':
            // One-time payment, doesn't count toward MRR
            break;
        }
      }

      if (mounted) {
        setState(() {
          _activeCount = subscriptions.length;
          _mrr = mrr;
          _arr = mrr * 12;
          _loading = false;
        });
      }
    } catch (e) {
      print('Error loading subscription stats: $e');
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    final compactFmt = NumberFormat.currency(symbol: '', decimalDigits: 0);

    return Card(
      child: InkWell(
        onTap: () => context.go('/admin/subscriptions'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Subscriptions',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.purple.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.repeat,
                      color: Colors.purple,
                      size: 20,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMetric(
                    'Active',
                    _activeCount.toString(),
                    Icons.check_circle,
                    Colors.green,
                  ),
                  _buildMetric(
                    'MRR',
                    'RWF ${compactFmt.format(_mrr)}',
                    Icons.attach_money,
                    Colors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMetric(
                    'ARR',
                    'RWF ${compactFmt.format(_arr)}',
                    Icons.trending_up,
                    Colors.orange,
                  ),
                  TextButton.icon(
                    onPressed: () => context.go('/admin/subscriptions'),
                    icon: const Icon(Icons.arrow_forward, size: 16),
                    label: const Text('View All'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

/// Compact subscription stat card for grid view
class SubscriptionStatCard extends StatelessWidget {
  final int activeCount;
  final double mrr;

  const SubscriptionStatCard({
    Key? key,
    required this.activeCount,
    required this.mrr,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final compactFmt = NumberFormat.currency(symbol: '', decimalDigits: 0);

    return Card(
      child: InkWell(
        onTap: () => context.go('/admin/subscriptions'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.repeat,
                  color: Colors.purple,
                  size: 24,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                activeCount.toString(),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Active Subs',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'RWF ${compactFmt.format(mrr)}',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Colors.purple,
                ),
              ),
              const Text(
                'MRR',
                style: TextStyle(
                  fontSize: 9,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
