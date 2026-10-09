'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import type { CustomerSubscription, SubscriptionPlan, SubscriptionMetrics } from '@/lib/types/subscriptions';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [billingCycleFilter, setBillingCycleFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [filter, billingCycleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch subscriptions
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const subsResponse = await fetch(`/api/subscriptions?${params}`);
      const subsData = await subsResponse.json();
      setSubscriptions(subsData);

      // Fetch plans
      const plansResponse = await fetch('/api/subscriptions/plans');
      const plansData = await plansResponse.json();
      setPlans(plansData);

      // Calculate metrics
      calculateMetrics(subsData, plansData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (subs: CustomerSubscription[], plans: SubscriptionPlan[]) => {
    const activeSubscriptions = subs.filter(s => s.status === 'active');
    
    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const plan = plans.find(p => p.id === sub.subscription_plan_id);
      if (!plan) return sum;
      
      let monthlyValue = 0;
      switch (plan.billing_cycle) {
        case 'weekly':
          monthlyValue = sub.current_price * 4.33; // Average weeks per month
          break;
        case 'monthly':
          monthlyValue = sub.current_price;
          break;
        case 'yearly':
          monthlyValue = sub.current_price / 12;
          break;
        case 'permanent':
          monthlyValue = 0; // One-time payment
          break;
      }
      return sum + monthlyValue;
    }, 0);

    const arr = mrr * 12;

    // Calculate counts by status and cycle
    const byStatus = {
      active: subs.filter(s => s.status === 'active').length,
      paused: subs.filter(s => s.status === 'paused').length,
      cancelled: subs.filter(s => s.status === 'cancelled').length,
      expired: subs.filter(s => s.status === 'expired').length,
    };

    const byCycle = {
      weekly: activeSubscriptions.filter(s => {
        const plan = plans.find(p => p.id === s.subscription_plan_id);
        return plan?.billing_cycle === 'weekly';
      }).length,
      monthly: activeSubscriptions.filter(s => {
        const plan = plans.find(p => p.id === s.subscription_plan_id);
        return plan?.billing_cycle === 'monthly';
      }).length,
      yearly: activeSubscriptions.filter(s => {
        const plan = plans.find(p => p.id === s.subscription_plan_id);
        return plan?.billing_cycle === 'yearly';
      }).length,
      permanent: activeSubscriptions.filter(s => {
        const plan = plans.find(p => p.id === s.subscription_plan_id);
        return plan?.billing_cycle === 'permanent';
      }).length,
    };

    setMetrics({
      total_active: activeSubscriptions.length,
      total_revenue_mrr: mrr,
      total_revenue_arr: arr,
      churn_rate: 0, // TODO: Calculate from historical data
      new_this_month: 0, // TODO: Calculate from date ranges
      cancelled_this_month: 0,
      by_billing_cycle: byCycle,
      by_status: byStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    return cycle.charAt(0).toUpperCase() + cycle.slice(1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading subscriptions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Contracts</h1>
          <p className="mt-1 text-gray-500">
            Manage recurring services and long-term contracts
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          New Subscription
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.total_active}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue (MRR)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${metrics.total_revenue_mrr.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annual Revenue (ARR)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${metrics.total_revenue_arr.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billing Cycles</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">{metrics.by_billing_cycle.weekly}</span> Weekly
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{metrics.by_billing_cycle.monthly}</span> Monthly
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{metrics.by_billing_cycle.yearly}</span> Yearly
                  </p>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Cycle
            </label>
            <select
              value={billingCycleFilter}
              onChange={(e) => setBillingCycleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cycles</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Billing Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => {
                const plan = plans.find(p => p.id === subscription.subscription_plan_id);
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.customer?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{plan?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {plan ? getBillingCycleLabel(plan.billing_cycle) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${subscription.current_price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.next_billing_date 
                          ? new Date(subscription.next_billing_date).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new subscription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
