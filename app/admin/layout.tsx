"use client";

import Link from "next/link";
import Image from "next/image";
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
  Clipboard,
  Wallet,
  Boxes,
  MoreHorizontal,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Role = "admin" | "manager" | "staff";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

// Which nav sections each role can see
const ROLE_ACCESS: Record<Role, string[]> = {
  admin: ["dashboard", "customers", "operations", "financial", "resources", "more"],
  manager: ["dashboard", "customers", "operations", "financial", "resources", "reports"],
  staff: ["dashboard", "jobs"],
};

function hasAccess(role: Role, section: string) {
  return ROLE_ACCESS[role]?.includes(section) ?? false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<Role>("staff");
  const [collapsed, setCollapsed] = useState(false);
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
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email ?? "");

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setUserRole((data?.role as Role) ?? "staff");
    });
  }, [router]);

  useEffect(() => {
    const newPinned = {
      customers: pathname?.includes("/customers") || pathname?.includes("/services"),
      operations: pathname?.includes("/bookings") || pathname?.includes("/quotations") || pathname?.includes("/jobs"),
      financial: pathname?.includes("/invoices") || pathname?.includes("/payments"),
      resources: pathname?.includes("/staff") || pathname?.includes("/inventory") || pathname?.includes("/equipment"),
      more: pathname?.includes("/reports") || pathname?.includes("/settings"),
    };
    setPinnedSections(newPinned);
    setOpenSections((prev) => ({ ...prev, ...newPinned }));
  }, [pathname]);

  const handleSectionHover = (section: string, isHovering: boolean) => {
    if (!pinnedSections[section]) {
      setOpenSections((prev) => ({ ...prev, [section]: isHovering }));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className="text-white flex flex-col overflow-hidden transition-all duration-300"
        style={{ backgroundColor: "#005555", width: collapsed ? "64px" : "256px" }}
      >
        {/* Header */}
        <div className={`flex items-center border-b border-[#09ACAD]/40 ${collapsed ? "justify-center p-4" : "justify-between p-4 pl-5"}`}>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={28} 
                  height={28}
                  className="object-contain"
                />
                <h1 className="text-lg font-bold whitespace-nowrap">Admin Panel</h1>
              </div>
              {userEmail && (
                <p className="text-xs text-gray-400 truncate max-w-[160px]">{userEmail}</p>
              )}
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[#09ACAD]/30 text-[#09ACAD] capitalize">
                {ROLE_LABELS[userRole]}
              </span>
            </div>
          )}
          {collapsed && (
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={32} 
              height={32}
              className="object-contain"
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[#09ACAD]/30 transition text-gray-200 flex-shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <SidebarOpen size={20} /> : <SidebarClose size={20} />}
          </button>
        </div>

        <nav className="space-y-1 px-2 flex-1 overflow-y-auto pt-2">
          {hasAccess(userRole, "dashboard") && (
            <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} collapsed={collapsed}>
              Dashboard
            </NavLink>
          )}

          {hasAccess(userRole, "customers") && (
            <NavSection
              title="Customers"
              icon={<Users size={18} />}
              isOpen={openSections.customers}
              onHover={(h) => handleSectionHover("customers", h)}
              collapsed={collapsed}
            >
              <NavLink href="/admin/customers" icon={<Users size={16} />} isNested collapsed={collapsed}>Customers</NavLink>
              <NavLink href="/admin/services" icon={<Briefcase size={16} />} isNested collapsed={collapsed}>Services</NavLink>
            </NavSection>
          )}

          {hasAccess(userRole, "operations") && (
            <NavSection
              title="Operations"
              icon={<Clipboard size={18} />}
              isOpen={openSections.operations}
              onHover={(h) => handleSectionHover("operations", h)}
              collapsed={collapsed}
            >
              <NavLink href="/admin/bookings" icon={<Calendar size={16} />} isNested collapsed={collapsed}>Bookings</NavLink>
              <NavLink href="/admin/quotations" icon={<FileText size={16} />} isNested collapsed={collapsed}>Quotations</NavLink>
              <NavLink href="/admin/jobs" icon={<Briefcase size={16} />} isNested collapsed={collapsed}>Jobs</NavLink>
            </NavSection>
          )}

          {/* Staff role: direct Jobs link without section wrapper */}
          {userRole === "staff" && (
            <NavLink href="/admin/jobs" icon={<Briefcase size={20} />} collapsed={collapsed}>
              Jobs
            </NavLink>
          )}

          {hasAccess(userRole, "financial") && (
            <NavSection
              title="Financial"
              icon={<Wallet size={18} />}
              isOpen={openSections.financial}
              onHover={(h) => handleSectionHover("financial", h)}
              collapsed={collapsed}
            >
              <NavLink href="/admin/invoices" icon={<Receipt size={16} />} isNested collapsed={collapsed}>Invoices</NavLink>
              <NavLink href="/admin/payments" icon={<DollarSign size={16} />} isNested collapsed={collapsed}>Payments</NavLink>
            </NavSection>
          )}

          {hasAccess(userRole, "resources") && (
            <NavSection
              title="Resources"
              icon={<Boxes size={18} />}
              isOpen={openSections.resources}
              onHover={(h) => handleSectionHover("resources", h)}
              collapsed={collapsed}
            >
              <NavLink href="/admin/staff" icon={<UserCircle size={16} />} isNested collapsed={collapsed}>Staff</NavLink>
              <NavLink href="/admin/inventory" icon={<Package size={16} />} isNested collapsed={collapsed}>Inventory</NavLink>
              <NavLink href="/admin/equipment" icon={<Truck size={16} />} isNested collapsed={collapsed}>Equipment</NavLink>
            </NavSection>
          )}

          {(hasAccess(userRole, "more") || hasAccess(userRole, "reports")) && (
            <NavSection
              title="More"
              icon={<MoreHorizontal size={18} />}
              isOpen={openSections.more}
              onHover={(h) => handleSectionHover("more", h)}
              collapsed={collapsed}
            >
              {hasAccess(userRole, "reports") && (
                <NavLink href="/admin/reports" icon={<BarChart size={16} />} isNested collapsed={collapsed}>Reports</NavLink>
              )}
              {userRole === "admin" && (
                <NavLink href="/admin/settings" icon={<Settings size={16} />} isNested collapsed={collapsed}>Settings</NavLink>
              )}
            </NavSection>
          )}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-[#09ACAD]/40">
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center rounded-lg hover:bg-red-600 transition text-white ${collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
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
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
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
  href, icon, children, isNested = false, collapsed = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isNested?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      className={`flex items-center rounded-lg transition ${
        collapsed
          ? `justify-center p-3 ${isActive ? "bg-[#09ACAD] text-white" : "hover:bg-[#09ACAD]/30 text-gray-200"}`
          : isNested
          ? `gap-2 px-3 py-2 text-sm ${isActive ? "bg-[#09ACAD] text-white" : "hover:bg-[#09ACAD]/30 text-gray-200"}`
          : `gap-3 px-4 py-3 ${isActive ? "bg-[#09ACAD] text-white" : "hover:bg-[#09ACAD]/30 text-gray-200"}`
      }`}
    >
      {icon}
      {!collapsed && <span>{children}</span>}
    </Link>
  );
}

function NavSection({
  title, icon, isOpen, onHover, children, collapsed = false,
}: {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onHover: (isHovering: boolean) => void;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className="mt-1" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <div
        title={collapsed ? title : undefined}
        className={`w-full flex items-center rounded-lg hover:bg-[#09ACAD]/30 text-gray-200 transition cursor-pointer ${
          collapsed ? "justify-center p-3" : "justify-between px-4 py-2"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "" : "gap-2"}`}>
          {icon}
          {!collapsed && <span className="font-semibold text-sm tracking-wide">{title}</span>}
        </div>
        {!collapsed && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </div>
      {isOpen && !collapsed && (
        <div className="ml-4 mt-1 space-y-1 border-l border-[#09ACAD]/40 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}
