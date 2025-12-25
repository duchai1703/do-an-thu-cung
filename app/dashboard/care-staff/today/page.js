"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import CareNoteModal from "@/components/modals/CareNoteModal";
import { ClipboardList, Clock, RefreshCw, CheckCircle2, Play, FileText, AlertCircle, PawPrint, Cat, Bath, Scissors, Sparkles, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";
import { useToast } from "@/lib/contexts/ToastContext";

export default function CareStaffTodayPage() {
  const { showToast } = useToast();
  const [todayTasks, setTodayTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get current employee ID from localStorage or session
  const getEmployeeId = () => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.employeeId || user.id || 1; // Default to 1 for testing
    }
    return 1;
  };

  useEffect(() => {
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
    setLoading(true);
    const employeeId = getEmployeeId();

    try {
      const result = await careStaffApi.getTodayTasks(employeeId);
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
      } else {
        showToast(result.error || "Không thể hoàn thành công việc", "error");
      }
    } catch (error) {
      console.error('Error completing task:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  const handleOpenNoteModal = (task) => {
    setSelectedTask(task);
    setIsNoteModalOpen(true);
  };

  const handleNoteSuccess = (data) => {
    showToast("Đã lưu ghi chú chăm sóc!");
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chưa làm", variant: "warning", icon: Clock },
      in_progress: { label: "Đang làm", variant: "info", icon: RefreshCw },
      completed: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { label: "Quan trọng", variant: "destructive", icon: AlertCircle },
      normal: { label: "Bình thường", variant: "secondary", icon: Clock }
    };
    return badges[priority] || badges.normal;
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🛁': return Bath;
      case '✂️': return Scissors;
      case '🧼': return Sparkles;
      case '🪮': return Sparkles;
      default: return Sparkles;
    }
  };

  const stats = {
    total: todayTasks.length,
    pending: todayTasks.filter(t => t.status === 'pending').length,
    inProgress: todayTasks.filter(t => t.status === 'in_progress').length,
    completed: todayTasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Công việc hôm nay"
        subtitle="Danh sách công việc chi tiết - Thứ Hai, 27/10/2025"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng công việc</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa làm</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang làm</CardTitle>
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

      {/* Tasks List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Chi tiết công việc hôm nay
          </h2>
          <Badge variant="secondary">{todayTasks.length} công việc</Badge>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => {
            const statusBadge = getStatusBadge(task.status);
            const priorityBadge = getPriorityBadge(task.priority);
            const ServiceIcon = task.serviceIcon ? getServiceIcon(task.serviceIcon) : null;
            const PetIcon = task.petIcon === '🐕' ? PawPrint : task.petIcon === '🐈' ? Cat : PawPrint;
            
            return (
              <Card key={task.id} className="flex items-center gap-4 p-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="ml-1 text-sm font-semibold">{task.time}</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityBadge.variant} className="flex items-center gap-1">
                        <priorityBadge.icon className="h-3 w-3" /> {priorityBadge.label}
                      </Badge>
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                      </Badge>
                    </div>
                  </div>

                  {task.type === 'service' && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
                        <PetIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{task.petName} - {task.petType}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {task.ownerName}
                      </span>
                      {ServiceIcon && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <ServiceIcon className="h-3 w-3" /> {task.service}
                        </span>
                      )}
                    </div>
                  )}

                  {task.type === 'reminder' && task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}

                  {task.notes && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{task.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <Button size="sm" onClick={() => handleStartTask(task.id)}>
                      <Play className="h-4 w-4 mr-2" /> Bắt đầu
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && task.type === 'service' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleOpenNoteModal(task)}>
                        <FileText className="h-4 w-4 mr-2" /> Ghi chú
                      </Button>
                      <Button variant="success" size="sm" onClick={() => handleCompleteTask(task.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Hoàn thành
                      </Button>
                    </>
                  )}
                  
                  {task.status === 'in_progress' && task.type === 'reminder' && (
                    <Button variant="success" size="sm" onClick={() => handleCompleteTask(task.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Hoàn thành
                    </Button>
                  )}
                  
                  {task.status === 'completed' && (
                    <Badge variant="success">Đã xong</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isNoteModalOpen && selectedTask && (
        <CareNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => {
            setIsNoteModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={handleNoteSuccess}
          task={selectedTask}
        />
      )}
    </div>
  );
}
