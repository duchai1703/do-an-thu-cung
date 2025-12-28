/**
 * Reports & Statistics - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/reports
 * 
 * Features:
 * - Gradient header (Violet → Purple)
 * - Date range picker
 * - Report tabs: Financial, Appointments, Services, Employees
 * - Stats cards
 * - Charts (simulated with CSS)
 * 
 * APIs:
 * - GET /reports/dashboard
 * - GET /reports/financial
 * - GET /reports/revenue
 * - GET /reports/appointments
 * - GET /reports/services/top
 * - GET /reports/employees/workload
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ReportsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("financial");
  
  // Date range
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [employeeWorkload, setEmployeeWorkload] = useState([]);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentYear = new Date().getFullYear();
      
      // Call all report APIs - backend now handles missing dates with defaults
      const [dashboardRes, revenueRes, appointmentsRes, servicesRes, employeesRes] = await Promise.all([
        apiClient.get('/reports/dashboard').catch(e => { console.log('Dashboard error:', e); return { data: null }; }),
        apiClient.get(`/reports/revenue?period=month&year=${currentYear}`).catch(e => { console.log('Revenue error:', e); return { data: null }; }),
        apiClient.get(`/reports/appointments?startDate=${startDate}&endDate=${endDate}`).catch(e => { console.log('Appointments error:', e); return { data: null }; }),
        apiClient.get(`/reports/services/top?limit=5&startDate=${startDate}&endDate=${endDate}&sortBy=count`).catch(e => { console.log('Services error:', e); return { data: [] }; }),
        apiClient.get(`/reports/employees/workload?startDate=${startDate}&endDate=${endDate}`).catch(e => { console.log('Employees error:', e); return { data: [] }; })
      ]);
      
      console.log('Dashboard data:', dashboardRes.data);
      console.log('Revenue data:', revenueRes.data);
      console.log('Appointments data:', appointmentsRes.data);
      console.log('Services data:', servicesRes.data);
      console.log('Employees data:', employeesRes.data);
      
      const dashboard = dashboardRes.data?.data || dashboardRes.data || {};
      const revenueArray = revenueRes.data?.data || revenueRes.data || [];
      const appointments = appointmentsRes.data?.data || appointmentsRes.data || {};
      const services = servicesRes.data?.data || servicesRes.data || [];
      const employees = employeesRes.data?.data || employeesRes.data || [];
      
      setDashboardData(dashboard);
      
      // Calculate revenue from array response or use dashboard data
      let totalRevenue = dashboard.revenue?.thisMonth || 0;
      let invoiceCount = 0;
      if (Array.isArray(revenueArray) && revenueArray.length > 0) {
        totalRevenue = revenueArray.reduce((sum, item) => sum + (item.revenue || 0), 0);
        invoiceCount = revenueArray.reduce((sum, item) => sum + (item.invoiceCount || 0), 0);
      }
      
      // Use pending invoices from dashboard for invoice count if no revenue data
      const pendingInvoices = dashboard.revenue?.pendingInvoices || 0;
      
      setRevenueData({
        totalRevenue: totalRevenue,
        paidRevenue: totalRevenue,
        pendingRevenue: pendingInvoices,
        invoiceCount: invoiceCount || pendingInvoices || 0,
        monthly: Array.isArray(revenueArray) ? revenueArray : [] // Revenue by month data
      });
      
      // Set appointment stats from API - byStatus contains the actual status values
      const byStatus = appointments.byStatus || {};
      setAppointmentStats({
        total: appointments.total || 0,
        completed: byStatus.completed || byStatus.COMPLETED || 0,
        pending: byStatus.pending || byStatus.PENDING || 0,
        confirmed: byStatus.confirmed || byStatus.CONFIRMED || 0,
        in_progress: byStatus.in_progress || byStatus.IN_PROGRESS || 0,
        cancelled: byStatus.cancelled || byStatus.CANCELLED || 0,
        byStatus: byStatus  // Keep original byStatus for chart
      });
      
      // Set top services - use bookingCount from API
      if (Array.isArray(services) && services.length > 0) {
        setTopServices(services.map(s => ({
          ...s,
          count: s.bookingCount || s.count || 0  // Map bookingCount to count for display
        })));
      } else {
        setTopServices([]);
      }
      
      // Set employee workload from API
      if (Array.isArray(employees) && employees.length > 0) {
        setEmployeeWorkload(employees);
      } else {
        setEmployeeWorkload([]);
      }
      
    } catch (error) {
      console.error("Error loading reports:", error);
      showToast("Không thể tải dữ liệu báo cáo", "error");
    } finally {
      setLoading(false);
    }
  };

  // UI Helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
  };

  const formatPercent = (value) => {
    return Math.round(value || 0) + '%';
  };

  const tabs = [
    { id: 'financial', label: '💰 Tài chính', icon: '💰' },
    { id: 'appointments', label: '📅 Lịch hẹn', icon: '📅' },
    { id: 'services', label: '💼 Dịch vụ', icon: '💼' },
    { id: 'employees', label: '👥 Nhân viên', icon: '👥' }
  ];

  // Render bar chart (simple CSS-based)
  const renderBar = (value, maxValue, color = 'bg-violet-500') => {
    const width = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
    return (
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-500 text-lg">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white p-8 pb-28 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Báo Cáo & Thống Kê
              </h1>
              <p className="text-white/90">
                Phân tích doanh thu và hiệu suất hoạt động
              </p>
            </div>
            <Button 
              onClick={loadData}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              🔄 Làm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Date Range Picker */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-gray-500">📅 Khoảng thời gian:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-400">→</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'financial' && (
          <>
            {/* Revenue Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-violet-600">
                    {formatCurrency(revenueData?.totalRevenue || dashboardData?.revenue?.total || 0)}
                  </p>
                  <p className="text-sm text-gray-500">💰 Tổng doanh thu</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(revenueData?.paidRevenue || dashboardData?.revenue?.paid || 0)}
                  </p>
                  <p className="text-sm text-gray-500">✅ Đã thanh toán</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatCurrency(revenueData?.pendingRevenue || dashboardData?.revenue?.pending || 0)}
                  </p>
                  <p className="text-sm text-gray-500">⏳ Chờ thanh toán</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-gray-600">
                    {revenueData?.invoiceCount || dashboardData?.invoices?.total || 0}
                  </p>
                  <p className="text-sm text-gray-500">🧾 Hóa đơn</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Month Chart - uses /reports/revenue?period=month */}
            <Card className="bg-white shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Doanh Thu Theo Tháng (Năm {new Date().getFullYear()})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {revenueData?.monthly?.length > 0 ? (
                  <div className="space-y-3">
                    {revenueData.monthly.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-24 text-sm text-gray-600">{item.period}</span>
                        {renderBar(item.revenue, revenueData.monthly.reduce((max, d) => Math.max(max, d.revenue || 0), 0))}
                        <span className="w-32 text-right text-sm font-medium">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">📈</span>
                    <p>Chưa có dữ liệu doanh thu trong năm này</p>
                  </div>
                )}
              </CardContent>
            </Card>

{/* Payment Methods - Removed: Backend chưa hỗ trợ thống kê phương thức thanh toán */}
          </>
        )}

        {activeTab === 'appointments' && (
          <>
            {/* Appointment Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-violet-600">
                    {appointmentStats?.total || dashboardData?.appointments?.total || 0}
                  </p>
                  <p className="text-sm text-gray-500">📅 Tổng lịch hẹn</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {appointmentStats?.completed || dashboardData?.appointments?.completed || 0}
                  </p>
                  <p className="text-sm text-gray-500">✅ Hoàn thành</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {appointmentStats?.pending || dashboardData?.appointments?.pending || 0}
                  </p>
                  <p className="text-sm text-gray-500">⏳ Chờ xử lý</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {appointmentStats?.cancelled || dashboardData?.appointments?.cancelled || 0}
                  </p>
                  <p className="text-sm text-gray-500">❌ Đã hủy</p>
                </CardContent>
              </Card>
            </div>

            {/* Appointments by Status */}
            <Card className="bg-white shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📈</span>
                  Thống Kê Theo Trạng Thái
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Hoàn thành', value: appointmentStats?.byStatus?.completed || appointmentStats?.completed || 0, color: 'bg-green-500', emoji: '✅' },
                    { label: 'Đang xử lý', value: appointmentStats?.byStatus?.in_progress || 0, color: 'bg-blue-500', emoji: '🔵' },
                    { label: 'Chờ xử lý', value: appointmentStats?.byStatus?.pending || appointmentStats?.pending || 0, color: 'bg-yellow-500', emoji: '🟡' },
                    { label: 'Đã hủy', value: appointmentStats?.byStatus?.cancelled || appointmentStats?.cancelled || 0, color: 'bg-red-500', emoji: '🔴' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8">{item.emoji}</span>
                      <span className="w-32 text-sm text-gray-600">{item.label}</span>
                      {renderBar(item.value, appointmentStats?.total || 1, item.color)}
                      <span className="w-16 text-right font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card className="bg-white shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-6xl font-bold text-green-600">
                    {appointmentStats?.total > 0 
                      ? Math.round((appointmentStats?.completed || 0) / appointmentStats.total * 100)
                      : 0}%
                  </p>
                  <p className="text-gray-500 mt-2">📊 Tỷ lệ hoàn thành</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'services' && (
          <>
            {/* Top Services */}
            <Card className="bg-white shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  Top 5 Dịch Vụ Được Sử Dụng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topServices.length > 0 ? (
                  <div className="space-y-4">
                    {topServices.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-8 text-xl font-bold text-violet-600">#{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service.serviceName || service.name}</p>
                          <p className="text-sm text-gray-500">{service.categoryName || 'Dịch vụ'}</p>
                        </div>
                        {renderBar(service.count || service.bookings, topServices[0]?.count || topServices[0]?.bookings || 1)}
                        <span className="w-20 text-right">
                          <span className="text-lg font-bold text-violet-600">{service.count || service.bookings || 0}</span>
                          <span className="text-sm text-gray-500 ml-1">lượt</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">💼</span>
                    <p>Chưa có dữ liệu dịch vụ</p>
                  </div>
                )}
              </CardContent>
            </Card>

{/* Service Categories - Removed: Backend chưa hỗ trợ phân loại dịch vụ theo category */}
          </>
        )}

        {activeTab === 'employees' && (
          <>
            {/* Employee Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-violet-600">
                    {employeeWorkload.length || dashboardData?.overview?.totalEmployees || 0}
                  </p>
                  <p className="text-sm text-gray-500">👥 Tổng nhân viên</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {employeeWorkload.filter(e => (e.totalAppointments || 0) > 0).length || 0}
                  </p>
                  <p className="text-sm text-gray-500">🟢 Có lịch hẹn</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {employeeWorkload.reduce((sum, e) => sum + (e.totalAppointments || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">📅 Tổng lịch hẹn</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {employeeWorkload.reduce((sum, e) => sum + (e.completedAppointments || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">✅ Đã hoàn thành</p>
                </CardContent>
              </Card>
            </div>

            {/* Employee Workload */}
            <Card className="bg-white shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">👨‍⚕️</span>
                  Hiệu Suất Nhân Viên
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {employeeWorkload.length > 0 ? (
                  <div className="space-y-4">
                    {employeeWorkload.map((emp, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white flex items-center justify-center font-bold">
                          {(emp.employeeName || emp.fullName || 'NV').charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{emp.employeeName || emp.fullName}</p>
                          <p className="text-xs text-gray-500">{emp.role || emp.userType || 'Nhân viên'}</p>
                        </div>
                        {renderBar(emp.totalAppointments || emp.appointments || 0, 20)}
                        <span className="w-20 text-right">
                          <span className="text-lg font-bold text-violet-600">{emp.totalAppointments || emp.appointments || 0}</span>
                          <span className="text-sm text-gray-500 ml-1">lịch</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">👥</span>
                    <p>Chưa có dữ liệu nhân viên</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employee Roles Distribution */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Phân Bổ Theo Vai Trò
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">🏆</p>
                    <p className="font-bold text-blue-700">Top NV</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {employeeWorkload[0]?.employeeName?.split(' ').pop() || '-'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="font-bold text-green-700">Tỷ lệ HT TB</p>
                    <p className="text-2xl font-bold text-green-600">
                      {employeeWorkload.length > 0
                        ? Math.round(employeeWorkload.reduce((sum, e) => sum + (e.completionRate || 0), 0) / employeeWorkload.length * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="font-bold text-purple-700">TB lịch/NV</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {employeeWorkload.length > 0
                        ? Math.round(employeeWorkload.reduce((sum, e) => sum + (e.totalAppointments || 0), 0) / employeeWorkload.length)
                        : 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">💰</p>
                    <p className="font-bold text-orange-700">Tổng doanh thu</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(employeeWorkload.reduce((sum, e) => sum + (e.revenue || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
