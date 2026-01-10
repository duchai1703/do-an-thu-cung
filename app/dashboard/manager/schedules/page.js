/**
 * Schedule Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/schedules
 * 
 * Features:
 * - Gradient header (Green → Emerald)
 * - Weekly calendar view
 * - Employee filter
 * - Shift management
 * - Drag & drop scheduling (future)
 * - CRUD modals
 * 
 * APIs:
 * - GET /schedules
 * - GET /schedules/week?date=YYYY-MM-DD
 * - GET /schedules/employee/:id
 * - POST /schedules
 * - PUT /schedules/:id
 * - DELETE /schedules/:id
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function SchedulesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(getMonday(new Date()));
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'list'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    workDate: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "17:00",
    shiftType: "MORNING",
    notes: ""
  });

  // Get Monday of current week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Format time to HH:MM (strip seconds if present)
  const formatTimeHHMM = (timeStr) => {
    if (!timeStr) return "08:00";
    // Handle formats like "08:00:00" or "08:00"
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  };

  // Get week dates
  function getWeekDates(monday) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate week start (Monday) and end (Sunday) dates
      const startDate = selectedWeek.toISOString().split('T')[0];
      const endOfWeek = new Date(selectedWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      const endDate = endOfWeek.toISOString().split('T')[0];
      
      const [schedulesRes, employeesRes] = await Promise.all([
        apiClient.get(`/schedules?startDate=${startDate}&endDate=${endDate}`).catch(() => 
          apiClient.get('/schedules').catch(() => ({ data: [] }))
        ),
        apiClient.get('/employees').catch(() => ({ data: [] }))
      ]);

      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : 
                           (schedulesRes.data?.data || []);
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : 
                           (employeesRes.data?.data || []);

      setSchedules(schedulesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter schedules by employee
  const getFilteredSchedules = () => {
    if (selectedEmployee === "all") return schedules;
    return schedules.filter(s => {
      const empId = s.employeeId || s.employee?.employeeId || s.employee?.id;
      return empId == selectedEmployee;
    });
  };

  // Get schedules for a specific date and employee
  const getSchedulesForDate = (date, employeeId = null) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => {
      const scheduleDate = s.workDate?.split('T')[0];
      const empId = s.employeeId || s.employee?.employeeId || s.employee?.id;
      
      if (scheduleDate !== dateStr) return false;
      if (employeeId && empId != employeeId) return false;
      if (selectedEmployee !== "all" && empId != selectedEmployee) return false;
      
      return true;
    });
  };

  // Modal handlers
  const handleOpenModal = (schedule = null, date = null) => {
    if (schedule) {
      setIsEditing(true);
      setSelectedSchedule(schedule);
      setFormData({
        employeeId: schedule.employeeId || schedule.employee?.employeeId || schedule.employee?.id || "",
        workDate: schedule.workDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        startTime: formatTimeHHMM(schedule.startTime),
        endTime: formatTimeHHMM(schedule.endTime),
        shiftType: schedule.shiftType || "MORNING",
        notes: schedule.notes || ""
      });
    } else {
      setIsEditing(false);
      setSelectedSchedule(null);
      setFormData({
        employeeId: selectedEmployee !== "all" ? selectedEmployee : "",
        workDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: "08:00",
        endTime: "17:00",
        shiftType: "MORNING",
        notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        employeeId: Number(formData.employeeId),
        workDate: formData.workDate,
        startTime: formatTimeHHMM(formData.startTime),
        endTime: formatTimeHHMM(formData.endTime),
        notes: formData.notes || null
      };

      if (isEditing && selectedSchedule) {
        const id = selectedSchedule.scheduleId || selectedSchedule.id;
        await apiClient.put(`/schedules/${id}`, payload);
        showToast("Cập nhật lịch làm việc thành công! ✅", "success");
      } else {
        await apiClient.post('/schedules', payload);
        showToast("Thêm lịch làm việc thành công! ✅", "success");
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error saving schedule:", error);
      showToast(error.response?.data?.message || "Không thể lưu lịch làm việc", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule) => {
    const id = schedule.scheduleId || schedule.id;
    if (!confirm("Bạn có chắc muốn xóa lịch làm việc này?")) return;
    
    try {
      await apiClient.delete(`/schedules/${id}`);
      showToast("Đã xóa lịch làm việc! 🗑️", "success");
      loadData();
    } catch (error) {
      showToast("Không thể xóa lịch làm việc", "error");
    }
  };

  // Navigation
  const goToPreviousWeek = () => {
    const prev = new Date(selectedWeek);
    prev.setDate(prev.getDate() - 7);
    setSelectedWeek(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(selectedWeek);
    next.setDate(next.getDate() + 7);
    setSelectedWeek(next);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(getMonday(new Date()));
  };

  // UI Helpers
  const getRoleEmoji = (userType) => {
    const emojiMap = {
      'VETERINARIAN': '👨‍⚕️', 'Veterinarian': '👨‍⚕️',
      'CARE_STAFF': '👷', 'CareStaff': '👷',
      'RECEPTIONIST': '💁',
      'MANAGER': '👔'
    };
    return emojiMap[userType] || '👤';
  };

  const getShiftConfig = (shiftType) => {
    const shifts = {
      'MORNING': { label: 'Ca sáng', emoji: '🌅', bg: 'bg-amber-100 text-amber-700', time: '08:00 - 12:00' },
      'AFTERNOON': { label: 'Ca chiều', emoji: '☀️', bg: 'bg-orange-100 text-orange-700', time: '13:00 - 17:00' },
      'EVENING': { label: 'Ca tối', emoji: '🌙', bg: 'bg-indigo-100 text-indigo-700', time: '17:00 - 21:00' },
      'FULL_DAY': { label: 'Cả ngày', emoji: '📅', bg: 'bg-green-100 text-green-700', time: '08:00 - 17:00' },
      'NIGHT': { label: 'Ca đêm', emoji: '🌃', bg: 'bg-purple-100 text-purple-700', time: '21:00 - 23:59' }
    };
    return shifts[shiftType] || shifts.MORNING;
  };

  // Infer shift type from actual start/end times
  const inferShiftType = (startTime, endTime) => {
    if (!startTime || !endTime) return 'MORNING';
    
    const start = formatTimeHHMM(startTime);
    const end = formatTimeHHMM(endTime);
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    
    // Check for night shift (starts at 21:00 or later)
    if (startHour >= 21) return 'NIGHT';
    
    // Check for full day (8+ hours, starts in morning)
    if (startHour <= 9 && endHour >= 17) return 'FULL_DAY';
    
    // Check for evening (starts at 17:00 or later, or ends at 21:00 or later)
    if (startHour >= 17 || endHour >= 21) return 'EVENING';
    
    // Check for afternoon (starts at 13:00 or later, or ends after 13:00)
    if (startHour >= 13 || (endHour > 13 && startHour >= 12)) return 'AFTERNOON';
    
    // Default to morning
    return 'MORNING';
  };

  // Get shift config based on schedule times (infers type if not stored)
  const getScheduleShiftConfig = (schedule) => {
    const shiftType = inferShiftType(schedule.startTime, schedule.endTime);
    return getShiftConfig(shiftType);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
  };

  const getDayName = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDates = getWeekDates(selectedWeek);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📆</div>
          <p className="text-gray-500 text-lg">Đang tải lịch làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📆</span>
                Quản Lý Lịch Làm Việc
              </h1>
              <p className="text-white/90">
                Xếp ca và quản lý thời gian làm việc nhân viên
              </p>
            </div>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
            >
              ➕ Thêm ca làm
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Week Navigation & Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Week Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ⬅️
                </button>
                <button
                  onClick={goToCurrentWeek}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors"
                >
                  📅 Tuần hiện tại
                </button>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ➡️
                </button>
                <span className="text-gray-600 font-medium ml-2">
                  {weekDates[0].toLocaleDateString('vi-VN')} - {weekDates[6].toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Employee Filter */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  <option value="all">👥 Tất cả nhân viên</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {getRoleEmoji(emp.userType || emp.account?.userType)} {emp.fullName}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      viewMode === 'week' ? 'bg-white shadow text-green-600' : 'text-gray-600'
                    }`}
                  >
                    🗓️ Tuần
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow text-green-600' : 'text-gray-600'
                    }`}
                  >
                    📋 Danh sách
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Calendar View */}
        {viewMode === 'week' && (
          <Card className="bg-white shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {weekDates.map((date, idx) => (
                      <th 
                        key={idx} 
                        className={`p-4 text-center min-w-[140px] ${isToday(date) ? 'bg-white/20' : ''}`}
                      >
                        <div className="text-lg font-bold">{getDayName(date)}</div>
                        <div className="text-sm opacity-90">{date.getDate()}/{date.getMonth() + 1}</div>
                        {isToday(date) && <div className="text-xs mt-1">📍 Hôm nay</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {weekDates.map((date, idx) => {
                      const daySchedules = getSchedulesForDate(date);
                      return (
                        <td 
                          key={idx} 
                          className={`p-2 align-top border-r last:border-r-0 min-h-[200px] ${
                            isToday(date) ? 'bg-green-50' : 'bg-white'
                          }`}
                        >
                          <div className="space-y-2 min-h-[180px]">
                            {daySchedules.map((schedule, sIdx) => {
                              const shift = getScheduleShiftConfig(schedule);
                              const emp = schedule.employee || employees.find(e => 
                                (e.employeeId || e.id) == (schedule.employeeId || schedule.employee?.employeeId)
                              );
                              
                              return (
                                <div
                                  key={sIdx}
                                  onClick={() => handleOpenModal(schedule)}
                                  className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-all ${shift.bg}`}
                                >
                                  <div className="flex items-center gap-1 text-sm font-medium">
                                    <span>{shift.emoji}</span>
                                    <span className="truncate">{emp?.fullName || 'N/A'}</span>
                                  </div>
                                  <div className="text-xs opacity-80">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Add button */}
                            <button
                              onClick={() => handleOpenModal(null, date)}
                              className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors text-sm"
                            >
                              ➕ Thêm ca
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {getFilteredSchedules().length} ca làm việc trong tuần này
            </p>

            {getFilteredSchedules().length > 0 ? (
              <div className="space-y-3">
                {getFilteredSchedules().map((schedule, idx) => {
                  const shift = getScheduleShiftConfig(schedule);
                  const emp = schedule.employee || employees.find(e => 
                    (e.employeeId || e.id) == (schedule.employeeId || schedule.employee?.employeeId)
                  );
                  const scheduleId = schedule.scheduleId || schedule.id;
                  
                  return (
                    <Card key={scheduleId || idx} className="bg-white shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Date Block */}
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl p-2">
                              <div className="text-lg font-bold">
                                {new Date(schedule.workDate).getDate()}
                              </div>
                              <div className="text-xs">
                                {getDayName(new Date(schedule.workDate))}
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">
                                {getRoleEmoji(emp?.userType || emp?.account?.userType)}
                              </span>
                              <span className="font-bold text-gray-900">{emp?.fullName || 'N/A'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${shift.bg}`}>
                                {shift.emoji} {shift.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              ⏰ {schedule.startTime} - {schedule.endTime}
                              {schedule.notes && ` • 📝 ${schedule.notes}`}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(schedule)}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(schedule)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-white shadow-xl">
                <CardContent className="py-16 text-center">
                  <span className="text-8xl block mb-4">📭</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch làm việc</h3>
                  <p className="text-gray-500 mb-4">Thêm ca làm việc cho nhân viên</p>
                  <Button onClick={() => handleOpenModal()}>
                    ➕ Thêm ca làm
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Legend */}
        <Card className="bg-white shadow-xl mt-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Chú thích ca làm:</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries({
                'MORNING': 'Ca sáng',
                'AFTERNOON': 'Ca chiều',
                'EVENING': 'Ca tối',
                'FULL_DAY': 'Cả ngày',
                'NIGHT': 'Ca đêm'
              }).map(([type, label]) => {
                const shift = getShiftConfig(type);
                return (
                  <div key={type} className={`px-3 py-1 rounded-full text-sm ${shift.bg}`}>
                    {shift.emoji} {label}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isEditing ? '✏️ Chỉnh sửa ca làm' : '➕ Thêm ca làm mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Employee */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  👤 Nhân viên <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {getRoleEmoji(emp.userType || emp.account?.userType)} {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📅 Ngày làm việc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.workDate}
                    onChange={(e) => setFormData({...formData, workDate: e.target.value})}
                    required
                  />
                </div>

                {/* Shift Type */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    🕐 Loại ca <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => {
                      const shift = getShiftConfig(e.target.value);
                      const [startTime, endTime] = shift.time.split(' - ');
                      setFormData({
                        ...formData, 
                        shiftType: e.target.value,
                        startTime: startTime,
                        endTime: endTime
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="MORNING">🌅 Ca sáng</option>
                    <option value="AFTERNOON">☀️ Ca chiều</option>
                    <option value="EVENING">🌙 Ca tối</option>
                    <option value="FULL_DAY">📅 Cả ngày</option>
                    <option value="NIGHT">🌃 Ca đêm</option>
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    ⏰ Giờ bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    ⏰ Giờ kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  📝 Ghi chú
                </Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 min-h-[60px]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu lịch làm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
