/**
 * Appointments Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/appointments
 * 
 * Features:
 * - Gradient header (Orange → Amber)
 * - Tabs: Tất cả, Chờ XN, Đã XN, Đang thực hiện, Hoàn thành
 * - Calendar/List view toggle
 * - Search & Filter by date range, status
 * - Appointment cards với pet info, service, employee
 * - Status lifecycle: confirm, start, complete, cancel
 * - Create appointment modal
 * 
 * APIs:
 * - GET /appointments
 * - POST /appointments
 * - PUT /appointments/:id
 * - PUT /appointments/:id/confirm
 * - PUT /appointments/:id/cancel
 * - DELETE /appointments/:id
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
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/components/ui/usePagination";

export default function AppointmentsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredAppointments, 10);

  // Data for dropdowns
  const [pets, setPets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    petId: "",
    employeeId: "",
    serviceId: "",
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
    estimatedCost: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, activeTab, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [appointmentsRes, petsRes, employeesRes, servicesRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/pets').catch(() => ({ data: [] })),
        apiClient.get('/employees').catch(() => ({ data: [] })),
        apiClient.get('/services').catch(() => ({ data: [] }))
      ]);

      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : 
                               (appointmentsRes.data?.data || []);
      const petsData = Array.isArray(petsRes.data) ? petsRes.data : (petsRes.data?.data || []);
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : (employeesRes.data?.data || []);
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data?.data || []);

      setAppointments(appointmentsData);
      setPets(petsData);
      setEmployees(employeesData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by tab/status
    if (activeTab !== "all") {
      filtered = filtered.filter(apt => apt.status === activeTab);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(apt => {
        const aptDate = apt.appointmentDate?.split('T')[0];
        return aptDate === dateFilter;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.pet?.name?.toLowerCase().includes(term) ||
        apt.service?.serviceName?.toLowerCase().includes(term) ||
        apt.employee?.fullName?.toLowerCase().includes(term) ||
        apt.petOwner?.fullName?.toLowerCase().includes(term)
      );
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return dateB - dateA;
    });

    setFilteredAppointments(filtered);
  };

  const handleOpenModal = () => {
    setFormData({
      petId: "",
      employeeId: "",
      serviceId: "",
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
      estimatedCost: 0
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        petId: Number(formData.petId),
        employeeId: Number(formData.employeeId),
        serviceId: Number(formData.serviceId),
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes || null,
        estimatedCost: Number(formData.estimatedCost) || null
      };

      await apiClient.post('/appointments', payload);
      showToast("Tạo lịch hẹn thành công! ✅", "success");
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error creating appointment:", error);
      showToast(error.response?.data?.message || "Không thể tạo lịch hẹn", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (appointment) => {
    const id = appointment.appointmentId || appointment.id;
    try {
      await apiClient.put(`/appointments/${id}/confirm`);
      showToast("Đã xác nhận lịch hẹn! 🟢", "success");
      loadData();
    } catch (error) {
      showToast("Không thể xác nhận lịch hẹn", "error");
    }
  };

  const handleCancel = async (appointment) => {
    const id = appointment.appointmentId || appointment.id;
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
    
    try {
      await apiClient.put(`/appointments/${id}/cancel`);
      showToast("Đã hủy lịch hẹn! 🔴", "success");
      loadData();
    } catch (error) {
      showToast("Không thể hủy lịch hẹn", "error");
    }
  };



  // UI Helpers
  const getPetEmoji = (species) => {
    const emojiMap = {
      'Dog': '🐕', 'Chó': '🐕',
      'Cat': '🐈', 'Mèo': '🐈',
      'Bird': '🐦', 'Chim': '🐦',
      'Rabbit': '🐇', 'Thỏ': '🐇',
      'Hamster': '🐹',
      'Turtle': '🐢', 'Rùa': '🐢',
      'Fish': '🐟', 'Cá': '🐟'
    };
    return emojiMap[species] || '🐾';
  };

  const getStatusConfig = (status) => {
    const statusMap = {
      'PENDING': { emoji: '🟡', label: 'Chờ xác nhận', bg: 'bg-amber-100 text-amber-700', border: 'border-amber-300' },
      'CONFIRMED': { emoji: '🟢', label: 'Đã xác nhận', bg: 'bg-green-100 text-green-700', border: 'border-green-300' },
      'IN_PROGRESS': { emoji: '🔵', label: 'Đang thực hiện', bg: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
      'COMPLETED': { emoji: '✅', label: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300' },
      'CANCELLED': { emoji: '🔴', label: 'Đã hủy', bg: 'bg-red-100 text-red-700', border: 'border-red-300' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', emoji: '📋' },
    { id: 'PENDING', label: 'Chờ XN', emoji: '🟡' },
    { id: 'CONFIRMED', label: 'Đã XN', emoji: '🟢' },
    { id: 'IN_PROGRESS', label: 'Đang thực hiện', emoji: '🔵' },
    { id: 'COMPLETED', label: 'Hoàn thành', emoji: '✅' },
    { id: 'CANCELLED', label: 'Đã hủy', emoji: '🔴' }
  ];

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    today: appointments.filter(a => a.appointmentDate?.split('T')[0] === new Date().toISOString().split('T')[0]).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📅</div>
          <p className="text-gray-500 text-lg">Đang tải lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">📅</span>
                Quản Lý Lịch Hẹn
              </h1>
              <p className="text-white/90">
                Quản lý toàn bộ lịch hẹn khám và chăm sóc
              </p>
            </div>
            <Button 
              onClick={handleOpenModal}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
            >
              ➕ Tạo lịch hẹn
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">📋 Tổng lịch hẹn</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">🟡 Chờ xác nhận</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-500">🟢 Đã xác nhận</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
              <p className="text-sm text-gray-500">📆 Hôm nay</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên thú cưng, dịch vụ, nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ❌
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-600'
                  }`}
                >
                  📋 Danh sách
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'calendar' ? 'bg-white shadow text-orange-600' : 'text-gray-600'
                  }`}
                >
                  🗓️ Lịch
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          Hiển thị {filteredAppointments.length} / {appointments.length} lịch hẹn
        </p>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {paginatedData.map((appointment) => {
              const status = getStatusConfig(appointment.status);
              const appointmentId = appointment.appointmentId || appointment.id;
              
              return (
                <Card 
                  key={appointmentId} 
                  className={`bg-white shadow-lg hover:shadow-xl transition-all border-l-4 ${status.border}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start gap-6">
                      {/* Date/Time Block */}
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl p-3">
                          <p className="text-2xl font-bold">
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).getDate() : '--'}
                          </p>
                          <p className="text-xs uppercase">
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN', { month: 'short' }) : ''}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mt-2">
                          {appointment.startTime || formatTime(appointment.appointmentDate)}
                        </p>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{getPetEmoji(appointment.pet?.species)}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {appointment.pet?.name || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {appointment.pet?.species} • {appointment.pet?.breed || 'Không rõ giống'}
                            </p>
                          </div>
                          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${status.bg}`}>
                            {status.emoji} {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">💼 Dịch vụ</p>
                            <p className="font-medium text-gray-900">{appointment.service?.serviceName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">👨‍⚕️ Nhân viên</p>
                            <p className="font-medium text-gray-900">{appointment.employee?.fullName || 'Chưa phân công'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">👤 Chủ nuôi</p>
                            <p className="font-medium text-gray-900">{appointment.petOwner?.fullName || appointment.pet?.owner?.fullName || 'N/A'}</p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            📝 {appointment.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(appointment)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              ✅ Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(appointment)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              ❌ Hủy
                            </Button>
                          </>
                        )}
                        {appointment.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(appointment)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            ❌ Hủy
                          </Button>
                        )}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc tạo lịch hẹn mới</p>
              <Button onClick={handleOpenModal}>
                ➕ Tạo lịch hẹn mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
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

      {/* Create Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                ➕ Tạo Lịch Hẹn Mới
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Pet Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  🐾 Chọn thú cưng <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.petId}
                  onChange={(e) => setFormData({...formData, petId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map(pet => (
                    <option key={pet.petId || pet.id} value={pet.petId || pet.id}>
                      {getPetEmoji(pet.species)} {pet.name} - {pet.species} ({pet.owner?.fullName || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💼 Dịch vụ <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => {
                      const service = services.find(s => (s.serviceId || s.id) == e.target.value);
                      setFormData({
                        ...formData, 
                        serviceId: e.target.value,
                        estimatedCost: service?.basePrice || 0
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map(service => (
                      <option key={service.serviceId || service.id} value={service.serviceId || service.id}>
                        {service.serviceName} - {formatCurrency(service.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    👨‍⚕️ Nhân viên phụ trách <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                        {emp.fullName} - {emp.userType === 'VETERINARIAN' ? '👨‍⚕️ Bác sĩ' : '👷 NV Chăm sóc'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📅 Ngày hẹn <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
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

                {/* Estimated Cost */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💰 Chi phí dự kiến
                  </Label>
                  <Input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                    min="0"
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
                  placeholder="Ghi chú thêm về lịch hẹn..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                />
              </div>

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
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  {saving ? '⏳ Đang tạo...' : '✅ Tạo lịch hẹn'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
