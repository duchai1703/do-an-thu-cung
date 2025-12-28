"use client";
import "../vet/vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";
import { useToast } from "@/lib/contexts/ToastContext";
import apiClient from "@/lib/api/client";

export default function CareStaffDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    upcoming: 0
  });

  const [todayTasks, setTodayTasks] = useState([]);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Step 1: Fetch current user profile to get employeeId
      console.log('Fetching user profile from /api/auth/me...');
      const meResponse = await apiClient.get('/auth/me');
      console.log('User profile response:', meResponse);
      
      // Extract employeeId from response
      // Backend structure: { data: { accountId, email, employee: { employeeId }, ... } }
      // Or directly: { accountId, email, employee: { employeeId }, ... }
      const userData = meResponse.data || meResponse;
      const currentEmployeeId = userData?.employee?.employeeId;
      
      console.log('User data:', userData);
      console.log('Extracted employeeId:', currentEmployeeId);
      
      if (!currentEmployeeId) {
        console.warn('No employeeId found in response, user might not be an employee');
        console.warn('Response structure:', JSON.stringify(userData, null, 2));
        showToast("Không tìm thấy thông tin nhân viên", "error");
        setLoading(false);
        return;
      }

      // Save employeeId to state
      setEmployeeId(currentEmployeeId);
      setUserData(userData); // Save user data for header
      
      // Save employee details from profile (isAvailable might be at root level)
      if (userData?.isAvailable !== undefined) {
        setIsAvailable(userData.isAvailable);
      }

      // Step 2: Load statistics
      console.log('Loading statistics for employee:', currentEmployeeId);
      const statsResult = await careStaffApi.getStatistics(currentEmployeeId);
      if (statsResult.success) {
        const statsWithUpcoming = {
          ...statsResult.data,
          upcoming: statsResult.data.pending || 0
        };
        setStats(statsWithUpcoming);
      }

      // Step 3: Load today's tasks
      console.log('Loading today tasks...');
      const tasksResult = await careStaffApi.getTodayTasks(currentEmployeeId);
      if (tasksResult.success) {
        const tasksWithIcons = tasksResult.data.map(task => ({
          ...task,
          petIcon: task.petType === 'Dog' ? '🐕' : task.petType === 'Cat' ? '🐈' : '🐾',
          serviceIcon: getServiceEmoji(task.service)
        }));
        setTodayTasks(tasksWithIcons);
      }

      // Step 4: Load work schedule
      console.log('Loading work schedule...');
      const scheduleResult = await careStaffApi.getWorkSchedule(currentEmployeeId);
      if (scheduleResult.success && scheduleResult.data) {
        setWorkSchedule(scheduleResult.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast("Không thể tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };


  const getServiceEmoji = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('tắm') || name.includes('bath')) return '🛁';
    if (name.includes('cắt') || name.includes('trim')) return '✂️';
    if (name.includes('spa')) return '🪮';
    if (name.includes('lưu trú') || name.includes('board')) return '🏠';
    return '🐾';
  };

  const handleToggleStatus = async () => {
    console.log('Toggle button clicked!');
    console.log('Current employeeId:', employeeId);
    console.log('Current isAvailable:', isAvailable);
    
    if (!employeeId) {
      showToast("Không tìm thấy thông tin nhân viên", "error");
      return;
    }
    
    const newStatus = !isAvailable;
    console.log('Attempting to set status to:', newStatus);
    
    try {
      const result = await careStaffApi.toggleEmployeeStatus(employeeId, newStatus);
      console.log('Toggle result:', result);
      
      if (result.success) {
        setIsAvailable(newStatus);
        showToast(newStatus ? "Đã chuyển sang trạng thái Rảnh" : "Đã chuyển sang trạng thái Bận");
      } else {
        showToast(result.error || "Không thể cập nhật trạng thái", "error");
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast("Không thể cập nhật trạng thái", "error");
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      const task = todayTasks.find(t => t.id === taskId);
      if (!task) return;

      const result = await careStaffApi.startTask(task.appointmentId);
      if (result.success) {
        setTodayTasks(todayTasks.map(t =>
          t.id === taskId ? { ...t, status: "in_progress" } : t
        ));
        showToast("Đã bắt đầu công việc!");
        loadDashboardData();
      } else {
        showToast(result.error || "Không thể bắt đầu công việc", "error");
      }
    } catch (error) {
      console.error('Error starting task:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const task = todayTasks.find(t => t.id === taskId);
      if (!task) return;

      const result = await careStaffApi.completeTask(task.appointmentId, task.notes || '');
      if (result.success) {
        setTodayTasks(todayTasks.map(t =>
          t.id === taskId ? { ...t, status: "completed" } : t
        ));
        showToast("Đã hoàn thành công việc!");
        loadDashboardData();
      } else {
        showToast(result.error || "Không thể hoàn thành công việc", "error");
      }
    } catch (error) {
      console.error('Error completing task:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chưa làm", variant: "warning", emoji: "⏳" },
      in_progress: { label: "Đang làm", variant: "info", emoji: "🔄" },
      completed: { label: "Hoàn thành", variant: "success", emoji: "✅" }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Extended Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🌟</span>
              <h1 className="text-3xl font-bold">Chào buổi chiều</h1>
            </div>
            <p className="text-lg opacity-90">
              {userData?.fullName || 'Nhân viên chăm sóc'}
            </p>
            <p className="text-sm opacity-75 mt-1">
              Quản lý và thực hiện các dịch vụ chăm sóc thú cưng
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-3xl">🕐</span>
              <div>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm opacity-75">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">📋</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hôm nay</span>
          </div>
          <div className="value">{stats.totalTasks}</div>
          <div className="label mt-1">Tổng công việc</div>
        </div>

        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">✅</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hoàn thành</span>
          </div>
          <div className="value">{stats.completed}</div>
          <div className="label mt-1">Đã xong</div>
        </div>

        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🔄</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đang làm</span>
          </div>
          <div className="value">{stats.inProgress}</div>
          <div className="label mt-1">Đang thực hiện</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">⏰</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Sắp tới</span>
          </div>
          <div className="value">{stats.upcoming || 0}</div>
          <div className="label mt-1">Lịch sắp tới</div>
        </div>
      </div>

      {/* Work Schedule Timeline */}
      <div className="vet-glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-2xl shadow-lg">
            📅
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Lịch làm việc hôm nay</h2>
            <p className="text-sm text-gray-500">Ca làm việc và giờ nghỉ</p>
          </div>
        </div>

        {workSchedule ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="font-semibold">Ca làm việc: {workSchedule.startTime} - {workSchedule.endTime}</p>
                <p className="text-sm text-gray-600">Giờ nghỉ: {workSchedule.breakStart} - {workSchedule.breakEnd}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <span className="text-4xl mb-2 block">📅</span>
            <p>Chưa có lịch làm việc hôm nay</p>
          </div>
        )}
      </div>

      {/* Quick Actions - Premium Buttons */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Thao tác nhanh
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => router.push("/dashboard/care-staff/schedule")}
            className="p-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold text-left hover:shadow-xl transition-all flex items-center gap-4"
          >
            <span className="text-4xl">📅</span>
            <div>
              <p className="text-lg">Xem lịch làm việc</p>
              <p className="text-sm opacity-90">Quản lý ca làm việc</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/care-staff/today")}
            className="p-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-left hover:shadow-xl transition-all flex items-center gap-4"
          >
            <span className="text-4xl">📋</span>
            <div>
              <p className="text-lg">Công việc hôm nay</p>
              <p className="text-sm opacity-90">Xem chi tiết công việc</p>
            </div>
          </button>
        </div>
      </div>

      {/* Task List - Premium Design */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Danh sách công việc
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
            <span className="text-xl">{todayTasks.length}</span>
            <span className="text-sm opacity-90">công việc</span>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <span className="text-5xl">⏳</span>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-5xl">📋</span>
              <p className="text-gray-500 mt-2">Chưa có công việc nào</p>
            </div>
          ) : (
            todayTasks.map((task) => {
              const statusBadge = getStatusBadge(task.status);
              return (
                <div key={task.id} className="vet-glass-card rounded-xl p-4 flex items-center gap-4">
                  {/* Time Box */}
                  <div className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white min-w-[80px]">
                    <span className="text-2xl">🕐</span>
                    <span className="text-sm font-bold mt-1">{task.time}</span>
                  </div>

                  {/* Pet Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{task.petIcon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{task.petName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>👤</span> {task.ownerName}
                      </p>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50">
                    <span className="text-xl">{task.serviceIcon}</span>
                    <span className="text-sm font-medium">{task.service}</span>
                  </div>

                  {/* Status Badge */}
                  <div className={cn(
                    "px-3 py-1 rounded-full flex items-center gap-1 font-semibold text-sm",
                    statusBadge.variant === "success" && "bg-green-100 text-green-800",
                    statusBadge.variant === "info" && "bg-blue-100 text-blue-800",
                    statusBadge.variant === "warning" && "bg-yellow-100 text-yellow-800"
                  )}>
                    <span>{statusBadge.emoji}</span>
                    {statusBadge.label}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                      >
                        <span className="mr-1">▶️</span> Bắt đầu
                      </Button>
                    )}

                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500"
                      >
                        <span className="mr-1">✅</span> Hoàn thành
                      </Button>
                    )}

                    {task.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800">
                        <span className="mr-1">✅</span> Đã xong
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
