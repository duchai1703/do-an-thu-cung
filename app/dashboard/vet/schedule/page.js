// app/(dashboard)/vet/schedule/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetScheduleDetailModal from "@/components/modals/VetScheduleDetailModal";
import VetRecordFormModal from "@/components/modals/VetRecordFormModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appointmentApi, getToken, serviceApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";
import { formatAppointmentId } from "@/lib/utils/id-formatter";
import { authApi } from "@/lib/api";

export default function VeterinarianSchedulePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch both appointments and services in parallel
      const [appointmentsResponse, servicesResponse] = await Promise.all([
        appointmentApi.getMyAppointments(),
        serviceApi.getAll()
      ]);
      
      console.log('📅 Loaded appointments:', appointmentsResponse);
      console.log('📦 Loaded services:', servicesResponse);

      // Build services map for quick lookup
      let servicesMap = {};
      if (servicesResponse.success && servicesResponse.data) {
        servicesResponse.data.forEach(service => {
          const serviceKey = service.id || service.serviceId;
          servicesMap[serviceKey] = service;
          // Also map by serviceId for compatibility
          if (service.serviceId) {
            servicesMap[service.serviceId] = service;
          }
        });
      }
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        // Filter theo ngày đã chọn
        const filteredByDate = appointmentsResponse.data.filter(apt => {
          const aptDate = apt.appointmentDate ? getLocalDateString(new Date(apt.appointmentDate)) : '';
          return aptDate === selectedDate;
        });

        const mappedAppointments = filteredByDate.map(apt => {
          // Extract services from appointmentServices array
          let allServices = [];
          if (apt.appointmentServices && apt.appointmentServices.length > 0) {
            allServices = apt.appointmentServices.map(as => {
              // Try to get service from appointmentService relation or from servicesMap
              const serviceId = as.serviceId || as.service?.id || as.service?.serviceId;
              const serviceFromMap = servicesMap[serviceId];
              return {
                ...as.service,
                ...serviceFromMap,
                appointmentServiceId: as.id,
                quantity: as.quantity || 1,
                unitPrice: as.unitPrice
              };
            }).filter(s => s != null);
          }
          
          // Get first service for display (or fallback)
          const primaryService = allServices[0];
          const serviceNames = allServices.length > 0 
            ? allServices.map(s => s.serviceName || s.name).filter(Boolean).join(', ')
            : 'N/A';

          return {
            id: apt.appointmentId || apt.id,
            code: formatAppointmentId(apt.appointmentId || apt.id),
            time: apt.startTime || '',
            petId: apt.pet?.petId || apt.pet?.id,
            petName: apt.pet?.name || 'Unknown',
            petIcon: apt.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            petType: `${apt.pet?.species || ''} ${apt.pet?.breed || ''}`.trim(),
            petAge: apt.pet?.birthDate ? calculateAge(apt.pet.birthDate) : 'N/A',
            petWeight: apt.pet?.weight ? `${apt.pet.weight} kg` : 'N/A',
            ownerId: apt.pet?.owner?.petOwnerId || apt.pet?.owner?.id,
            ownerName: apt.pet?.owner?.fullName || apt.pet?.owner?.account?.email?.split('@')[0] || 'Unknown',
            ownerPhone: apt.pet?.owner?.phoneNumber || 'N/A',
            // Updated service fields to support multiple services
            services: allServices,
            serviceId: primaryService?.id || primaryService?.serviceId,
            serviceName: serviceNames,
            servicePrice: primaryService?.price || primaryService?.basePrice || null,
            serviceDescription: primaryService?.description || null,
            serviceIconName: primaryService?.serviceName || primaryService?.name || '',
            status: mapStatus(apt.status),
            symptoms: apt.notes || 'N/A',
            notes: apt.notes || '',
            previousRecords: []
          };
        });
        
        setAppointments(mappedAppointments);
      }
      else {
        throw new Error(appointmentsResponse.error || 'Không thể tải lịch khám');
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} tuổi`;
    }
    return `${age} tuổi`;
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'waiting',
      'CONFIRMED': 'waiting',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[backendStatus] || 'waiting';
  };

  const handleStartExam = async (appointmentId) => {
    try {
      // Call API to start the exam
      const response = await appointmentApi.start(appointmentId);
      
      if (response.success) {
        // Reload appointments from server to get updated status
        await loadAppointments();
        showToast("Đã bắt đầu khám");
      } else {
        showToast(response.error || "Không thể bắt đầu ca khám", "error");
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      showToast("Có lỗi xảy ra khi bắt đầu khám", "error");
    }
  };

  const handleCompleteExam = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRecordModalOpen(true);
  };

  const handleRecordSuccess = async (data) => {
    // Reload appointments to get updated status from server
    // (VetRecordModal already called appointmentApi.complete())
    await loadAppointments();
    showToast("Đã hoàn thành ca khám và lưu bệnh án!");
  };

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchFilter = filter === "all" || apt.status === filter;
    const matchSearch = apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      waiting: { label: "Chờ khám", variant: "warning", emoji: "⏰" },
      in_progress: { label: "Đang khám", variant: "info", emoji: "🔄" },
      completed: { label: "Hoàn thành", variant: "success", emoji: "✅" }
    };
    return badges[status] || badges.waiting;
  };

  const getServiceEmoji = (icon) => {
    switch (icon) {
      case '🏥': return '🩺';
      case '💉': return '💉';
      case '🔄': return '🔄';
      case '🩺': return '🩺';
      default: return '🩺';
    }
  };

  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === 'waiting').length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="flex-1 space-y-6">
      {/* 🎨 Stunning Gradient Header Banner - Schedule Theme */}
      <div className="relative overflow-hidden rounded-b-3xl">
        {/* Animated Background - Purple/Violet */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['📅', '⏰', '🗓️', '✨', '📋', '🔔'].map((icon, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-4xl"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${3 + i % 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Title & Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                  📅
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Lịch làm việc
                    <span className="text-yellow-300">✨</span>
                  </h1>
                  <p className="text-white/80 mt-1">
                    Quản lý lịch khám và thực hiện ca khám
                  </p>
                </div>
              </div>

              {/* Right side - Stats summary */}
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-xs text-white/80">tổng ca</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-yellow-300">{stats.waiting}</p>
                      <p className="text-xs text-white/80">chờ khám</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-emerald-300">{stats.completed}</p>
                      <p className="text-xs text-white/80">hoàn thành</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📆 Week Navigation - Unique to Schedule Page */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-100 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Week Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const prevWeek = new Date(selectedDate);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setSelectedDate(getLocalDateString(prevWeek));
                }}
                className="flex items-center gap-2 hover:bg-indigo-100"
              >
                <span>←</span> Tuần trước
              </Button>
              
              <Button 
                variant={selectedDate === getLocalDateString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(getLocalDateString())}
                className={cn(
                  "flex items-center gap-2",
                  selectedDate === getLocalDateString() 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                    : "hover:bg-indigo-100"
                )}
              >
                <span>◉</span> Hôm nay
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const nextWeek = new Date(selectedDate);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(getLocalDateString(nextWeek));
                }}
                className="flex items-center gap-2 hover:bg-indigo-100"
              >
                Tuần sau <span>→</span>
              </Button>
            </div>
            
            {/* Selected Date Display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-indigo-200 shadow-sm">
                <span className="text-2xl">🗓️</span>
                <div>
                  <p className="text-xs text-gray-500">Ngày đang xem</p>
                  <p className="font-bold text-indigo-700">
                    {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {/* Date Input */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
          
          {/* Quick Week Days */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = new Date(selectedDate);
              const currentDay = day.getDay();
              const diff = i - currentDay;
              day.setDate(day.getDate() + diff);
              const dayStr = getLocalDateString(day);
              const isSelected = dayStr === selectedDate;
              const isToday = dayStr === getLocalDateString();
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dayStr)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all min-w-[70px]",
                    isSelected 
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-105" 
                      : isToday
                        ? "bg-indigo-100 border-2 border-indigo-300 hover:bg-indigo-200"
                        : "bg-white hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  <span className={cn("text-xs font-medium", isSelected ? "text-white/80" : "text-gray-500")}>
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][i]}
                  </span>
                  <span className={cn("text-lg font-bold", isSelected ? "text-white" : "text-gray-800")}>
                    {day.getDate()}
                  </span>
                  {isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              📅
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng ca</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng ca khám</div>
        </div>

        {/* Waiting */}
        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              ⏰
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chờ khám</span>
          </div>
          <div className="value">{stats.waiting}</div>
          <div className="label mt-1">Đang chờ</div>
        </div>

        {/* In Progress */}
        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl vet-animate-pulse">
              🔄
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đang khám</span>
          </div>
          <div className="value">{stats.inProgress}</div>
          <div className="label mt-1">Đang thực hiện</div>
        </div>

        {/* Completed */}
        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">
              ✅
            </div>
            <span className="text-xs uppercase tracking-wider opacity-80">Hoàn thành</span>
          </div>
          <div className="value">{stats.completed}</div>
          <div className="label mt-1">Đã hoàn thành</div>
        </div>
      </div>

      {/* Filter Tabs - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl p-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'all', label: 'Tất cả', emoji: '📋', gradient: 'from-pink-500 to-rose-400' },
            { value: 'waiting', label: 'Chờ khám', emoji: '⏰', gradient: 'from-amber-500 to-orange-400' },
            { value: 'in_progress', label: 'Đang khám', emoji: '🔄', gradient: 'from-blue-500 to-cyan-400' },
            { value: 'completed', label: 'Hoàn thành', emoji: '✅', gradient: 'from-green-500 to-emerald-400' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                filter === tab.value
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : "bg-white/50 text-gray-600 hover:bg-white/80"
              )}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker and Search - Premium Cards với UX cải thiện */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Picker Card */}
        <div className="vet-glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => {
          const input = document.getElementById('date-input');
          input?.focus();
          input?.showPicker?.();
        }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-3xl shadow-lg hover:scale-110 transition-transform">
              📅
            </div>
            <div className="flex-1">
              <label htmlFor="date-input" className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                Chọn ngày khám
              </label>
              <Input
                id="date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-xl font-bold text-gray-900 focus-visible:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="vet-glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => document.getElementById('search-input')?.focus()}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-3xl shadow-lg hover:scale-110 transition-transform">
              🔍
            </div>
            <div className="flex-1">
              <label htmlFor="search-input" className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                Tìm kiếm lịch khám
              </label>
              <Input
                id="search-input"
                type="text"
                placeholder="Nhập tên thú cưng hoặc chủ nuôi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
                📋
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Lịch khám ngày {selectedDate}</h2>
                <p className="text-sm text-gray-500">Danh sách các ca khám trong ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
              <span className="text-2xl">{filteredAppointments.length}</span>
              <span className="text-sm opacity-90">ca khám</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <div className="rounded-xl border border-pink-100 overflow-hidden bg-white/50">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">Mã</TableHead>
                <TableHead className="w-[8%]">Giờ</TableHead>
                <TableHead className="w-[18%]">Thú cưng</TableHead>
                <TableHead className="w-[15%]">Chủ nuôi</TableHead>
                <TableHead className="w-[16%]">Dịch vụ</TableHead>
                <TableHead className="w-[12%]">Trạng thái</TableHead>
                <TableHead className="w-[23%] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📅</span>
                      Không có ca khám nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{apt.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-base">🕐</span>
                          <span className="font-medium">{apt.time}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-xl">
                            {apt.petIcon || '🐾'}
                          </div>
                          <div>
                            <p className="font-semibold">{apt.petName}</p>
                            <p className="text-xs text-muted-foreground">{apt.petType}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold">{apt.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{apt.ownerPhone}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getServiceEmoji(apt.serviceIconName)}</span>
                          <span className="text-sm">{apt.serviceName}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <span className="text-sm">{statusBadge.emoji}</span> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(apt)} title="Xem chi tiết">
                            <span className="text-lg">👁️</span>
                          </Button>
                          
                          {apt.status === 'waiting' && (
                            <Button variant="default" size="icon" onClick={() => handleStartExam(apt.id)} title="Bắt đầu khám">
                              <span className="text-lg">▶️</span>
                            </Button>
                          )}
                          
                          {(apt.status === 'in_progress' || apt.status === 'waiting') && (
                            <Button variant="success" size="icon" onClick={() => handleCompleteExam(apt)} title="Hoàn thành">
                              <span className="text-lg">✅</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <VetScheduleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}

      {isRecordModalOpen && (
        <VetRecordFormModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleRecordSuccess}
          appointment={selectedAppointment}
        />
      )}
      </div>  {/* Close max-w-7xl container */}
    </div>
  );
}
