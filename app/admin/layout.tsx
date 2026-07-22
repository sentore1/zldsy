"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  DollarSign,
  Package,
  Truck,
  BarChart,
  Settings,
  UserCircle,
  Receipt,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    customers: false,
    operations: false,
    financial: false,
    resources: false,
    more: false,
  });
  const [pinnedSections, setPinnedSections] = useState<Record<string, boolean>>({
    customers: false,
    operations: false,
    financial: false,
    resources: false,
    more: false,
  });

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    
    if (!isAuth) {
      router.push("/login");
    } else {
      setUserEmail(email || "");
    }
  }, [router]);

  // Determine which section should be pinned based on current path
  useEffect(() => {
    const newPinnedSections = {
      customers: pathname?.includes('/customers') || pathname?.includes('/services'),
      operations: pathname?.includes('/bookings') || pathname?.includes('/quotations') || pathname?.includes('/jobs'),
      financial: pathname?.includes('/invoices') || pathname?.includes('/payments'),
      resources: pathname?.includes('/staff') || pathname?.includes('/inventory') || pathname?.includes('/equipment'),
      more: pathname?.includes('/reports') || pathname?.includes('/settings'),
    };
    setPinnedSections(newPinnedSections);
    setOpenSections(prev => ({
      ...prev,
      ...newPinnedSections
    }));
  }, [pathname]);

  const handleSectionHover = (section: string, isHovering: boolean) => {
    // Only respond to hover if section is not pinned
    if (!pinnedSections[section]) {
      setOpenSections(prev => ({
        ...prev,
        [section]: isHovering
      }));
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    
    // Clear cookie
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to login
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          {userEmail && (
            <p className="text-sm text-gray-400 mt-2 truncate">{userEmail}</p>
          )}
        </div>
        <nav className="space-y-1 px-3 flex-1 overflow-y-auto bg-gray-900">
          {/* Dashboard - Standalone */}
          <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />}>
            Dashboard
          </NavLink>

          {/* Customers & Services Group */}
          <NavSection 
            title="Customers" 
            isOpen={openSections.customers}
            onHover={(isHovering) => handleSectionHover('customers', isHovering)}
          >
            <NavLink href="/admin/customers" icon={<Users size={16} />} isNested>
              Customers
            </NavLink>
            <NavLink href="/admin/services" icon={<Briefcase size={16} />} isNested>
              Services
            </NavLink>
          </NavSection>

          {/* Operations Group */}
          <NavSection 
            title="Operations" 
            isOpen={openSections.operations}
            onHover={(isHovering) => handleSectionHover('operations', isHovering)}
          >
            <NavLink href="/admin/bookings" icon={<Calendar size={16} />} isNested>
              Bookings
            </NavLink>
            <NavLink href="/admin/quotations" icon={<FileText size={16} />} isNested>
              Quotations
            </NavLink>
            <NavLink href="/admin/jobs" icon={<Calendar size={16} />} isNested>
              Jobs
            </NavLink>
          </NavSection>

          {/* Financial Group */}
          <NavSection 
            title="Financial" 
            isOpen={openSections.financial}
            onHover={(isHovering) => handleSectionHover('financial', isHovering)}
          >
            <NavLink href="/admin/invoices" icon={<Receipt size={16} />} isNested>
              Invoices
            </NavLink>
            <NavLink href="/admin/payments" icon={<DollarSign size={16} />} isNested>
              Payments
            </NavLink>
          </NavSection>

          {/* Resources Group */}
          <NavSection 
            title="Resources" 
            isOpen={openSections.resources}
            onHover={(isHovering) => handleSectionHover('resources', isHovering)}
          >
            <NavLink href="/admin/staff" icon={<UserCircle size={16} />} isNested>
              Staff
            </NavLink>
            <NavLink href="/admin/inventory" icon={<Package size={16} />} isNested>
              Inventory
            </NavLink>
            <NavLink href="/admin/equipment" icon={<Truck size={16} />} isNested>
              Equipment
            </NavLink>
          </NavSection>

          {/* More Group (Reports & Settings) */}
          <NavSection 
            title="More" 
            isOpen={openSections.more}
            onHover={(isHovering) => handleSectionHover('more', isHovering)}
          >
            <NavLink href="/admin/reports" icon={<BarChart size={16} />} isNested>
              Reports
            </NavLink>
            <NavLink href="/admin/settings" icon={<Settings size={16} />} isNested>
              Settings
            </NavLink>
          </NavSection>
        </nav>
        
        {/* Logout Button */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white shadow">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Service Management System
            </h2>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  isNested = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isNested?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg transition ${
        isNested 
          ? `px-3 py-2 text-sm ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-800 text-gray-300"}`
          : `px-4 py-3 gap-3 ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-800 text-gray-300"}`
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function NavSection({
  title,
  isOpen,
  onHover,
  children,
}: {
  title: string;
  isOpen: boolean;
  onHover: (isHovering: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div 
      className="mt-1"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 transition cursor-pointer">
        <span className="font-semibold text-sm tracking-wide">{title}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isOpen && (
        <div className="ml-2 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
