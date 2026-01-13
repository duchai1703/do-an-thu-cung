/**
 * Appointments Management Page - Premium UI v2
 * 
 * Features:
 * - Stunning gradient header với floating calendar icons
 * - 3 Premium stats cards với glassmorphism
 * - Filter tabs với gradient selection
 * - Timeline-style appointment cards
 * - Premium booking modal với step indicator
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, Plus, X, Eye, Clock, CheckCircle, XCircle,
  User, Stethoscope, DollarSign, Sparkles, CalendarCheck, CalendarX, Heart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import { appointmentApi } from "@/lib/api";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  
  // For booking form
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingForm, setBookingForm] = useState({
    petId: "",
    services: [],
    employeeId: "",
    appointmentDate: "",
    startTime: "",
    notes: ""
  });
  const [selectedServices, setSelectedServices] = useState({}); // { serviceId: { quantity, notes } }

  const filterTabs = [
    { value: "all", label: "Tất cả", icon: "📋", gradient: "from-purple-500 to-pink-500" },
    { value: "upcoming", label: "Sắp tới", icon: "⏰", gradient: "from-blue-500 to-cyan-500" },
    { value: "completed", label: "Hoàn thành", icon: "✅", gradient: "from-green-500 to-emerald-500" },
    { value: "cancelled", label: "Đã hủy", icon: "❌", gradient: "from-red-500 to-pink-500" }
  ];

  useEffect(() => {
    loadAppointments();
    loadPetsAndServices();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter, dateRange]);

  useEffect(() => {
    if (services.length === 0) return;

    const serviceId = searchParams.get('serviceId');
    const openDialog = searchParams.get('openDialog');

    if (serviceId && services.length > 0) {
      const service = services.find(s => (s.serviceId || s.id)?.toString() === serviceId);
      if (service) {
        const id = service.serviceId || service.id;
        setSelectedServices({ [id]: { quantity: 1, notes: '' } });
      }
    }

    if (openDialog === 'true') {
      setIsBookModalOpen(true);
      router.replace('/dashboard/owner/appointments', { scroll: false });
    }
  }, [services, searchParams]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getMyAppointments();
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
      const [petsRes, servicesRes, employeesRes] = await Promise.all([
        apiClient.get('/pets/me'),
        apiClient.get('/services'),
        apiClient.get('/employees').catch(() => ({ data: [] }))
      ]);
      
      setPets(petsRes.data || petsRes || []);
      setServices(servicesRes.data || servicesRes || []);
      const employeesData = employeesRes.data || employeesRes || [];
      setEmployees(employeesData);
      
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

    // Status filter
    if (filter === "upcoming") {
      filtered = filtered.filter(apt => 
        apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      );
    } else if (filter === "completed") {
      filtered = filtered.filter(apt => apt.status === 'COMPLETED');
    } else if (filter === "cancelled") {
      filtered = filtered.filter(apt => apt.status === 'CANCELLED');
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        if (dateRange.start && aptDate < dateRange.start) return false;
        if (dateRange.end && aptDate > dateRange.end) return false;
        return true;
      });
    }

    filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    
    setFilteredAppointments(filtered);
  };

  const handleDateRangeChange = (start, end, preset) => {
    setDateRange({ start, end });
  };

  const getStats = () => {
    const upcoming = appointments.filter(apt => 
      apt.status === 'PENDING' || apt.status === 'CONFIRMED'
    ).length;
    const completed = appointments.filter(apt => apt.status === 'COMPLETED').length;
    const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length;

    return { upcoming, completed, cancelled, total: appointments.length };
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!bookingForm.petId || Object.keys(selectedServices).length === 0 || !bookingForm.employeeId || !bookingForm.appointmentDate || !bookingForm.startTime) {
      showToast("Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 dịch vụ", "error");
      return;
    }

    const selectedPet = pets.find(p => (p.petId || p.id)?.toString() === bookingForm.petId);
    if (!selectedPet) {
      showToast("Thú cưng không hợp lệ. Vui lòng chọn lại!", "error");
      return;
    }

    try {
      // Calculate total duration from all selected services
      const servicesArray = Object.entries(selectedServices).map(([serviceId, data]) => ({
        serviceId: parseInt(serviceId),
        quantity: data.quantity,
        notes: data.notes || undefined
      }));
      
      const totalDuration = servicesArray.reduce((total, item) => {
        const service = services.find(s => (s.serviceId || s.id) === item.serviceId);
        return total + ((service?.estimatedDuration || service?.duration || 60) * item.quantity);
      }, 0);
      
      const [hours, minutes] = bookingForm.startTime.split(':');
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + totalDuration;
      
      // Cap endTime at 23:59 to avoid invalid time format
      const cappedEndMinutes = Math.min(endMinutes, 23 * 60 + 59);
      const endHour = Math.floor(cappedEndMinutes / 60);
      const endMin = cappedEndMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const payload = {
        petId: parseInt(bookingForm.petId),
        services: servicesArray,
        employeeId: parseInt(bookingForm.employeeId),
        appointmentDate: bookingForm.appointmentDate,
        startTime: bookingForm.startTime,
        endTime: endTime,
        notes: bookingForm.notes || null
      };

      console.log('📦 Booking payload:', payload);
      console.log('📦 Selected services:', selectedServices);
      console.log('📦 Services array:', servicesArray);

      await apiClient.post('/appointments', payload);

      showToast("Đặt lịch hẹn thành công! 🎉", "success");
      setIsBookModalOpen(false);
      setBookingStep(1);
      setBookingForm({
        petId: "",
        services: [],
        employeeId: employees.length > 0 ? (employees[0].employeeId || employees[0].id)?.toString() || "" : "",
        appointmentDate: "",
        startTime: "",
        notes: ""
      });
      setSelectedServices({});
      loadAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
      showToast(error.response?.data?.message || "Không thể đặt lịch", "error");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-amber-500", label: "⏳ Chờ xác nhận", color: "amber" },
      CONFIRMED: { className: "bg-blue-500", label: "✅ Đã xác nhận", color: "blue" },
      COMPLETED: { className: "bg-green-500", label: "🎉 Hoàn thành", color: "green" },
      CANCELLED: { className: "bg-red-500", label: "❌ Đã hủy", color: "red" }
    };
    return variants[status] || variants.PENDING;
  };

  const getPetIcon = (species) => {
    const s = species?.toLowerCase() || '';
    if (s.includes('chó') || s.includes('dog')) return '🐕';
    if (s.includes('mèo') || s.includes('cat')) return '🐈';
    if (s.includes('thỏ') || s.includes('rabbit')) return '🐰';
    return '🐾';
  };

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      showToast("Vui lòng nhập lý do hủy lịch", "error");
      return;
    }

    if (!selectedAppointment) return;

    try {
      setCancelling(true);
      const appointmentId = selectedAppointment.appointmentId || selectedAppointment.id;
      
      await appointmentApi.cancel(appointmentId, cancelReason.trim());
      
      showToast("Đã hủy lịch hẹn thành công!", "success");
      setIsCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancelReason("");
      loadAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showToast(error.response?.data?.message || "Không thể hủy lịch hẹn", "error");
    } finally {
      setCancelling(false);
    }
  };

  const canCancelAppointment = (appointment) => {
    return appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">📅</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">✨</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải lịch hẹn...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* 🌈 Premium Gradient Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-3xl animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              {['📅', '🐾', '💉', '🏥', '⏰', '💖'][i]}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                  📅
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Lịch Hẹn Của Tôi
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </h1>
                  <p className="text-white/80 mt-1">
                    Quản lý và đặt lịch chăm sóc thú cưng
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsBookModalOpen(true)}
                className="bg-white text-blue-600 hover:bg-white/90 shadow-xl hover:scale-105 transition-transform"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Đặt Lịch Mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 📊 Premium Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('upcoming')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Sắp tới</p>
                  <p className="text-4xl font-bold">{stats.upcoming}</p>
                  <p className="text-white/70 text-xs mt-1">cuộc hẹn</p>
                </div>
                <div className="text-5xl opacity-80">⏰</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('completed')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Hoàn thành</p>
                  <p className="text-4xl font-bold">{stats.completed}</p>
                  <p className="text-white/70 text-xs mt-1">cuộc hẹn</p>
                </div>
                <div className="text-5xl opacity-80">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('cancelled')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Đã hủy</p>
                  <p className="text-4xl font-bold">{stats.cancelled}</p>
                  <p className="text-white/70 text-xs mt-1">cuộc hẹn</p>
                </div>
                <div className="text-5xl opacity-80">❌</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('all')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Tổng cộng</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                  <p className="text-white/70 text-xs mt-1">cuộc hẹn</p>
                </div>
                <div className="text-5xl opacity-80">📋</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔘 Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300
                ${filter === tab.value 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105` 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.value ? 'bg-white/30' : 'bg-gray-100'
              }`}>
                {tab.value === 'all' ? stats.total : 
                 tab.value === 'upcoming' ? stats.upcoming :
                 tab.value === 'completed' ? stats.completed : stats.cancelled}
              </span>
            </button>
          ))}
        </div>

        {/* 📅 Date Range Filter */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <DateRangeFilter
              onChange={handleDateRangeChange}
              defaultPreset="all"
              showCustomRange={true}
              theme="blue"
              size="md"
              showLabel={false}
              compact={true}
            />
          </CardContent>
        </Card>

        {/* 📅 Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((apt, idx) => {
              const status = getStatusBadge(apt.status);
              const aptDate = new Date(apt.appointmentDate);
              
              return (
                <Card 
                  key={apt.appointmentId}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex">
                    {/* Date Box */}
                    <div className={`w-24 flex-shrink-0 bg-gradient-to-br ${
                      apt.status === 'COMPLETED' ? 'from-green-500 to-emerald-500' :
                      apt.status === 'CANCELLED' ? 'from-red-500 to-pink-500' :
                      'from-blue-500 to-cyan-500'
                    } flex flex-col items-center justify-center text-white py-6`}>
                      <span className="text-3xl font-bold">{aptDate.getDate()}</span>
                      <span className="text-sm uppercase">{aptDate.toLocaleDateString('vi-VN', { month: 'short' })}</span>
                      <span className="text-xs mt-1 opacity-80">{aptDate.getFullYear()}</span>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={status.className}>{status.label}</Badge>
                            <span className="text-gray-500 text-sm">🕐 {apt.startTime} - {apt.endTime || apt.startTime}</span>
                            {apt.cageAssignmentId && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">🏠 Lưu trú #{apt.cageAssignmentId}</Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-800 mb-3">
                            {apt.service?.serviceName || 'Dịch vụ'}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                              <span className="text-2xl">{getPetIcon(apt.pet?.species)}</span>
                              <div>
                                <p className="font-semibold text-gray-800">{apt.pet?.name || `Pet #${apt.petId}`}</p>
                                <p className="text-xs text-gray-500">{apt.pet?.species}</p>
                              </div>
                            </div>

                            {apt.employee && (
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                <Stethoscope className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="font-semibold text-gray-800">{apt.employee.fullName}</p>
                                  <p className="text-xs text-gray-500">Bác sĩ phụ trách</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {apt.notes && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700 border border-amber-200">
                              📝 {apt.notes}
                            </div>
                          )}

                          {/* Cancellation Reason */}
                          {apt.cancellationReason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-700 border border-red-200">
                              ❌ Lý do hủy: {apt.cancellationReason}
                            </div>
                          )}

                          {/* Timestamps Row */}
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                            {apt.createdAt && (
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                📅 Tạo: {new Date(apt.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {apt.updatedAt && apt.updatedAt !== apt.createdAt && (
                              <span className="bg-blue-50 px-2 py-1 rounded text-blue-600">
                                🔄 Cập nhật: {new Date(apt.updatedAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {apt.cancelledAt && (
                              <span className="bg-red-50 px-2 py-1 rounded text-red-600">
                                ❌ Hủy lúc: {new Date(apt.cancelledAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Dự kiến</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {apt.estimatedCost?.toLocaleString('vi-VN') || '0'}đ
                          </p>
                          {apt.actualCost && apt.actualCost !== apt.estimatedCost && (
                            <div className="mt-2">
                              <p className="text-xs text-green-600">Thực tế</p>
                              <p className="text-lg font-bold text-green-600">
                                {apt.actualCost?.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          )}
                        {/* Cancel Button for pending/confirmed appointments */}
                        {canCancelAppointment(apt) && (
                          <Button
                            onClick={() => handleOpenCancelModal(apt)}
                            variant="outline"
                            size="sm"
                            className="mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Hủy lịch
                          </Button>
                        )}                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4 animate-bounce">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {filter === "all" ? "Chưa có lịch hẹn" : "Không có lịch hẹn"}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === "all" 
                  ? "Đặt lịch hẹn đầu tiên cho bé yêu của bạn!"
                  : "Không tìm thấy lịch hẹn phù hợp với bộ lọc"}
              </p>
              {filter === "all" && (
                <Button
                  onClick={() => setIsBookModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Đặt lịch ngay
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 📝 Premium Booking Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-hidden border-0 rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-8xl opacity-20 rotate-12">📅</div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                    📅
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Đặt Lịch Hẹn</h2>
                    <p className="text-white/80 text-sm">Chọn thú cưng và dịch vụ</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsBookModalOpen(false);
                    setBookingStep(1);
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleBookAppointment} className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
              {/* Pet Selection */}
              <div className="space-y-2">
                <label className="text-base font-semibold flex items-center gap-2">
                  🐾 Chọn thú cưng
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {pets.map((pet) => {
                    const id = (pet.petId || pet.id)?.toString();
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, petId: id})}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-200 text-left
                          ${bookingForm.petId === id
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-gray-200 hover:border-blue-300"}
                        `}
                      >
                        <div className="text-2xl mb-1">{getPetIcon(pet.species)}</div>
                        <div className="font-semibold text-gray-800 truncate">{pet.name}</div>
                        <div className="text-xs text-gray-500 truncate">{pet.species}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-base font-semibold flex items-center gap-2">
                  💉 Chọn dịch vụ <span className="text-sm text-gray-500 font-normal">(có thể chọn nhiều)</span>
                </label>
                <div className="border-2 border-gray-200 rounded-xl p-3 max-h-[350px] overflow-y-auto space-y-2">
                  {services.map((service) => {
                    const id = service.serviceId || service.id;
                    const isSelected = !!selectedServices[id];
                    return (
                      <div
                        key={id}
                        className={`border-2 rounded-lg p-3 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`service-${id}`}
                            checked={isSelected}
                            onChange={() => {
                              setSelectedServices(prev => {
                                const newSelected = { ...prev };
                                if (newSelected[id]) {
                                  delete newSelected[id];
                                } else {
                                  newSelected[id] = { quantity: 1, notes: '' };
                                }
                                return newSelected;
                              });
                            }}
                            className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <label htmlFor={`service-${id}`} className="cursor-pointer">
                              <div className="font-semibold text-gray-800">
                                {service.serviceName || service.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {(service.basePrice || service.price || 0).toLocaleString('vi-VN')}đ
                              </div>
                            </label>
                            
                            {isSelected && (
                              <div className="mt-2 space-y-2 pt-2 border-t border-blue-200">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium w-20">Số lượng:</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={selectedServices[id].quantity}
                                    onChange={(e) => {
                                      setSelectedServices(prev => ({
                                        ...prev,
                                        [id]: { ...prev[id], quantity: Math.max(1, parseInt(e.target.value) || 1) }
                                      }));
                                    }}
                                    className="h-8 w-20 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium w-20">Ghi chú:</label>
                                  <Input
                                    type="text"
                                    placeholder="Ghi chú..."
                                    value={selectedServices[id].notes}
                                    onChange={(e) => {
                                      setSelectedServices(prev => ({
                                        ...prev,
                                        [id]: { ...prev[id], notes: e.target.value }
                                      }));
                                    }}
                                    className="h-8 text-sm flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Tổng chi phí */}
                {Object.keys(selectedServices).length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-blue-700">Chi phí dự kiến:</span>
                        <div className="text-xs text-blue-600">
                          {Object.keys(selectedServices).length} dịch vụ đã chọn
                        </div>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {Object.entries(selectedServices).reduce((total, [serviceId, data]) => {
                          const service = services.find(s => (s.serviceId || s.id)?.toString() === serviceId);
                          return total + ((service?.basePrice || service?.price || 0) * data.quantity);
                        }, 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <label className="text-base font-semibold flex items-center gap-2">
                  👨‍⚕️ Chọn bác sĩ
                </label>
                <select
                  value={bookingForm.employeeId}
                  onChange={(e) => setBookingForm({...bookingForm, employeeId: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-base font-semibold flex items-center gap-2">
                    📅 Ngày hẹn
                  </label>
                  <Input
                    type="date"
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({...bookingForm, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-semibold flex items-center gap-2">
                    🕐 Giờ hẹn
                  </label>
                  <Input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-base font-semibold flex items-center gap-2">
                  📝 Ghi chú
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  placeholder="Triệu chứng, yêu cầu đặc biệt..."
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBookModalOpen(false);
                  setBookingStep(1);
                }}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>

              <Button
                type="submit"
                onClick={handleBookAppointment}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg"
              >
                <Heart className="h-4 w-4 mr-2 fill-white" />
                Đặt Lịch Ngay! 🎉
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 animate-scale-in">
            <div className="p-6 border-b bg-gradient-to-r from-red-500 to-pink-500">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Hủy lịch hẹn
              </h2>
              <p className="text-white/90 text-sm mt-1">
                Vui lòng cho chúng tôi biết lý do hủy lịch
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedAppointment && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getPetIcon(selectedAppointment.pet?.species)}</span>
                    <div>
                      <p className="font-bold text-gray-800">{selectedAppointment.pet?.name}</p>
                      <p className="text-sm text-gray-500">{selectedAppointment.service?.name}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                    <p>🕐 {selectedAppointment.startTime}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-base font-semibold flex items-center gap-2">
                  📝 Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="VD: Có việc bận đột xuất, Bé không khỏe, Muốn đổi lịch khác..."
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-colors resize-none"
                  disabled={cancelling}
                />
                <p className="text-xs text-gray-500">
                  💡 Lý do hủy sẽ giúp chúng tôi cải thiện dịch vụ tốt hơn
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedAppointment(null);
                  setCancelReason("");
                }}
                disabled={cancelling}
                className="rounded-xl flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Đóng
              </Button>

              <Button
                type="button"
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg flex-1"
              >
                {cancelling ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Đang hủy...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Xác nhận hủy
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
