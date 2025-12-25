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
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/contexts/ToastContext";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/charts/RevenueChart";
import { cn } from "@/lib/utils";

export default function ManagerReportsPage() {
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    totalCustomers: 0,
    avgRevenuePerCustomer: 0,
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, [period, year]);

  const loadRevenueData = () => {
    const mockData = [
      { month: 1, year: 2025, revenue: 15600000 },
      { month: 2, year: 2025, revenue: 18200000 },
      { month: 3, year: 2025, revenue: 22400000 },
      { month: 4, year: 2025, revenue: 19800000 },
      { month: 5, year: 2025, revenue: 25600000 },
      { month: 6, year: 2025, revenue: 28900000 },
      { month: 7, year: 2025, revenue: 31200000 },
      { month: 8, year: 2025, revenue: 29500000 },
      { month: 9, year: 2025, revenue: 33800000 },
      { month: 10, year: 2025, revenue: 45600000 },
      { month: 11, year: 2025, revenue: 38400000 },
      { month: 12, year: 2025, revenue: 42100000 },
    ];

    setRevenueData(mockData);

    const totalRevenue = mockData.reduce((sum, d) => sum + d.revenue, 0);
    setStats({
      totalRevenue,
      totalAppointments: 342,
      totalCustomers: 89,
      avgRevenuePerCustomer: totalRevenue / 89,
    });
  };

  const handleExportExcel = () => {
    showToast("Đang xuất báo cáo ra Excel...", "info");
  };

  const handleExportPDF = () => {
    showToast("Đang xuất báo cáo ra PDF...", "info");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
          <RevenueChart data={revenueData} period={period} />
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
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
      </Card>

      {/* Top Services & Customers */}
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
              {[
                {
                  rank: 1,
                  icon: "🏥",
                  name: "Khám sức khỏe",
                  count: 89,
                  revenue: 17800000,
                },
                {
                  rank: 2,
                  icon: "🛁",
                  name: "Tắm spa",
                  count: 76,
                  revenue: 11400000,
                },
                {
                  rank: 3,
                  icon: "✂️",
                  name: "Cắt tỉa lông",
                  count: 64,
                  revenue: 11520000,
                },
                {
                  rank: 4,
                  icon: "💉",
                  name: "Tiêm phòng",
                  count: 52,
                  revenue: 6240000,
                },
                {
                  rank: 5,
                  icon: "🏠",
                  name: "Lưu trú",
                  count: 45,
                  revenue: 4500000,
                },
              ].map((service) => (
                <div
                  key={service.rank}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {service.rank}
                  </div>
                  <div className="text-2xl">{service.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.count} lượt • {formatCurrency(service.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Khách hàng thân thiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Nguyễn Văn A", pets: 3, spent: 5600000 },
                { rank: 2, name: "Trần Thị B", pets: 2, spent: 4200000 },
                { rank: 3, name: "Lê Văn C", pets: 2, spent: 3800000 },
                { rank: 4, name: "Phạm Thị D", pets: 1, spent: 3200000 },
                { rank: 5, name: "Hoàng Văn E", pets: 4, spent: 2900000 },
              ].map((customer) => (
                <div
                  key={customer.rank}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {customer.rank}
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground/10">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.pets} thú cưng •{" "}
                      {formatCurrency(customer.spent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
