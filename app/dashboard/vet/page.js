// app/dashboard/vet/page.js
"use client";
import "./vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import VetRecordFormModal from "@/components/modals/VetRecordFormModal";
import VetRecordDetailModal from "@/components/modals/VetRecordDetailModal";
import VetScheduleDetailModal from "@/components/modals/VetScheduleDetailModal";
import { 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Bell, 
  Clock, 
  Sparkles, 
  ClipboardList, 
  PawPrint, 
  Cat, 
  Dog,
  Bird,
  Stethoscope, 
  User,
  Play,
  Eye,
  Home,
  Syringe,
  AlertTriangle,
  Heart,
  Activity,
  TrendingUp,
  Zap,
  CalendarCheck,
  UserCheck,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { appointmentApi, medicalRecordApi, authApi, scheduleApi, petApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function VeterinarianDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Bác sĩ");
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [myWorkSchedule, setMyWorkSchedule] = useState([]);
  const [upcomingAlert, setUpcomingAlert] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [vaccinationAlerts, setVaccinationAlerts] = useState({ upcoming: [], overdue: [] });
  const [overdueFollowUps, setOverdueFollowUps] = useState([]);
  
  // State for viewing completed appointment's record
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  
  // State for viewing appointment details (Chi tiết modal)
  const [isAptDetailModalOpen, setIsAptDetailModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);

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

      // Load user info
      let currentEmployeeId = null;
      try {
        const userRes = await authApi.getCurrentUser();
        console.log('[Dashboard] User info:', userRes);
        if (userRes.success && userRes.data) {
          setUserName(userRes.data.fullName || userRes.data.email || "Bác sĩ");
          currentEmployeeId = userRes.data.employee?.employeeId;
          setEmployeeId(currentEmployeeId);
          console.log('[Dashboard] Employee ID:', currentEmployeeId);
        }
      } catch (e) {
        console.error("Error loading user info:", e);
      }

      const today = new Date().toISOString().split('T')[0];

      // Chỉ lấy appointments của bác sĩ đang đăng nhập (theo employeeId)
      if (!currentEmployeeId) {
        console.log('[Dashboard] No employeeId found - cannot fetch appointments');
        setStats({ todayAppointments: 0, waiting: 0, inProgress: 0, completed: 0 });
        setTodaySchedule([]);
        setLoading(false);
        return;
      }

      // Gọi API lấy appointments theo employeeId
      const appointmentsRes = await appointmentApi.getByEmployee(currentEmployeeId);
      console.log('[Dashboard] My appointments:', appointmentsRes);

      if (appointmentsRes.success && appointmentsRes.data) {
        // Filter today's appointments
        const todayAppointments = appointmentsRes.data.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === today;
        });

        const waiting = todayAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
        const inProgress = todayAppointments.filter(a => a.status === 'IN_PROGRESS').length;
        const completed = todayAppointments.filter(a => a.status === 'COMPLETED').length;

        // Map schedule
        const mappedSchedule = todayAppointments.map(apt => ({
          id: apt.appointmentId || apt.id,
          time: apt.startTime || '',
          // Pet info - important for medical record form
          petId: apt.pet?.petId || apt.petId,
          petName: apt.pet?.name || 'Unknown',
          petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petBreed: apt.pet?.breed || '',
          petType: `${apt.pet?.species || ''} ${apt.pet?.breed || ''}`.trim(),
          // Owner info
          ownerId: apt.pet?.owner?.petOwnerId,
          ownerName: apt.pet?.owner?.fullName || 'Unknown',
          ownerPhone: apt.pet?.owner?.phoneNumber || 'N/A',
          // Service & Status
          service: apt.service?.serviceName || apt.service?.name || 'Khám bệnh',
          status: apt.status,
          symptoms: apt.notes || ''
        }));

        // Sort by time
        mappedSchedule.sort((a, b) => {
          if (!a.time || !b.time) return 0;
          return a.time.localeCompare(b.time);
        });

        setTodaySchedule(mappedSchedule);

        setStats({
          todayAppointments: todayAppointments.length,
          waiting,
          inProgress,
          completed
        });

        // Check for upcoming appointments
        checkUpcomingAppointments(mappedSchedule);
      }

      // Load my work schedule for this week
      if (currentEmployeeId) {
        try {
          const weekStart = new Date();
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() + 7);
          
          const scheduleRes = await scheduleApi.getByEmployee(
            currentEmployeeId,
            weekStart.toISOString().split('T')[0],
            weekEnd.toISOString().split('T')[0]
          );
          
          if (scheduleRes.success && scheduleRes.data) {
            const mappedWorkSchedule = scheduleRes.data.map(ws => ({
              id: ws.scheduleId || ws.id,
              date: ws.workDate,
              dayOfWeek: getDayOfWeek(ws.workDate),
              startTime: ws.startTime || '08:00',
              endTime: ws.endTime || '17:00',
              isAvailable: ws.isAvailable !== false,
              notes: ws.notes || '',
              // New fields from API
              breakStart: ws.breakStart || null,
              breakEnd: ws.breakEnd || null,
              workingHours: ws.workingHours || calculateWorkingHours(ws.startTime, ws.endTime, ws.breakStart, ws.breakEnd)
            }));
            setMyWorkSchedule(mappedWorkSchedule);
          }
        } catch (e) {
          console.log('Error loading work schedule:', e);
        }
      }

      // Load vaccination alerts - pets with upcoming/overdue vaccinations
      try {
        // Get all pets from today's appointments to check their vaccinations
        const allPetIds = new Set();
        if (appointmentsRes?.success && appointmentsRes?.data) {
          appointmentsRes.data.forEach(apt => {
            if (apt.pet?.petId) allPetIds.add(apt.pet.petId);
          });
        }

        const upcomingVacs = [];
        const overdueVacs = [];

        for (const petId of allPetIds) {
          try {
            const [upcomingRes, overdueRes] = await Promise.all([
              petApi.getUpcomingVaccinations(petId, 14),
              petApi.getOverdueVaccinations(petId)
            ]);

            if (upcomingRes.success && upcomingRes.data?.length > 0) {
              upcomingRes.data.forEach(v => {
                const apt = appointmentsRes.data.find(a => a.pet?.petId === petId);
                upcomingVacs.push({
                  ...v,
                  petName: apt?.pet?.name || 'Unknown',
                  petIcon: apt?.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈'
                });
              });
            }

            if (overdueRes.success && overdueRes.data?.length > 0) {
              overdueRes.data.forEach(v => {
                const apt = appointmentsRes.data.find(a => a.pet?.petId === petId);
                overdueVacs.push({
                  ...v,
                  petName: apt?.pet?.name || 'Unknown',
                  petIcon: apt?.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈'
                });
              });
            }
          } catch (e) {
            console.log('Error loading vaccinations for pet:', petId, e);
          }
        }

        setVaccinationAlerts({ upcoming: upcomingVacs, overdue: overdueVacs });
      } catch (e) {
        console.log('Error loading vaccination alerts:', e);
      }

      // Load overdue follow-ups
      try {
        const overdueRes = await medicalRecordApi.getOverdueFollowUps();
        if (overdueRes.success && overdueRes.data) {
          setOverdueFollowUps(overdueRes.data.map(record => ({
            id: record.id || record.recordId,
            petId: record.petId || record.pet?.petId,
            petName: record.pet?.name || 'Unknown',
            petIcon: record.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            diagnosis: record.diagnosis,
            followUpDate: record.followUpDate,
            veterinarianName: record.veterinarian?.fullName || 'N/A',
            ownerName: record.pet?.owner?.fullName || 'Unknown',
            ownerPhone: record.pet?.owner?.phoneNumber || 'N/A'
          })));
        }
      } catch (e) {
        console.log('Error loading overdue follow-ups:', e);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (dateStr) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Calculate working hours from start/end times minus break
  const calculateWorkingHours = (startTime, endTime, breakStart, breakEnd) => {
    if (!startTime || !endTime) return 8;
    
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };
    
    const start = parseTime(startTime) || 8;
    const end = parseTime(endTime) || 17;
    const bStart = parseTime(breakStart);
    const bEnd = parseTime(breakEnd);
    
    let totalHours = end - start;
    if (bStart && bEnd) {
      totalHours -= (bEnd - bStart);
    }
    
    return Math.round(totalHours * 10) / 10; // Round to 1 decimal
  };

  const checkUpcomingAppointments = (schedule) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const upcoming = schedule.find(apt => {
      if (!apt.time) return false;
      const [hours, minutes] = apt.time.split(':').map(Number);
      const aptTime = hours * 60 + minutes;
      const diff = aptTime - currentTime;
      return diff > 0 && diff <= 30 && apt.status === 'CONFIRMED';
    });

    if (upcoming) {
      setUpcomingAlert({
        id: upcoming.id,
        petName: upcoming.petName,
        time: upcoming.time
      });
    }
  };

  const handleStartExam = async (appointmentId) => {
    try {
      const response = await appointmentApi.start(appointmentId);
      if (response.success) {
        showToast("Đã bắt đầu khám!");
        loadDashboardData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleCompleteExam = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRecordModalOpen(true);
  };

  const handleRecordSuccess = (result) => {
    showToast(result.message || "Hoàn thành khám thành công!");
    setIsRecordModalOpen(false);
    setSelectedAppointment(null);
    loadDashboardData();
  };

  // Toggle schedule availability
  const handleToggleAvailability = async (schedule) => {
    try {
      if (schedule.isAvailable) {
        // Mark as unavailable - ask for reason
        const reason = prompt("📅 Nhập lý do nghỉ (nếu có):", "");
        if (reason === null) return; // User cancelled
        
        const response = await scheduleApi.markUnavailable(schedule.id, reason);
        if (response.success) {
          showToast("✅ Đã đánh dấu nghỉ phép");
          loadDashboardData();
        } else {
          throw new Error(response.error);
        }
      } else {
        // Mark as available
        const response = await scheduleApi.markAvailable(schedule.id);
        if (response.success) {
          showToast("✅ Đã sẵn sàng nhận lịch");
          loadDashboardData();
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    }
  };

  // Handler to view medical record for completed appointment
  const handleViewRecord = async (appointment) => {
    try {
      // Fetch medical record by appointmentId
      const response = await medicalRecordApi.getAll();
      
      if (response.success && response.data) {
        // Find record matching this appointment
        const record = response.data.find(r => 
          r.appointmentId === appointment.id || 
          r.appointment?.appointmentId === appointment.id
        );
        
        if (record) {
          // Format record for detail modal
          const formattedRecord = {
            id: record.recordId || record.id,
            code: `MR${String(record.recordId || record.id).padStart(4, '0')}`,
            date: record.createdAt,
            petId: record.pet?.petId || record.petId,
            petName: record.pet?.name || appointment.petName,
            petIcon: appointment.petIcon || '🐾',
            petType: `${record.pet?.species || ''} ${record.pet?.breed || ''}`.trim(),
            ownerId: record.pet?.owner?.petOwnerId,
            ownerName: record.pet?.owner?.fullName || appointment.ownerName,
            ownerPhone: record.pet?.owner?.phoneNumber || appointment.ownerPhone,
            symptoms: record.symptoms || record.medicalSummary?.symptoms || '',
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            prescription: record.prescription || record.medicalSummary?.prescription || '',
            notes: record.notes || record.medicalSummary?.notes || '',
            followUpDate: record.followUpDate,
            invoiceCreated: !!record.invoice?.invoiceId
          };
          
          setViewingRecord(formattedRecord);
          setIsDetailModalOpen(true);
        } else {
          showToast("Không tìm thấy hồ sơ bệnh án cho cuộc hẹn này", "warning");
        }
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
      showToast("Có lỗi khi tải hồ sơ bệnh án", "error");
    }
  };

  const quickActions = [
    {
      icon: Zap,
      emoji: "⚡",
      label: "Công việc hôm nay",
      onClick: () => router.push("/dashboard/vet/today"),
      highlight: true
    },
    {
      icon: CalendarCheck,
      emoji: "📅",
      label: "Xem lịch khám",
      onClick: () => router.push("/dashboard/vet/schedule")
    },
    {
      icon: Heart,
      emoji: "📋",
      label: "Hồ sơ bệnh án",
      onClick: () => router.push("/dashboard/vet/records")
    },
    {
      icon: PawPrint,
      emoji: "🏠",
      label: "Chuồng nuôi",
      onClick: () => router.push("/dashboard/vet/boarding")
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { label: "Chờ xác nhận", variant: "secondary", emoji: "⏳" },
      'CONFIRMED': { label: "Chờ khám", variant: "warning", emoji: "⏰" },
      'IN_PROGRESS': { label: "Đang khám", variant: "info", emoji: "🔄" },
      'COMPLETED': { label: "Hoàn thành", variant: "success", emoji: "✅" },
      'CANCELLED': { label: "Đã hủy", variant: "destructive", emoji: "⚠️" }
    };
    return badges[status] || badges.PENDING;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <DashboardHeader
        title="Dashboard Bác sĩ thú y"
        subtitle={`Xin chào, ${userName} - ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Upcoming Alert */}
      {upcomingAlert && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary animate-pulse" />
              <p className="text-sm">
                ⏰ Sắp đến giờ khám cho <strong>{upcomingAlert.petName}</strong> lúc <strong>{upcomingAlert.time}</strong>
              </p>
            </div>
            <Button onClick={() => handleStartExam(upcomingAlert.id)} size="sm" className="flex items-center gap-1">
              <Play className="h-4 w-4" /> Bắt đầu khám
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats - Tổng quan công việc với Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Appointments */}
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              📅
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hôm nay</span>
          </div>
          <div className="value">{stats.todayAppointments}</div>
          <div className="label mt-1">Tổng lịch khám</div>
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
          <div className="label mt-1">Bệnh nhân đang chờ</div>
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
          <div className="label mt-1">Đã hoàn thành hôm nay</div>
        </div>
      </div>

      {/* Vaccination Alerts */}
      {(vaccinationAlerts.overdue.length > 0 || vaccinationAlerts.upcoming.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Overdue Vaccinations */}
          {vaccinationAlerts.overdue.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-red-700 text-base">
                  <AlertTriangle className="h-5 w-5" />
                  Quá hạn tiêm phòng ({vaccinationAlerts.overdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vaccinationAlerts.overdue.map((vac, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-red-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{vac.petIcon}</span>
                        <div>
                          <p className="font-medium text-sm">{vac.petName}</p>
                          <p className="text-xs text-red-600">
                            Quá {Math.abs(vac.daysUntilDue || 0)} ngày
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">Quá hạn</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Vaccinations */}
          {vaccinationAlerts.upcoming.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-yellow-700 text-base">
                  <Syringe className="h-5 w-5" />
                  Sắp đến hạn tiêm ({vaccinationAlerts.upcoming.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vaccinationAlerts.upcoming.map((vac, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-yellow-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{vac.petIcon}</span>
                        <div>
                          <p className="font-medium text-sm">{vac.petName}</p>
                          <p className="text-xs text-yellow-600">
                            Còn {vac.daysUntilDue || 0} ngày
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500 text-xs">Sắp đến</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions - Premium Style */}
      <div className="space-y-4">
        <div className="vet-section-header">
          <div className="icon-wrapper text-2xl">
            ✨
          </div>
          <h2>Thao tác nhanh</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={cn(
                "vet-action-btn",
                action.highlight && "highlight"
              )}
            >
              <div className="icon-bg text-3xl">
                {action.emoji}
              </div>
              <span className="font-semibold text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔴 Overdue Follow-ups Warning Widget */}
      {overdueFollowUps.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 animate-pulse-slow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800">⚠️ Tái khám quá hạn</h3>
                <p className="text-sm text-red-600">{overdueFollowUps.length} bệnh nhân cần được tái khám</p>
              </div>
            </div>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {overdueFollowUps.length}
            </Badge>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {overdueFollowUps.slice(0, 5).map((record) => (
              <div key={record.id} className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{record.petIcon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{record.petName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{record.diagnosis}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 font-semibold">
                    📅 {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">📞 {record.ownerPhone}</p>
                </div>
              </div>
            ))}
          </div>
          {overdueFollowUps.length > 5 && (
            <p className="text-xs text-red-600 mt-2 text-center">
              +{overdueFollowUps.length - 5} khác...
            </p>
          )}
        </div>
      )}

      {/* My Work Schedule This Week */}
      {myWorkSchedule.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Lịch trực tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {myWorkSchedule.map((ws) => {
                const isToday = ws.date === new Date().toISOString().split('T')[0];
                return (
                  <div 
                    key={ws.id} 
                    className={cn(
                      "flex-shrink-0 w-28 p-2 rounded-lg text-center border transition-all group",
                      isToday && "border-primary border-2 bg-primary/5",
                      !ws.isAvailable && "opacity-60 bg-muted"
                    )}
                    title={ws.notes ? `📝 ${ws.notes}` : ''}
                  >
                    <p className={cn("text-sm font-bold", isToday && "text-primary")}>{ws.dayOfWeek}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ws.date)}</p>
                    <div className="mt-1">
                      {ws.isAvailable ? (
                        <>
                          <Badge variant="outline" className="text-xs px-1">
                            {ws.startTime?.slice(0,5)} - {ws.endTime?.slice(0,5)}
                          </Badge>
                          {/* Working Hours */}
                          <p className="text-xs text-emerald-600 font-semibold mt-1">
                            ⏱️ {ws.workingHours || 8}h
                          </p>
                          {/* Break Time - show on hover */}
                          {ws.breakStart && ws.breakEnd && (
                            <p className="text-xs text-orange-500 mt-0.5 hidden group-hover:block">
                              ☕ {ws.breakStart?.slice(0,5)}-{ws.breakEnd?.slice(0,5)}
                            </p>
                          )}
                          {/* Notes indicator */}
                          {ws.notes && (
                            <span className="text-xs" title={ws.notes}>📝</span>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Nghỉ</Badge>
                      )}
                    </div>
                    {/* Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAvailability(ws);
                      }}
                      className={cn(
                        "mt-2 w-full py-1 px-2 rounded text-xs font-medium transition-all",
                        ws.isAvailable 
                          ? "bg-red-100 text-red-700 hover:bg-red-200" 
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      )}
                      title={ws.isAvailable ? "Xin nghỉ" : "Huỷ nghỉ"}
                    >
                      {ws.isAvailable ? "🚫 Xin nghỉ" : "✅ Làm việc"}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments - Công việc hôm nay - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="vet-section-header" style={{ marginBottom: 0 }}>
                <div className="icon-wrapper text-2xl">
                  📋
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Công việc hôm nay</h2>
                  <p className="text-sm text-gray-500">Danh sách các ca khám trong ngày</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
              <span className="text-2xl">{todaySchedule.length}</span>
              <span className="text-sm opacity-90">ca khám</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {todaySchedule.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center text-4xl">
                📅
              </div>
              <p className="text-gray-400 text-lg">Không có lịch khám hôm nay</p>
              <p className="text-gray-300 text-sm mt-1">Tận hưởng ngày nghỉ! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4 vet-scrollbar max-h-[500px] overflow-y-auto pr-2">
              {todaySchedule.map((apt) => {
                const statusBadge = getStatusBadge(apt.status);
                const PetIcon = apt.petIcon === '🐕' ? PawPrint : Cat;
                const canStart = apt.status === 'CONFIRMED';
                
                return (
                  <div 
                    key={apt.id} 
                    className={cn(
                      "vet-apt-card",
                      apt.status === 'PENDING' && "border-gray-200",
                      apt.status === 'CONFIRMED' && "waiting",
                      apt.status === 'IN_PROGRESS' && "in-progress",
                      apt.status === 'COMPLETED' && "completed"
                    )}
                  >
                    {/* Time Badge */}
                    <div className="time-badge flex-shrink-0">
                      <span className="text-lg mb-1">🕐</span>
                      <span className="text-sm font-bold">{apt.time || '--:--'}</span>
                    </div>

                    {/* Pet Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="pet-avatar flex-shrink-0 text-2xl">
                        {apt.petIcon || '🐾'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate text-lg">{apt.petName}</p>
                        <p className="text-sm text-gray-500 truncate">{apt.petBreed}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <span>👤</span> {apt.ownerName}
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-lg">🩺</span>
                      <span className="text-sm font-medium text-gray-600">{apt.service}</span>
                    </div>

                    {/* Status Badge */}
                    <div className={cn(
                      "vet-badge",
                      apt.status === 'PENDING' && "bg-gray-100 text-gray-600 border-gray-200",
                      apt.status === 'CONFIRMED' && "vet-badge-warning",
                      apt.status === 'IN_PROGRESS' && "vet-badge-info",
                      apt.status === 'COMPLETED' && "vet-badge-success"
                    )}>
                      <span className="text-sm">{statusBadge.emoji}</span>
                      {statusBadge.label}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {canStart && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartExam(apt.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-4 w-4" /> Bắt đầu
                        </Button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleCompleteExam(apt)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Hoàn thành
                        </Button>
                      )}
                      {apt.status === 'COMPLETED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewRecord(apt)}
                          className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Eye className="h-4 w-4" /> Xem hồ sơ
                        </Button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setViewingAppointment({
                              id: apt.id,
                              code: `APT${String(apt.id).padStart(3, '0')}`,
                              time: apt.time,
                              petName: apt.petName,
                              petIcon: apt.petIcon,
                              petType: apt.petType,
                              petAge: apt.petAge || 'N/A',
                              petWeight: apt.petWeight || 'N/A',
                              ownerName: apt.ownerName,
                              ownerPhone: apt.ownerPhone,
                              serviceName: apt.service,
                              serviceIcon: Stethoscope,
                              symptoms: apt.symptoms
                            });
                            setIsAptDetailModalOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> Chi tiết
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* VetRecordFormModal - Full form for creating records from appointments */}
      <VetRecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleRecordSuccess}
        appointment={selectedAppointment}
      />

      {/* VetRecordDetailModal - View medical record details */}
      <VetRecordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingRecord(null);
        }}
        record={viewingRecord}
      />

      {/* VetScheduleDetailModal - View appointment details */}
      <VetScheduleDetailModal
        isOpen={isAptDetailModalOpen}
        onClose={() => {
          setIsAptDetailModalOpen(false);
          setViewingAppointment(null);
        }}
        appointment={viewingAppointment}
      />
    </div>
  );
}