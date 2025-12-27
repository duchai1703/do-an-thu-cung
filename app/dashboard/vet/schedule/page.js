// app/(dashboard)/vet/schedule/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetScheduleDetailModal from "@/components/modals/VetScheduleDetailModal";
import VetRecordModal from "@/components/modals/VetRecordModal";
import { Calendar, Clock, CheckCircle2, RefreshCw, Search, Eye, Play, ClipboardList, PawPrint, Cat, Stethoscope, Syringe, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";
import { formatAppointmentId } from "@/lib/utils/id-formatter";

export default function VeterinarianSchedulePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Lấy employeeId của bác sĩ đang đăng nhập
      const { authApi } = await import("@/lib/api");
      const userRes = await authApi.getCurrentUser();
      const employeeId = userRes.data?.employee?.employeeId;

      if (!employeeId) {
        console.log('[Schedule] No employeeId found - cannot fetch appointments');
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Chỉ lấy appointments của bác sĩ này
      const response = await appointmentApi.getByEmployee(employeeId);
      
      if (response.success && response.data) {
        // Filter theo ngày đã chọn
        const filteredByDate = response.data.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === selectedDate;
        });

        const mappedAppointments = filteredByDate.map(apt => ({
          id: apt.appointmentId || apt.id,
          code: formatAppointmentId(apt.appointmentId || apt.id),
          time: apt.startTime || '',
          petId: apt.pet?.petId || apt.pet?.id,
          petName: apt.pet?.name || 'Unknown',
          petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petType: `${apt.pet?.species || ''} ${apt.pet?.breed || ''}`.trim(),
          petAge: apt.pet?.birthDate ? calculateAge(apt.pet.birthDate) : 'N/A',
          petWeight: apt.pet?.weight ? `${apt.pet.weight} kg` : 'N/A',
          ownerId: apt.pet?.owner?.petOwnerId || apt.pet?.owner?.id,
          ownerName: apt.pet?.owner?.fullName || apt.pet?.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: apt.pet?.owner?.phoneNumber || 'N/A',
          serviceId: apt.service?.serviceId || apt.service?.id,
          serviceName: apt.service?.serviceName || apt.service?.name || 'Unknown Service',
          serviceIconName: apt.service?.serviceName || apt.service?.name || '',
          status: mapStatus(apt.status),
          symptoms: apt.notes || 'N/A',
          notes: apt.notes || '',
          previousRecords: []
        }));
        
        setAppointments(mappedAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} tuổi`;
    }
    return `${age} tuổi`;
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'waiting',
      'CONFIRMED': 'waiting',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[backendStatus] || 'waiting';
  };

  const handleStartExam = async (appointmentId) => {
    try {
      // Call API to start the exam
      const response = await appointmentApi.start(appointmentId);
      
      if (response.success) {
        // Reload appointments from server to get updated status
        await loadAppointments();
        showToast("Đã bắt đầu khám");
      } else {
        showToast(response.error || "Không thể bắt đầu ca khám", "error");
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      showToast("Có lỗi xảy ra khi bắt đầu khám", "error");
    }
  };

  const handleCompleteExam = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRecordModalOpen(true);
  };

  const handleRecordSuccess = async (data) => {
    // Reload appointments to get updated status from server
    // (VetRecordModal already called appointmentApi.complete())
    await loadAppointments();
    showToast("Đã hoàn thành ca khám và lưu bệnh án!");
  };

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchFilter = filter === "all" || apt.status === filter;
    const matchSearch = apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      waiting: { label: "Chờ khám", variant: "warning", icon: Clock },
      in_progress: { label: "Đang khám", variant: "info", icon: RefreshCw },
      completed: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 }
    };
    return badges[status] || badges.waiting;
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '💉': return Syringe;
      case '🔄': return RefreshCw;
      case '🩺': return Stethoscope;
      default: return Stethoscope;
    }
  };

  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === 'waiting').length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Lịch làm việc"
        subtitle="Quản lý lịch khám và thực hiện ca khám"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ca khám</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ khám</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waiting}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang khám</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="waiting">Chờ khám</TabsTrigger>
          <TabsTrigger value="in_progress">Đang khám</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Picker and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Chọn ngày:</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên thú cưng hoặc chủ nuôi..."
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
            Lịch khám ngày {selectedDate}
          </h2>
          <Badge variant="secondary">{filteredAppointments.length} ca khám</Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">Mã</TableHead>
                <TableHead className="w-[8%]">Giờ</TableHead>
                <TableHead className="w-[18%]">Thú cưng</TableHead>
                <TableHead className="w-[15%]">Chủ nuôi</TableHead>
                <TableHead className="w-[16%]">Dịch vụ</TableHead>
                <TableHead className="w-[12%]">Trạng thái</TableHead>
                <TableHead className="w-[23%] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-8 w-8 mb-2" />
                    Không có ca khám nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  const ServiceIcon = getServiceIcon(apt.serviceIconName);
                  const PetIcon = apt.petIcon === '🐕' ? PawPrint : apt.petIcon === '🐈' ? Cat : PawPrint;
                  return (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{apt.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{apt.time}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
                            <PetIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{apt.petName}</p>
                            <p className="text-xs text-muted-foreground">{apt.petType}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold">{apt.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{apt.ownerPhone}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{apt.serviceName}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(apt)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {apt.status === 'waiting' && (
                            <Button variant="default" size="icon" onClick={() => handleStartExam(apt.id)}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(apt.status === 'in_progress' || apt.status === 'waiting') && (
                            <Button variant="success" size="icon" onClick={() => handleCompleteExam(apt)}>
                              <CheckCircle2 className="h-4 w-4" />
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
      {isDetailModalOpen && (
        <VetScheduleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}

      {isRecordModalOpen && (
        <VetRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleRecordSuccess}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}
