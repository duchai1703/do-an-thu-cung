/**
 * Appointments Management Page - Premium UI
 * 
 * Features:
 * - Gradient header
 * - 3 Stats cards (Upcoming, Completed, Cancelled)
 * - Filter tabs by status
 * - Appointment list with status badges
 * - Book new appointment (modal)
 * - Cancel appointment
 * 
 * APIs:
 * - GET /appointments
 * - POST /appointments
 * - DELETE /appointments/:id
 * - GET /pets
 * - GET /services
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Plus, X, Eye, Clock, CheckCircle, XCircle,
  User, Stethoscope, DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function AppointmentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // For booking form
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    petId: "",
    serviceId: "",
    employeeId: "",
    appointmentDate: "",
    startTime: "",
    notes: ""
  });

  const filterTabs = [
    { value: "all", label: "Tất cả", icon: Calendar },
    { value: "upcoming", label: "Sắp tới", icon: Clock },
    { value: "completed", label: "Hoàn thành", icon: CheckCircle },
    { value: "cancelled", label: "Đã hủy", icon: XCircle }
  ];

  useEffect(() => {
    loadAppointments();
    loadPetsAndServices();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/appointments');
      const data = response.data || response || [];
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      showToast("Không thể tải danh sách lịch hẹn", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPetsAndServices = async () => {
    try {
      // Check current user
      const currentUserRes = await apiClient.get('/auth/me');
      const currentUser = currentUserRes.data || currentUserRes;
      console.log('👤 Current logged in user:', currentUser);

      const [petsRes, servicesRes, employeesRes] = await Promise.all([
        apiClient.get('/pets/me'), // ← Changed from /pets to /pets/me
        apiClient.get('/services'),
        apiClient.get('/employees').catch(() => ({ data: [] })) // Fallback if no API
      ]);
      
      const petsData = petsRes.data || petsRes || [];
      console.log('🐾 Raw pets from API:', petsData);
      console.log('🔍 Pets count:', petsData.length);
      
      // Log each pet's owner
      petsData.forEach(pet => {
        console.log(`Pet "${pet.name}" (ID: ${pet.petId || pet.id}) belongs to ownerId: ${pet.ownerId}, owner: ${pet.owner?.fullName || 'N/A'}`);
      });

      setPets(petsData);
      setServices(servicesRes.data || servicesRes || []);
      const employeesData = employeesRes.data || employeesRes || [];
      setEmployees(employeesData);
      
      // Auto-select first employee if available
      if (employeesData.length > 0 && !bookingForm.employeeId) {
        const firstEmployeeId = employeesData[0].employeeId || employeesData[0].id;
        setBookingForm(prev => ({ ...prev, employeeId: firstEmployeeId?.toString() || "" }));
      }
    } catch (error) {
      console.error("Error loading pets/services:", error);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (filter === "upcoming") {
      filtered = appointments.filter(apt => 
        apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      );
    } else if (filter === "completed") {
      filtered = appointments.filter(apt => apt.status === 'COMPLETED');
    } else if (filter === "cancelled") {
      filtered = appointments.filter(apt => apt.status === 'CANCELLED');
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    
    setFilteredAppointments(filtered);
  };

  const getStats = () => {
    const upcoming = appointments.filter(apt => 
      apt.status === 'PENDING' || apt.status === 'CONFIRMED'
    ).length;
    const completed = appointments.filter(apt => apt.status === 'COMPLETED').length;
    const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length;

    return { upcoming, completed, cancelled };
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    console.log('📋 Booking Form Data:', bookingForm);
    console.log('🐾 Available Pets:', pets);
    console.log('💼 Available Services:', services);
    console.log('👨‍⚕️ Available Employees:', employees);

    if (!bookingForm.petId || !bookingForm.serviceId || !bookingForm.employeeId || !bookingForm.appointmentDate || !bookingForm.startTime) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    // Validate pet exists in available pets
    const selectedPet = pets.find(p => (p.petId || p.id)?.toString() === bookingForm.petId);
    if (!selectedPet) {
      console.error('❌ Selected pet not found in available pets!');
      showToast("Thú cưng không hợp lệ. Vui lòng chọn lại!", "error");
      return;
    }
    console.log('✅ Selected pet:', selectedPet);

    try {
      // Calculate endTime (1 hour after startTime)
      const [hours, minutes] = bookingForm.startTime.split(':');
      const endHour = (parseInt(hours) + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;

      const payload = {
        petId: parseInt(bookingForm.petId),
        serviceId: parseInt(bookingForm.serviceId),
        employeeId: parseInt(bookingForm.employeeId),
        appointmentDate: bookingForm.appointmentDate,
        startTime: bookingForm.startTime,
        endTime: endTime,
        notes: bookingForm.notes || null
      };

      console.log('📤 Sending Appointment Payload:', payload);

      await apiClient.post('/appointments', payload);

      showToast("Đã đặt lịch hẹn thành công!", "success");
      setIsBookModalOpen(false);
      setBookingForm({
        petId: "",
        serviceId: "",
        employeeId: employees.length > 0 ? (employees[0].employeeId || employees[0].id)?.toString() || "" : "",
        appointmentDate: "",
        startTime: "",
        notes: ""
      });
      loadAppointments();
    } catch (error) {
      console.error("❌ Error booking appointment:", error);
      console.error("📋 Error response:", error.response?.data);
      showToast(error.response?.data?.message || "Không thể đặt lịch", "error");
    }
  };

  // Note: handleCancelAppointment removed - PET_OWNER lacks DELETE permission

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-amber-500", label: "Chờ xác nhận" },
      CONFIRMED: { className: "bg-blue-500", label: "Đã xác nhận" },
      COMPLETED: { className: "bg-green-500", label: "Hoàn thành" },
      CANCELLED: { className: "bg-red-500", label: "Đã hủy" }
    };
    return variants[status] || variants.PENDING;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Quản Lý Lịch Hẹn
          </h1>
          <p className="text-white/90">
            Đặt lịch khám và theo dõi các cuộc hẹn của bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Sắp đến</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.upcoming}</p>
                </div>
                <Clock className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Hoàn thành</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.completed}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Đã hủy</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.cancelled}</p>
                </div>
                <XCircle className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs + Book Button */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <Button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    variant={filter === tab.value ? "default" : "outline"}
                    size="sm"
                    className={filter === tab.value ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setIsBookModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Đặt lịch mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map((apt) => (
              <Card 
                key={apt.appointmentId}
                className="hover:shadow-xl transition-shadow border-l-4 border-l-blue-500"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge {...getStatusBadge(apt.status)}>
                          {getStatusBadge(apt.status).label}
                        </Badge>
                        <span className="text-gray-600">
                          {new Date(apt.appointmentDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">{apt.startTime}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {apt.service?.serviceName || 'Dịch vụ'}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4" />
                          <span>{apt.pet?.name || `Pet ID: ${apt.petId}`}</span>
                        </div>

                        {apt.employee && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Stethoscope className="h-4 w-4" />
                            <span>{apt.employee.fullName}</span>
                          </div>
                        )}

                        {apt.notes && (
                          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mt-2">
                            📝 {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tổng chi phí</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {apt.estimatedCost?.toLocaleString('vi-VN') || '0'} đ
                        </p>
                      </div>
                      {/* Note: Cancel button removed - PET_OWNER cannot cancel appointments via API */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-8xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "all" ? "Chưa có lịch hẹn" : "Không có lịch hẹn"}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === "all" 
                  ? "Đặt lịch hẹn đầu tiên của bạn"
                  : "Không tìm thấy lịch hẹn phù hợp với bộ lọc"}
              </p>
              {filter === "all" && (
                <Button
                  onClick={() => setIsBookModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Đặt lịch ngay
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Đặt Lịch Hẹn Mới</h2>
                <Button
                  onClick={() => setIsBookModalOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Pet Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn thú cưng *</label>
                  <select
                    value={bookingForm.petId}
                    onChange={(e) => setBookingForm({...bookingForm, petId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">-- Chọn thú cưng --</option>
                    {pets.map((pet) => {
                      const id = pet.petId || pet.id;
                      return (
                        <option key={id} value={id}>
                          {pet.name} - {pet.species}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn dịch vụ *</label>
                  <select
                    value={bookingForm.serviceId}
                    onChange={(e) => setBookingForm({...bookingForm, serviceId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map((service) => {
                      const id = service.serviceId || service.id;
                      return (
                        <option key={id} value={id}>
                          {service.serviceName || service.name} - {(service.basePrice || service.price || 0).toLocaleString('vi-VN')} đ
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn bác sĩ *</label>
                  <select
                    value={bookingForm.employeeId}
                    onChange={(e) => setBookingForm({...bookingForm, employeeId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {employees.map((emp) => {
                      const id = emp.employeeId || emp.id;
                      return (
                        <option key={id} value={id}>
                          {emp.fullName || emp.name || `Bác sĩ #${id}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ngày hẹn *</label>
                  <Input
                    type="date"
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({...bookingForm, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Thời gian *</label>
                  <Input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ghi chú</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    placeholder="Nhập ghi chú (tùy chọn)..."
                    rows={3}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBookModalOpen(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    Đặt lịch
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
