"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Sun,
  Cloud,
  CloudRain,
  Briefcase,
  Package,
} from "lucide-react";

interface DashboardData {
  overview: {
    totalJobs: number;
    totalRevenue: number;
    pendingRevenue: number;
    totalCustomers: number;
    totalStaff: number;
  };
  jobsByStatus: Record<string, number>;
  lowStockCount: number;
  lowStockItems: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchRecentJobs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/reports/dashboard");
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/jobs?start_date=${today}`);
      const result = await response.json();
      
      if (response.ok) {
        setRecentJobs(result.jobs?.slice(0, 10) || []);
      }
    } catch (err) {
      console.error("Failed to fetch recent jobs:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-900 mb-2">
          Dashboard Data Unavailable
        </h2>
        <p className="text-yellow-700 mb-4">
          {error || "No data available. Make sure your database is set up."}
        </p>
        <div className="space-y-2 text-sm text-yellow-800">
          <p>📋 <strong>Did you run the database schema?</strong></p>
          <p className="ml-6">Run <code className="bg-yellow-100 px-2 py-1 rounded">lib/supabase/schema.sql</code> in Supabase SQL Editor</p>
          <p>📊 <strong>Add sample data:</strong></p>
          <p className="ml-6">Run <code className="bg-yellow-100 px-2 py-1 rounded">lib/supabase/seed-data.sql</code> for test data</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const todaysJobs = data.jobsByStatus?.scheduled || 0;
  const ongoingJobs = data.jobsByStatus?.in_progress || 0;
  const pendingJobs = data.jobsByStatus?.pending || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={data.overview.totalJobs}
          icon={<Calendar className="w-5 h-5" />}
          color="bg-[#09ACAD]"
        />
        <StatCard
          title="Ongoing Jobs"
          value={ongoingJobs}
          icon={<Clock className="w-5 h-5" />}
          color="bg-[#005555]"
        />
        <StatCard
          title="Pending Jobs"
          value={pendingJobs}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-[#28A8AC]"
        />
        <StatCard
          title="Total Customers"
          value={data.overview.totalCustomers}
          icon={<Users className="w-5 h-5" />}
          color="bg-[#145456]"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            <span className="text-sm font-normal">RWF</span> {data.overview.totalRevenue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Paid invoices</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Pending Revenue</h3>
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            <span className="text-sm font-normal">RWF</span> {data.overview.pendingRevenue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Unpaid invoices</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Active Staff</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {data.overview.totalStaff}
          </p>
          <p className="text-sm text-gray-500 mt-2">Team members</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Low Stock</h3>
            <Package className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {data.lowStockCount}
          </p>
          <p className="text-sm text-gray-500 mt-2">Items need restock</p>
        </div>
      </div>

      {/* Job Status Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Jobs by Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(data.jobsByStatus || {}).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{count}</p>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {status.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Jobs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.job_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.booking?.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.booking?.service?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      {data.lowStockItems && data.lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Low Stock Alert
          </h2>
          <div className="space-y-3">
            {data.lowStockItems.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-bold">{item.quantity} {item.unit}</p>
                  <p className="text-sm text-gray-500">Reorder: {item.reorder_level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          title="Add New Service"
          description="Create a new service offering"
          href="/admin/services"
          icon={<Briefcase className="w-5 h-5" />}
          color="bg-[#09ACAD]"
        />
        <QuickAction
          title="Manage Jobs"
          description="View and update job status"
          href="/admin/jobs"
          icon={<Calendar className="w-5 h-5" />}
          color="bg-[#005555]"
        />
        <QuickAction
          title="View Reports"
          description="Access detailed analytics"
          href="/admin/reports"
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-[#28A8AC]"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <div className={`${color} text-white rounded-2xl p-2`}>{icon}</div>
      </div>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-800" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition group"
    >
      <div className={`${color} text-white rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  );
}
