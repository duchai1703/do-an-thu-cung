"use client";
import { useState, useEffect } from "react";
import { 
  PawPrint, Users, DollarSign, Calendar, Zap, 
  Users as UsersIcon, Sparkles, Home, Receipt, BarChart3 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import EditStaffModal from "@/components/modals/EditStaffModal";
import EditServiceModal from "@/components/modals/EditServiceModal";
import EditAppointmentModal from "@/components/modals/EditAppointmentModal";
import InvoiceDetailModal from "@/components/modals/InvoiceDetailModal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { petApi, petOwnerApi, serviceApi, employeeApi, appointmentApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPets: 0,
    totalCustomers: 0,
    totalServices: 0,
    monthlyRevenue: 0,
    todayAppointments: 0,
    activeStaff: 0
  });

  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [loading, setLoading] = useState(true);

  // TODO: Load staff,Service,Appointments,...
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      console.log("Token in Manager Dashboard:", token);
      if (!token) {
        // router.push('/login');
        return;
      }

      // Fetch all data in parallel
      const [petsRes, customersRes, servicesRes, employeesRes, appointmentsRes] = await Promise.all([
        petApi.getAll(),
        petOwnerApi?.getAll ? petOwnerApi.getAll() : Promise.resolve({ success: true, data: [] }),
        serviceApi.getAll(),
        employeeApi.getAll(),
        appointmentApi.getAll()
      ]);

      const totalPets = petsRes.success ? (petsRes.data?.length || 0) : 0;
      const totalCustomers = customersRes.success ? (customersRes.data?.length || 0) : 0;
      const totalServices = servicesRes.success ? (servicesRes.data?.length || 0) : 0;
      const activeStaff = employeesRes.success ? (employeesRes.data?.filter(e => e.isActive !== false).length || 0) : 0;
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointments = appointmentsRes.success ? (appointmentsRes.data || []) : [];
      const todayAppointments = appointments.filter(apt => {
        const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
        return aptDate === today;
      }).length;

      setStats({
        totalPets,
        totalCustomers,
        totalServices,
        monthlyRevenue: 0, // TODO: Calculate from invoice/payment API
        todayAppointments,
        activeStaff
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setIsEditStaffModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsEditServiceModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditAppointmentModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailModalOpen(true);
  };

  const handleEditStaffSuccess = (data) => {
    console.log("Staff updated:", data);
    showToast("Cập nhật nhân viên thành công!", "success");
  };

  const handleEditServiceSuccess = (data) => {
    console.log("Service updated:", data);
    showToast("Cập nhật dịch vụ thành công!", "success");
  };

  const handleEditAppointmentSuccess = (data) => {
    console.log("Appointment updated:", data);
    showToast("Cập nhật lịch đặt thành công!", "success");
  };

  const quickActions = [
    {
      icon: UsersIcon,
      label: "Thêm nhân viên",
      onClick: () => router.push("/dashboard/manager/staff?action=add")
    },
    {
      icon: Sparkles,
      label: "Thêm dịch vụ",
      onClick: () => router.push("/dashboard/manager/services?action=add")
    },
    {
      icon: Calendar,
      label: "Xem lịch đặt",
      onClick: () => router.push("/dashboard/manager/appointments")
    },
    {
      icon: Home,
      label: "Xem chuồng nuôi",
      onClick: () => router.push("/dashboard/manager/cages")
    },
    {
      icon: Receipt,
      label: "Xem hóa đơn",
      onClick: () => router.push("/dashboard/manager/invoices")
    },
    {
      icon: BarChart3,
      label: "Xem báo cáo",
      onClick: () => router.push("/dashboard/manager/reports")
    }
  ];

  const recentActivities = [
    {
      icon: CheckCircle2,
      text: "Nguyễn Văn A đã hoàn thành dịch vụ spa cho Lucky",
      time: "5 phút trước",
      action: () => handleViewInvoice({
        id: "INV-2025-001",
        date: "10:30 15/01/2025",
        status: "paid",
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        customerEmail: "nguyenvana@gmail.com",
        petName: "Lucky",
        petIcon: "🐕",
        petBreed: "Golden Retriever",
        petAge: "3 tuổi",
        services: [
          {
            icon: "🩺",
            name: "Khám sức khỏe tổng quát",
            quantity: 1,
            price: 200000,
            total: 200000
          },
          {
            icon: "💉",
            name: "Tiêm phòng dại",
            quantity: 1,
            price: 120000,
            total: 120000
          }
        ],
        subtotal: 320000,
        discount: 0,
        total: 320000,
        isPaid: true,
        paymentMethod: "Tiền mặt",
        paymentDate: "2025-01-15T11:00:00",
        notes: ""
      })
    },
    {
      icon: UsersIcon,
      text: "Đã thêm nhân viên mới: Trần Thị B",
      time: "1 giờ trước"
    },
    {
      icon: Sparkles,
      text: "Đã cập nhật dịch vụ: Tắm spa cao cấp",
      time: "2 giờ trước"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader 
        title="Dashboard Quản lý" 
        subtitle="Tổng quan hoạt động trung tâm PAW LOVERS"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={PawPrint}
          title="Tổng số thú cưng"
          value={stats.totalPets}
          change="+12%"
          trend="up"
          color="primary"
        />
        <StatsCard
          icon={UsersIcon}
          title="Khách hàng"
          value={stats.totalCustomers}
          change="+8%"
          trend="up"
          color="success"
        />
        <StatsCard
          icon={DollarSign}
          title="Doanh thu tháng"
          value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
          change="+15%"
          trend="up"
          color="warning"
        />
        <StatsCard
          icon={Calendar}
          title="Lịch hẹn hôm nay"
          value={stats.todayAppointments}
          color="info"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Modals */}
      <EditStaffModal
        isOpen={isEditStaffModalOpen}
        onClose={() => {
          setIsEditStaffModalOpen(false);
          setSelectedStaff(null);
        }}
        onSuccess={handleEditStaffSuccess}
        staff={selectedStaff}
      />

      <EditServiceModal
        isOpen={isEditServiceModalOpen}
        onClose={() => {
          setIsEditServiceModalOpen(false);
          setSelectedService(null);
        }}
        onSuccess={handleEditServiceSuccess}
        service={selectedService}
      />

      <EditAppointmentModal
        isOpen={isEditAppointmentModalOpen}
        onClose={() => {
          setIsEditAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleEditAppointmentSuccess}
        appointment={selectedAppointment}
      />

      <InvoiceDetailModal
        isOpen={isInvoiceDetailModalOpen}
        onClose={() => {
          setIsInvoiceDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}
