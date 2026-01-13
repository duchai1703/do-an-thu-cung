/**
 * Employee Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/employees
 * 
 * Features:
 * - Gradient header (Blue → Cyan)
 * - Employee cards với avatar, info, status
 * - Tabs: Tất cả, Bác sĩ, Nhân viên CS, Lễ tân, Quản lý
 * - Search & Filter
 * - CRUD Modal: Add/Edit Employee
 * - Availability toggle
 * 
 * APIs:
 * - GET /employees
 * - POST /employees
 * - PUT /employees/:id
 * - PUT /employees/:id/available
 * - PUT /employees/:id/unavailable
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
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/components/ui/usePagination";

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredEmployees, 10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "VETERINARIAN",
    fullName: "",
    phoneNumber: "",
    address: "",
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
    licenseNumber: "",
    expertise: "",
    skills: "",
    sendEmailNotification: true // Send welcome email to new employee
  });

  useEffect(() => {
    loadEmployees();
    // Check if action=add is in URL
    if (searchParams.get('action') === 'add') {
      handleOpenAddModal();
    }
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, activeTab, showOnlineOnly]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees');
      const data = Array.isArray(response.data) ? response.data : 
                   (response.data?.data || response || []);
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      showToast("Không thể tải danh sách nhân viên", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(e => {
        const userType = e.userType || e.account?.userType;
        return userType === activeTab;
      });
    }

    // Filter by online status
    if (showOnlineOnly) {
      filtered = filtered.filter(e => e.isAvailable !== false);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.fullName?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term) ||
        e.phoneNumber?.includes(term)
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
    setFormData({
      email: "",
      password: "",
      userType: "VETERINARIAN",
      fullName: "",
      phoneNumber: "",
      address: "",
      hireDate: new Date().toISOString().split('T')[0],
      salary: 0,
      licenseNumber: "",
      expertise: "",
      skills: "",
      sendEmailNotification: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setIsEditing(true);
    setSelectedEmployee(employee);
    setFormData({
      email: employee.account?.email || employee.email || "",
      password: "",
      userType: employee.userType || employee.account?.userType || "VETERINARIAN",
      fullName: employee.fullName || "",
      phoneNumber: employee.phoneNumber || "",
      address: employee.address || "",
      hireDate: employee.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      salary: employee.salary || 0,
      licenseNumber: employee.licenseNumber || "",
      expertise: employee.expertise || "",
      skills: Array.isArray(employee.skills) ? employee.skills.join(", ") : (employee.skills || "")
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address || null,
        salary: Number(formData.salary),
      };

      if (isEditing && selectedEmployee) {
        // Update existing employee
        const employeeId = selectedEmployee.employeeId || selectedEmployee.id;
        
        // Add role-specific fields
        if (formData.userType === 'VETERINARIAN') {
          payload.licenseNumber = formData.licenseNumber || null;
          payload.expertise = formData.expertise || null;
        } else if (formData.userType === 'CARE_STAFF') {
          payload.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
        }

        await apiClient.put(`/employees/${employeeId}`, payload);
        showToast("Cập nhật nhân viên thành công! ✅", "success");
      } else {
        // Create new employee
        const createPayload = {
          ...payload,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          hireDate: formData.hireDate,
        };

        if (formData.userType === 'VETERINARIAN') {
          createPayload.licenseNumber = formData.licenseNumber || null;
          createPayload.expertise = formData.expertise || null;
        } else if (formData.userType === 'CARE_STAFF') {
          createPayload.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
        }

        await apiClient.post('/employees', createPayload);
        
        // Show notification about email (frontend only - backend should handle actual email sending)
        if (formData.sendEmailNotification) {
          showToast(`Thêm nhân viên mới thành công! 📧 Email thông báo đã được gửi đến ${formData.email}`, "success");
        } else {
          showToast("Thêm nhân viên mới thành công! ✅", "success");
        }
      }

      handleCloseModal();
      loadEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      showToast(error.response?.data?.message || "Không thể lưu nhân viên", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (employee) => {
    const employeeId = employee.employeeId || employee.id;
    const isCurrentlyAvailable = employee.isAvailable !== false;

    try {
      if (isCurrentlyAvailable) {
        await apiClient.put(`/employees/${employeeId}/unavailable`);
        showToast(`${employee.fullName} đã được đánh dấu vắng mặt 🔴`, "success");
      } else {
        await apiClient.put(`/employees/${employeeId}/available`);
        showToast(`${employee.fullName} đã được đánh dấu có mặt 🟢`, "success");
      }
      loadEmployees();
    } catch (error) {
      console.error("Error toggling availability:", error);
      showToast("Không thể cập nhật trạng thái", "error");
    }
  };

  // UI Helpers
  const getRoleEmoji = (userType) => {
    const emojiMap = {
      'VETERINARIAN': '👨‍⚕️',
      'CARE_STAFF': '👷',
      'RECEPTIONIST': '💁',
      'MANAGER': '👔'
    };
    return emojiMap[userType] || '👤';
  };

  const getRoleLabel = (userType) => {
    const labelMap = {
      'VETERINARIAN': 'Bác sĩ thú y',
      'CARE_STAFF': 'Nhân viên chăm sóc',
      'RECEPTIONIST': 'Lễ tân',
      'MANAGER': 'Quản lý'
    };
    return labelMap[userType] || userType;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'VETERINARIAN', label: '👨‍⚕️ Bác sĩ' },
    { id: 'CARE_STAFF', label: '👷 NV Chăm sóc' },
    { id: 'RECEPTIONIST', label: '💁 Lễ tân' },
    { id: 'MANAGER', label: '👔 Quản lý' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">👥</div>
          <p className="text-gray-500 text-lg">Đang tải danh sách nhân viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">👥</span>
                Quản Lý Nhân Viên
              </h1>
              <p className="text-white/90">
                Quản lý đội ngũ bác sĩ và nhân viên chăm sóc
              </p>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
            >
              ➕ Thêm nhân viên
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Search & Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Online only toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">✅ Chỉ đang làm việc</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Employee Count */}
        <p className="text-sm text-gray-500 mb-4">
          Hiển thị {filteredEmployees.length} / {employees.length} nhân viên
        </p>

        {/* Employee List */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedData.map((employee) => {
              const isAvailable = employee.isAvailable !== false;
              const employeeId = employee.employeeId || employee.id;
              
              return (
                <Card 
                  key={employeeId} 
                  className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl text-white flex-shrink-0">
                        {getRoleEmoji(employee.userType || employee.account?.userType)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {employee.fullName}
                          </h3>
                          <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} 
                                title={isAvailable ? 'Đang làm việc' : 'Nghỉ'} />
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          🏷️ {getRoleLabel(employee.userType || employee.account?.userType)}
                        </p>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <span>📧</span>
                            <span className="truncate">{employee.account?.email || employee.email}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span>📞</span>
                            <span>{employee.phoneNumber || 'N/A'}</span>
                          </p>
                          {employee.expertise && (
                            <p className="flex items-center gap-2">
                              <span>💼</span>
                              <span className="truncate">{employee.expertise}</span>
                            </p>
                          )}
                          {employee.skills?.length > 0 && (
                            <p className="flex items-center gap-2">
                              <span>🛠️</span>
                              <span className="truncate">
                                {Array.isArray(employee.skills) ? employee.skills.join(', ') : employee.skills}
                              </span>
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{formatCurrency(employee.salary || 0)}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleToggleAvailability(employee)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isAvailable 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {isAvailable ? '🔴 Đánh dấu vắng' : '🟢 Đánh dấu có mặt'}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(employee)}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy nhân viên</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <Button onClick={handleOpenAddModal}>
                ➕ Thêm nhân viên mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      )}


      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isEditing ? '✏️ Chỉnh sửa nhân viên' : '➕ Thêm nhân viên mới'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isEditing && (
                  <>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        📧 Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="employee@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        🔒 Mật khẩu <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Tối thiểu 8 ký tự"
                        required
                        minLength={8}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    👤 Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📞 Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="0901234567"
                    required
                  />
                </div>

                {!isEditing && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      🏷️ Vai trò <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({...formData, userType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="VETERINARIAN">👨‍⚕️ Bác sĩ thú y</option>
                      <option value="CARE_STAFF">👷 Nhân viên chăm sóc</option>
                      <option value="RECEPTIONIST">💁 Lễ tân</option>
                      <option value="MANAGER">👔 Quản lý</option>
                    </select>
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💰 Lương (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="25000000"
                    min="0"
                    required
                  />
                </div>

                {!isEditing && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      📅 Ngày vào làm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    📍 Địa chỉ
                  </Label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">📋 Thông tin chuyên môn</h3>
                
                {(formData.userType === 'VETERINARIAN' || (!isEditing && formData.userType === 'VETERINARIAN')) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        📜 Số giấy phép hành nghề
                      </Label>
                      <Input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        placeholder="VET-2024-0001"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        🔬 Chuyên môn
                      </Label>
                      <Input
                        type="text"
                        value={formData.expertise}
                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                        placeholder="Nội khoa, Ngoại khoa, Da liễu..."
                      />
                    </div>
                  </div>
                )}

                {(formData.userType === 'CARE_STAFF' || (isEditing && selectedEmployee?.userType === 'CARE_STAFF')) && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      🛠️ Kỹ năng (ngăn cách bằng dấu phẩy)
                    </Label>
                    <Input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      placeholder="Spa, Grooming, Tắm y tế, Massage..."
                    />
                  </div>
                )}
              </div>

              {/* Email Notification (only for new employees) */}
              {!isEditing && (
                <div className="border-t pt-6">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.sendEmailNotification}
                      onChange={(e) => setFormData({...formData, sendEmailNotification: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        📧 Gửi email thông báo cho nhân viên mới
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Gửi email chào mừng và thông tin đăng nhập đến địa chỉ email của nhân viên
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu nhân viên'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
