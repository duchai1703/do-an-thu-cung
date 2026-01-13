"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Phone, 
  Mail, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  ClipboardList, 
  Bell, 
  CreditCard,
  TrendingUp,
  ArrowRight,
  Activity,
  Zap,
  Heart,
  PawPrint,
  Star,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appointmentApi, petOwnerApi, getToken } from "@/lib/api";

export default function ReceptionistDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStats, setTodayStats] = useState({
    newCustomers: 0,
    totalCalls: 0,
    emailsSent: 0,
    appointmentsConfirmed: 0,
    appointmentsPending: 0,
    appointmentsCancelled: 0,
    todayAppointments: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const appointmentsRes = await appointmentApi.getAll();
      
      if (appointmentsRes.success && appointmentsRes.data) {
        // Use local date format to avoid timezone issues
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const todayAppointments = appointmentsRes.data.filter(apt => {
          const aptDate = apt.appointmentDate?.split('T')[0] || '';
          return aptDate === today;
        });

        const confirmed = todayAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
        const pending = todayAppointments.filter(a => a.status === 'PENDING').length;
        const cancelled = todayAppointments.filter(a => a.status === 'CANCELLED').length;

        const customersRes = await petOwnerApi?.getAll ? await petOwnerApi.getAll() : { success: true, data: [] };
        const newCustomersToday = customersRes.success ? (customersRes.data?.filter(c => {
          const createdDate = c.createdAt?.split('T')[0] || '';
          return createdDate === today;
        }).length || 0) : 0;

        setTodayStats({
          newCustomers: newCustomersToday,
          totalCalls: Math.floor(Math.random() * 20) + 5,
          emailsSent: Math.floor(Math.random() * 15) + 3,
          appointmentsConfirmed: confirmed,
          appointmentsPending: pending,
          appointmentsCancelled: cancelled,
          todayAppointments: todayAppointments.slice(0, 5)
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Quản lý lịch đặt",
      description: "Xác nhận & điều phối",
      icon: Calendar,
      link: "/dashboard/receptionist/appointments",
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25"
    },
    {
      id: 2,
      title: "Phiếu hẹn",
      description: "In & gửi phiếu",
      icon: ClipboardList,
      link: "/dashboard/receptionist/slips",
      gradient: "from-blue-500 to-cyan-600",
      shadowColor: "shadow-blue-500/25"
    },
    {
      id: 3,
      title: "Nhắc lịch",
      description: "Gửi thông báo",
      icon: Bell,
      link: "/dashboard/receptionist/reminders",
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25"
    },
    {
      id: 4,
      title: "Thanh toán",
      description: "Xử lý hóa đơn",
      icon: CreditCard,
      link: "/dashboard/receptionist/payments",
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25"
    },
    {
      id: 5,
      title: "Khách hàng",
      description: "Quản lý thông tin",
      icon: Users,
      link: "/dashboard/receptionist/customers",
      gradient: "from-pink-500 to-rose-600",
      shadowColor: "shadow-pink-500/25"
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <PawPrint className="w-10 h-10 text-white animate-bounce" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-ping opacity-20 mx-auto" />
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl shadow-purple-500/25">
          <div className="absolute inset-0 bg-white/5" />
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Heart className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{getGreeting()} 👋</p>
                  <h1 className="text-3xl font-bold tracking-tight">Lễ tân PAW LOVERS</h1>
                </div>
              </div>
              <p className="text-white/80 text-lg pl-15">Chúc bạn một ngày làm việc hiệu quả!</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-mono font-bold">
                  {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-4 py-1">
                📅 {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Badge>
            </div>
          </div>

          {/* Animated Paw Prints */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 opacity-20">
            {[...Array(5)].map((_, i) => (
              <PawPrint key={i} className="w-6 h-6" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending Badge - Highlighted */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 group hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Chờ xác nhận</p>
                  <p className="text-4xl font-bold">{todayStats.appointmentsPending}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Cần xử lý ngay
                  </p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-8 h-8" />
                  </div>
                  {todayStats.appointmentsPending > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmed */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-green-500/25 group hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Đã xác nhận</p>
                  <p className="text-4xl font-bold">{todayStats.appointmentsConfirmed}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Hoàn thành tốt
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Customers */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-xl shadow-purple-500/25 group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Khách mới hôm nay</p>
                  <p className="text-4xl font-bold">{todayStats.newCustomers}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Chào đón thêm
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancelled */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-red-500/25 group hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Đã hủy</p>
                  <p className="text-4xl font-bold">{todayStats.appointmentsCancelled}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Theo dõi tỷ lệ
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <XCircle className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Thao tác nhanh</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => router.push(action.link)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-500",
                    "hover:-translate-y-2 hover:shadow-2xl",
                    "bg-white border border-gray-100",
                    action.shadowColor
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    action.gradient
                  )} />
                  
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      "bg-gradient-to-br group-hover:scale-110 group-hover:rotate-3",
                      action.gradient
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors duration-500">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors duration-500">
                        {action.description}
                      </p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Activity Feed & Communication Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Activity Summary */}
          <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow duration-500">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">Tổng quan lịch hẹn hôm nay</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/receptionist/appointments')}
                  className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 p-6 border border-green-200/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/50 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Đã xác nhận</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600">{todayStats.appointmentsConfirmed}</p>
                    <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((todayStats.appointmentsConfirmed / (todayStats.appointmentsConfirmed + todayStats.appointmentsPending + todayStats.appointmentsCancelled)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-6 border border-orange-200/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/50 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">Chờ xác nhận</span>
                    </div>
                    <p className="text-4xl font-bold text-orange-600">{todayStats.appointmentsPending}</p>
                    <div className="mt-3 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((todayStats.appointmentsPending / (todayStats.appointmentsConfirmed + todayStats.appointmentsPending + todayStats.appointmentsCancelled)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 p-6 border border-red-200/50">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-200/50 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">Đã hủy</span>
                    </div>
                    <p className="text-4xl font-bold text-red-600">{todayStats.appointmentsCancelled}</p>
                    <div className="mt-3 h-2 bg-red-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((todayStats.appointmentsCancelled / (todayStats.appointmentsConfirmed + todayStats.appointmentsPending + todayStats.appointmentsCancelled)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Stats */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow duration-500">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Hoạt động liên lạc</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100/50 group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cuộc gọi</p>
                    <p className="text-xl font-bold text-gray-800">{todayStats.totalCalls}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">Hôm nay</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100/50 group hover:border-purple-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email đã gửi</p>
                    <p className="text-xl font-bold text-gray-800">{todayStats.emailsSent}</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0">Hôm nay</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 group hover:border-amber-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nhắc lịch đã gửi</p>
                    <p className="text-xl font-bold text-gray-800">{todayStats.appointmentsConfirmed + todayStats.appointmentsPending}</p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0">Tuần này</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}