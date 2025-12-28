"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountController } from "@/lib/controllers/AccountController";
import { cn } from "@/lib/utils.js";

const menuItems = {
  manager: [
    { emoji: "🏠", label: "Tổng quan", path: "/dashboard/manager" },
    { emoji: "👥", label: "Nhân viên", path: "/dashboard/manager/employees" },
    { emoji: "📆", label: "Lịch làm việc", path: "/dashboard/manager/schedules" },
    { emoji: "✨", label: "Dịch vụ", path: "/dashboard/manager/services" },
    { emoji: "📅", label: "Lịch đặt", path: "/dashboard/manager/appointments" },
    { emoji: "🐾", label: "Thú cưng", path: "/dashboard/manager/pets" },
    { emoji: "👤", label: "Khách hàng", path: "/dashboard/manager/customers" },
    { emoji: "🏠", label: "Chuồng nuôi", path: "/dashboard/manager/cages" },
    { emoji: "💰", label: "Hóa đơn", path: "/dashboard/manager/invoices" },
    { emoji: "📊", label: "Báo cáo", path: "/dashboard/manager/reports" },
    { emoji: "⚙️", label: "Cài đặt", path: "/dashboard/manager/settings" },
  ],
  veterinarian: [
    { emoji: "🏠", label: "Tổng quan", path: "/dashboard/vet" },
    { emoji: "📅", label: "Lịch làm việc", path: "/dashboard/vet/schedule" },
    { emoji: "❤️", label: "Hồ sơ bệnh án", path: "/dashboard/vet/records" },
    { emoji: "⚡", label: "Công việc hôm nay", path: "/dashboard/vet/today" },
    { emoji: "🐾", label: "Bệnh nhân", path: "/dashboard/vet/patients" },
    { emoji: "🏡", label: "Chuồng nuôi", path: "/dashboard/vet/boarding" },
  ],
  care_staff: [
    { emoji: "🏠", label: "Tổng quan", path: "/dashboard/care-staff" },
    { emoji: "📅", label: "Lịch làm việc", path: "/dashboard/care-staff/schedule" },
    { emoji: "📋", label: "Công việc hôm nay", path: "/dashboard/care-staff/today" },
    { emoji: "🏡", label: "Chuồng nuôi", path: "/dashboard/care-staff/cages" },
  ],
  receptionist: [
    { emoji: "🏠", label: "Tổng quan", path: "/dashboard/receptionist" },
    { emoji: "📅", label: "Đặt lịch", path: "/dashboard/receptionist/appointments" },
    { emoji: "📄", label: "Phiếu hẹn", path: "/dashboard/receptionist/slips" },
    { emoji: "🔔", label: "Nhắc lịch", path: "/dashboard/receptionist/reminders" },
    { emoji: "💳", label: "Thanh toán", path: "/dashboard/receptionist/payments" },
    { emoji: "👥", label: "Khách hàng", path: "/dashboard/receptionist/customers" },
  ],
  pet_owner: [
    { emoji: "🏠", label: "Tổng quan", path: "/dashboard/owner" },
    { emoji: "🐾", label: "Thú cưng của tôi", path: "/dashboard/owner/pets" },
    { emoji: "📅", label: "Lịch đặt", path: "/dashboard/owner/appointments" },
    { emoji: "💳", label: "Thanh Toán", path: "/dashboard/owner/invoices" },
    { emoji: "🛍️", label: "Xem dịch vụ", path: "/dashboard/owner/services" },
    { emoji: "👤", label: "Hồ sơ cá nhân", path: "/dashboard/owner/profile" },
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
  const sidebarWidth = isMobile ? "240px" : (isCollapsed ? "80px" : "260px");

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-[1100] p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xl text-2xl"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-[1000] flex flex-col transition-all duration-300",
          "bg-gradient-to-b from-pink-500 via-rose-400 to-pink-500 text-white shadow-2xl",
          isMobile && !mobileOpen && "-translate-x-full"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Header with Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-3xl">
              🐾
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-bold tracking-wide">PAW LOVERS</h2>
                <p className="text-xs opacity-90 font-medium">Pet Care System</p>
              </div>
            )}
          </div>
          {!isMobile && !isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              ← Thu gọn
            </button>
          )}
          {!isMobile && isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xl"
            >
              →
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm font-bold text-xl shrink-0 shadow-lg">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate drop-shadow-md">
                  {userInfo?.name || "User"}
                </p>
                <p className="text-xs opacity-90 truncate font-medium">{getRoleLabel(role)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuList.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  "hover:bg-white/20 hover:shadow-lg hover:scale-[1.02]",
                  isActive && "bg-white/30 shadow-xl backdrop-blur-sm"
                )}
              >
                <span className={cn(
                  "text-2xl shrink-0 transition-transform",
                  "group-hover:scale-110"
                )}>
                  {item.emoji}
                </span>
                {!isCollapsed && (
                  <span className="font-semibold text-sm truncate drop-shadow-md">
                    {item.label}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white shrink-0 shadow-lg" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
              "hover:bg-white/20 hover:shadow-lg transition-all group",
              "text-left"
            )}
          >
            <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🚪
            </span>
            {!isCollapsed && (
              <span className="font-semibold text-sm drop-shadow-md">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
