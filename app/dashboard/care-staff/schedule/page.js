// app/dashboard/care-staff/schedule/page.js
"use client";
import "../../vet/vet-dashboard.css";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";
import { useToast } from "@/lib/contexts/ToastContext";
import apiClient from "@/lib/api/client";

export default function CareStaffSchedulePage() {
  const { showToast } = useToast();
  
  // Helper function to get local date string (avoids UTC timezone issues)
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    hoursThisWeek: 0
  });

  // Get week date range based on offset
  const getWeekRange = (offset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (offset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: getLocalDateString(monday),
      end: getLocalDateString(sunday),
      monday,
      sunday
    };
  };

  const weekRange = getWeekRange(weekOffset);

  useEffect(() => {
    loadData();
  }, [weekOffset]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Step 1: Get employeeId from user profile
      const meResponse = await apiClient.get('/auth/me');
      const userData = meResponse.data || meResponse;
      const currentEmployeeId = userData?.employee?.employeeId;
      
      if (!currentEmployeeId) {
        showToast("Không tìm thấy thông tin nhân viên", "error");
        setLoading(false);
        return;
      }
      
      setEmployeeId(currentEmployeeId);
      
      // Step 2: Get schedules for the selected week
      console.log('Loading schedules for week:', weekRange.start, '-', weekRange.end);
      const result = await careStaffApi.getWorkScheduleRange(
        currentEmployeeId,
        weekRange.start,
        weekRange.end
      );
      
      console.log('Schedules API result:', result);
      if (result.success && result.data) {
        // Sort by workDate
        const sortedSchedules = result.data.sort((a, b) => 
          new Date(a.workDate) - new Date(b.workDate)
        );
        setSchedules(sortedSchedules);
        
        // Calculate stats
        const available = sortedSchedules.filter(s => s.isAvailable !== false).length;
        const unavailable = sortedSchedules.filter(s => s.isAvailable === false).length;
        const totalHours = sortedSchedules.reduce((acc, s) => {
          if (s.startTime && s.endTime) {
            const start = parseTimeToMinutes(s.startTime);
            const end = parseTimeToMinutes(s.endTime);
            const breakDuration = s.breakStart && s.breakEnd
              ? parseTimeToMinutes(s.breakEnd) - parseTimeToMinutes(s.breakStart)
              : 0;
            return acc + ((end - start - breakDuration) / 60);
          }
          return acc;
        }, 0);
        
        setStats({
          total: sortedSchedules.length,
          available,
          unavailable,
          hoursThisWeek: Math.round(totalHours)
        });
        
        console.log('Calculated stats:', {
          total: sortedSchedules.length,
          available,
          unavailable,
          hoursThisWeek: Math.round(totalHours)
        });
      } else {
        setSchedules([]);
        setStats({ total: 0, available: 0, unavailable: 0, hoursThisWeek: 0 });
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      showToast("Không thể tải lịch làm việc", "error");
    } finally {
      setLoading(false);
    }
  };

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.slice(0, 5);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[date.getDay()];
    return {
      dayName,
      day: date.getDate(),
      month: date.getMonth() + 1,
      full: `${dayName}, ${date.getDate()}/${date.getMonth() + 1}`
    };
  };

  const handleToggleAvailability = async (scheduleId, currentAvailable) => {
    const newStatus = !currentAvailable;
    
    try {
      const result = await careStaffApi.toggleScheduleAvailability(scheduleId, newStatus);
      
      if (result.success) {
        // Update local state
        setSchedules(schedules.map(s => 
          s.id === scheduleId 
            ? { ...s, isAvailable: newStatus }
            : s
        ));
        
        // Update stats
        if (newStatus) {
          setStats(prev => ({ ...prev, available: prev.available + 1, unavailable: prev.unavailable - 1 }));
        } else {
          setStats(prev => ({ ...prev, available: prev.available - 1, unavailable: prev.unavailable + 1 }));
        }
        
        showToast(newStatus ? "Đã đánh dấu sẵn sàng làm việc" : "Đã đánh dấu không rảnh");
      } else {
        showToast(result.error || "Không thể cập nhật trạng thái", "error");
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const isToday = (dateStr) => {
    return dateStr === getLocalDateString();
  };

  const weekLabel = () => {
    const start = formatDate(weekRange.start);
    const end = formatDate(weekRange.end);
    return `${start.day}/${start.month} - ${end.day}/${end.month}`;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Extended Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📅</span>
              <h1 className="text-3xl font-bold">Lịch làm việc của tôi</h1>
            </div>
            <p className="text-lg opacity-90">
              Xem và quản lý ca làm việc trong tuần
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-sm opacity-90">Tổng ca</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-green-500 to-emerald-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm opacity-90">Sẵn sàng</p>
              <p className="text-2xl font-bold">{stats.available}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚫</span>
            <div>
              <p className="text-sm opacity-90">Không rảnh</p>
              <p className="text-2xl font-bold">{stats.unavailable}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-pink-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏱️</span>
            <div>
              <p className="text-sm opacity-90">Giờ làm</p>
              <p className="text-2xl font-bold">{stats.hoursThisWeek}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="vet-glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="flex items-center gap-2"
          >
            <span>◀️</span> Tuần trước
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <div className="text-center">
              <p className="text-lg font-bold">
                {weekOffset === 0 ? 'Tuần này' : weekOffset > 0 ? `Tuần sau ${weekOffset > 1 ? `(+${weekOffset})` : ''}` : `Tuần trước ${weekOffset < -1 ? `(${weekOffset})` : ''}`}
              </p>
              <p className="text-sm text-gray-500">{weekLabel()}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="flex items-center gap-2"
          >
            Tuần sau <span>▶️</span>
          </Button>
        </div>
        
        {weekOffset !== 0 && (
          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => setWeekOffset(0)}
              className="text-sm"
            >
              Về tuần hiện tại
            </Button>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="vet-glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-2xl shadow-lg">
            📋
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Lịch làm việc</h2>
            <p className="text-sm text-gray-500">Nhấn vào nút để đổi trạng thái</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="text-5xl">⏳</span>
            <p className="text-gray-500 mt-4">Đang tải lịch làm việc...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">📭</span>
            <p className="text-gray-500 mt-4">Không có lịch làm việc trong tuần này</p>
            <p className="text-sm text-gray-400">Liên hệ quản lý để được xếp ca</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const dateInfo = formatDate(schedule.workDate);
              const scheduleIsToday = isToday(schedule.workDate);
              const isAvailable = schedule.isAvailable !== false;
              
              return (
                <div
                  key={schedule.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    scheduleIsToday
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  {/* Date */}
                  <div className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-xl",
                    scheduleIsToday
                      ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
                      : "bg-white shadow text-gray-700"
                  )}>
                    <span className="text-xs font-medium">{dateInfo.dayName}</span>
                    <span className="text-2xl font-bold">{dateInfo.day}</span>
                  </div>

                  {/* Time Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span className="text-lg font-semibold">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                      {scheduleIsToday && (
                        <Badge className="bg-blue-500 text-white ml-2">Hôm nay</Badge>
                      )}
                    </div>
                    {schedule.breakStart && schedule.breakEnd && (
                      <p className="text-sm text-gray-500 mt-1">
                        ☕ Nghỉ: {formatTime(schedule.breakStart)} - {formatTime(schedule.breakEnd)}
                      </p>
                    )}
                  </div>

                  {/* Availability Display (Read-only) */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-md",
                        isAvailable
                          ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white"
                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                      )}
                    >
                      <span>{isAvailable ? '✅' : '🚫'}</span>
                      {isAvailable ? 'Sẵn sàng' : 'Không rảnh'}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[120px]">
                      📝 Chỉ quản lý mới có thể thay đổi
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="vet-glass-card rounded-xl p-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-400"></div>
            <span>Sẵn sàng làm việc</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-400 to-gray-500"></div>
            <span>Không thể làm việc</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50"></div>
            <span>Ca hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
