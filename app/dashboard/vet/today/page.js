// app/(dashboard)/vet/today/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetScheduleDetailModal from "@/components/modals/VetScheduleDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { appointmentApi, medicalRecordApi, getToken } from "@/lib/api";

export default function VetTodayPage() {
  const router = useRouter();
  const [todayTasks, setTodayTasks] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
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
        console.log('[Today] No employeeId found');
        setTodayTasks([]);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Chỉ lấy appointments của bác sĩ này
      const response = await appointmentApi.getByEmployee(employeeId);
      
      if (response.success && response.data) {
        // Filter theo ngày hôm nay
        const todayAppointments = response.data.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === today;
        });

        const mappedTasks = todayAppointments.map(apt => ({
          id: apt.appointmentId || apt.id,
          time: apt.startTime || '',
          type: 'appointment',
          title: `${getServiceTitle(apt.service?.serviceName || apt.service?.name)} cho ${apt.pet?.name || 'Unknown'}`,
          petName: apt.pet?.name || 'Unknown',
          petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petType: `${apt.pet?.species || ''} ${apt.pet?.breed || ''}`.trim(),
          petAge: apt.pet?.birthDate ? calculateAge(apt.pet.birthDate) : 'N/A',
          petWeight: apt.pet?.weight ? `${apt.pet.weight} kg` : 'N/A',
          ownerName: apt.pet?.owner?.fullName || apt.pet?.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: apt.pet?.owner?.phoneNumber || 'N/A',
          serviceName: apt.service?.serviceName || apt.service?.name || 'Unknown Service',
          serviceIcon: '🩺', // Default service emoji
          status: mapStatus(apt.status),
          priority: apt.status === 'IN_PROGRESS' ? 'high' : 'normal',
          symptoms: apt.notes || 'N/A',
          previousRecords: []
        }));
        
        setTodayTasks(mappedTasks);
      }
    } catch (error) {
      console.error('Error loading today tasks:', error);
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

  const getServiceTitle = (serviceName) => {
    const titles = {
      'General Checkup': 'Khám sức khỏe',
      'Vaccination': 'Tiêm phòng',
      'Surgery': 'Phẫu thuật',
      'Dental': 'Khám răng',
      'Grooming': 'Tắm và chăm sóc'
    };
    return titles[serviceName] || serviceName || 'Khám tổng quát';
  };


  const mapStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'pending', // Treat CONFIRMED as pending for UI
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[backendStatus] || 'pending';
  };

  const handleViewDetail = (task) => {
    if (task.type === 'appointment') {
      // Chuyển đổi task thành appointment format
      const appointment = {
        id: task.id,
        code: task.id,
        time: task.time,
        petName: task.petName,
        petIcon: task.petIcon,
        petType: task.petType,
        petAge: task.petAge,
        petWeight: task.petWeight,
        ownerName: task.ownerName,
        ownerPhone: task.ownerPhone,
        serviceName: task.serviceName,
        serviceIcon: task.serviceIcon,
        symptoms: task.symptoms,
        previousRecords: task.previousRecords || []
      };
      setSelectedAppointment(appointment);
      setIsDetailModalOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chưa làm", variant: "warning", emoji: "⏰" },
      in_progress: { label: "Đang làm", variant: "info", emoji: "🔄" },
      completed: { label: "Hoàn thành", variant: "success", emoji: "✅" }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { label: "Quan trọng", variant: "destructive", emoji: "⚠️" },
      normal: { label: "Bình thường", variant: "secondary", emoji: "📌" }
    };
    return badges[priority] || badges.normal;
  };

  const stats = {
    total: todayTasks.length,
    pending: todayTasks.filter(t => t.status === 'pending').length,
    inProgress: todayTasks.filter(t => t.status === 'in_progress').length,
    completed: todayTasks.filter(t => t.status === 'completed').length
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

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Công việc hôm nay"
        subtitle="Danh sách công việc và lịch khám trong ngày"
      />

      {/* Stats - Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">📋</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng số</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng công việc</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">⏰</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chờ làm</span>
          </div>
          <div className="value">{stats.pending}</div>
          <div className="label mt-1">Chưa làm</div>
        </div>

        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl vet-animate-pulse">🔄</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đang làm</span>
          </div>
          <div className="value">{stats.inProgress}</div>
          <div className="label mt-1">Đang thực hiện</div>
        </div>

        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">✅</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hoàn thành</span>
          </div>
          <div className="value">{stats.completed}</div>
          <div className="label mt-1">Đã hoàn thành</div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Công việc hôm nay</h2>
              <p className="text-sm text-gray-500">Thứ Hai, 27/10/2025</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
            <span className="text-2xl">{todayTasks.length}</span>
            <span className="text-sm opacity-90">công việc</span>
          </div>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => {
            const statusBadge = getStatusBadge(task.status);
            const priorityBadge = getPriorityBadge(task.priority);
            const serviceEmoji = task.serviceIcon ? getServiceEmoji(task.serviceIcon) : null;
            
            return (
              <Card key={task.id} className="p-0 overflow-hidden">
                <div className="flex items-stretch gap-0">
                  {/* Time Box - Separate pink section */}
                  <div className="flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-400 text-white px-6 py-4 min-w-[120px]">
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">🕐</div>
                      <div className="text-xl font-bold">{task.time}</div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-4 flex items-center gap-4">
                    {/* Pet Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-2xl flex-shrink-0">
                        {task.petIcon || '🐾'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                        {task.type === 'appointment' && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span>🐕</span>
                              <span className="font-medium">{task.petName}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>👤</span>
                              <span>{task.ownerName}</span>
                            </span>
                            {serviceEmoji && (
                              <span className="flex items-center gap-1">
                                <span>{serviceEmoji}</span>
                                <span>{task.serviceName}</span>
                              </span>
                            )}
                          </div>
                        )}
                        {task.type === 'reminder' && task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Badges and Button - Aligned vertically center */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col gap-2">
                        <Badge variant={priorityBadge.variant} className="flex items-center gap-1 justify-center">
                          <span className="text-sm">{priorityBadge.emoji}</span> {priorityBadge.label}
                        </Badge>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 justify-center">
                          <span className="text-sm">{statusBadge.emoji}</span> {statusBadge.label}
                        </Badge>
                      </div>
                      
                      <div>
                        {task.type === 'appointment' && (
                          <Button variant="outline" onClick={() => handleViewDetail(task)} className="h-full">
                            <span className="text-lg mr-2">👁️</span> Chi tiết
                          </Button>
                        )}
                        {task.type === 'reminder' && (
                          <Button variant="outline" onClick={() => router.push("/dashboard/vet/records")}>
                            Xem ngay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
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
    </div>
  );
}
