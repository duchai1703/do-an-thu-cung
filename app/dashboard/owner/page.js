"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Calendar, CreditCard, Zap } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { petApi, appointmentApi, paymentApi, petOwnerApi, authApi, getToken, TOKEN_KEY } from "@/lib/api";
import { USE_MOCK_API } from "@/lib/api/config";

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

      // Get user information
      await loadUserInfo();

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

  const loadUserInfo = async () => {
    try {
      if (USE_MOCK_API) {
        // For mock API, get user data from localStorage
        if (typeof window !== 'undefined') {
          const storedData = localStorage.getItem(TOKEN_KEY);
          if (storedData) {
            try {
              const authData = JSON.parse(storedData);
              if (authData.account) {
                setUserName(authData.account.fullName || authData.account.email || "Chủ thú cưng");
                return;
              }
            } catch (e) {
              console.error("Error parsing stored auth data:", e);
            }
          }
        }
      } else {
        // For real API, fetch user profile
        // First, try to get accountId from stored token/user data
        if (typeof window !== 'undefined') {
          const storedData = localStorage.getItem(TOKEN_KEY);
          if (storedData) {
            try {
              const authData = JSON.parse(storedData);
              const accountId = authData.account?.accountID || authData.user?.accountID;
              
              if (accountId) {
                const profileResponse = await authApi.getFullProfile(accountId);
                if (profileResponse.success && profileResponse.data) {
                  const profile = profileResponse.data;
                  setUserName(profile.fullName || profile.petOwner?.name || profile.email || "Chủ thú cưng");
                  return;
                }
              }
            } catch (e) {
              console.error("Error fetching user profile:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      // Keep default name on error
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
