// app/(dashboard)/care-staff/tasks/page.js
"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ServiceNoteModal from "@/components/modals/ServiceNoteModal";
import { ClipboardList, Clock, RefreshCw, CheckCircle2, Play, FileText, AlertCircle, PawPrint, Cat, Bath, Scissors, Home, Sparkles, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";
import { useToast } from "@/lib/contexts/ToastContext";

export default function CareStaffTasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
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
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const employeeId = getEmployeeId();

    try {
      const result = await careStaffApi.getAllTasks(employeeId);
      if (result.success) {
        // Transform to match the expected format
        const transformedTasks = result.data.map(task => ({
          ...task,
          pet: task.petName,
          owner: task.ownerName,
          notes: task.notes ? [{ type: 'pre', content: task.notes }] : [],
        }));
        setTasks(transformedTasks);
      } else {
        showToast(result.error || "Không thể tải danh sách công việc", "error");
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleStartTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const result = await careStaffApi.startTask(task.appointmentId);
      if (result.success) {
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: 'in_progress' } : t
        ));
        showToast("Đã bắt đầu dịch vụ");
      } else {
        showToast(result.error || "Không thể bắt đầu dịch vụ", "error");
      }
    } catch (error) {
      console.error('Error starting task:', error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (!task.notes || task.notes.length === 0) {
        showToast("Vui lòng ghi chú trước khi hoàn thành", "error");
        return;
      }

      const notesContent = task.notes.map(n => n.content).join('\n');
      const result = await careStaffApi.completeTask(task.appointmentId, notesContent);
      
      if (result.success) {
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        ));
        showToast("Đã hoàn thành dịch vụ");
      } else {
        showToast(result.error || "Không thể hoàn thành dịch vụ", "error");
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

  const handleSaveNote = (noteData) => {
    setTasks(tasks.map(task =>
      task.id === noteData.taskId
        ? {
            ...task,
            notes: [
              ...task.notes,
              {
                type: "complete",
                timestamp: new Date().toISOString(),
                ...noteData
              }
            ]
          }
        : task
    ));
    showToast("Đã lưu ghi chú chăm sóc");
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🛁': return Bath;
      case '✂️': return Scissors;
      case '🏠': return Home;
      case '💆': return Sparkles;
      default: return Sparkles;
    }
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Công việc hôm nay"
        subtitle="Quản lý và thực hiện các dịch vụ chăm sóc"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Danh sách công việc
        </h2>

        <div className="space-y-3">
          {tasks.map(task => {
            const ServiceIcon = getServiceIcon(task.serviceIcon);
            const PetIcon = task.petIcon === '🐕' ? PawPrint : task.petIcon === '🐈' ? Cat : PawPrint;
            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="ml-1 text-sm font-semibold">{task.time}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground">
                          <PetIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{task.pet}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> {task.owner}
                          </p>
                        </div>
                      </div>
                      {task.priority === 'high' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Ưu tiên
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{task.service}</span>
                    </div>
                    {task.notes.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{task.notes.length} ghi chú</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleStartTask(task.id)}>
                          <Play className="h-4 w-4 mr-2" /> Bắt đầu
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleOpenNoteModal(task)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOpenNoteModal(task)}>
                          <FileText className="h-4 w-4 mr-2" /> Ghi chú
                        </Button>
                        <Button variant="success" size="sm" onClick={() => handleCompleteTask(task.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Hoàn thành
                        </Button>
                      </>
                    )}
                    {task.status === 'completed' && (
                      <Badge variant="success">Đã xong</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Service Note Modal */}
      <ServiceNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={handleSaveNote}
        task={selectedTask}
      />
    </div>
  );
}
