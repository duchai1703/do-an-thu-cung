"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ConfirmAppointmentModal from "@/components/modals/ConfirmAppointmentModal";
import CancelAppointmentModal from "@/components/modals/CancelAppointmentModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Calendar, Clock, CheckCircle2, XCircle, Search, PawPrint, Cat, Stethoscope, Bath, Scissors, ClipboardList, Phone, Loader2 } from "lucide-react";
import { cn, formatAppointmentId } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";

export default function AppointmentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

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
        setAppointments(response.data);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIconFromType = (categoryName) => {
    if (!categoryName) return '📋';
    const lower = categoryName.toLowerCase();
    if (lower.includes('health') || lower.includes('khám')) return '🏥';
    if (lower.includes('grooming') || lower.includes('spa') || lower.includes('tắm')) return '🛁';
    if (lower.includes('hair') || lower.includes('cắt')) return '✂️';
    return '📋';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chờ xác nhận", variant: "warning", icon: Clock },
      confirmed: { label: "Đã xác nhận", variant: "success", icon: CheckCircle2 },
      cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '🛁': return Bath;
      case '✂️': return Scissors;
      default: return ClipboardList;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const status = apt.status ? apt.status.toLowerCase() : 'pending';
    const matchFilter = filter === "all" || status === filter;
    const customerName = apt.pet?.owner?.fullName || '';
    const phone = apt.pet?.owner?.phoneNumber || '';
    const aptId = formatAppointmentId(apt.appointmentId);
    const matchSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       phone.includes(searchTerm) ||
                       aptId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirm = (appointment) => {
    console.log('Confirming appointment:', appointment);
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmAppointment = async () => {
    try {
      const response = await appointmentApi.update(selectedAppointment.appointmentId, {
        status: 'CONFIRMED'
      });

      if (response.success) {
        // Reload appointments to reflect changes
        await loadAppointments();
        setShowConfirmModal(false);
      } else {
        alert('Lỗi khi xác nhận lịch hẹn: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Lỗi khi xác nhận lịch hẹn');
    }
  };

  const cancelAppointment = async (reason) => {
    try {
      const response = await appointmentApi.update(selectedAppointment.appointmentId, {
        status: 'CANCELLED',
        notes: reason
      });

      if (response.success) {
        // Reload appointments to reflect changes
        await loadAppointments();
        setShowCancelModal(false);
      } else {
        alert('Lỗi khi hủy lịch hẹn: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Lỗi khi hủy lịch hẹn');
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => (a.status || '').toLowerCase() === 'pending').length,
    confirmed: appointments.filter(a => (a.status || '').toLowerCase() === 'confirmed').length,
    cancelled: appointments.filter(a => (a.status || '').toLowerCase() === 'cancelled').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Quản lý lịch đặt"
        subtitle="Xác nhận và quản lý lịch hẹn khách hàng"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch hẹn</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Chờ xác nhận</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Đã xác nhận</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Đã hủy</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên, SĐT, mã lịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Danh sách lịch đặt
          </h2>
          <Badge variant="secondary">{filteredAppointments.length} lịch hẹn</Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">Mã lịch</TableHead>
                <TableHead className="w-[18%]">Khách hàng</TableHead>
                <TableHead className="w-[15%]">Thú cưng</TableHead>
                <TableHead className="w-[18%]">Dịch vụ</TableHead>
                <TableHead className="w-[15%]">Ngày & Giờ</TableHead>
                <TableHead className="w-[12%]">Trạng thái</TableHead>
                <TableHead className="w-[12%] text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-8 w-8 mb-2" />
                    Không có lịch hẹn nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const status = (apt.status || '').toLowerCase();
                  const statusBadge = getStatusBadge(status);
                  const petSpecies = apt.pet?.species || '';
                  const PetIcon = petSpecies === 'DOG' ? PawPrint : petSpecies === 'CAT' ? Cat : PawPrint;
                  const serviceIcon = getServiceIconFromType(apt.service?.serviceCategory?.categoryName);
                  const ServiceIcon = getServiceIcon(serviceIcon);
                  const appointmentDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : 'N/A';
                  return (
                    <TableRow key={apt.appointmentId}>
                      <TableCell className="font-mono text-sm">{formatAppointmentId(apt.appointmentId)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apt.pet?.owner?.fullName || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {apt.pet?.owner?.phoneNumber || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PetIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{apt.pet?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                          <span>{apt.service?.serviceName || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointmentDate}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {apt.startTime || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {status === 'pending' && (
                            <Button size="sm" onClick={() => handleConfirm(apt)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Xác nhận
                            </Button>
                          )}
                          {status !== 'cancelled' && (
                            <Button variant="destructive" size="sm" onClick={() => handleCancel(apt)}>
                              <XCircle className="h-4 w-4 mr-2" /> Hủy
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <ConfirmAppointmentModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        appointment={selectedAppointment}
        onConfirm={confirmAppointment}
      />

      <CancelAppointmentModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        appointment={selectedAppointment}
        onCancel={cancelAppointment}
      />
        </>
      )}
    </div>
  );
}
