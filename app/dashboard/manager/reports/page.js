"use client";
import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Trophy,
  Star,
  RefreshCw,
  Briefcase,
  PawPrint,
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/contexts/ToastContext";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/charts/RevenueChart";
import { reportApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ManagerReportsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [employeeWorkload, setEmployeeWorkload] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    totalCustomers: 0,
    avgRevenuePerCustomer: 0,
  });

  // Date range for detailed reports
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadAllReports();
  }, [period, year]);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      // Load multiple reports in parallel
      const [dashboardRes, revenueRes, topServicesRes, workloadRes] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getRevenue({ period, year }),
        reportApi.getTopServices({ limit: 5, startDate, endDate, sortBy: 'revenue' }),
        reportApi.getEmployeeWorkload({ startDate, endDate })
      ]);

      // Dashboard stats
      if (dashboardRes.success && dashboardRes.data) {
        const d = dashboardRes.data;
        setStats({
          totalRevenue: d.revenue?.total || d.totalRevenue || 0,
          totalAppointments: d.appointments?.total || d.totalAppointments || 0,
          totalCustomers: d.customers?.total || d.totalCustomers || 0,
          avgRevenuePerCustomer: d.avgRevenuePerCustomer || 0,
        });
      }

      // Revenue data
      if (revenueRes.success && revenueRes.data) {
        const monthlyData = Array.isArray(revenueRes.data)
          ? revenueRes.data
          : (revenueRes.data.data || []);
        setRevenueData(monthlyData);
      }

      // Top services
      if (topServicesRes.success && topServicesRes.data) {
        const services = Array.isArray(topServicesRes.data)
          ? topServicesRes.data
          : (topServicesRes.data.data || []);
        setTopServices(services);
      }

      // Employee workload
      if (workloadRes.success && workloadRes.data) {
        const workload = Array.isArray(workloadRes.data)
          ? workloadRes.data
          : (workloadRes.data.data || []);
        setEmployeeWorkload(workload);
      }

    } catch (error) {
      console.error("Error loading reports:", error);
      showToast("Lỗi khi tải báo cáo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    showToast("Đang xuất báo cáo ra Excel...", "info");
    // In real implementation, call export API
  };

  const handleExportPDF = () => {
    showToast("Đang xuất báo cáo ra PDF...", "info");
    // In real implementation, call export API
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName?.toLowerCase() || '';
    if (name.includes('khám') || name.includes('health')) return '🏥';
    if (name.includes('tắm') || name.includes('spa') || name.includes('bath')) return '🛁';
    if (name.includes('cắt') || name.includes('groom')) return '✂️';
    if (name.includes('tiêm') || name.includes('vaccin')) return '💉';
    if (name.includes('lưu trú') || name.includes('board')) return '🏠';
    return '✨';
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Báo cáo & Thống kê"
        subtitle="Phân tích doanh thu và hoạt động trung tâm"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={DollarSign}
          title={`Tổng doanh thu ${year}`}
          value={formatCurrency(stats.totalRevenue)}
          color="primary"
        />
        <StatsCard
          icon={Calendar}
          title="Tổng lượt dịch vụ"
          value={stats.totalAppointments}
          color="success"
        />
        <StatsCard
          icon={Users}
          title="Tổng khách hàng"
          value={stats.totalCustomers}
          color="info"
        />
        <StatsCard
          icon={BarChart3}
          title="TB/Khách hàng"
          value={formatCurrency(stats.avgRevenuePerCustomer)}
          color="warning"
        />
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={loadAllReports} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Biểu đồ doanh thu
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Theo dõi xu hướng doanh thu theo thời gian
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={year.toString()}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-32"
              >
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
              </Select>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-32"
              >
                <option value="month">Theo tháng</option>
                <option value="quarter">Theo quý</option>
                <option value="year">Theo năm</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RevenueChart data={revenueData} period={period} />
          )}
        </CardContent>
      </Card>

      {/* Export Actions - Temporarily hidden, will be implemented later */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Xuất báo cáo
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tải báo cáo doanh thu và thống kê
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleExportExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Xuất PDF
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Top Services & Employee Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Dịch vụ phổ biến nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topServices.length > 0 ? topServices.map((service, idx) => (
                <div
                  key={service.serviceId || idx}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </div>
                  <div className="text-2xl">{getServiceIcon(service.serviceName || service.name)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {service.serviceName || service.name || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.count || service.totalBookings || 0} lượt • {formatCurrency(service.revenue || service.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có dữ liệu dịch vụ
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Hiệu suất nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeeWorkload.length > 0 ? employeeWorkload.slice(0, 5).map((emp, idx) => (
                <div
                  key={emp.employeeId || idx}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground/10">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {emp.employeeName || emp.fullName || emp.name || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emp.appointmentsCompleted || emp.totalAppointments || 0} dịch vụ • {emp.hoursWorked || 0}h làm việc
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có dữ liệu nhân viên
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
