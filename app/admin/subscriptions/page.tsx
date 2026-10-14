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
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerMonthlyTotal, setCustomerMonthlyTotal] = useState<number>(0);
  const [customerServices, setCustomerServices] = useState<any[]>([]);
  const [customerTopService, setCustomerTopService] = useState<string | null>(null);
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCustomers();
  }, [filter, billingCycleFilter]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCustomerMonthlyData = async (customerId: string) => {
    if (!customerId) {
      setCustomerMonthlyTotal(0);
      setCustomerServices([]);
      setCustomerTopService(null);
      return;
    }

    setLoadingCustomerData(true);
    try {
      // Get start and end of current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Fetch customer's bookings and jobs from this month
      const [bookingsRes, jobsRes, invoicesRes] = await Promise.all([
        fetch(`/api/bookings?customer_id=${customerId}&start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`),
        fetch(`/api/jobs?customer_id=${customerId}&start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`),
        fetch(`/api/invoices?customer_id=${customerId}&start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`)
      ]);

      const bookings = await bookingsRes.json();
      const jobs = await jobsRes.json();
      const invoices = await invoicesRes.json();

      // Calculate total from invoices (most accurate)
      let total = 0;
      const services: any[] = [];
      const serviceUsage: { [key: string]: { name: string; amount: number; count: number } } = {};

      if (invoices && Array.isArray(invoices)) {
        invoices.forEach((invoice: any) => {
          total += invoice.final_amount || invoice.total_amount || 0;
          if (invoice.job) {
            const serviceName = invoice.job.service?.name || 'Unknown Service';
            const amount = invoice.final_amount || invoice.total_amount || 0;
            
            services.push({
              type: 'Invoice',
              description: `Job #${invoice.job.job_number}`,
              serviceName: serviceName,
              amount: amount,
              date: invoice.created_at
            });

            // Track service usage
            if (!serviceUsage[serviceName]) {
              serviceUsage[serviceName] = { name: serviceName, amount: 0, count: 0 };
            }
            serviceUsage[serviceName].amount += amount;
            serviceUsage[serviceName].count += 1;
          }
        });
      }

      // If no invoices, calculate from completed jobs
      if (total === 0 && jobs?.jobs && Array.isArray(jobs.jobs)) {
        jobs.jobs.forEach((job: any) => {
          if (job.status === 'completed') {
            const jobTotal = (job.total_labor_cost || 0) + (job.total_material_cost || 0) + (job.total_equipment_cost || 0);
            total += jobTotal;
            const serviceName = job.service?.name || 'Unknown Service';
            
            services.push({
              type: 'Completed Job',
              description: `Job #${job.job_number}`,
              serviceName: serviceName,
              amount: jobTotal,
              date: job.scheduled_date
            });

            // Track service usage
            if (!serviceUsage[serviceName]) {
              serviceUsage[serviceName] = { name: serviceName, amount: 0, count: 0 };
            }
            serviceUsage[serviceName].amount += jobTotal;
            serviceUsage[serviceName].count += 1;
          }
        });
      }

      // If still no total, use bookings
      if (total === 0 && bookings?.bookings && Array.isArray(bookings.bookings)) {
        bookings.bookings.forEach((booking: any) => {
          if (booking.service?.base_price) {
            total += booking.service.base_price;
            const serviceName = booking.service.name;
            
            services.push({
              type: 'Booking',
              description: booking.service.name,
              serviceName: serviceName,
              amount: booking.service.base_price,
              date: booking.booking_date
            });

            // Track service usage
            if (!serviceUsage[serviceName]) {
              serviceUsage[serviceName] = { name: serviceName, amount: 0, count: 0 };
            }
            serviceUsage[serviceName].amount += booking.service.base_price;
            serviceUsage[serviceName].count += 1;
          }
        });
      }

      // Find the top service by amount spent
      let topService: string | null = null;
      let maxAmount = 0;
      Object.values(serviceUsage).forEach(service => {
        if (service.amount > maxAmount) {
          maxAmount = service.amount;
          topService = service.name;
        }
      });

      setCustomerMonthlyTotal(total);
      setCustomerServices(services);
      setCustomerTopService(topService);
    } catch (error) {
      console.error('Error fetching customer monthly data:', error);
      setCustomerMonthlyTotal(0);
      setCustomerServices([]);
      setCustomerTopService(null);
    } finally {
      setLoadingCustomerData(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    fetchCustomerMonthlyData(customerId);
  };

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
      
      if (!plansResponse.ok) {
        console.error('Failed to fetch plans:', plansResponse.status, plansResponse.statusText);
        throw new Error(`Failed to fetch plans: ${plansResponse.statusText}`);
      }
      
      const plansData = await plansResponse.json();
      console.log('Fetched plans:', plansData); // Debug log
      
      if (!Array.isArray(plansData)) {
        console.error('Plans data is not an array:', plansData);
        setPlans([]);
      } else {
        setPlans(plansData);
      }

      // Calculate metrics
      calculateMetrics(subsData, plansData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setPlans([]); // Set empty array on error
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
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
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
                  RWF {metrics.total_revenue_mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  RWF {metrics.total_revenue_arr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        RWF {subscription.current_price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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

      {/* New Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Subscription</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCustomer('');
                    setCustomerMonthlyTotal(0);
                    setCustomerServices([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                try {
                  const customPrice = formData.get('custom_price');
                  const billingCycle = formData.get('billing_cycle');
                  const subscriptionPlanId = formData.get('subscription_plan_id');
                  
                  // Validate: either plan OR custom price must be provided
                  if (!subscriptionPlanId && !customPrice) {
                    alert('Please select a plan or enter a custom price');
                    return;
                  }
                  
                  const payload: any = {
                    customer_id: formData.get('customer_id'),
                    start_date: formData.get('start_date'),
                    payment_method: formData.get('payment_method'),
                    notes: formData.get('notes'),
                  };
                  
                  // If custom price is provided, use it; otherwise use plan
                  if (customPrice && parseFloat(customPrice as string) > 0) {
                    payload.custom_price = parseFloat(customPrice as string);
                    payload.billing_cycle = billingCycle || 'monthly';
                    // Note: When custom_price is set, subscription_plan_id can be null or omitted
                  } else if (subscriptionPlanId) {
                    payload.subscription_plan_id = subscriptionPlanId;
                  }
                  
                  const response = await fetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  if (response.ok) {
                    setShowModal(false);
                    setSelectedCustomer('');
                    setCustomerMonthlyTotal(0);
                    setCustomerServices([]);
                    setCustomerTopService(null);
                    fetchData(); // Refresh the list
                    alert('Subscription created successfully!');
                  } else {
                    const error = await response.json();
                    alert('Error creating subscription: ' + (error.error || 'Unknown error'));
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Failed to create subscription');
                }
              }}>
                <div className="space-y-4">
                  {/* Customer Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      name="customer_id"
                      required
                      value={selectedCustomer}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Monthly Summary */}
                  {selectedCustomer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        Customer's Activity This Month
                      </h3>
                      {loadingCustomerData ? (
                        <p className="text-sm text-blue-700">Loading customer data...</p>
                      ) : (
                        <>
                          <div className="mb-3">
                            <p className="text-sm text-blue-700">
                              Total Spent This Month:
                            </p>
                            <p className="text-2xl font-bold text-blue-900">
                              RWF {customerMonthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            {customerTopService && (
                              <p className="text-xs text-blue-600 mt-1">
                                Most Used: <span className="font-semibold">{customerTopService}</span>
                              </p>
                            )}
                          </div>
                          {customerServices.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-blue-700 mb-1">Services:</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {customerServices.map((service, idx) => (
                                  <div key={idx} className="text-xs text-blue-600 flex justify-between">
                                    <span>{service.serviceName ? `${service.description} (${service.serviceName})` : service.description}</span>
                                    <span className="font-medium">RWF {service.amount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {customerServices.length === 0 && (
                            <p className="text-xs text-blue-600">No services found this month</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Plan Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plan *
                    </label>
                    
                    {/* Smart Suggestion: Convert Current Spending */}
                    {customerMonthlyTotal > 0 && (
                      <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="use-current-spending"
                            className="mt-1"
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Auto-fill with customer's spending
                                const form = e.target.closest('form');
                                if (form) {
                                  const planSelect = form.querySelector('[name="subscription_plan_id"]') as HTMLSelectElement;
                                  if (planSelect) planSelect.value = '';
                                  
                                  const priceInput = form.querySelector('[name="custom_price"]') as HTMLInputElement;
                                  if (priceInput) priceInput.value = customerMonthlyTotal.toString();
                                }
                              }
                            }}
                          />
                          <label htmlFor="use-current-spending" className="flex-1 cursor-pointer">
                            <div className="text-sm font-semibold text-green-900">
                              Convert Current Spending to Subscription
                            </div>
                            <div className="text-xs text-green-700 mt-1">
                              This customer spent <span className="font-bold">RWF {customerMonthlyTotal.toLocaleString()}</span> this month
                              {customerTopService && ` on ${customerTopService}`}.
                              Check this to create a subscription based on their actual usage.
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {plans.length === 0 ? (
                      <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        No subscription plans available. Please create plans first at{' '}
                        <a href="/admin/subscription-plans" className="underline font-semibold">
                          Subscription Plans
                        </a>
                      </div>
                    ) : (
                      <>
                        <select
                          name="subscription_plan_id"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a plan (or use custom pricing below)</option>
                          {plans
                            .sort((a, b) => {
                              // If customer has monthly spending, prioritize plans intelligently
                              if (customerMonthlyTotal > 0) {
                                // Score based on price match (within 30%)
                                const aPriceDiff = Math.abs(a.price - customerMonthlyTotal);
                                const bPriceDiff = Math.abs(b.price - customerMonthlyTotal);
                                const aPriceScore = aPriceDiff / customerMonthlyTotal;
                                const bPriceScore = bPriceDiff / customerMonthlyTotal;
                                
                                // Score based on service match
                                const aServiceMatch = customerTopService && 
                                  (a.service?.name === customerTopService || !a.service_id) ? 0 : 1;
                                const bServiceMatch = customerTopService && 
                                  (b.service?.name === customerTopService || !b.service_id) ? 0 : 1;
                                
                                // Combined score (service match is more important)
                                const aScore = (aServiceMatch * 2) + aPriceScore;
                                const bScore = (bServiceMatch * 2) + bPriceScore;
                                
                                return aScore - bScore;
                              }
                              return 0;
                            })
                            .map((plan) => {
                              // Determine if this plan is recommended
                              const priceMatch = customerMonthlyTotal > 0 && 
                                Math.abs(plan.price - customerMonthlyTotal) < customerMonthlyTotal * 0.3;
                              const serviceMatch = customerTopService && 
                                (plan.service?.name === customerTopService || !plan.service_id);
                              const isRecommended = priceMatch && serviceMatch;
                              
                              return (
                                <option key={plan.id} value={plan.id}>
                                  {isRecommended ? '[RECOMMENDED] ' : ''}
                                  {plan.name} - {plan.service?.name || 'All Services'} - RWF {plan.price.toLocaleString()} / {plan.billing_cycle}
                                </option>
                              );
                            })}
                        </select>
                        
                        {/* Custom Price Option */}
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Or set custom monthly price:
                          </label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                name="custom_price"
                                placeholder={customerMonthlyTotal > 0 ? `e.g., ${customerMonthlyTotal}` : 'Custom amount'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                            <select
                              name="billing_cycle"
                              defaultValue="monthly"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                              <option value="permanent">Permanent</option>
                            </select>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to use selected plan's pricing
                          </p>
                        </div>
                        
                        {customerMonthlyTotal > 0 && (
                          <p className="mt-2 text-xs text-gray-500">
                            Plans marked [RECOMMENDED] match the customer's spending (RWF {customerMonthlyTotal.toLocaleString()})
                            {customerTopService && ` for ${customerTopService}`}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      name="payment_method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select payment method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCustomer('');
                      setCustomerMonthlyTotal(0);
                      setCustomerServices([]);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Subscription
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
