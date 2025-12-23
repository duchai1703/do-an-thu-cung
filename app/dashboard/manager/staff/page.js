"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Edit,
  CheckCircle2,
  XCircle,
  Pause,
  Stethoscope,
  Wrench,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddStaffModal from "@/components/modals/AddStaffModal";
import EditStaffModal from "@/components/modals/EditStaffModal";
import { cn } from "@/lib/utils";
import { employeeApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ManagerStaffPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
    }

    loadStaff();
  }, [searchParams]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await employeeApi.getAll();
      
      if (response.success && response.data) {
        const mappedStaff = response.data.map(emp => ({
          id: emp.employeeID || emp.id,
          name: emp.account?.email?.split('@')[0] || emp.fullName || 'Unknown',
          email: emp.account?.email || 'N/A',
          phone: emp.phoneNumber || 'N/A',
          role: mapRole(emp.account?.userType),
          isActive: emp.account?.isActive !== false,
          joinDate: emp.createdAt ? new Date(emp.createdAt).toISOString().split('T')[0] : 'N/A',
          specialization: emp.specialization || 'N/A',
        }));
        
        setStaffList(mappedStaff);
      } else {
        console.error("Failed to load staff:", response.error);
        showToast("Không thể tải danh sách nhân viên", "error");
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      showToast("Lỗi khi tải danh sách nhân viên", "error");
    } finally {
      setLoading(false);
    }
  };

  const mapRole = (userType) => {
    const roleMap = {
      'VETERINARIAN': 'veterinarian',
      'CARE_STAFF': 'care_staff',
      'RECEPTIONIST': 'receptionist',
      'MANAGER': 'manager'
    };
    return roleMap[userType] || 'care_staff';
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleAddStaff = async (newStaff) => {
    try {
      const response = await employeeApi.create(newStaff);
      
      if (response.success) {
        showToast("Đã thêm nhân viên thành công!", "success");
        loadStaff();
      } else {
        showToast(response.error || "Không thể thêm nhân viên", "error");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      showToast("Lỗi khi thêm nhân viên", "error");
    }
  };

  const handleEditStaff = async (updatedData) => {
    try {
      const response = await employeeApi.update(updatedData.id, updatedData);
      
      if (response.success) {
        showToast("Cập nhật nhân viên thành công!", "success");
        loadStaff();
      } else {
        showToast(response.error || "Không thể cập nhật nhân viên", "error");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      showToast("Lỗi khi cập nhật nhân viên", "error");
    }
  };

  const handleToggleStatus = (staffId) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    if (
      confirm(
        `Bạn có chắc muốn ${
          staff.isActive ? "vô hiệu hóa" : "kích hoạt"
        } nhân viên này?`
      )
    ) {
      const newActiveStatus = !staff.isActive;
      setStaffList(
        staffList.map((s) =>
          s.id === staffId ? { ...s, isActive: newActiveStatus } : s
        )
      );
      showToast(
        `Đã ${newActiveStatus ? "kích hoạt" : "vô hiệu hóa"} nhân viên`,
        "success"
      );
    }
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const badges = {
      veterinarian: {
        label: "Bác sĩ",
        variant: "info",
        icon: Stethoscope,
      },
      care_staff: {
        label: "Nhân viên",
        variant: "secondary",
        icon: Wrench,
      },
      receptionist: {
        label: "Lễ tân",
        variant: "default",
        icon: Briefcase,
      },
    };
    return badges[role] || badges.care_staff;
  };

  const stats = {
    total: staffList.length,
    active: staffList.filter((s) => s.isActive).length,
    inactive: staffList.filter((s) => !s.isActive).length,
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý nhân viên"
        subtitle="Thêm, chỉnh sửa và quản lý thông tin nhân viên"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Users}
          title="Tổng nhân viên"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đang hoạt động"
          value={stats.active}
          color="success"
        />
        <StatsCard
          icon={Pause}
          title="Ngưng hoạt động"
          value={stats.inactive}
          color="warning"
        />
      </div>

      {/* Add Button & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên mới
        </Button>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc mã nhân viên..."
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
            Danh sách nhân viên
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredStaff.length} nhân viên
          </Badge>
        </div>

        {filteredStaff.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%]">Mã NV</TableHead>
                  <TableHead className="w-[20%]">Họ và tên</TableHead>
                  <TableHead className="w-[18%]">Email</TableHead>
                  <TableHead className="w-[13%]">Số điện thoại</TableHead>
                  <TableHead className="w-[15%]">Vai trò</TableHead>
                  <TableHead className="w-[12%]">Trạng thái</TableHead>
                  <TableHead className="w-[10%] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => {
                  const badge = getRoleBadge(staff.role);
                  const BadgeIcon = badge.icon;
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {staff.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">
                            {staff.name}
                          </p>
                          {staff.specialization && (
                            <p className="text-xs text-muted-foreground">
                              {staff.specialization}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {staff.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {staff.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={badge.variant}
                          className="flex items-center gap-1 w-fit"
                        >
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleToggleStatus(staff.id)}
                          variant={staff.isActive ? "default" : "secondary"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {staff.isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3" />
                              Ngưng
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleOpenEdit(staff)}
                          variant="ghost"
                          size="icon"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
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
                Không tìm thấy nhân viên nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddStaff}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStaff(null);
        }}
        onSuccess={handleEditStaff}
        staff={editingStaff}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={cn(
            "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-4",
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-red-100 text-red-800 border border-red-200"
          )}
        >
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
