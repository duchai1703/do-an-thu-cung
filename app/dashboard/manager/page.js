/**
 * Manager Dashboard - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager
 * 
 * Features:
 * - Gradient header với greeting
 * - Stats cards với animations
 * - Revenue chart (7 ngày)
 * - Upcoming appointments timeline
 * - Top services ranking
 * - Notifications panel
 * 
 * API: GET /reports/dashboard
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    todayAppointments: 0,
    boardingPets: 0,
    activeStaff: 0,
    totalStaff: 0,
    recentAppointments: [],
    topServices: [],
    notifications: [],
    revenueChange: 0,
    appointmentChange: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get current user
      const userRes = await apiClient.get('/auth/me');
      const userData = userRes.data || userRes;
      setUser(userData);

      // Load dashboard data in parallel
      const [dashboardRes, appointmentsRes, employeesRes, servicesRes, cagesRes, invoicesRes] = await Promise.all([
        apiClient.get('/reports/dashboard').catch(() => ({ data: null })),
        apiClient.get('/appointments').catch(() => ({ data: [] })),
        apiClient.get('/employees').catch(() => ({ data: [] })),
        apiClient.get('/services').catch(() => ({ data: [] })),
        apiClient.get('/cages/assignments/active').catch(() => ({ data: [] })),
        apiClient.get('/invoices').catch(() => ({ data: [] }))
      ]);

      // Process data
      const dashboard = dashboardRes.data || {};
      const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : 
                          (appointmentsRes.data?.data || appointmentsRes || []);
      const employees = Array.isArray(employeesRes.data) ? employeesRes.data : 
                       (employeesRes.data?.data || employeesRes || []);
      const services = Array.isArray(servicesRes.data) ? servicesRes.data : 
                      (servicesRes.data?.data || servicesRes || []);
      const cageAssignments = Array.isArray(cagesRes.data) ? cagesRes.data : 
                             (cagesRes.data?.data || cagesRes || []);
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : 
                      (invoicesRes.data?.data || invoicesRes || []);

      // Get today's date using local time (avoid UTC timezone issues)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // Filter today's appointments
      const todayAppointments = appointments.filter(apt => {
        const aptDate = apt.appointmentDate?.split('T')[0] || '';
        return aptDate === today;
      });

      // Get upcoming appointments (next 5)
      const upcomingAppointments = appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= new Date() && apt.status !== 'CANCELLED';
        })
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

      // Count active staff
      const activeStaff = employees.filter(e => e.isAvailable !== false).length;

      // Calculate today's revenue from invoices
      const todayInvoices = invoices.filter(inv => {
        const invDate = inv.createdAt?.split('T')[0] || inv.invoiceDate?.split('T')[0] || '';
        return invDate === today && (inv.status === 'PAID' || inv.paymentStatus === 'PAID');
      });
      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

      // Calculate top services from appointments (real data)
      const serviceCountMap = {};
      appointments.forEach(apt => {
        const servicesList = apt.appointmentServices || [];
        servicesList.forEach(as => {
          const serviceName = as.service?.serviceName || as.serviceName || 'Unknown';
          const servicePrice = as.service?.basePrice || as.price || 0;
          if (!serviceCountMap[serviceName]) {
            serviceCountMap[serviceName] = { name: serviceName, count: 0, revenue: 0 };
          }
          serviceCountMap[serviceName].count += 1;
          serviceCountMap[serviceName].revenue += servicePrice;
        });
      });
      const topServices = Object.values(serviceCountMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Build dynamic notifications based on real data
      const notifications = [];
      const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length;
      const confirmedToday = todayAppointments.filter(a => a.status === 'CONFIRMED').length;
      const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID' || inv.paymentStatus === 'UNPAID').length;
      
      if (pendingAppointments > 0) {
        notifications.push({ type: 'warning', emoji: '🟡', text: `${pendingAppointments} lịch hẹn đang chờ xác nhận` });
      }
      if (unpaidInvoices > 0) {
        notifications.push({ type: 'warning', emoji: '⚠️', text: `${unpaidInvoices} hóa đơn chưa thanh toán` });
      }
      if (confirmedToday > 0) {
        notifications.push({ type: 'success', emoji: '✅', text: `${confirmedToday} lịch hẹn hôm nay đã xác nhận` });
      }
      if (cageAssignments.length > 0) {
        notifications.push({ type: 'info', emoji: '🏠', text: `${cageAssignments.length} thú cưng đang lưu trú` });
      }
      if (notifications.length === 0) {
        notifications.push({ type: 'success', emoji: '🎉', text: 'Mọi thứ đang hoạt động tốt!' });
      }

      // Calculate change percentages (compare with yesterday's data if available)
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
      
      const yesterdayAppointments = appointments.filter(apt => {
        const aptDate = apt.appointmentDate?.split('T')[0] || '';
        return aptDate === yesterday;
      }).length;
      
      const yesterdayInvoices = invoices.filter(inv => {
        const invDate = inv.createdAt?.split('T')[0] || inv.invoiceDate?.split('T')[0] || '';
        return invDate === yesterday && (inv.status === 'PAID' || inv.paymentStatus === 'PAID');
      });
      const yesterdayRevenue = yesterdayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

      // Calculate percentage changes
      const revenueChange = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;
      const appointmentChange = yesterdayAppointments > 0 ? todayAppointments.length - yesterdayAppointments : todayAppointments.length;

      setDashboardData({
        todayRevenue,
        todayAppointments: todayAppointments.length,
        boardingPets: cageAssignments.length,
        activeStaff,
        totalStaff: employees.length,
        recentAppointments: upcomingAppointments,
        topServices,
        notifications,
        revenueChange,
        appointmentChange
      });

    } catch (error) {
      console.error("Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Navigation items
  const navItems = [
    { emoji: '👥', label: 'Nhân viên', path: '/dashboard/manager/staff' },
    { emoji: '📅', label: 'Lịch hẹn', path: '/dashboard/manager/appointments' },
    { emoji: '💼', label: 'Dịch vụ', path: '/dashboard/manager/services' },
    { emoji: '📆', label: 'Lịch làm việc', path: '/dashboard/manager/schedules' },
    { emoji: '🏠', label: 'Chuồng nuôi', path: '/dashboard/manager/cages' },
    { emoji: '💰', label: 'Hóa đơn', path: '/dashboard/manager/invoices' },
  ];

  // Get pet emoji
  const getPetEmoji = (species) => {
    const emojiMap = {
      'Dog': '🐕', 'Chó': '🐕',
      'Cat': '🐈', 'Mèo': '🐈',
      'Bird': '🐦', 'Chim': '🐦',
      'Rabbit': '🐇', 'Thỏ': '🐇',
      'Hamster': '🐹',
      'Turtle': '🐢', 'Rùa': '🐢',
      'Fish': '🐟', 'Cá': '🐟'
    };
    return emojiMap[species] || '🐾';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { emoji: '🟡', label: 'Chờ XN', bg: 'bg-amber-100 text-amber-700' },
      'CONFIRMED': { emoji: '🟢', label: 'Đã XN', bg: 'bg-green-100 text-green-700' },
      'IN_PROGRESS': { emoji: '🔵', label: 'Đang thực hiện', bg: 'bg-blue-100 text-blue-700' },
      'COMPLETED': { emoji: '✅', label: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-700' },
      'CANCELLED': { emoji: '🔴', label: 'Đã hủy', bg: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                {getGreeting()}, {user?.fullName || 'Manager'}! 👋
              </h1>
              <p className="text-white/90 flex items-center gap-2">
                <span>📅</span>
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                <span className="mx-2">|</span>
                <span>⏰</span>
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/manager/reports')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              📈 Xem báo cáo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Revenue */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">💰</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  dashboardData.revenueChange >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {dashboardData.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.revenueChange || 0)}%
                </span>
              </div>
              <p className="text-gray-500 text-sm">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(dashboardData.todayRevenue)}
              </p>
            </CardContent>
          </Card>

          {/* Today Appointments */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">📅</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  dashboardData.appointmentChange >= 0 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {dashboardData.appointmentChange >= 0 ? '+' : ''}{dashboardData.appointmentChange || 0}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Lịch hẹn hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.todayAppointments}
              </p>
            </CardContent>
          </Card>

          {/* Boarding Pets */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🐾</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  Đang lưu trú
                </span>
              </div>
              <p className="text-gray-500 text-sm">Thú cưng lưu trú</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.boardingPets}
              </p>
            </CardContent>
          </Card>

          {/* Active Staff */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">👥</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {dashboardData.totalStaff > 0 ? Math.round((dashboardData.activeStaff / dashboardData.totalStaff) * 100) : 0}%
                </span>
              </div>
              <p className="text-gray-500 text-sm">Nhân viên làm việc</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.activeStaff}/{dashboardData.totalStaff || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-white shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Truy cập nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Lịch hẹn sắp tới
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/dashboard/manager/appointments')}
              >
                Xem tất cả →
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardData.recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentAppointments.map((apt, idx) => {
                    const status = getStatusBadge(apt.status);
                    return (
                      <div
                        key={apt.appointmentId || apt.id || idx}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/manager/appointments`)}
                      >
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                          <div className="text-center">
                            <div className="text-lg font-bold">{formatTime(apt.appointmentDate)}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getPetEmoji(apt.pet?.species)}</span>
                            <span className="font-semibold text-gray-900">{apt.pet?.name || 'N/A'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg}`}>
                              {status.emoji} {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {apt.appointmentServices && apt.appointmentServices.length > 0
                              ? apt.appointmentServices.map(as => as.service?.serviceName || as.serviceName).join(', ')
                              : (apt.service?.serviceName || apt.allServicesDisplay || 'Dịch vụ')}
                            {apt.employee && ` • ${apt.employee.fullName}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl block mb-4">📭</span>
                  <p className="text-gray-500">Chưa có lịch hẹn sắp tới</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Services */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Top dịch vụ tháng này
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.topServices.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{service.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min((service.count / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{service.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  Thông báo quan trọng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.notifications.map((notif, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        notif.type === 'warning' ? 'bg-amber-50' :
                        notif.type === 'success' ? 'bg-green-50' :
                        'bg-gray-50'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{notif.emoji}</span>
                      <p className="text-sm text-gray-700">{notif.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
