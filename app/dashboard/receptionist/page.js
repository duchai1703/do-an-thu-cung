"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, Users, CheckCircle2, Clock, XCircle, Sparkles, ClipboardList, Bell, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { appointmentApi, petOwnerApi, getToken } from "@/lib/api";

export default function ReceptionistDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    newCustomers: 0,
    totalCalls: 0,
    emailsSent: 0,
    appointmentsConfirmed: 0,
    appointmentsPending: 0,
    appointmentsCancelled: 0
  });

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

      // Fetch appointments
      const appointmentsRes = await appointmentApi.getAll();
      
      if (appointmentsRes.success && appointmentsRes.data) {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointmentsRes.data.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === today;
        });

        const confirmed = todayAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
        const pending = todayAppointments.filter(a => a.status === 'PENDING').length;
        const cancelled = todayAppointments.filter(a => a.status === 'CANCELLED').length;

        // Fetch customers (pet owners)
        const customersRes = await petOwnerApi?.getAll ? await petOwnerApi.getAll() : { success: true, data: [] };
        const newCustomersToday = customersRes.success ? (customersRes.data?.filter(c => {
          const createdDate = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '';
          return createdDate === today;
        }).length || 0) : 0;

        setTodayStats({
          newCustomers: newCustomersToday,
          totalCalls: 0, // Not tracked by backend yet
          emailsSent: 0, // Not tracked by backend yet
          appointmentsConfirmed: confirmed,
          appointmentsPending: pending,
          appointmentsCancelled: cancelled
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
      icon: Calendar,
      link: "/dashboard/receptionist/appointments"
    },
    {
      id: 2,
      title: "Quản lý phiếu hẹn",
      icon: ClipboardList,
      link: "/dashboard/receptionist/slips"
    },
    {
      id: 3,
      title: "Gửi nhắc lịch",
      icon: Bell,
      link: "/dashboard/receptionist/reminders"
    },
    {
      id: 4,
      title: "Thanh toán",
      icon: CreditCard,
      link: "/dashboard/receptionist/payments"
    },
    {
      id: 5,
      title: "Khách hàng",
      icon: Users,
      link: "/dashboard/receptionist/customers"
    }
  ];

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Tổng quan"
        subtitle="Xin chào! Chúc bạn một ngày làm việc tốt lành"
      />

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Thao tác nhanh
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => router.push(action.link)}
                variant="outline"
                className="flex flex-col h-auto py-6 items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all"
              >
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Today's Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Tổng quan hôm nay
          </h2>
          <Badge variant="secondary">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard icon={Users} title="Khách hàng mới" value={todayStats.newCustomers} color="primary" />
          <StatsCard icon={Phone} title="Cuộc gọi tiếp nhận" value={todayStats.totalCalls} color="success" />
          <StatsCard icon={Mail} title="Email đã gửi" value={todayStats.emailsSent} color="info" />
        </div>

        {/* Appointments Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Trạng thái lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-700" />
                    <p className="text-sm font-semibold text-green-700">Đã xác nhận</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{todayStats.appointmentsConfirmed}</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-700" />
                    <p className="text-sm font-semibold text-yellow-700">Chờ xác nhận</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{todayStats.appointmentsPending}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-700" />
                    <p className="text-sm font-semibold text-red-700">Đã hủy</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{todayStats.appointmentsCancelled}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}