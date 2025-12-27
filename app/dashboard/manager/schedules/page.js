"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, Plus, Edit, Trash2, Clock, User, 
  ChevronLeft, ChevronRight, RefreshCw, Filter
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { scheduleApi, employeeApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerSchedulesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // Filter states
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    employeeId: "",
    workDate: "",
    startTime: "08:00",
    endTime: "17:00",
    notes: ""
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [selectedWeek, selectedEmployee]);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  function getWeekEnd(startDate) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const endDate = getWeekEnd(selectedWeek);
      
      // Load employees first (always needed for UI)
      const employeesResponse = await employeeApi.getAll();
      
      if (employeesResponse.success && employeesResponse.data) {
        setEmployees(employeesResponse.data.map(emp => ({
          id: emp.employeeId || emp.id,
          name: emp.fullName || emp.name,
          role: emp.userType
        })));
      }

      // Load schedules based on filter
      let schedulesResponse;
      if (selectedEmployee) {
        // Filter by specific employee - use getByEmployee with date range query params
        schedulesResponse = await scheduleApi.getByEmployee(selectedEmployee, selectedWeek, endDate);
      } else {
        // Get all schedules for date range
        schedulesResponse = await scheduleApi.getByDateRange(selectedWeek, endDate);
      }

      if (schedulesResponse.success && schedulesResponse.data) {
        setSchedules(schedulesResponse.data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() - 7);
    setSelectedWeek(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + 7);
    setSelectedWeek(d.toISOString().split('T')[0]);
  };

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormData({
      employeeId: "",
      workDate: new Date().toISOString().split('T')[0],
      startTime: "08:00",
      endTime: "17:00",
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      employeeId: String(schedule.employeeId || schedule.employee?.employeeId),
      workDate: schedule.workDate,
      startTime: schedule.startTime || "08:00",
      endTime: schedule.endTime || "17:00",
      notes: schedule.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: parseInt(formData.employeeId),
        workDate: formData.workDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes || undefined
      };

      let response;
      if (editingSchedule) {
        response = await scheduleApi.update(editingSchedule.scheduleId || editingSchedule.id, payload);
      } else {
        response = await scheduleApi.create(payload);
      }

      if (response.success) {
        showToast(editingSchedule ? "Cập nhật lịch thành công!" : "Tạo lịch thành công!", "success");
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(response.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      showToast("Lỗi khi lưu lịch", "error");
    }
  };

  const handleDelete = async (scheduleId) => {
    if (confirm("Xác nhận xóa lịch làm việc này?")) {
      try {
        const response = await scheduleApi.remove(scheduleId);
        if (response.success) {
          showToast("Đã xóa lịch làm việc", "success");
          loadData();
        } else {
          showToast(response.error || "Không thể xóa", "error");
        }
      } catch (error) {
        showToast("Lỗi khi xóa", "error");
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'VETERINARIAN': 'Bác sĩ',
      'CARE_STAFF': 'Chăm sóc',
      'RECEPTIONIST': 'Lễ tân',
      'MANAGER': 'Quản lý'
    };
    return labels[role] || role;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + i);
    weekDays.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý lịch làm việc"
        subtitle="Phân công và quản lý ca trực của nhân viên"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[200px] text-center">
            Tuần {formatDate(selectedWeek)} - {formatDate(getWeekEnd(selectedWeek))}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-48"
          >
            <option value="">Tất cả nhân viên</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>

          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm lịch
          </Button>
        </div>
      </div>

      {/* Schedule Table */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Nhân viên</TableHead>
                    {weekDays.map(day => (
                      <TableHead key={day} className="min-w-[100px] text-center">
                        {formatDate(day)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{getRoleLabel(emp.role)}</p>
                          </div>
                        </div>
                      </TableCell>
                      {weekDays.map(day => {
                        const daySchedules = schedules.filter(s => 
                          (s.employeeId === emp.id || s.employee?.employeeId === emp.id) &&
                          s.workDate === day
                        );
                        return (
                          <TableCell key={day} className="text-center p-1">
                            {daySchedules.length > 0 ? (
                              daySchedules.map((schedule, idx) => (
                                <div 
                                  key={idx}
                                  className="bg-primary/10 rounded p-1 mb-1 text-xs cursor-pointer hover:bg-primary/20"
                                  onClick={() => handleOpenEdit(schedule)}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {schedule.startTime}-{schedule.endTime}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule List */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Danh sách lịch trong tuần
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ làm</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length > 0 ? schedules.map(schedule => {
                // Find employee name from employees list
                const emp = employees.find(e => 
                  e.id === schedule.employeeId || 
                  e.id === schedule.employee?.employeeId
                );
                const employeeName = emp?.name || schedule.employee?.fullName || schedule.employee?.name || 'N/A';
                
                return (
                <TableRow key={schedule.scheduleId || schedule.id}>
                  <TableCell>
                    {employeeName}
                  </TableCell>
                  <TableCell>{formatDate(schedule.workDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {schedule.startTime} - {schedule.endTime}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {schedule.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(schedule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(schedule.scheduleId || schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Không có lịch làm việc trong tuần này
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Cập nhật lịch làm việc" : "Thêm lịch làm việc"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nhân viên *</Label>
              <Select
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({getRoleLabel(emp.role)})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ngày làm việc *</Label>
              <Input
                type="date"
                value={formData.workDate}
                onChange={(e) => setFormData({...formData, workDate: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giờ bắt đầu *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Giờ kết thúc *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ghi chú thêm..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {editingSchedule ? "Cập nhật" : "Tạo lịch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
