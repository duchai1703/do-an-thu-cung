"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, Search, Edit, Hourglass, CheckCircle2, 
  RefreshCw, XCircle, Clock, ClipboardList, User, Stethoscope, Wrench 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UpdateAppointmentModal from "@/components/modals/UpdateAppointmentModal";
import { cn } from "@/lib/utils";
import { appointmentApi, employeeApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ManagerAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // TODO: Remove Customer Column
      // Load staff and appointments in parallel
      const [staffResponse, appointmentsResponse] = await Promise.all([
        employeeApi.getAll(),
        appointmentApi.getAll()
      ]);

      // Process staff data
      if (staffResponse.success && staffResponse.data) {
        const mappedStaff = staffResponse.data.map(emp => ({
          id: emp.employeeID || emp.id,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          role: emp.userType || emp.role
        }));
        setStaffList(mappedStaff);
      } else {
        console.error("Failed to load staff:", staffResponse.error);
      }

      // Process appointments data
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const mappedAppointments = appointmentsResponse.data.map(apt => {
          // Map status from backend format to frontend format
          const statusMap = {
            'PENDING': 'pending',
            'CONFIRMED': 'confirmed',
            'IN_PROGRESS': 'in_progress',
            'COMPLETED': 'completed',
            'CANCELLED': 'cancelled'
          };

          // Get pet icon based on species
          const petIcon = apt.pet?.species === 'DOG' ? '🐕' : 
                         apt.pet?.species === 'CAT' ? '🐈' : '🐾';

          // Get service category and icon
          const categoryMap = {
            'health': { category: 'medical', icon: '🛁' },
            'grooming': { category: 'care', icon: '✂️' },
            'medical': { category: 'medical', icon: '🏥' },
            'boarding': { category: 'care', icon: '🏠' }
          };
          
          const serviceCat = apt.service?.categoryName?.toLowerCase() || 'medical';
          const categoryData = categoryMap[serviceCat] || { category: 'medical', icon: '✨' };

          console.log(apt);
          return {
            id: apt.appointmentId || apt.id,
            code: `APT${String(apt.appointmentId || apt.id).padStart(3, '0')}`,
            customerName: apt.petOwner?.name || apt.pet?.petOwner?.name || 'N/A',
            customerPhone: apt.petOwner?.phoneNumber || apt.pet?.petOwner?.phoneNumber || 'N/A',
            petName: apt.pet?.name || 'N/A',
            petIcon: petIcon,
            serviceName: apt.service?.serviceName || apt.service?.name || 'N/A',
            serviceIcon: categoryData.icon,
            serviceCategory: categoryData.category,
            date: apt.appointmentDate || new Date().toISOString().split('T')[0],
            time: apt.startTime || '09:00',
            status: statusMap[apt.status] || 'pending',
            assignedStaffId: apt.employeeID || apt.employee?.employeeID,
            assignedStaffName: apt.employee?.name || '',
            notes: apt.notes || ''
          };
        });
        setAppointments(mappedAppointments);
      } else {
        console.error("Failed to load appointments:", appointmentsResponse.error);
        showToast("Không thể tải danh sách lịch hẹn", "error");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleUpdateAppointment = async (data) => {
    try {
      // Map frontend status to backend status
      const statusMap = {
        'pending': 'PENDING',
        'confirmed': 'CONFIRMED',
        'in_progress': 'IN_PROGRESS',
        'completed': 'COMPLETED',
        'cancelled': 'CANCELLED'
      };

      const updateData = {
        status: statusMap[data.status] || data.status,
        employeeID: data.assignedStaffId,
        notes: data.notes
      };

      const response = await appointmentApi.update(data.appointmentId, updateData);

      if (response.success) {
        showToast("Cập nhật lịch hẹn thành công!", "success");
        loadData(); // Reload to get fresh data
      } else {
        showToast(response.error || "Không thể cập nhật lịch hẹn", "error");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      showToast("Lỗi khi cập nhật lịch hẹn", "error");
    }
  };

  const handleOpenUpdate = (appointment) => {
    setSelectedAppointment(appointment);
    setIsUpdateModalOpen(true);
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        label: "Chờ xác nhận", 
        variant: "warning", 
        icon: Hourglass 
      },
      confirmed: { 
        label: "Đã xác nhận", 
        variant: "success", 
        icon: CheckCircle2 
      },
      in_progress: { 
        label: "Đang thực hiện", 
        variant: "info", 
        icon: RefreshCw 
      },
      completed: { 
        label: "Hoàn thành", 
        variant: "success", 
        icon: CheckCircle2 
      },
      cancelled: { 
        label: "Đã hủy", 
        variant: "destructive", 
        icon: XCircle 
      }
    };
    return badges[status] || badges.pending;
  };

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý lịch đặt"
        subtitle="Theo dõi, phân công và điều phối lịch hẹn"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Hourglass}
          title="Chờ xác nhận"
          value={stats.pending}
          color="warning"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đã xác nhận"
          value={stats.confirmed}
          color="success"
        />
        <StatsCard
          icon={RefreshCw}
          title="Đang thực hiện"
          value={stats.inProgress}
          color="info"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Hoàn thành"
          value={stats.completed}
          color="success"
        />
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm theo khách hàng, thú cưng, mã lịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách lịch đặt
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredAppointments.length} lịch hẹn
          </Badge>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground font-medium">
                Đang tải dữ liệu...
              </p>
            </CardContent>
          </Card>
        ) : filteredAppointments.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Mã lịch</TableHead>
                  {/* <TableHead className="min-w-[150px]">Khách hàng</TableHead> */}
                  <TableHead className="min-w-[120px]">Thú cưng</TableHead>
                  <TableHead className="min-w-[150px]">Dịch vụ</TableHead>
                  <TableHead className="min-w-[120px]">Ngày & Giờ</TableHead>
                  <TableHead className="min-w-[130px]">Nhân viên</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="min-w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {apt.code}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{apt.customerName}</p>
                          <p className="text-xs text-muted-foreground">{apt.customerPhone}</p>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{apt.petIcon}</span>
                          <span className="font-medium text-foreground">{apt.petName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{apt.serviceIcon}</span>
                          <span className="text-sm text-foreground">{apt.serviceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{apt.date}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {apt.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {apt.assignedStaffName ? (
                          <div className="flex items-center gap-2">
                            {apt.serviceCategory === 'medical' ? (
                              <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm text-foreground">{apt.assignedStaffName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Chưa phân công</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleOpenUpdate(apt)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Cập nhật
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy lịch đặt nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <UpdateAppointmentModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleUpdateAppointment}
        appointment={selectedAppointment}
        staffList={staffList}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={cn(
          "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-4",
          toast.type === "success"
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "bg-red-100 text-red-800 border border-red-200"
        )}>
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
