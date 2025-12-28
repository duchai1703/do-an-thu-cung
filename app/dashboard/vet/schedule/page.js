// app/(dashboard)/vet/schedule/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetScheduleDetailModal from "@/components/modals/VetScheduleDetailModal";
import VetRecordModal from "@/components/modals/VetRecordModal";
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
          servicePrice: apt.service?.price || apt.service?.basePrice || null,
          serviceDescription: apt.service?.description || null,
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
      waiting: { label: "Chờ khám", variant: "warning", emoji: "⏰" },
      in_progress: { label: "Đang khám", variant: "info", emoji: "🔄" },
      completed: { label: "Hoàn thành", variant: "success", emoji: "✅" }
    };
    return badges[status] || badges.waiting;
  };

  const getServiceEmoji = (icon) => {
    switch (icon) {
      case '🏥': return '🩺';
      case '💉': return '💉';
      case '🔄': return '🔄';
      case '🩺': return '🩺';
      default: return '🩺';
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

      {/* Stats - Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              📅
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng ca</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng ca khám</div>
        </div>

        {/* Waiting */}
        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              ⏰
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chờ khám</span>
          </div>
          <div className="value">{stats.waiting}</div>
          <div className="label mt-1">Đang chờ</div>
        </div>

        {/* In Progress */}
        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl vet-animate-pulse">
              🔄
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đang khám</span>
          </div>
          <div className="value">{stats.inProgress}</div>
          <div className="label mt-1">Đang thực hiện</div>
        </div>

        {/* Completed */}
        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              ✅
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hoàn thành</span>
          </div>
          <div className="value">{stats.completed}</div>
          <div className="label mt-1">Đã hoàn thành</div>
        </div>
      </div>

      {/* Filter Tabs - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl p-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'all', label: 'Tất cả', emoji: '📋', gradient: 'from-pink-500 to-rose-400' },
            { value: 'waiting', label: 'Chờ khám', emoji: '⏰', gradient: 'from-amber-500 to-orange-400' },
            { value: 'in_progress', label: 'Đang khám', emoji: '🔄', gradient: 'from-blue-500 to-cyan-400' },
            { value: 'completed', label: 'Hoàn thành', emoji: '✅', gradient: 'from-green-500 to-emerald-400' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                filter === tab.value
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : "bg-white/50 text-gray-600 hover:bg-white/80"
              )}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker and Search - Premium Cards với UX cải thiện */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Picker Card */}
        <div className="vet-glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => {
          const input = document.getElementById('date-input');
          input?.focus();
          input?.showPicker?.();
        }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-3xl shadow-lg hover:scale-110 transition-transform">
              📅
            </div>
            <div className="flex-1">
              <label htmlFor="date-input" className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                Chọn ngày khám
              </label>
              <Input
                id="date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-xl font-bold text-gray-900 focus-visible:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="vet-glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => document.getElementById('search-input')?.focus()}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-3xl shadow-lg hover:scale-110 transition-transform">
              🔍
            </div>
            <div className="flex-1">
              <label htmlFor="search-input" className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                Tìm kiếm lịch khám
              </label>
              <Input
                id="search-input"
                type="text"
                placeholder="Nhập tên thú cưng hoặc chủ nuôi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
                📋
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Lịch khám ngày {selectedDate}</h2>
                <p className="text-sm text-gray-500">Danh sách các ca khám trong ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
              <span className="text-2xl">{filteredAppointments.length}</span>
              <span className="text-sm opacity-90">ca khám</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <div className="rounded-xl border border-pink-100 overflow-hidden bg-white/50">
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
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📅</span>
                      Không có ca khám nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{apt.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-base">🕐</span>
                          <span className="font-medium">{apt.time}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-xl">
                            {apt.petIcon || '🐾'}
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
                          <span className="text-lg">{getServiceEmoji(apt.serviceIconName)}</span>
                          <span className="text-sm">{apt.serviceName}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <span className="text-sm">{statusBadge.emoji}</span> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(apt)} title="Xem chi tiết">
                            <span className="text-lg">👁️</span>
                          </Button>
                          
                          {apt.status === 'waiting' && (
                            <Button variant="default" size="icon" onClick={() => handleStartExam(apt.id)} title="Bắt đầu khám">
                              <span className="text-lg">▶️</span>
                            </Button>
                          )}
                          
                          {(apt.status === 'in_progress' || apt.status === 'waiting') && (
                            <Button variant="success" size="icon" onClick={() => handleCompleteExam(apt)} title="Hoàn thành">
                              <span className="text-lg">✅</span>
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
