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
    { emoji: "💉", label: "Tiêm phòng", path: "/dashboard/vet/vaccinations" },
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

// Pet avatars for different roles
const roleAvatars = {
  manager: "🦁",
  veterinarian: "🐕",
  care_staff: "🐱",
  receptionist: "🐰",
  pet_owner: "🐾",
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

export default function Sidebar({ role, userInfo, onCollapsedChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuList = menuItems[role] || menuItems.pet_owner;

  // Role-based gradient colors
  const roleGradients = {
    manager: "from-indigo-600 via-purple-600 to-pink-500",
    veterinarian: "from-teal-500 via-cyan-500 to-blue-500",
    care_staff: "from-green-500 via-emerald-500 to-teal-500",
    receptionist: "from-blue-500 via-sky-500 to-cyan-500",
    pet_owner: "from-amber-500 via-orange-500 to-rose-500"
  };
  const sidebarGradient = roleGradients[role] || roleGradients.pet_owner;

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
  const sidebarWidth = isMobile ? "260px" : (isCollapsed ? "88px" : "280px");

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-[1100] p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl text-2xl hover:scale-110 transition-transform"
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
          `bg-gradient-to-b ${sidebarGradient} text-white shadow-2xl`,
          "sidebar-custom-scrollbar",
          isMobile && !mobileOpen && "-translate-x-full"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Header with Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm text-4xl shadow-lg group-hover:scale-110 transition-transform">
              🐾
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-wide drop-shadow-md">PAW LOVERS</h2>
                <p className="text-sm opacity-90 font-semibold">Pet Care System</p>
              </div>
            )}
          </div>
          {!isMobile && !isCollapsed && (
            <button
              onClick={() => {
                setIsCollapsed(true);
                onCollapsedChange?.(true);
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-base font-semibold flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>←</span> Thu gọn
            </button>
          )}
          {!isMobile && isCollapsed && (
            <button
              onClick={() => {
                setIsCollapsed(false);
                onCollapsedChange?.(false);
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-2xl hover:scale-110"
            >
              →
            </button>
          )}
        </div>

        {/* User Info with Pet Avatar */}
        <div className="p-5 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm text-3xl shrink-0 shadow-lg ring-2 ring-white/30">
              {roleAvatars[role] || "🐾"}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md animate-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-lg truncate drop-shadow-md">
                  {userInfo?.name || "User"}
                </p>
                <p className="text-sm opacity-90 truncate font-semibold flex items-center gap-1">
                  <span className="text-xs">✨</span> {getRoleLabel(role)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scroll">
          {menuList.map((item, index) => {
            const isActive = pathname === item.path;
            const isHovered = hoveredItem === index;

            return (
              <Link
                key={index}
                href={item.path}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                  "hover:bg-white/20 hover:shadow-lg hover:scale-[1.02]",
                  isActive && "bg-white/30 shadow-xl backdrop-blur-sm ring-2 ring-white/30",
                  isCollapsed && "justify-center" // Center content when collapsed
                )}
              >
                {/* Paw print trail effect when hovered */}
                {isHovered && !isCollapsed && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-40">
                    <span className="text-sm animate-bounce" style={{ animationDelay: '0ms' }}>🐾</span>
                    <span className="text-xs animate-bounce" style={{ animationDelay: '100ms' }}>🐾</span>
                    <span className="text-[10px] animate-bounce" style={{ animationDelay: '200ms' }}>🐾</span>
                  </div>
                )}
                
                <span className={cn(
                  "text-3xl shrink-0 transition-all duration-300",
                  "group-hover:scale-125 group-hover:rotate-6",
                  isActive && "drop-shadow-lg"
                )}>
                  {item.emoji}
                </span>
                {!isCollapsed && (
                  <span className="font-bold text-base truncate drop-shadow-md">
                    {item.label}
                  </span>
                )}
                
                {/* Active indicator with glow */}
                {isActive && !isCollapsed && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-white shrink-0 shadow-lg animate-pulse" />
                    <div className="absolute right-2 w-4 h-4 rounded-full bg-white/30 blur-sm animate-ping" />
                  </div>
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
              "flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl",
              "hover:bg-red-500/30 hover:shadow-lg transition-all group",
              "text-left hover:scale-[1.02]"
            )}
          >
            <span className="text-3xl shrink-0 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">
              🚪
            </span>
            {!isCollapsed && (
              <span className="font-bold text-base drop-shadow-md">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Firefox scrollbar */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}

