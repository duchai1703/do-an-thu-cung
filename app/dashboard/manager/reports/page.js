/**
 * Reports & Statistics - Complete Data Display with DateRangeFilter
 * 
 * Route: /dashboard/manager/reports
 * 
 * Features:
 * - DateRangeFilter component for easy date selection
 * - Displays ALL backend data from ALL report endpoints
 * - Premium gradient UI with emoji icons
 * - Expandable sections to view raw JSON data
 * - Real-time data fetching (NO MOCK DATA)
 * 
 * Backend APIs:
 * - GET /reports/dashboard - Dashboard overview
 * - GET /reports/financial - Financial report
 * - GET /reports/revenue - Revenue by period
 * - GET /reports/appointments - Appointment statistics
 * - GET /reports/services/top - Top services
 * - GET /reports/services/performance - Service performance
 * - GET /reports/employees/workload - Employee workload
 * - GET /reports/customers/retention - Customer retention
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  PieChart,
  BarChart3,
  RefreshCw
} from "lucide-react";

export default function ReportsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState({ start: null, end: null, preset: "30days" });

  // All report data
  const [dashboardData, setDashboardData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [topServices, setTopServices] = useState(null);
  const [servicePerformance, setServicePerformance] = useState(null);
  const [employeeWorkload, setEmployeeWorkload] = useState(null);
  const [customerRetention, setCustomerRetention] = useState(null);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format dates for API
  const formatDateForAPI = (date) => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  };

  // Handle date range change
  const handleDateRangeChange = (start, end, preset) => {
    setDateRange({ start, end, preset });
  };

  // Load all report data
  const loadAllReports = async () => {
    try {
      const isRefresh = !loading;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const startDate = formatDateForAPI(dateRange.start);
      const endDate = formatDateForAPI(dateRange.end);
      const currentYear = new Date().getFullYear();

      console.log('📊 Loading reports with date range:', { startDate, endDate, preset: dateRange.preset });

      // Call ALL report APIs
      const [
        dashboardRes,
        financialRes,
        revenueRes,
        appointmentsRes,
        topServicesRes,
        servicePerformanceRes,
        employeeWorkloadRes,
        customerRetentionRes
      ] = await Promise.all([
        apiClient.get('/reports/dashboard').catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/financial?startDate=${startDate || ''}&endDate=${endDate || ''}`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/revenue?period=month&year=${currentYear}`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/appointments?startDate=${startDate || ''}&endDate=${endDate || ''}`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/services/top?limit=10&startDate=${startDate || ''}&endDate=${endDate || ''}&sortBy=revenue`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/services/performance?startDate=${startDate || ''}&endDate=${endDate || ''}`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/employees/workload?startDate=${startDate || ''}&endDate=${endDate || ''}`).catch(e => ({ data: null, error: e.message })),
        apiClient.get(`/reports/customers/retention?startDate=${startDate || ''}&endDate=${endDate || ''}`).catch(e => ({ data: null, error: e.message }))
      ]);

      // Extract data (handle both { data: {...} } and direct response formats)
      setDashboardData(dashboardRes.data?.data || dashboardRes.data);
      setFinancialData(financialRes.data?.data || financialRes.data);
      setRevenueData(revenueRes.data?.data || revenueRes.data);
      setAppointmentStats(appointmentsRes.data?.data || appointmentsRes.data);
      setTopServices(topServicesRes.data?.data || topServicesRes.data);
      setServicePerformance(servicePerformanceRes.data?.data || servicePerformanceRes.data);
      setEmployeeWorkload(employeeWorkloadRes.data?.data || employeeWorkloadRes.data);
      setCustomerRetention(customerRetentionRes.data?.data || customerRetentionRes.data);

      console.log('✅ All reports loaded successfully');

    } catch (error) {
      console.error("❌ Error loading reports:", error);
      showToast("Không thể tải dữ liệu báo cáo", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when date range changes
  useEffect(() => {
    loadAllReports();
  }, [dateRange]);

  // Helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  const formatPercent = (num) => {
    return (num || 0).toFixed(1) + '%';
  };

  // Render expandable JSON viewer
  const JsonViewer = ({ data, title }) => {
    const sectionKey = `json_${title}`;
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-600">🔍 {title}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <pre className="p-3 text-xs bg-gray-900 text-green-400 overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  // Render stat card
  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, onClick }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              📊 Báo Cáo & Thống Kê
            </h1>
            <p className="text-purple-100">Xem toàn bộ dữ liệu từ hệ thống</p>
          </div>
          <Button
            onClick={() => loadAllReports()}
            disabled={refreshing}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <DateRangeFilter
          onChange={handleDateRangeChange}
          defaultPreset="30days"
          showCustomRange={true}
          theme="purple"
          size="md"
          showLabel={true}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          title="Tổng Doanh Thu"
          value={formatCurrency(dashboardData?.revenue?.total || financialData?.totalRevenue || 0)}
          subtitle="Theo dashboard"
          gradient="from-green-500 to-emerald-500"
          onClick={() => toggleSection('financial')}
        />
        <StatCard
          icon={Calendar}
          title="Tổng Lịch Hẹn"
          value={formatNumber(appointmentStats?.total || dashboardData?.appointments?.total || 0)}
          subtitle={`Hoàn thành: ${appointmentStats?.completed || 0}`}
          gradient="from-blue-500 to-cyan-500"
          onClick={() => toggleSection('appointments')}
        />
        <StatCard
          icon={Users}
          title="Tổng Khách Hàng"
          value={formatNumber(dashboardData?.customers?.total || customerRetention?.totalCustomers || 0)}
          subtitle={`Mới: ${dashboardData?.customers?.new || 0}`}
          gradient="from-orange-500 to-pink-500"
          onClick={() => toggleSection('customers')}
        />
        <StatCard
          icon={Briefcase}
          title="Tổng Nhân Viên"
          value={formatNumber(employeeWorkload?.length || dashboardData?.employees?.total || 0)}
          subtitle="Đang hoạt động"
          gradient="from-purple-500 to-violet-500"
          onClick={() => toggleSection('employees')}
        />
      </div>

      {/* Detailed Reports */}
      <div className="space-y-6">
        {/* 1. Dashboard Overview */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Dashboard Overview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('dashboard')}
              >
                {expandedSections['dashboard'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['dashboard'] && (
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">💰 Doanh Thu</p>
                  <p className="text-lg font-bold">{formatCurrency(dashboardData?.revenue?.total)}</p>
                  <p className="text-xs text-gray-500">Tháng này: {formatCurrency(dashboardData?.revenue?.thisMonth)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">📅 Lịch Hẹn</p>
                  <p className="text-lg font-bold">{formatNumber(dashboardData?.appointments?.total)}</p>
                  <p className="text-xs text-gray-500">Hôm nay: {formatNumber(dashboardData?.appointments?.today)}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">👥 Khách Hàng</p>
                  <p className="text-lg font-bold">{formatNumber(dashboardData?.customers?.total)}</p>
                  <p className="text-xs text-gray-500">Mới: {formatNumber(dashboardData?.customers?.new)}</p>
                </div>
              </div>
              <JsonViewer data={dashboardData} title="Raw Dashboard Data" />
            </CardContent>
          )}
        </Card>

        {/* 2. Financial Report */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Report
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('financial')}
              >
                {expandedSections['financial'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['financial'] && (
            <CardContent className="pt-4">
              {financialData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs text-green-600 mb-1">📈 Tổng Doanh Thu</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(financialData.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-xs text-red-600 mb-1">📉 Tổng Chi Phí</p>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(financialData.totalExpenses)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-blue-600 mb-1">💎 Lợi Nhuận</p>
                      <p className="text-2xl font-bold text-blue-700">{formatCurrency(financialData.profit)}</p>
                    </div>
                  </div>
                  <JsonViewer data={financialData} title="Raw Financial Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu tài chính</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 3. Revenue by Period */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Revenue by Month ({new Date().getFullYear()})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('revenue')}
              >
                {expandedSections['revenue'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['revenue'] && (
            <CardContent className="pt-4">
              {revenueData && Array.isArray(revenueData) && revenueData.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    {revenueData.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1">Tháng {item.month || item.period}</p>
                        <p className="text-sm font-bold text-orange-700">{formatCurrency(item.revenue)}</p>
                        <p className="text-xs text-gray-500">{formatNumber(item.invoiceCount)} đơn</p>
                      </div>
                    ))}
                  </div>
                  <JsonViewer data={revenueData} title="Raw Revenue Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu doanh thu theo tháng</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 4. Appointment Statistics */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Appointment Statistics
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('appointments')}
              >
                {expandedSections['appointments'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['appointments'] && (
            <CardContent className="pt-4">
              {appointmentStats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">📊 Tổng</p>
                      <p className="text-xl font-bold">{formatNumber(appointmentStats.total)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">✅ Hoàn thành</p>
                      <p className="text-xl font-bold">{formatNumber(appointmentStats.completed || appointmentStats.byStatus?.COMPLETED)}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600 mb-1">⏳ Chờ xác nhận</p>
                      <p className="text-xl font-bold">{formatNumber(appointmentStats.pending || appointmentStats.byStatus?.PENDING)}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 mb-1">✔️ Đã xác nhận</p>
                      <p className="text-xl font-bold">{formatNumber(appointmentStats.confirmed || appointmentStats.byStatus?.CONFIRMED)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 mb-1">❌ Đã hủy</p>
                      <p className="text-xl font-bold">{formatNumber(appointmentStats.cancelled || appointmentStats.byStatus?.CANCELLED)}</p>
                    </div>
                  </div>
                  <JsonViewer data={appointmentStats} title="Raw Appointment Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu lịch hẹn</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 5. Top Services */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-pink-600" />
                Top Services
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('topServices')}
              >
                {expandedSections['topServices'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['topServices'] && (
            <CardContent className="pt-4">
              {topServices && Array.isArray(topServices) && topServices.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {topServices.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{service.serviceName || service.name}</p>
                            <p className="text-xs text-gray-500">{formatNumber(service.bookingCount || service.count)} lượt đặt</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">{formatCurrency(service.totalRevenue || service.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <JsonViewer data={topServices} title="Raw Top Services Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu dịch vụ</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 6. Service Performance */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Service Performance
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('servicePerformance')}
              >
                {expandedSections['servicePerformance'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['servicePerformance'] && (
            <CardContent className="pt-4">
              {servicePerformance ? (
                <JsonViewer data={servicePerformance} title="Raw Service Performance Data" />
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu hiệu suất dịch vụ</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 7. Employee Workload */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Employee Workload
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('employees')}
              >
                {expandedSections['employees'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['employees'] && (
            <CardContent className="pt-4">
              {employeeWorkload && Array.isArray(employeeWorkload) && employeeWorkload.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {employeeWorkload.map((emp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                        <div>
                          <p className="font-semibold text-gray-800">{emp.employeeName || emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.role || emp.userType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-teal-600">{formatNumber(emp.totalAppointments || emp.workload)} lịch</p>
                          <p className="text-xs text-gray-500">{formatNumber(emp.completedAppointments || emp.completed)} hoàn thành</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <JsonViewer data={employeeWorkload} title="Raw Employee Workload Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu nhân viên</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 8. Customer Retention */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Customer Retention
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('customers')}
              >
                {expandedSections['customers'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['customers'] && (
            <CardContent className="pt-4">
              {customerRetention ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                      <p className="text-xs text-amber-600 mb-1">👥 Tổng Khách Hàng</p>
                      <p className="text-2xl font-bold text-amber-700">{formatNumber(customerRetention.totalCustomers)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-xs text-green-600 mb-1">🆕 Khách Mới</p>
                      <p className="text-2xl font-bold text-green-700">{formatNumber(customerRetention.newCustomers)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-blue-600 mb-1">🔄 Khách Quay Lại</p>
                      <p className="text-2xl font-bold text-blue-700">{formatNumber(customerRetention.returningCustomers)}</p>
                      <p className="text-xs text-gray-500">Tỷ lệ: {formatPercent(customerRetention.retentionRate)}</p>
                    </div>
                  </div>
                  <JsonViewer data={customerRetention} title="Raw Customer Retention Data" />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu khách hàng</p>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 <strong>Lưu ý:</strong> Tất cả dữ liệu được lấy trực tiếp từ backend API. 
          Nhấn vào "🔍 Raw Data" để xem dữ liệu JSON gốc từ API.
        </p>
      </div>
    </div>
  );
}
