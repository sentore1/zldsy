import 'package:flutter/material.dart';
import '../models/subscription.dart';

/// Badge to display subscription status with appropriate color
class SubscriptionStatusBadge extends StatelessWidget {
  final String status;
  final bool compact;

  const SubscriptionStatusBadge({
    Key? key,
    required this.status,
    this.compact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    String label;

    switch (status.toLowerCase()) {
      case 'active':
        backgroundColor = Colors.green.withOpacity(0.2);
        textColor = Colors.green.shade700;
        label = 'Active';
        break;
      case 'paused':
        backgroundColor = Colors.orange.withOpacity(0.2);
        textColor = Colors.orange.shade700;
        label = 'Paused';
        break;
      case 'cancelled':
        backgroundColor = Colors.red.withOpacity(0.2);
        textColor = Colors.red.shade700;
        label = 'Cancelled';
        break;
      case 'expired':
        backgroundColor = Colors.grey.withOpacity(0.2);
        textColor = Colors.grey.shade700;
        label = 'Expired';
        break;
      case 'pending':
        backgroundColor = Colors.blue.withOpacity(0.2);
        textColor = Colors.blue.shade700;
        label = 'Pending';
        break;
      default:
        backgroundColor = Colors.grey.withOpacity(0.2);
        textColor = Colors.grey.shade700;
        label = status;
    }

    return Chip(
      label: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: compact ? 10 : 12,
          fontWeight: FontWeight.w600,
        ),
      ),
      backgroundColor: backgroundColor,
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 4 : 8,
        vertical: 0,
      ),
      visualDensity: compact ? VisualDensity.compact : VisualDensity.standard,
    );
  }
}

/// Badge to display billing cycle
class BillingCycleBadge extends StatelessWidget {
  final String billingCycle;

  const BillingCycleBadge({
    Key? key,
    required this.billingCycle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    IconData icon;
    String label;

    switch (billingCycle.toLowerCase()) {
      case 'weekly':
        icon = Icons.calendar_view_week;
        label = 'Weekly';
        break;
      case 'monthly':
        icon = Icons.calendar_month;
        label = 'Monthly';
        break;
      case 'yearly':
        icon = Icons.calendar_today;
        label = 'Yearly';
        break;
      case 'permanent':
        icon = Icons.all_inclusive;
        label = 'Permanent';
        break;
      default:
        icon = Icons.calendar_today;
        label = billingCycle;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.blue.shade700),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.blue.shade700,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

/// Card to display subscription plan info
class SubscriptionPlanCard extends StatelessWidget {
  final SubscriptionPlan plan;
  final VoidCallback? onTap;
  final bool showDetails;

  const SubscriptionPlanCard({
    Key? key,
    required this.plan,
    this.onTap,
    this.showDetails = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      plan.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (plan.isFeatured)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.star,
                            size: 12,
                            color: Colors.amber.shade700,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Featured',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.amber.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              BillingCycleBadge(billingCycle: plan.billingCycle),
              const SizedBox(height: 12),
              Text(
                'RWF ${plan.effectivePrice.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
              if (plan.promotionalPrice != null &&
                  plan.promotionValidUntil != null &&
                  plan.promotionValidUntil!.isAfter(DateTime.now())) ...[
                const SizedBox(height: 4),
                Text(
                  'Regular: RWF ${plan.price.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
              ],
              if (showDetails) ...[
                const Divider(height: 24),
                if (plan.description != null) ...[
                  Text(
                    plan.description!,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                _buildPlanDetail(
                  'Visits',
                  plan.includedVisits?.toString() ?? 'Unlimited',
                  Icons.event_available,
                ),
                if (plan.visitDuration != null)
                  _buildPlanDetail(
                    'Duration',
                    '${plan.visitDuration} min',
                    Icons.access_time,
                  ),
                if (plan.setupFee > 0)
                  _buildPlanDetail(
                    'Setup Fee',
                    'RWF ${plan.setupFee.toStringAsFixed(2)}',
                    Icons.price_change,
                  ),
                if (plan.discountPercentage > 0)
                  _buildPlanDetail(
                    'Discount',
                    '${plan.discountPercentage}%',
                    Icons.local_offer,
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlanDetail(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact subscription summary for lists
class SubscriptionListTile extends StatelessWidget {
  final CustomerSubscription subscription;
  final SubscriptionPlan? plan;
  final VoidCallback? onTap;

  const SubscriptionListTile({
    Key? key,
    required this.subscription,
    this.plan,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.all(12),
        title: Text(
          subscription.customer?['name'] ?? 'Unknown Customer',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(plan?.name ?? 'Unknown Plan'),
            const SizedBox(height: 4),
            Row(
              children: [
                SubscriptionStatusBadge(
                  status: subscription.status,
                  compact: true,
                ),
                const SizedBox(width: 8),
                if (plan != null)
                  Text(
                    plan!.billingCycleLabel,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[600],
                    ),
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
              'RWF ${subscription.currentPrice.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            if (subscription.nextBillingDate != null)
              Text(
                _formatDate(subscription.nextBillingDate!),
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[600],
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;

    if (difference == 0) return 'Today';
    if (difference == 1) return 'Tomorrow';
    if (difference < 7) return 'In $difference days';

    final month = [
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ][date.month];
    return '$month ${date.day}';
  }
}

/// Empty state for subscriptions
class SubscriptionEmptyState extends StatelessWidget {
  final String message;
  final VoidCallback? onActionTap;
  final String? actionLabel;

  const SubscriptionEmptyState({
    Key? key,
    this.message = 'No subscriptions found',
    this.onActionTap,
    this.actionLabel,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.repeat_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            if (onActionTap != null && actionLabel != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onActionTap,
                icon: const Icon(Icons.add),
                label: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
