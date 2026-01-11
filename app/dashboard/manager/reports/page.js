/**
 * Reports & Statistics - Enhanced Beautiful UI with Charts
 * 
 * Route: /dashboard/manager/reports
 * 
 * Features:
 * - DateRangeFilter component for easy date selection
 * - Beautiful CSS-based charts and visualizations
 * - Displays ALL backend data from ALL report endpoints
 * - Premium gradient UI with emoji icons
 * - Expandable sections to view raw JSON data (for verification)
 * - Real-time data fetching (NO MOCK DATA)
 * - Cute, colorful, and informative design
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
  RefreshCw,
  Heart,
  Zap,
  Award,
  Target
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

      // Build financial URL - only add dates if they exist
      let financialUrl = '/reports/financial';
      if (startDate && endDate) {
        financialUrl += `?startDate=${startDate}&endDate=${endDate}`;
      }

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
        // Only fetch financial if we have date range
        startDate && endDate 
          ? apiClient.get(financialUrl).catch(e => ({ data: null, error: e.message }))
          : Promise.resolve({ data: null }),
        apiClient.get(`/reports/revenue?period=month&year=${currentYear}`).catch(e => ({ data: null, error: e.message })),
        startDate && endDate
          ? apiClient.get(`/reports/appointments?startDate=${startDate}&endDate=${endDate}`).catch(e => ({ data: null, error: e.message }))
          : apiClient.get('/reports/appointments').catch(e => ({ data: null, error: e.message })),
        startDate && endDate
          ? apiClient.get(`/reports/services/top?limit=10&startDate=${startDate}&endDate=${endDate}&sortBy=revenue`).catch(e => ({ data: null, error: e.message }))
          : apiClient.get('/reports/services/top?limit=10&sortBy=revenue').catch(e => ({ data: null, error: e.message })),
        startDate && endDate
          ? apiClient.get(`/reports/services/performance?startDate=${startDate}&endDate=${endDate}`).catch(e => ({ data: null, error: e.message }))
          : apiClient.get('/reports/services/performance').catch(e => ({ data: null, error: e.message })),
        startDate && endDate
          ? apiClient.get(`/reports/employees/workload?startDate=${startDate}&endDate=${endDate}`).catch(e => ({ data: null, error: e.message }))
          : apiClient.get('/reports/employees/workload').catch(e => ({ data: null, error: e.message })),
        startDate && endDate
          ? apiClient.get(`/reports/customers/retention?startDate=${startDate}&endDate=${endDate}`).catch(e => ({ data: null, error: e.message }))
          : apiClient.get('/reports/customers/retention').catch(e => ({ data: null, error: e.message }))
      ]);

      // Extract data (handle both { data: {...} } and direct response formats)
      const dashboard = dashboardRes.data?.data || dashboardRes.data;
      const financial = financialRes.data?.data || financialRes.data;
      
      // Debug logging
      console.log('📊 Dashboard raw response:', dashboardRes.data);
      console.log('💰 Financial raw response:', financialRes.data);
      console.log('📈 Dashboard extracted:', dashboard);
      console.log('💵 Financial extracted:', financial);
      
      setDashboardData(dashboard);
      setFinancialData(financial);
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
      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 transition-all"
        >
          <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
            🔍 <span>{title}</span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {isExpanded && (
          <pre className="p-4 text-xs bg-gray-900 text-green-400 overflow-auto max-h-96 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  // CSS Progress Bar Component
  const ProgressBar = ({ value, max, color = "purple", label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const colorClasses = {
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      teal: "bg-teal-500"
    };

    return (
      <div className="space-y-1">
        {label && <p className="text-xs text-gray-600 font-medium">{label}</p>}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        <p className="text-xs text-gray-500">{formatNumber(value)} / {formatNumber(max)} ({percentage.toFixed(0)}%)</p>
      </div>
    );
  };

  // CSS Donut Chart Component
  const DonutChart = ({ percentage, size = 120, strokeWidth = 12, color = "purple", label, value }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
      purple: "#9333ea",
      blue: "#3b82f6",
      green: "#10b981",
      orange: "#f59e0b",
      pink: "#ec4899",
      teal: "#14b8a6"
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorClasses[color]}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-800">{percentage.toFixed(0)}%</p>
            {value && <p className="text-xs text-gray-500">{value}</p>}
          </div>
        </div>
        {label && <p className="text-sm font-semibold text-gray-700 mt-2 text-center">{label}</p>}
      </div>
    );
  };

  // CSS Bar Chart Component
  const BarChart = ({ data, maxValue, colorGradient = "from-purple-400 to-pink-500" }) => {
    const max = maxValue || Math.max(...data.map(d => d.value || 0));
    
    return (
      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 truncate flex-1">{item.label}</span>
                <span className="font-bold text-gray-800 ml-2">{formatNumber(item.value)}</span>
              </div>
              <div className="relative w-full h-6 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div 
                  className={`h-full bg-gradient-to-r ${colorGradient} rounded-lg transition-all duration-700 ease-out flex items-center px-2`}
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                >
                  {percentage > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow-md">{percentage.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-8 border-pink-200 border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-gray-700 font-bold text-lg mb-2">Đang tải báo cáo...</p>
          <p className="text-gray-500 text-sm">✨ Vui lòng chờ một chút</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-3 flex items-center gap-3 drop-shadow-lg">
                <span className="text-5xl">📊</span>
                <span>Báo Cáo & Thống Kê</span>
              </h1>
              <p className="text-purple-100 text-lg font-medium">
                ✨ Xem toàn bộ dữ liệu từ hệ thống một cách trực quan và đẹp mắt
              </p>
            </div>
            <Button
              onClick={() => loadAllReports()}
              disabled={refreshing}
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl font-bold px-6 py-6 text-base"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100">
          <DateRangeFilter
            onChange={handleDateRangeChange}
            defaultPreset="30days"
            showCustomRange={true}
            theme="purple"
            size="md"
            showLabel={true}
          />
        </div>

        {/* Quick Stats - Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90 mb-1">💰 Tổng Doanh Thu</p>
                  <p className="text-3xl font-black">
                    {formatCurrency(
                      financialData?.totalRevenue || 
                      dashboardData?.revenue?.thisMonth || 
                      dashboardData?.revenue?.total || 
                      dashboardData?.today?.revenue || 
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-4/5 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90 mb-1">📅 Tổng Lịch Hẹn</p>
                  <p className="text-3xl font-black">
                    {formatNumber(appointmentStats?.total || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-white bg-opacity-25 rounded-full">✅ {appointmentStats?.completed || appointmentStats?.byStatus?.COMPLETED || dashboardData?.today?.completedAppointments || 0}</span>
                <span className="px-2 py-1 bg-white bg-opacity-25 rounded-full">⏳ {appointmentStats?.pending || appointmentStats?.byStatus?.PENDING || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90 mb-1">👥 Tổng Khách Hàng</p>
                  <p className="text-3xl font-black">{formatNumber(dashboardData?.customers?.total || customerRetention?.totalCustomers || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-white bg-opacity-25 rounded-full">🆕 {dashboardData?.customers?.new || 0}</span>
                <span className="px-2 py-1 bg-white bg-opacity-25 rounded-full">🔄 {customerRetention?.returningCustomers || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Employees Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90 mb-1">👨‍💼 Tổng Nhân Viên</p>
                  <p className="text-3xl font-black">{formatNumber(employeeWorkload?.length || dashboardData?.employees?.total || 0)}</p>
                </div>
              </div>
              <div className="h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-3/5 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial Report - Full Width on Mobile, 2 cols on Desktop */}
          <Card className="lg:col-span-2 bg-white shadow-xl border-2 border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl">💰 Báo Cáo Tài Chính</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {financialData ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <p className="text-4xl mb-2">📈</p>
                      <p className="text-xs text-green-600 mb-1 font-semibold">Thu Nhập</p>
                      <p className="text-2xl font-black text-green-700">{formatCurrency(financialData.totalRevenue)}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                      <p className="text-4xl mb-2">📉</p>
                      <p className="text-xs text-red-600 mb-1 font-semibold">Chi Phí</p>
                      <p className="text-2xl font-black text-red-700">{formatCurrency(financialData.totalExpenses)}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <p className="text-4xl mb-2">💎</p>
                      <p className="text-xs text-blue-600 mb-1 font-semibold">Lợi Nhuận</p>
                      <p className="text-2xl font-black text-blue-700">{formatCurrency(financialData.profit)}</p>
                    </div>
                  </div>
                  
                  {/* Profit Margin Visual */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                    <p className="text-sm font-bold text-gray-700 mb-3">📊 Tỷ Lệ Lợi Nhuận</p>
                    <ProgressBar 
                      value={financialData.profit} 
                      max={financialData.totalRevenue} 
                      color="purple"
                      label={`${((financialData.profit / financialData.totalRevenue) * 100).toFixed(1)}% lợi nhuận`}
                    />
                  </div>

                  <JsonViewer data={financialData} title="Raw Financial Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">📊</p>
                  <p className="text-gray-500">Không có dữ liệu tài chính</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Retention - 1 col */}
          <Card className="bg-white shadow-xl border-2 border-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b-2 border-amber-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">💖 Khách Hàng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {customerRetention ? (
                <>
                  <div className="flex justify-center mb-6">
                    <DonutChart 
                      percentage={customerRetention.retentionRate || 0}
                      size={140}
                      strokeWidth={16}
                      color="orange"
                      label="Tỷ Lệ Quay Lại"
                      value={`${formatNumber(customerRetention.returningCustomers)}/${formatNumber(customerRetention.totalCustomers)}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-sm font-semibold text-gray-700">👥 Tổng KH</span>
                      <span className="text-lg font-black text-amber-600">{formatNumber(customerRetention.totalCustomers)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-semibold text-gray-700">🆕 KH Mới</span>
                      <span className="text-lg font-black text-green-600">{formatNumber(customerRetention.newCustomers)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-semibold text-gray-700">🔄 Quay Lại</span>
                      <span className="text-lg font-black text-blue-600">{formatNumber(customerRetention.returningCustomers)}</span>
                    </div>
                  </div>

                  <JsonViewer data={customerRetention} title="Raw Customer Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">👥</p>
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Month & Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card className="bg-white shadow-xl border-2 border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">📊 Doanh Thu Theo Tháng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {revenueData && Array.isArray(revenueData) && revenueData.length > 0 ? (
                <>
                  <BarChart 
                    data={revenueData.map(item => ({
                      label: `Tháng ${item.month || item.period}`,
                      value: item.revenue || 0
                    }))}
                    colorGradient="from-orange-400 to-amber-500"
                  />
                  <JsonViewer data={revenueData} title="Raw Revenue Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">📊</p>
                  <p className="text-gray-500">Không có dữ liệu doanh thu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments Stats */}
          <Card className="bg-white shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">📅 Thống Kê Lịch Hẹn</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {appointmentStats ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Tổng', value: appointmentStats.total, emoji: '📊', color: 'blue' },
                      { label: 'Hoàn thành', value: appointmentStats.completed || appointmentStats.byStatus?.COMPLETED, emoji: '✅', color: 'green' },
                      { label: 'Chờ XN', value: appointmentStats.pending || appointmentStats.byStatus?.PENDING, emoji: '⏳', color: 'yellow' },
                      { label: 'Đã hủy', value: appointmentStats.cancelled || appointmentStats.byStatus?.CANCELLED, emoji: '❌', color: 'red' }
                    ].map((stat, idx) => (
                      <div key={idx} className="text-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 hover:scale-105 transition-transform">
                        <p className="text-3xl mb-1">{stat.emoji}</p>
                        <p className="text-2xl font-black text-gray-800">{formatNumber(stat.value || 0)}</p>
                        <p className="text-xs text-gray-600 font-semibold mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Completion Rate */}
                  {appointmentStats.total > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm font-bold text-gray-700 mb-3">✅ Tỷ Lệ Hoàn Thành</p>
                      <ProgressBar 
                        value={appointmentStats.completed || appointmentStats.byStatus?.COMPLETED || 0} 
                        max={appointmentStats.total} 
                        color="green"
                      />
                    </div>
                  )}

                  <JsonViewer data={appointmentStats} title="Raw Appointment Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">📅</p>
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Services & Employee Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Services */}
          <Card className="bg-white shadow-xl border-2 border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b-2 border-pink-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">🏆 Top Dịch Vụ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {topServices && Array.isArray(topServices) && topServices.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {topServices.slice(0, 5).map((service, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 hover:shadow-lg transition-all">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg ${
                          idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                          'bg-gradient-to-br from-pink-400 to-rose-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{service.serviceName || service.name}</p>
                          <p className="text-xs text-gray-500">{formatNumber(service.bookingCount || service.count)} lượt • {formatCurrency(service.totalRevenue || service.revenue)}</p>
                        </div>
                        <div className="text-2xl">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <JsonViewer data={topServices} title="Raw Top Services Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">🏆</p>
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Workload */}
          <Card className="bg-white shadow-xl border-2 border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-100">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">👨‍💼 Hiệu Suất NV</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {employeeWorkload && Array.isArray(employeeWorkload) && employeeWorkload.length > 0 ? (
                <>
                  <BarChart 
                    data={employeeWorkload.slice(0, 8).map(emp => ({
                      label: emp.employeeName || emp.name || 'N/A',
                      value: emp.totalAppointments || emp.workload || 0
                    }))}
                    colorGradient="from-teal-400 to-cyan-500"
                  />
                  <JsonViewer data={employeeWorkload} title="Raw Employee Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">👨‍💼</p>
                  <p className="text-gray-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Overview - Full Width */}
        <Card className="bg-white shadow-xl border-2 border-purple-100 mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b-2 border-purple-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">📈 Tổng Quan Dashboard</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('dashboard')}
                className="hover:bg-purple-100"
              >
                {expandedSections['dashboard'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections['dashboard'] && (
            <CardContent className="pt-6">
              {dashboardData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 text-center hover:scale-105 transition-transform">
                      <p className="text-5xl mb-3">💰</p>
                      <p className="text-xs text-green-600 mb-1 font-bold">DOANH THU</p>
                      <p className="text-2xl font-black text-green-700">{formatCurrency(dashboardData.revenue?.thisMonth || dashboardData.revenue?.total || 0)}</p>
                      <p className="text-xs text-gray-500 mt-2">Hôm nay: {formatCurrency(dashboardData.revenue?.today || dashboardData.today?.revenue || 0)}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 text-center hover:scale-105 transition-transform">
                      <p className="text-5xl mb-3">📅</p>
                      <p className="text-xs text-blue-600 mb-1 font-bold">LỊCH HẸN</p>
                      <p className="text-2xl font-black text-blue-700">{formatNumber(dashboardData.overview?.activeAppointments || dashboardData.appointments?.total || 0)}</p>
                      <p className="text-xs text-gray-500 mt-2">Hôm nay: {formatNumber(dashboardData.today?.appointments || dashboardData.appointments?.today || 0)}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 text-center hover:scale-105 transition-transform">
                      <p className="text-5xl mb-3">👥</p>
                      <p className="text-xs text-orange-600 mb-1 font-bold">KHÁCH HÀNG</p>
                      <p className="text-2xl font-black text-orange-700">{formatNumber(dashboardData.overview?.totalOwners || dashboardData.customers?.total || 0)}</p>
                      <p className="text-xs text-gray-500 mt-2">Thú cưng: {formatNumber(dashboardData.overview?.totalPets || 0)}</p>
                    </div>
                  </div>
                  <JsonViewer data={dashboardData} title="Raw Dashboard Data" />
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">📊</p>
                  <p className="text-gray-500">Không có dữ liệu dashboard</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl border-2 border-purple-200 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💡</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 mb-1">
                📊 Dữ Liệu Thực Từ Backend API
              </p>
              <p className="text-xs text-gray-600">
                Tất cả dữ liệu được lấy trực tiếp từ backend. Nhấn vào nút <strong>"🔍 Raw Data"</strong> để xem dữ liệu JSON gốc từ API.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
