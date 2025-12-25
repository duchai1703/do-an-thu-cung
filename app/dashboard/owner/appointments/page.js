"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, Search, Plus, FileText, X, Hourglass, CheckCircle2, 
  XCircle, ClipboardList, Clock, Sparkles, PawPrint 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import BookAppointmentModal from "@/components/modals/BookAppointmentModal";
import AppointmentDetailModal from "@/components/modals/AppointmentDetailModal";
import CancelAppointmentOwnerModal from "@/components/modals/CancelAppointmentOwnerModal";
import { cn } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function OwnerAppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();

    if (searchParams.get('action') === 'book') {
      setIsBookModalOpen(true);
    }
  }, [searchParams]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await appointmentApi.getAll();
      
      if (response.success && response.data) {
        // Map backend data to frontend format
        const mappedAppointments = response.data.map(apt => ({
          id: apt.appointmentId || apt.id,
          code: apt.appointmentId || apt.id,
          petId: apt.petId || apt.pet?.petId,
          petName: apt.pet?.name || 'Unknown',
          petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          serviceId: apt.serviceId || apt.service?.serviceId,
          serviceName: apt.service?.name || 'Unknown Service',
          serviceIcon: getServiceIcon(apt.service?.categoryId),
          date: apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '',
          time: apt.startTime || '',
          status: mapStatus(apt.status),
          notes: apt.notes || '',
          createdAt: apt.createdAt || new Date().toISOString(),
          completedAt: apt.status === 'COMPLETED' ? apt.updatedAt : null,
          cancelledAt: apt.status === 'CANCELLED' ? apt.updatedAt : null,
          cancelReason: apt.cancellationReason || ''
        }));
        
        setAppointments(mappedAppointments);
      } else {
        console.error("Failed to load appointments:", response.error);
        showToast("Không thể tải danh sách lịch đặt", "error");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      showToast("Lỗi khi tải danh sách lịch đặt", "error");
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'upcoming',
      'CONFIRMED': 'upcoming',
      'IN_PROGRESS': 'upcoming',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[backendStatus] || 'upcoming';
  };

  const getServiceIcon = (categoryId) => {
    // Map service categories to icons
    const iconMap = {
      1: '🏥', // Medical
      2: '🛁', // Grooming
      3: '💉', // Vaccination
      4: '✂️', // Styling
    };
    return iconMap[categoryId] || '🩺';
  };

  const handleBookAppointment = async (data) => {
    try {
      const response = await appointmentApi.create(data);
      
      if (response.success) {
        showToast("Đặt lịch thành công!", "success");
        loadAppointments(); // Reload the list
      } else {
        showToast(response.error || "Không thể đặt lịch", "error");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      showToast("Lỗi khi đặt lịch", "error");
    }
  };

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const handleCancelSuccess = async (data) => {
    try {
      const response = await appointmentApi.cancel(data.appointmentId, data.reason);
      
      if (response.success) {
        showToast("Đã hủy lịch hẹn", "success");
        loadAppointments(); // Reload the list
      } else {
        showToast(response.error || "Không thể hủy lịch hẹn", "error");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showToast("Lỗi khi hủy lịch hẹn", "error");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchFilter = filter === "all" || apt.status === filter;
    const matchSearch = apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { 
        label: "Sắp tới", 
        variant: "secondary", 
        icon: Hourglass 
      },
      completed: { 
        label: "Đã hoàn thành", 
        variant: "success", 
        icon: CheckCircle2 
      },
      cancelled: { 
        label: "Đã hủy", 
        variant: "destructive", 
        icon: XCircle 
      }
    };
    return badges[status] || badges.upcoming;
  };

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", icon: ClipboardList },
    { value: "upcoming", label: "Sắp tới", icon: Hourglass },
    { value: "completed", label: "Đã hoàn thành", icon: CheckCircle2 },
    { value: "cancelled", label: "Đã hủy", icon: XCircle }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Lịch đặt"
        subtitle="Quản lý lịch hẹn dịch vụ cho thú cưng"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Calendar}
          title="Tổng lịch đặt"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={Hourglass}
          title="Sắp tới"
          value={stats.upcoming}
          color="info"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đã hoàn thành"
          value={stats.completed}
          color="success"
        />
        <StatsCard
          icon={XCircle}
          title="Đã hủy"
          value={stats.cancelled}
          color="warning"
        />
      </div>

      {/* Filter Buttons & Search & Book Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm lịch đặt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            onClick={() => setIsBookModalOpen(true)}
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Đặt lịch mới
          </Button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Lịch đặt của tôi
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredAppointments.length} lịch hẹn
          </Badge>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => {
              const statusBadge = getStatusBadge(apt.status);
              const StatusIcon = statusBadge.icon;
              return (
                <Card key={apt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {apt.code}
                      </Badge>
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {apt.time}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{apt.petIcon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{apt.petName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {apt.serviceIcon && <span>{apt.serviceIcon}</span>}
                          {apt.serviceName}
                        </p>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Ghi chú:
                        </p>
                        <p className="text-sm text-foreground">{apt.notes}</p>
                      </div>
                    )}

                    {apt.cancelReason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs font-medium text-red-900 mb-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Lý do hủy:
                        </p>
                        <p className="text-sm text-red-900">{apt.cancelReason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleViewDetail(apt)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>
                      {apt.status === 'upcoming' && (
                        <Button
                          onClick={() => handleCancelClick(apt)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy lịch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy lịch đặt nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={handleBookAppointment}
      />

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />

      <CancelAppointmentOwnerModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleCancelSuccess}
        appointment={selectedAppointment}
      />
    </div>
  );
}
