/**
 * Services Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/services
 * 
 * Features:
 * - Gradient header (Purple → Pink)
 * - Tabs: Danh mục & Dịch vụ
 * - Service cards với price, duration, staff type
 * - Category management
 * - Availability toggle
 * - CRUD modals
 * 
 * APIs:
 * - GET /services
 * - GET /service-categories
 * - POST /services
 * - PUT /services/:id
 * - DELETE /services/:id
 * - PUT /services/:id/availability
 * - POST /service-categories
 * - PUT /service-categories/:id
 * - DELETE /service-categories/:id
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("services"); // 'services' or 'categories'
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Service form
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    categoryId: "",
    basePrice: 0,
    estimatedDuration: 30,
    description: "",
    requiredStaffType: "Veterinarian",
    isBoardingService: false
  });

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: ""
  });

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'add') {
      handleOpenServiceModal();
    }
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [servicesRes, categoriesRes] = await Promise.all([
        apiClient.get('/services'),
        apiClient.get('/service-categories').catch(() => ({ data: [] }))
      ]);

      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : 
                          (servicesRes.data?.data || []);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : 
                            (categoriesRes.data?.data || []);

      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => {
        const catId = s.categoryId || s.category?.categoryId || s.category?.id;
        return catId == selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.serviceName?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }

    setFilteredServices(filtered);
  };

  // Service Modal Handlers
  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setIsEditing(true);
      setSelectedItem(service);
      setServiceForm({
        serviceName: service.serviceName || "",
        categoryId: service.categoryId || service.category?.categoryId || service.category?.id || "",
        basePrice: service.basePrice || 0,
        estimatedDuration: service.estimatedDuration || service.durationMinutes || 30,
        description: service.description || "",
        requiredStaffType: service.requiredStaffType || "Veterinarian",
        isBoardingService: service.isBoardingService || false
      });
    } else {
      setIsEditing(false);
      setSelectedItem(null);
      setServiceForm({
        serviceName: "",
        categoryId: categories[0]?.categoryId || categories[0]?.id || "",
        basePrice: 0,
        estimatedDuration: 30,
        description: "",
        requiredStaffType: "Veterinarian",
        isBoardingService: false
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        serviceName: serviceForm.serviceName,
        categoryId: Number(serviceForm.categoryId),
        basePrice: Number(serviceForm.basePrice),
        estimatedDuration: Number(serviceForm.estimatedDuration),
        description: serviceForm.description || null,
        requiredStaffType: serviceForm.requiredStaffType,
        isBoardingService: serviceForm.isBoardingService
      };

      if (isEditing && selectedItem) {
        const id = selectedItem.serviceId || selectedItem.id;
        await apiClient.put(`/services/${id}`, payload);
        showToast("Cập nhật dịch vụ thành công! ✅", "success");
      } else {
        await apiClient.post('/services', payload);
        showToast("Thêm dịch vụ mới thành công! ✅", "success");
      }

      handleCloseServiceModal();
      loadData();
    } catch (error) {
      console.error("Error saving service:", error);
      showToast(error.response?.data?.message || "Không thể lưu dịch vụ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (service) => {
    const id = service.serviceId || service.id;
    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${service.serviceName}"?`)) return;
    
    try {
      await apiClient.delete(`/services/${id}`);
      showToast("Đã xóa dịch vụ! 🗑️", "success");
      loadData();
    } catch (error) {
      showToast("Không thể xóa dịch vụ", "error");
    }
  };

  const handleToggleAvailability = async (service) => {
    const id = service.serviceId || service.id;
    const isCurrentlyActive = service.isActive !== false;
    
    try {
      await apiClient.put(`/services/${id}/availability`, { isActive: !isCurrentlyActive });
      showToast(isCurrentlyActive ? "Đã tắt dịch vụ 🔴" : "Đã bật dịch vụ 🟢", "success");
      loadData();
    } catch (error) {
      showToast("Không thể cập nhật trạng thái", "error");
    }
  };

  // Category Modal Handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setSelectedItem(category);
      setCategoryForm({
        categoryName: category.categoryName || "",
        description: category.description || ""
      });
    } else {
      setIsEditing(false);
      setSelectedItem(null);
      setCategoryForm({
        categoryName: "",
        description: ""
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        categoryName: categoryForm.categoryName,
        description: categoryForm.description || null
      };

      if (isEditing && selectedItem) {
        const id = selectedItem.categoryId || selectedItem.id;
        await apiClient.put(`/service-categories/${id}`, payload);
        showToast("Cập nhật danh mục thành công! ✅", "success");
      } else {
        await apiClient.post('/service-categories', payload);
        showToast("Thêm danh mục mới thành công! ✅", "success");
      }

      handleCloseCategoryModal();
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(error.response?.data?.message || "Không thể lưu danh mục", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const id = category.categoryId || category.id;
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.categoryName}"?`)) return;
    
    try {
      await apiClient.delete(`/service-categories/${id}`);
      showToast("Đã xóa danh mục! 🗑️", "success");
      loadData();
    } catch (error) {
      showToast("Không thể xóa danh mục (có thể đang có dịch vụ sử dụng)", "error");
    }
  };

  // UI Helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStaffTypeLabel = (type) => {
    const labels = {
      'Veterinarian': '👨‍⚕️ Bác sĩ thú y',
      'CareStaff': '👷 NV Chăm sóc',
      'Any': '👤 Bất kỳ',
      'VETERINARIAN': '👨‍⚕️ Bác sĩ thú y',
      'CARE_STAFF': '👷 NV Chăm sóc'
    };
    return labels[type] || type;
  };

  const getServiceEmoji = (serviceName, isBoardingService) => {
    if (isBoardingService) return '🏨';
    const name = serviceName?.toLowerCase() || '';
    if (name.includes('khám') || name.includes('exam')) return '🏥';
    if (name.includes('spa') || name.includes('tắm')) return '🛁';
    if (name.includes('tiêm') || name.includes('vaccine')) return '💉';
    if (name.includes('cắt') || name.includes('grooming')) return '✂️';
    if (name.includes('phẫu') || name.includes('surgery')) return '🔪';
    if (name.includes('xét nghiệm') || name.includes('test')) return '🔬';
    return '💼';
  };

  const getCategoryEmoji = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('khám')) return '🏥';
    if (name.includes('spa') || name.includes('làm đẹp')) return '✨';
    if (name.includes('lưu trú')) return '🏨';
    if (name.includes('tiêm') || name.includes('vaccine')) return '💉';
    if (name.includes('phẫu thuật')) return '🔪';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">💼</div>
          <p className="text-gray-500 text-lg">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">💼</span>
                Quản Lý Dịch Vụ
              </h1>
              <p className="text-white/90">
                Quản lý danh mục và giá dịch vụ PAW LOVERS
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleOpenCategoryModal()}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                📁 Thêm danh mục
              </Button>
              <Button 
                onClick={() => handleOpenServiceModal()}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                ➕ Thêm dịch vụ
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Main Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-white text-purple-600 shadow-xl'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            💼 Dịch vụ ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-white text-purple-600 shadow-xl'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            📂 Danh mục ({categories.length})
          </button>
        </div>

        {/* Services Tab Content */}
        {activeTab === 'services' && (
          <>
            {/* Search & Filter */}
            <Card className="bg-white shadow-xl mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <Input
                      type="text"
                      placeholder="Tìm kiếm dịch vụ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="all">📂 Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                        {getCategoryEmoji(cat.categoryName)} {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Services Count */}
            <p className="text-sm text-gray-500 mb-4">
              Hiển thị {filteredServices.length} / {services.length} dịch vụ
            </p>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const serviceId = service.serviceId || service.id;
                  const isActive = service.isActive !== false;
                  
                  return (
                    <Card 
                      key={serviceId} 
                      className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                        !isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">
                              {getServiceEmoji(service.serviceName, service.isBoardingService)}
                            </span>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {service.serviceName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                📁 {service.categoryName || service.category?.categoryName || 'Chưa phân loại'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isActive ? '🟢 Hoạt động' : '🔴 Tạm ngừng'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">💰 Giá:</span>
                            <span className="font-bold text-purple-600">{formatCurrency(service.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">⏱️ Thời gian:</span>
                            <span className="font-medium">{service.estimatedDuration || service.durationMinutes || 'N/A'} phút</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">👷 NV thực hiện:</span>
                            <span className="font-medium text-xs">
                              {getStaffTypeLabel(service.requiredStaffType)}
                            </span>
                          </div>
                          {service.isBoardingService && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">🏨 Loại:</span>
                              <span className="font-medium text-blue-600">Dịch vụ lưu trú</span>
                            </div>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-4 line-clamp-2">
                            📝 {service.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-4 border-t">
                          <button
                            onClick={() => handleToggleAvailability(service)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {isActive ? '🔴 Tắt' : '🟢 Bật'}
                          </button>
                          <button
                            onClick={() => handleOpenServiceModal(service)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            🗑️
                          </button>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
                  <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc thêm dịch vụ mới</p>
                  <Button onClick={() => handleOpenServiceModal()}>
                    ➕ Thêm dịch vụ mới
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {categories.length} danh mục dịch vụ
            </p>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryId = category.categoryId || category.id;
                  const serviceCount = services.filter(s => 
                    (s.categoryId || s.category?.categoryId || s.category?.id) == categoryId
                  ).length;
                  
                  return (
                    <Card 
                      key={categoryId} 
                      className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl">
                            {getCategoryEmoji(category.categoryName)}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {category.categoryName}
                            </h3>
                            <p className="text-sm text-purple-600 font-medium">
                              {serviceCount} dịch vụ
                            </p>
                          </div>
                        </div>

                        {category.description && (
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-4">
                            📝 {category.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-4 border-t">
                          <button
                            onClick={() => {
                              setSelectedCategory(String(categoryId));
                              setActiveTab('services');
                            }}
                            className="px-3 py-1.5 text-sm rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          >
                            👁️ Xem dịch vụ
                          </button>
                          <button
                            onClick={() => handleOpenCategoryModal(category)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-white shadow-xl">
                <CardContent className="py-16 text-center">
                  <span className="text-8xl block mb-4">📂</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có danh mục nào</h3>
                  <p className="text-gray-500 mb-4">Tạo danh mục để phân loại dịch vụ</p>
                  <Button onClick={() => handleOpenCategoryModal()}>
                    📁 Thêm danh mục mới
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isEditing ? '✏️ Chỉnh sửa dịch vụ' : '➕ Thêm dịch vụ mới'}
              </h2>
              <button onClick={handleCloseServiceModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💼 Tên dịch vụ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={serviceForm.serviceName}
                    onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})}
                    placeholder="VD: Khám tổng quát"
                    required
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📁 Danh mục <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={serviceForm.categoryId}
                    onChange={(e) => setServiceForm({...serviceForm, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💰 Giá cơ bản (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={serviceForm.basePrice}
                    onChange={(e) => setServiceForm({...serviceForm, basePrice: e.target.value})}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    ⏱️ Thời gian (phút) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={serviceForm.estimatedDuration}
                    onChange={(e) => setServiceForm({...serviceForm, estimatedDuration: e.target.value})}
                    min="15"
                    max="480"
                    required
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    👷 Loại nhân viên <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={serviceForm.requiredStaffType}
                    onChange={(e) => setServiceForm({...serviceForm, requiredStaffType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="Veterinarian">👨‍⚕️ Bác sĩ thú y</option>
                    <option value="CareStaff">👷 Nhân viên chăm sóc</option>
                    <option value="Any">👤 Bất kỳ</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="flex items-center gap-2">
                    🏨 Dịch vụ lưu trú?
                  </Label>
                  <input
                    type="checkbox"
                    checked={serviceForm.isBoardingService}
                    onChange={(e) => setServiceForm({...serviceForm, isBoardingService: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    📝 Mô tả dịch vụ
                  </Label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    placeholder="Mô tả chi tiết về dịch vụ..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseServiceModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu dịch vụ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isEditing ? '✏️ Chỉnh sửa danh mục' : '📁 Thêm danh mục mới'}
              </h2>
              <button onClick={handleCloseCategoryModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  📁 Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={categoryForm.categoryName}
                  onChange={(e) => setCategoryForm({...categoryForm, categoryName: e.target.value})}
                  placeholder="VD: Khám bệnh"
                  required
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  📝 Mô tả
                </Label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  placeholder="Mô tả danh mục..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseCategoryModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu danh mục'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
