"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Sparkles,
  Calendar,
  DollarSign,
  BarChart3,
  Bell,
  LogOut,
  ClipboardList,
  FileText,
  CreditCard,
  ShoppingBag,
  PawPrint,
  Box,
  Menu,
  X,
} from "lucide-react";
import { AccountController } from "@/lib/controllers/AccountController";
import { cn } from "@/lib/utils.js";

// Icon mapping function
const getIcon = (iconName, label) => {
  if (label === "Chuồng nuôi") {
    return Box;
  }

  const iconMap = {
    "🏠": Home,
    "👥": Users,
    "✨": Sparkles,
    "📅": Calendar,
    "💰": DollarSign,
    "📊": BarChart3,
    "🔔": Bell,
    "🚪": LogOut,
    "📋": ClipboardList,
    "📄": FileText,
    "💳": CreditCard,
    "🛍️": ShoppingBag,
    "🐾": PawPrint,
  };
  return iconMap[iconName] || Home;
};

const menuItems = {
  manager: [
    { icon: "🏠", label: "Tổng quan", path: "/dashboard/manager" },
    { icon: "👥", label: "Nhân viên", path: "/dashboard/manager/staff" },
    { icon: "📆", label: "Lịch làm việc", path: "/dashboard/manager/schedules" },
    { icon: "✨", label: "Dịch vụ", path: "/dashboard/manager/services" },
    { icon: "📅", label: "Lịch đặt", path: "/dashboard/manager/appointments" },
    { icon: "🐾", label: "Thú cưng", path: "/dashboard/manager/pets" },
    { icon: "👤", label: "Khách hàng", path: "/dashboard/manager/customers" },
    { icon: "🏠", label: "Chuồng nuôi", path: "/dashboard/manager/cages" },
    { icon: "💰", label: "Hóa đơn", path: "/dashboard/manager/invoices" },
    { icon: "📊", label: "Báo cáo", path: "/dashboard/manager/reports" },
  ],
  veterinarian: [
    { icon: "🏠", label: "Tổng quan", path: "/dashboard/vet" },
    { icon: "📅", label: "Lịch làm việc", path: "/dashboard/vet/schedule" },
    { icon: "👥", label: "Hồ sơ bệnh án", path: "/dashboard/vet/records" },
    { icon: "📋", label: "Công việc hôm nay", path: "/dashboard/vet/today" },
    { icon: "🐾", label: "Bệnh nhân", path: "/dashboard/vet/patients" },
  ],
  care_staff: [
    { icon: "🏠", label: "Tổng quan", path: "/dashboard/care-staff" },
    { icon: "📅", label: "Lịch làm việc", path: "/dashboard/care-staff/schedule" },
    { icon: "📋", label: "Công việc hôm nay", path: "/dashboard/care-staff/today" },
  ],
  receptionist: [
    { icon: "🏠", label: "Tổng quan", path: "/dashboard/receptionist" },
    { icon: "📅", label: "Đặt lịch", path: "/dashboard/receptionist/appointments" },
    { icon: "📄", label: "Phiếu hẹn", path: "/dashboard/receptionist/slips" },
    { icon: "🔔", label: "Nhắc lịch", path: "/dashboard/receptionist/reminders" },
    { icon: "💳", label: "Thanh toán", path: "/dashboard/receptionist/payments" },
    { icon: "👥", label: "Khách hàng", path: "/dashboard/receptionist/customers" },
  ],
  pet_owner: [
    { icon: "🏠", label: "Tổng quan", path: "/dashboard/owner" },
    { icon: "🐾", label: "Thú cưng của tôi", path: "/dashboard/owner/pets" },
    { icon: "📅", label: "Lịch đặt", path: "/dashboard/owner/appointments" },
    { icon: "💳", label: "Thanh Toán", path: "/dashboard/owner/payments" },
    { icon: "🛍️", label: "Xem dịch vụ", path: "/dashboard/owner/services" },
  ],
};

function getRoleLabel(role) {
  const labels = {
    manager: "Quản lý",
    veterinarian: "Bác sĩ",
    care_staff: "Nhân viên",
    receptionist: "Lễ tân",
    pet_owner: "Chủ nuôi",
  };
  return labels[role] || "User";
}

export default function Sidebar({ role, userInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuList = menuItems[role] || menuItems.pet_owner;

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    AccountController.handleLogout();
    router.push("/login");
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Calculate sidebar width
  const sidebarWidth = isMobile ? "240px" : (isCollapsed ? "64px" : "240px");

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-[1100] p-2 rounded-lg bg-gradient-to-r from-[#FF6B9D] to-[#C239B3] text-white shadow-lg"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-[1000] flex flex-col transition-all duration-300",
          "bg-gradient-to-b from-[#FF6B9D] to-[#C239B3] text-white shadow-lg",
          isMobile && !mobileOpen && "-translate-x-full"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
              <PawPrint className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold">PAW LOVERS</h2>
                <p className="text-xs opacity-90">Pet Care System</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "→" : "←"}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 font-bold text-lg shrink-0">
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {userInfo?.name || "User"}
              </p>
              <p className="text-xs opacity-80 truncate">{getRoleLabel(role)}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {menuList.map((item, index) => {
            const isActive = pathname === item.path;
            const IconComponent = getIcon(item.icon, item.label);

            return (
              <Link
                key={index}
                href={item.path}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all",
                  "hover:bg-white/10 active:bg-white/20",
                  isActive && "bg-white/20 shadow-md"
                )}
              >
                <IconComponent
                  className={cn("h-5 w-5 shrink-0", isActive && "text-white")}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg",
              "hover:bg-white/10 active:bg-white/20 transition-colors",
              "text-left"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
