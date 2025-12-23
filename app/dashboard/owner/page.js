"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Calendar, CreditCard, Zap } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { petApi, appointmentApi, paymentApi, getToken } from "@/lib/api";

export default function OwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPets: 0,
    upcomingAppointments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Chủ thú cưng");

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

      // Fetch owner's pets
      const petsResponse = await petApi.getAll();
      const totalPets = petsResponse.success ? (petsResponse.data?.length || 0) : 0;

      // Fetch owner's appointments
      const appointmentsResponse = await appointmentApi.getAll();
      const appointments = appointmentsResponse.success ? (appointmentsResponse.data || []) : [];
      
      // Filter upcoming appointments (PENDING or CONFIRMED status)
      const upcomingAppointments = appointments.filter(
        apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      ).length;

      // Fetch pending payments
      const paymentsResponse = await paymentApi?.getAll ? await paymentApi.getAll() : { success: true, data: [] };
      const payments = paymentsResponse.success ? (paymentsResponse.data || []) : [];
      const pendingPayments = payments.filter(p => p.status === 'PENDING').length;

      setStats({
        totalPets,
        upcomingAppointments,
        pendingPayments
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: PawPrint,
      label: "Thú cưng của tôi",
      onClick: () => router.push("/dashboard/owner/pets")
    },
    {
      icon: Calendar,
      label: "Lịch đặt",
      onClick: () => router.push("/dashboard/owner/appointments")
    },
    {
      icon: CreditCard,
      label: "Thanh toán",
      onClick: () => router.push("/dashboard/owner/payments")
    },
    {
      icon: Zap,
      label: "Xem dịch vụ",
      onClick: () => router.push("/dashboard/owner/services")
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Tổng quan"
        subtitle={`Xin chào, ${userName} - Chúc bạn một ngày tốt lành!`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          icon={PawPrint}
          title="Thú cưng của tôi"
          value={loading ? "..." : stats.totalPets}
          color="primary"
        />
        <StatsCard
          icon={Calendar}
          title="Lịch sắp tới"
          value={loading ? "..." : stats.upcomingAppointments}
          color="info"
        />
        <StatsCard
          icon={CreditCard}
          title="Chờ thanh toán"
          value={loading ? "..." : stats.pendingPayments}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Thao tác nhanh
        </h2>
        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}
