// app/dashboard/vet/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
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
  Stethoscope, 
  User,
  Play,
  Eye,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { appointmentApi, medicalRecordApi, authApi, scheduleApi, getToken } from "@/lib/api";
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
          petName: apt.pet?.name || 'Unknown',
          petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petBreed: apt.pet?.breed || '',
          ownerName: apt.pet?.owner?.fullName || 'Unknown',
          ownerPhone: apt.pet?.owner?.phoneNumber || 'N/A',
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
              notes: ws.notes || ''
            }));
            setMyWorkSchedule(mappedWorkSchedule);
          }
        } catch (e) {
          console.log('Error loading work schedule:', e);
        }
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

  const quickActions = [
    {
      icon: ClipboardList,
      label: "Công việc hôm nay",
      onClick: () => router.push("/dashboard/vet/today"),
      highlight: true
    },
    {
      icon: Calendar,
      label: "Xem lịch khám",
      onClick: () => router.push("/dashboard/vet/schedule")
    },
    {
      icon: FileText,
      label: "Hồ sơ bệnh án",
      onClick: () => router.push("/dashboard/vet/records")
    },
    {
      icon: Home,
      label: "Chuồng nuôi",
      onClick: () => router.push("/dashboard/vet/boarding")
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
      'CONFIRMED': { label: "Chờ khám", variant: "warning", icon: Clock },
      'IN_PROGRESS': { label: "Đang khám", variant: "info", icon: RefreshCw },
      'COMPLETED': { label: "Hoàn thành", variant: "success", icon: CheckCircle2 },
      'CANCELLED': { label: "Đã hủy", variant: "destructive", icon: Clock }
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

      {/* Stats - Tổng quan công việc */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Calendar} title="Tổng lịch khám hôm nay" value={stats.todayAppointments} color="primary" />
        <StatsCard icon={Clock} title="Chờ khám" value={stats.waiting} color="warning" />
        <StatsCard icon={RefreshCw} title="Đang khám" value={stats.inProgress} color="info" />
        <StatsCard icon={CheckCircle2} title="Đã hoàn thành" value={stats.completed} color="success" />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Thao tác nhanh
        </h2>
        <QuickActions actions={quickActions} />
      </div>

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
                      "flex-shrink-0 w-20 p-2 rounded-lg text-center border",
                      isToday && "border-primary border-2 bg-primary/5",
                      !ws.isAvailable && "opacity-50 bg-muted"
                    )}
                  >
                    <p className={cn("text-sm font-bold", isToday && "text-primary")}>{ws.dayOfWeek}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ws.date)}</p>
                    <div className="mt-1">
                      {ws.isAvailable ? (
                        <Badge variant="outline" className="text-xs px-1">
                          {ws.startTime?.slice(0,5)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Nghỉ</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments - Công việc hôm nay */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Công việc hôm nay
              </CardTitle>
              <CardDescription>Danh sách các ca khám trong ngày</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">{todaySchedule.length} ca</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Không có lịch khám hôm nay</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((apt) => {
                const statusBadge = getStatusBadge(apt.status);
                const PetIcon = apt.petIcon === '🐕' ? PawPrint : Cat;
                // Backend chỉ cho start từ CONFIRMED → IN_PROGRESS
                const canStart = apt.status === 'CONFIRMED';
                const canView = apt.status === 'IN_PROGRESS' || apt.status === 'COMPLETED';
                
                return (
                  <div 
                    key={apt.id} 
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-all",
                      apt.status === 'IN_PROGRESS' && "border-info bg-info/5",
                      canStart && "hover:border-primary/50"
                    )}
                  >
                    {/* Time */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary mb-1" />
                      <span className="text-sm font-bold text-primary">{apt.time || '--:--'}</span>
                    </div>

                    {/* Pet Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                        <PetIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{apt.petName}</p>
                        <p className="text-xs text-muted-foreground truncate">{apt.petBreed}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {apt.ownerName}
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="hidden md:flex items-center gap-2 flex-1">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{apt.service}</span>
                    </div>

                    {/* Status */}
                    <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                      <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                    </Badge>

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
                      {canView && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/dashboard/vet/schedule`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> Xem
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}