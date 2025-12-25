"use client";
import { useState, useEffect } from "react";
import { 
  Home, Plus, Edit, Eye, Trash2, CheckCircle2, 
  XCircle, AlertTriangle, ClipboardList, BarChart3, RefreshCw 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CageFormModal from "@/components/modals/CageFormModal";
import CageDetailModal from "@/components/modals/CageDetailModal";
import { cn } from "@/lib/utils";
import { cageApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerCagesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cages, setCages] = useState([]);
  const [selectedCage, setSelectedCage] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCage, setEditingCage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCages();
  }, []);

  const loadCages = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Load cages and active assignments in parallel
      const [cagesResponse, assignmentsResponse] = await Promise.all([
        cageApi.getAll(),
        cageApi.getActiveAssignments()
      ]);

      if (cagesResponse.success && cagesResponse.data) {
        const mappedCages = cagesResponse.data.map(cage => {
          // Map cage size from backend format
          const sizeMap = {
            'SMALL': 'small',
            'MEDIUM': 'medium',
            'LARGE': 'large',
            'EXTRA_LARGE': 'large'
          };

          // Map cage status from backend format
          const statusMap = {
            'AVAILABLE': 'available',
            'OCCUPIED': 'occupied',
            'MAINTENANCE': 'maintenance'
          };

          // Find active assignments for this cage
          const assignments = assignmentsResponse.success && assignmentsResponse.data
            ? assignmentsResponse.data.filter(a => a.cageId === cage.cageId && !a.checkOutDate)
            : [];

          // Map assignments to pets
          const pets = assignments.map(assignment => {
            const pet = assignment.pet;
            return {
              name: pet?.name || 'N/A',
              icon: pet?.species === 'Dog' ? '🐕' : pet?.species === 'Cat' ? '🐈' : '🐾',
              breed: pet?.breed || 'N/A',
              ownerName: pet?.petOwner?.fullName || 'N/A',
              checkInDate: assignment.checkInDate || '',
              checkOutDate: assignment.expectedCheckOutDate || ''
            };
          });

          return {
            id: cage.cageId,
            code: cage.cageNumber || `CAGE${cage.cageId}`,
            type: sizeMap[cage.size] || 'small',
            capacity: 1,
            status: statusMap[cage.status] || 'available',
            notes: cage.location || '',
            dailyRate: cage.dailyRate || 0,
            pets: pets
          };
        });
        
        setCages(mappedCages);
      } else {
        console.error("Failed to load cages:", cagesResponse.error);
        showToast("Không thể tải danh sách chuồng", "error");
      }
    } catch (error) {
      console.error("Error loading cages:", error);
      showToast("Lỗi khi tải danh sách chuồng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCage = async (cageData) => {
    try {
      const sizeMap = {
        'small': 'SMALL',
        'medium': 'MEDIUM',
        'large': 'LARGE'
      };

      const payload = {
        cageNumber: cageData.code,
        size: sizeMap[cageData.type] || 'SMALL',
        dailyRate: cageData.dailyRate || 0,
        location: cageData.notes || '',
        status: 'AVAILABLE'
      };

      const response = await cageApi.create(payload);
      
      if (response.success) {
        showToast("Đã thêm chuồng thành công!", "success");
        loadCages();
      } else {
        showToast(response.error || "Không thể thêm chuồng", "error");
      }
    } catch (error) {
      console.error("Error adding cage:", error);
      showToast("Lỗi khi thêm chuồng", "error");
    }
  };

  const handleUpdateCage = async (cageData) => {
    try {
      const sizeMap = {
        'small': 'SMALL',
        'medium': 'MEDIUM',
        'large': 'LARGE'
      };

      const statusMap = {
        'available': 'AVAILABLE',
        'occupied': 'OCCUPIED',
        'maintenance': 'MAINTENANCE'
      };

      const payload = {
        cageNumber: cageData.code,
        size: sizeMap[cageData.type] || 'SMALL',
        dailyRate: cageData.dailyRate || 0,
        location: cageData.notes || '',
        status: statusMap[cageData.status] || 'AVAILABLE'
      };

      const response = await cageApi.update(editingCage.id, payload);
      
      if (response.success) {
        showToast("Cập nhật chuồng thành công!", "success");
        loadCages();
        setEditingCage(null);
      } else {
        showToast(response.error || "Không thể cập nhật chuồng", "error");
      }
    } catch (error) {
      console.error("Error updating cage:", error);
      showToast("Lỗi khi cập nhật chuồng", "error");
    }
  };

  const handleDeleteCage = async (cageId) => {
    const cage = cages.find(c => c.id === cageId);
    if (cage.status === 'occupied') {
      showToast("Không thể xóa chuồng đang có thú cưng", "error");
      return;
    }

    if (confirm(`Xác nhận xóa chuồng ${cage.code}?`)) {
      try {
        const response = await cageApi.remove(cageId);
        
        if (response.success) {
          showToast("Đã xóa chuồng", "success");
          loadCages();
        } else {
          showToast(response.error || "Không thể xóa chuồng", "error");
        }
      } catch (error) {
        console.error("Error deleting cage:", error);
        showToast("Lỗi khi xóa chuồng", "error");
      }
    }
  };

  const handleOpenEdit = (cage) => {
    setEditingCage(cage);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (cage) => {
    setSelectedCage(cage);
    setIsDetailModalOpen(true);
  };

  const getCageTypeLabel = (type) => {
    const labels = {
      small: "Nhỏ",
      medium: "Trung",
      large: "Lớn"
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { 
        label: "Trống", 
        variant: "success", 
        icon: CheckCircle2 
      },
      occupied: { 
        label: "Đang sử dụng", 
        variant: "warning", 
        icon: AlertTriangle 
      },
      maintenance: { 
        label: "Bảo trì", 
        variant: "destructive", 
        icon: XCircle 
      }
    };
    return badges[status] || badges.available;
  };

  const stats = {
    total: cages.length,
    available: cages.filter(c => c.status === 'available').length,
    occupied: cages.filter(c => c.status === 'occupied').length,
    maintenance: cages.filter(c => c.status === 'maintenance').length,
    occupancyRate: cages.length > 0 
      ? Math.round((cages.filter(c => c.status === 'occupied').length / cages.length) * 100)
      : 0
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý chuồng nuôi"
        subtitle="Theo dõi và quản lý khu lưu trú thú cưng"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Home}
          title="Tổng chuồng"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đang trống"
          value={stats.available}
          color="success"
        />
        <StatsCard
          icon={AlertTriangle}
          title="Đang sử dụng"
          value={stats.occupied}
          color="warning"
        />
        <StatsCard
          icon={BarChart3}
          title="Tỷ lệ sử dụng"
          value={`${stats.occupancyRate}%`}
          color="info"
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-start">
        <Button
          onClick={() => {
            setEditingCage(null);
            setIsFormModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm chuồng mới
        </Button>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách chuồng nuôi
          </h2>
          <Badge variant="outline" className="text-sm">
            {cages.length} chuồng
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
        ) : cages.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Mã chuồng</TableHead>
                  <TableHead className="min-w-[100px]">Loại</TableHead>
                  <TableHead className="min-w-[100px]">Sức chứa</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="min-w-[200px]">Thú cưng hiện tại</TableHead>
                  <TableHead className="min-w-[150px]">Ghi chú</TableHead>
                  <TableHead className="min-w-[120px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cages.map((cage) => {
                  const statusBadge = getStatusBadge(cage.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <TableRow key={cage.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {cage.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {getCageTypeLabel(cage.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {cage.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cage.pets && cage.pets.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {cage.pets.map((pet, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <span className="mr-1">{pet.icon}</span>
                                {pet.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {cage.notes || <span className="text-muted-foreground italic">Không có</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cage.status === 'occupied' && (
                            <Button
                              onClick={() => handleViewDetail(cage)}
                              variant="ghost"
                              size="icon"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleOpenEdit(cage)}
                            variant="ghost"
                            size="icon"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCage(cage.id)}
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            disabled={cage.status === 'occupied'}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Chưa có chuồng nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CageFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCage(null);
        }}
        onSuccess={editingCage ? handleUpdateCage : handleAddCage}
        cage={editingCage}
      />

      <CageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCage(null);
        }}
        cage={selectedCage}
      />
    </div>
  );
}
