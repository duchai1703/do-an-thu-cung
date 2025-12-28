"use client";
import "../../vet/vet-dashboard.css";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";
import { useToast } from "@/lib/contexts/ToastContext";
import apiClient from "@/lib/api/client";

export default function CareStaffTodayPage() {
  const { showToast } = useToast();
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Get employeeId from user profile
      const meResponse = await apiClient.get('/auth/me');
      const userData = meResponse.data || meResponse;
      const currentEmployeeId = userData?.employee?.employeeId;
      
      if (!currentEmployeeId) {
        showToast("Không tìm thấy thông tin nhân viên", "error");
        setLoading(false);
        return;
      }
      
      setEmployeeId(currentEmployeeId);
      
      // Get today's tasks
      const result = await careStaffApi.getTodayTasks(currentEmployeeId);
      if (result.success) {
        setTodayTasks(result.data);
      } else {
        showToast(result.error || "Không thể tải công việc hôm nay", "error");
      }
    } catch (error) {
      console.error('Error loading today tasks:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
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
        loadData();
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

      const result = await careStaffApi.completeTask(task.appointmentId, '');
      if (result.success) {
        setTodayTasks(todayTasks.map(t =>
          t.id === taskId ? { ...t, status: "completed" } : t
        ));
        showToast("Đã hoàn thành công việc!");
        loadData();
      } else {
        showToast(result.error || "Không thể hoàn thành công việc", "error");
      }
    } catch (error) {
      console.error('Error completing task:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const getTodayDate = () => {
    const today = new Date();
    const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  };

  const stats = {
    total: todayTasks.length,
    pending: todayTasks.filter(t => t.status === 'pending').length,
    inProgress: todayTasks.filter(t => t.status === 'in_progress').length,
    completed: todayTasks.filter(t => t.status === 'completed').length
  };

  const filteredTasks = filter === 'all' 
    ? todayTasks 
    : todayTasks.filter(t => t.status === filter);

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <DashboardHeader
        title="Công việc hôm nay"
        subtitle={getTodayDate()}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <p className="text-sm opacity-90">Tổng công việc</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏰</span>
            <div>
              <p className="text-sm opacity-90">Chưa làm</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-pink-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔄</span>
            <div>
              <p className="text-sm opacity-90">Đang làm</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-green-500 to-emerald-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm opacity-90">Hoàn thành</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="vet-glass-card rounded-xl p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'all'
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Tất cả ({todayTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'pending'
                ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Chưa làm ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'in_progress'
                ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Đang làm ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'completed'
                ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Hoàn thành ({stats.completed})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="vet-glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-2xl shadow-lg">
            📝
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Danh sách công việc</h2>
            <p className="text-sm text-gray-500">{filteredTasks.length} công việc</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="text-5xl">⏳</span>
            <p className="text-gray-500 mt-4">Đang tải công việc...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">🎉</span>
            <p className="text-gray-500 mt-4">
              {filter === 'all' ? 'Không có công việc hôm nay' : `Không có công việc ${
                filter === 'pending' ? 'chưa làm' :
                filter === 'in_progress' ? 'đang làm' : 'đã hoàn thành'
              }`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isPending = task.status === 'pending';
              const isInProgress = task.status === 'in_progress';
              const isCompleted = task.status === 'completed';
              
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    isCompleted 
                      ? "bg-green-50 border border-green-200"
                      : isInProgress
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-amber-50 border border-amber-200 hover:shadow-md"
                  )}
                >
                  {/* Time */}
                  <div className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-xl font-bold",
                    isCompleted 
                      ? "bg-green-100 text-green-700"
                      : isInProgress
                      ? "bg-purple-100 text-purple-700"
                      : "bg-amber-100 text-amber-700"
                  )}>
                    <span className="text-xs">🕐</span>
                    <span className="text-sm">{formatTime(task.time || task.startTime)}</span>
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <Badge className="bg-amber-500 text-white">⏰ Chưa làm</Badge>
                        )}
                        {isInProgress && (
                          <Badge className="bg-purple-500 text-white">🔄 Đang làm</Badge>
                        )}
                        {isCompleted && (
                          <Badge className="bg-green-500 text-white">✅ Hoàn thành</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>🐾</span> {task.petName} ({task.petType})
                      </span>
                      <span className="flex items-center gap-1">
                        <span>👤</span> {task.ownerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💼</span> {task.service}
                      </span>
                    </div>

                    {task.ownerPhone && (
                      <p className="text-sm text-gray-500">
                        📞 {task.ownerPhone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isPending && (
                      <Button
                        onClick={() => handleStartTask(task.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white"
                      >
                        <span className="mr-1">▶️</span> Bắt đầu
                      </Button>
                    )}
                    
                    {isInProgress && (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white"
                      >
                        <span className="mr-1">✅</span> Hoàn thành
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
  );
}
