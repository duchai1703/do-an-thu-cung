"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
  DollarSign,
  Clock,
  ClipboardList,
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import AddServiceModal from "@/components/modals/AddServiceModal";
import EditServiceModal from "@/components/modals/EditServiceModal";
import { cn } from "@/lib/utils";
import { serviceApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ManagerServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
    }
    loadServices();
  }, [searchParams]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await serviceApi.getAll();
      
      if (response.success && response.data) {
        const mappedServices = response.data.map(svc => {
          const categoryData = getCategoryData(svc.categoryID || svc.category);
          return {
            id: svc.serviceID || svc.id,
            name: svc.name,
            category: svc.categoryID || svc.category,
            categoryLabel: categoryData.label,
            categoryIcon: categoryData.icon,
            price: parseFloat(svc.basePrice || svc.price || 0),
            duration: parseInt(svc.estimatedDuration || svc.duration || 30),
            description: svc.description || '',
            isActive: svc.isActive !== false,
          };
        });
        
        setServices(mappedServices);
      } else {
        console.error("Failed to load services:", response.error);
        showToast("Không thể tải danh sách dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error loading services:", error);
      showToast("Lỗi khi tải danh sách dịch vụ", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const getCategoryData = (categoryValue) => {
    const categories = {
      health: { label: "Tắm & vệ sinh", icon: "🛁" },
      grooming: { label: "Cắt tỉa & làm đẹp", icon: "✂️" },
      medical: { label: "Y tế & khám bệnh", icon: "💊" },
      boarding: { label: "Lưu trú & chăm sóc", icon: "🏠" },
    };
    return categories[categoryValue] || { label: "Khác", icon: "✨" };
  };

  const handleAddService = async (newService) => {
    try {
      const response = await serviceApi.create(newService);
      
      if (response.success) {
        showToast("Đã thêm dịch vụ thành công!", "success");
        loadServices();
      } else {
        showToast(response.error || "Không thể thêm dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      showToast("Lỗi khi thêm dịch vụ", "error");
    }
  };

  const handleEditService = async (updatedData) => {
    try {
      const response = await serviceApi.update(updatedData.id, updatedData);
      
      if (response.success) {
        showToast("Đã cập nhật dịch vụ thành công!", "success");
        loadServices();
      } else {
        showToast(response.error || "Không thể cập nhật dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      showToast("Lỗi khi cập nhật dịch vụ", "error");
    }
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setIsEditModalOpen(true);
  };

  const handleToggleService = async (serviceId) => {
    try {
      const response = await serviceApi.toggleAvailability(serviceId);
      
      if (response.success) {
        const service = services.find((s) => s.id === serviceId);
        const newActiveStatus = !service?.isActive;
        showToast(
          `Đã ${newActiveStatus ? "kích hoạt" : "tạm ngưng"} dịch vụ`,
          "success"
        );
        loadServices();
      } else {
        showToast(response.error || "Không thể thay đổi trạng thái dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error toggling service:", error);
      showToast("Lỗi khi thay đổi trạng thái dịch vụ", "error");
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý dịch vụ"
        subtitle="Thêm, chỉnh sửa và quản lý các dịch vụ của trung tâm"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          icon={Sparkles}
          title="Tổng dịch vụ"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đang hoạt động"
          value={stats.active}
          color="success"
        />
      </div>

      {/* Add Button & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ mới
        </Button>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách dịch vụ
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredServices.length} dịch vụ
          </Badge>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{service.categoryIcon}</div>
                    <Badge
                      variant={service.isActive ? "success" : "destructive"}
                    >
                      {service.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Tạm ngưng
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <CardTitle className="text-lg mb-1">
                      {service.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {service.categoryIcon} {service.categoryLabel}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Giá:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-semibold text-foreground">
                        {service.duration >= 60
                          ? `${Math.floor(service.duration / 60)} giờ`
                          : `${service.duration} phút`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleOpenEdit(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() => handleToggleService(service.id)}
                      variant={service.isActive ? "secondary" : "default"}
                      size="sm"
                      className="flex-1"
                    >
                      {service.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Tạm ngưng
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Kích hoạt
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy dịch vụ nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddService}
      />

      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={handleEditService}
        service={editingService}
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
