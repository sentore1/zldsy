import 'package:flutter/material.dart';
import '../../models/subscription.dart';
import '../../services/subscription_service.dart';
import 'package:intl/intl.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<CustomerSubscription> _subscriptions = [];
  List<SubscriptionPlan> _plans = [];
  bool _isLoading = true;
  String _filterStatus = 'all';
  String _filterCycle = 'all';

  // Metrics
  int _totalActive = 0;
  double _mrr = 0;
  double _arr = 0;
  Map<String, int> _statusCounts = {};
  Map<String, int> _cycleCounts = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final subscriptions = await SubscriptionService.getSubscriptions(
        status: _filterStatus != 'all' ? _filterStatus : null,
      );
      final plans = await SubscriptionService.getSubscriptionPlans(
        isActive: true,
      );

      setState(() {
        _subscriptions = subscriptions;
        _plans = plans;
        _calculateMetrics();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _calculateMetrics() {
    final activeSubscriptions =
        _subscriptions.where((s) => s.status == 'active').toList();

    _totalActive = activeSubscriptions.length;

    // Calculate MRR
    double mrr = 0;
    for (var sub in activeSubscriptions) {
      final plan = _plans.firstWhere((p) => p.id == sub.subscriptionPlanId,
          orElse: () => _plans.first);

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
          // One-time, doesn't count toward MRR
          break;
      }
    }
    _mrr = mrr;
    _arr = mrr * 12;

    // Count by status
    _statusCounts = {
      'active': _subscriptions.where((s) => s.status == 'active').length,
      'paused': _subscriptions.where((s) => s.status == 'paused').length,
      'cancelled': _subscriptions.where((s) => s.status == 'cancelled').length,
      'expired': _subscriptions.where((s) => s.status == 'expired').length,
    };

    // Count by cycle
    _cycleCounts = {
      'weekly': 0,
      'monthly': 0,
      'yearly': 0,
      'permanent': 0,
    };
    for (var sub in activeSubscriptions) {
      final plan = _plans.firstWhere((p) => p.id == sub.subscriptionPlanId,
          orElse: () => _plans.first);
      _cycleCounts[plan.billingCycle] =
          (_cycleCounts[plan.billingCycle] ?? 0) + 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscriptions & Contracts'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.repeat), text: 'Subscriptions'),
            Tab(icon: Icon(Icons.description), text: 'Plans'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildSubscriptionsTab(),
                _buildPlansTab(),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create subscription screen
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSubscriptionsTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Metrics Cards
          _buildMetricsSection(),
          const SizedBox(height: 24),

          // Filters
          _buildFiltersSection(),
          const SizedBox(height: 16),

          // Subscriptions List
          _buildSubscriptionsList(),
        ],
      ),
    );
  }

  Widget _buildMetricsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Overview',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _buildMetricCard(
              'Active',
              _totalActive.toString(),
              Icons.people,
              Colors.blue,
            ),
            _buildMetricCard(
              'MRR',
              '\$${_mrr.toStringAsFixed(0)}',
              Icons.attach_money,
              Colors.green,
            ),
            _buildMetricCard(
              'ARR',
              '\$${_arr.toStringAsFixed(0)}',
              Icons.trending_up,
              Colors.purple,
            ),
            _buildMetricCard(
              'Weekly',
              '${_cycleCounts['weekly']}',
              Icons.calendar_today,
              Colors.orange,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFiltersSection() {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<String>(
            value: _filterStatus,
            decoration: const InputDecoration(
              labelText: 'Status',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            items: const [
              DropdownMenuItem(value: 'all', child: Text('All Status')),
              DropdownMenuItem(value: 'active', child: Text('Active')),
              DropdownMenuItem(value: 'paused', child: Text('Paused')),
              DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
            ],
            onChanged: (value) {
              if (value != null) {
                setState(() => _filterStatus = value);
                _loadData();
              }
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: DropdownButtonFormField<String>(
            value: _filterCycle,
            decoration: const InputDecoration(
              labelText: 'Cycle',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            items: const [
              DropdownMenuItem(value: 'all', child: Text('All Cycles')),
              DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
              DropdownMenuItem(value: 'monthly', child: Text('Monthly')),
              DropdownMenuItem(value: 'yearly', child: Text('Yearly')),
              DropdownMenuItem(value: 'permanent', child: Text('Permanent')),
            ],
            onChanged: (value) {
              if (value != null) {
                setState(() => _filterCycle = value);
                // Filter locally for cycle
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSubscriptionsList() {
    if (_subscriptions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No subscriptions found',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Subscriptions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _subscriptions.length,
          itemBuilder: (context, index) {
            final subscription = _subscriptions[index];
            final plan = _plans.firstWhere(
              (p) => p.id == subscription.subscriptionPlanId,
              orElse: () => _plans.first,
            );

            return _buildSubscriptionCard(subscription, plan);
          },
        ),
      ],
    );
  }

  Widget _buildSubscriptionCard(
      CustomerSubscription subscription, SubscriptionPlan plan) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        title: Text(
          subscription.customer?['name'] ?? 'Unknown Customer',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(plan.name),
            const SizedBox(height: 4),
            Row(
              children: [
                Chip(
                  label: Text(
                    subscription.statusLabel,
                    style: const TextStyle(fontSize: 11),
                  ),
                  backgroundColor: _getStatusColor(subscription.status),
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                ),
                const SizedBox(width: 8),
                Text(
                  plan.billingCycleLabel,
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '\$${subscription.currentPrice.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            if (subscription.nextBillingDate != null)
              Text(
                DateFormat('MMM d, y').format(subscription.nextBillingDate!),
                style: TextStyle(color: Colors.grey[600], fontSize: 11),
              ),
          ],
        ),
        onTap: () {
          _showSubscriptionDetails(subscription, plan);
        },
      ),
    );
  }

  Widget _buildPlansTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Available Plans',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (_plans.isEmpty)
            const Center(child: Text('No plans available'))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _plans.length,
              itemBuilder: (context, index) {
                return _buildPlanCard(_plans[index]);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(SubscriptionPlan plan) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(
          plan.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(plan.billingCycleLabel),
        trailing: Text(
          '\$${plan.effectivePrice.toStringAsFixed(2)}',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (plan.description != null) ...[
                  Text(plan.description!),
                  const SizedBox(height: 12),
                ],
                _buildPlanDetail(
                  'Billing Cycle',
                  plan.billingCycleLabel,
                ),
                _buildPlanDetail(
                  'Included Visits',
                  plan.includedVisits?.toString() ?? 'Unlimited',
                ),
                if (plan.visitDuration != null)
                  _buildPlanDetail(
                    'Visit Duration',
                    '${plan.visitDuration} minutes',
                  ),
                _buildPlanDetail(
                  'Setup Fee',
                  '\$${plan.setupFee.toStringAsFixed(2)}',
                ),
                if (plan.discountPercentage > 0)
                  _buildPlanDetail(
                    'Discount',
                    '${plan.discountPercentage}%',
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey[600]),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return Colors.green.withOpacity(0.2);
      case 'paused':
        return Colors.orange.withOpacity(0.2);
      case 'cancelled':
        return Colors.red.withOpacity(0.2);
      case 'expired':
        return Colors.grey.withOpacity(0.2);
      default:
        return Colors.blue.withOpacity(0.2);
    }
  }

  void _showSubscriptionDetails(
      CustomerSubscription subscription, SubscriptionPlan plan) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Subscription Details',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 16),
              _buildDetailRow('Plan', plan.name),
              _buildDetailRow('Customer',
                  subscription.customer?['name'] ?? 'Unknown'),
              _buildDetailRow('Status', subscription.statusLabel),
              _buildDetailRow('Billing Cycle', plan.billingCycleLabel),
              _buildDetailRow(
                  'Price', '\$${subscription.currentPrice.toStringAsFixed(2)}'),
              if (subscription.nextBillingDate != null)
                _buildDetailRow(
                  'Next Billing',
                  DateFormat('MMM d, y').format(subscription.nextBillingDate!),
                ),
              if (subscription.visitsRemaining != null)
                _buildDetailRow('Visits Remaining',
                    subscription.visitsRemaining.toString()),
              if (subscription.notes != null && subscription.notes!.isNotEmpty)
                _buildDetailRow('Notes', subscription.notes!),
              const SizedBox(height: 24),
              if (subscription.isActive) ...[
                ElevatedButton.icon(
                  onPressed: () => _pauseSubscription(subscription.id),
                  icon: const Icon(Icons.pause),
                  label: const Text('Pause Subscription'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                  ),
                ),
                const SizedBox(height: 8),
              ],
              if (subscription.isPaused)
                ElevatedButton.icon(
                  onPressed: () => _resumeSubscription(subscription.id),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Resume Subscription'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                ),
              if (!subscription.isCancelled)
                OutlinedButton.icon(
                  onPressed: () => _cancelSubscription(subscription.id),
                  icon: const Icon(Icons.cancel),
                  label: const Text('Cancel Subscription'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pauseSubscription(String id) async {
    final startDate = DateTime.now();
    final endDate = startDate.add(const Duration(days: 30));

    try {
      await SubscriptionService.pauseSubscription(
        id,
        pauseStartDate: startDate.toIso8601String(),
        pauseEndDate: endDate.toIso8601String(),
        reason: 'Paused from mobile app',
      );

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Subscription paused successfully')),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _resumeSubscription(String id) async {
    try {
      await SubscriptionService.resumeSubscription(id);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Subscription resumed successfully')),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _cancelSubscription(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: const Text(
          'Are you sure you want to cancel this subscription? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes, Cancel'),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await SubscriptionService.cancelSubscription(
          id,
          immediate: false,
          reason: 'Cancelled from mobile app',
        );

        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Subscription cancelled')),
          );
          _loadData();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }
}
