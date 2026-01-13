"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ConfirmAppointmentModal from "@/components/modals/ConfirmAppointmentModal";
import CancelAppointmentModal from "@/components/modals/CancelAppointmentModal";
import { CreateAppointmentModal, AppointmentDetailModal } from "@/components/receptionist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotification } from "@/lib/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  PawPrint, 
  Cat, 
  Stethoscope, 
  Bath, 
  Scissors, 
  ClipboardList, 
  Phone, 
  Loader2,
  Filter,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Briefcase,
  DollarSign,
  User,
  EyeIcon,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import { cn, formatAppointmentId } from "@/lib/utils";
import { appointmentApi, serviceApi, getToken } from "@/lib/api";

export default function AppointmentsPage() {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [allServicesMap, setAllServicesMap] = useState({});

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch appointments and services in parallel
      const [appointmentsRes, servicesRes] = await Promise.all([
        appointmentApi.getAll(),
        serviceApi.getAll()
      ]);

      // Create services map for quick lookup
      console.log('=== DEBUG: Services Response ===', servicesRes);
      console.log('=== DEBUG: Appointments Response ===', appointmentsRes);
      
      if (servicesRes.success && servicesRes.data) {
        const servicesMap = {};
        servicesRes.data.forEach(service => {
          // Map by both 'id' and 'serviceId' for compatibility
          const serviceKey = service.id || service.serviceId;
          servicesMap[serviceKey] = service;
        });
        setAllServicesMap(servicesMap);
        console.log('=== DEBUG: Services Map ===', servicesMap);

        // Enrich appointments with service data
        if (appointmentsRes.success && appointmentsRes.data) {
          const enrichedAppointments = appointmentsRes.data.map(apt => {
            console.log('=== DEBUG: Appointment appointmentServices ===', apt.appointmentId, apt.appointmentServices);
            if (apt.appointmentServices && apt.appointmentServices.length > 0) {
              apt.appointmentServices = apt.appointmentServices.map(as => {
                console.log('=== DEBUG: AppointmentService ===', as.serviceId, 'mapped to:', servicesMap[as.serviceId]);
                return {
                  ...as,
                  service: as.service || servicesMap[as.serviceId] || null
                };
              });
            }
            return apt;
          });
          console.log('=== DEBUG: Enriched Appointments ===', enrichedAppointments);
          setAppointments(enrichedAppointments);
        }
      } else if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleExpandRow = (appointmentId) => {
    setExpandedRows(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  const getServiceIconFromType = (categoryName) => {
    if (!categoryName) return '📋';
    const lower = categoryName.toLowerCase();
    if (lower.includes('health') || lower.includes('khám')) return '🏥';
    if (lower.includes('grooming') || lower.includes('spa') || lower.includes('tắm')) return '🛁';
    if (lower.includes('hair') || lower.includes('cắt')) return '✂️';
    return '📋';
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: "Chờ xác nhận", 
        variant: "warning", 
        icon: Clock,
        bgClass: "bg-amber-50 border-amber-200",
        textClass: "text-amber-700",
        badgeBg: "bg-gradient-to-r from-amber-400 to-orange-500"
      },
      confirmed: { 
        label: "Đã xác nhận", 
        variant: "success", 
        icon: CheckCircle2,
        bgClass: "bg-emerald-50 border-emerald-200",
        textClass: "text-emerald-700",
        badgeBg: "bg-gradient-to-r from-emerald-400 to-green-500"
      },
      completed: { 
        label: "Hoàn thành", 
        variant: "success", 
        icon: CheckCircle2,
        bgClass: "bg-blue-50 border-blue-200",
        textClass: "text-blue-700",
        badgeBg: "bg-gradient-to-r from-blue-400 to-cyan-500"
      },
      cancelled: { 
        label: "Đã hủy", 
        variant: "destructive", 
        icon: XCircle,
        bgClass: "bg-rose-50 border-rose-200",
        textClass: "text-rose-700",
        badgeBg: "bg-gradient-to-r from-rose-400 to-red-500"
      }
    };
    return configs[status] || configs.pending;
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '🛁': return Bath;
      case '✂️': return Scissors;
      default: return ClipboardList;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const status = apt.status ? apt.status.toLowerCase() : 'pending';
    const matchFilter = filter === "all" || status === filter;
    const customerName = apt.pet?.owner?.fullName || '';
    const phone = apt.pet?.owner?.phoneNumber || '';
    const aptId = formatAppointmentId(apt.appointmentId);
    const matchSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       phone.includes(searchTerm) ||
                       aptId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirm = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmAppointment = async () => {
    try {
      const response = await appointmentApi.confirm(selectedAppointment.appointmentId);

      if (response.success) {
        success('Lịch hẹn đã được xác nhận! Email thông báo đã được gửi đến khách hàng.');
        await loadAppointments(true);
        setShowConfirmModal(false);
        setSelectedAppointment(null);
      } else {
        showError(response.error || 'Có lỗi xảy ra khi xác nhận lịch hẹn');
      }
    } catch (err) {
      console.error('Error confirming appointment:', err);
      showError('Không thể xác nhận lịch hẹn. Vui lòng thử lại.');
    }
  };

  const cancelAppointment = async (reason) => {
    try {
      const response = await appointmentApi.cancel(selectedAppointment.appointmentId, reason);

      if (response.success) {
        success('Lịch hẹn đã được hủy! Email thông báo đã được gửi đến khách hàng.');
        await loadAppointments(true);
        setShowCancelModal(false);
        setSelectedAppointment(null);
      } else {
        showError(response.error || 'Có lỗi xảy ra khi hủy lịch hẹn');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      showError('Không thể hủy lịch hẹn. Vui lòng thử lại.');
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => (a.status || '').toLowerCase() === 'pending').length,
    confirmed: appointments.filter(a => (a.status || '').toLowerCase() === 'confirmed').length,
    cancelled: appointments.filter(a => (a.status || '').toLowerCase() === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/30">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý lịch đặt</h1>
              <p className="text-gray-500">Xác nhận và điều phối lịch hẹn khách hàng</p>
            </div>
          </div>
          
          <Button 
            onClick={() => loadAppointments(true)}
            disabled={refreshing}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Tổng lịch hẹn</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 font-medium">Chờ xác nhận</p>
                  <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                  {stats.pending > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs mt-2 bg-white/20 rounded-full px-2 py-1">
                      <AlertCircle className="w-3 h-3" /> Cần xử lý
                    </span>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 font-medium">Đã xác nhận</p>
                  <p className="text-3xl font-bold mt-1">{stats.confirmed}</p>
                  <span className="inline-flex items-center gap-1 text-xs mt-2 bg-white/20 rounded-full px-2 py-1">
                    <TrendingUp className="w-3 h-3" /> Sẵn sàng
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-red-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 font-medium">Đã hủy</p>
                  <p className="text-3xl font-bold mt-1">{stats.cancelled}</p>
                  <span className="inline-flex items-center gap-1 text-xs mt-2 bg-white/20 rounded-full px-2 py-1">
                    <XCircle className="w-3 h-3" /> Theo dõi
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <XCircle className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-100/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-gray-500">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Lọc:</span>
                </div>
                <Tabs value={filter} onValueChange={setFilter} className="w-full lg:w-auto">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100/80">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Tất cả
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                      Chờ ({stats.pending})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Đã xác nhận
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                      Đã hủy
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã lịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-100/50 overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Danh sách lịch đặt</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Đặt lịch mới
                </Button>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-sm px-4 py-1">
                  {filteredAppointments.length} lịch hẹn
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="font-bold text-gray-700">Mã lịch</TableHead>
                    <TableHead className="font-bold text-gray-700">Khách hàng & Thú cưng</TableHead>
                    <TableHead className="font-bold text-gray-700">Dịch vụ</TableHead>
                    <TableHead className="font-bold text-gray-700">Ngày & Giờ</TableHead>
                    <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium">Không có lịch hẹn nào</p>
                          <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt, index) => {
                      const status = (apt.status || '').toLowerCase();
                      const statusConfig = getStatusConfig(status);
                      const petSpecies = apt.pet?.species || '';
                      const PetIcon = petSpecies === 'DOG' ? PawPrint : petSpecies === 'CAT' ? Cat : PawPrint;
                      const appointmentDate = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN') : 'N/A';
                      const isExpanded = expandedRows[apt.appointmentId];
                      
                      // Get all services from appointmentServices or fallback to single service
                      const allServices = apt.appointmentServices && apt.appointmentServices.length > 0
                        ? apt.appointmentServices.map(as => as.service).filter(s => s != null)
                        : (apt.service ? [apt.service] : []);
                      
                      const totalCost = apt.appointmentServices && apt.appointmentServices.length > 0
                        ? apt.appointmentServices.reduce((sum, as) => sum + ((as.unitPrice || as.service?.basePrice || 0) * (as.quantity || 1)), 0)
                        : (apt.estimatedCost || 0);
                      
                      return (
                        <>
                          <TableRow 
                            key={apt.appointmentId} 
                            className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => toggleExpandRow(apt.appointmentId)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandRow(apt.appointmentId);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-sm bg-gray-50 border-gray-200">
                                {formatAppointmentId(apt.appointmentId)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-bold">
                                  {(apt.pet?.owner?.fullName || 'N')[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{apt.pet?.owner?.fullName || 'N/A'}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <PetIcon className="w-3 h-3" />
                                    <span>{apt.pet?.name || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-700">
                                  {allServices.length > 0 ? allServices[0]?.serviceName : 'N/A'}
                                </p>
                                {allServices.length > 1 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{allServices.length - 1} dịch vụ khác
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" /> {appointmentDate}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {apt.startTime || 'N/A'} - {apt.endTime || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-white border-0 shadow-lg whitespace-nowrap",
                                statusConfig.badgeBg
                              )}>
                                <statusConfig.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="flex-shrink-0">{statusConfig.label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center items-center gap-2">
                                {status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleConfirm(apt)}
                                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 border-0"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Xác nhận
                                  </Button>
                                )}
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={() => {
                                        setDetailAppointment(apt);
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      <EyeIcon className="mr-2 h-4 w-4 text-blue-500" />
                                      <span>Xem chi tiết</span>
                                    </DropdownMenuItem>
                                    
                                    {status !== 'cancelled' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                          onClick={() => handleCancel(apt)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Hủy lịch hẹn</span>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Row */}
                          {isExpanded && (
                            <TableRow className="bg-gradient-to-r from-violet-50/30 to-purple-50/30">
                              <TableCell colSpan={7}>
                                <div className="p-6 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Services Detail */}
                                    <div className="md:col-span-2 space-y-3">
                                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" />
                                        Chi tiết dịch vụ
                                      </h4>
                                      <div className="space-y-2">
                                        {allServices.map((service, idx) => {
                                          if (!service) return null; // Skip if service is null
                                          
                                          const appointmentService = apt.appointmentServices?.find(as => as.service?.serviceId === service.serviceId);
                                          const quantity = appointmentService?.quantity || 1;
                                          const price = appointmentService?.unitPrice || service.basePrice || 0;
                                          const serviceIcon = getServiceIconFromType(service?.serviceCategory?.categoryName);
                                          const ServiceIcon = getServiceIcon(serviceIcon);
                                          
                                          return (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                  <ServiceIcon className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                  <p className="font-medium text-gray-800">{service?.serviceName || 'N/A'}</p>
                                                  <p className="text-sm text-gray-500">{service?.serviceCategory?.categoryName || ''}</p>
                                                  {appointmentService?.notes && (
                                                    <p className="text-xs text-gray-400 mt-1">Ghi chú: {appointmentService.notes}</p>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-semibold text-emerald-600">
                                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                                                </p>
                                                <p className="text-sm text-gray-500">x{quantity}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Additional Info */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" />
                                        Thông tin bổ sung
                                      </h4>
                                      
                                      {/* Employee */}
                                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                          <Briefcase className="w-4 h-4" />
                                          <span className="text-sm font-medium">Nhân viên</span>
                                        </div>
                                        <p className="text-gray-800 font-medium">{apt.employee?.fullName || 'Chưa phân công'}</p>
                                      </div>
                                      
                                      {/* Contact */}
                                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 text-violet-600 mb-1">
                                          <Phone className="w-4 h-4" />
                                          <span className="text-sm font-medium">Liên hệ</span>
                                        </div>
                                        <p className="text-gray-800 text-sm">{apt.pet?.owner?.phoneNumber || 'N/A'}</p>
                                      </div>
                                      
                                      {/* Total Cost */}
                                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white">
                                        <div className="flex items-center gap-2 mb-1">
                                          <DollarSign className="w-4 h-4" />
                                          <span className="text-sm font-medium">Tổng chi phí</span>
                                        </div>
                                        <p className="text-2xl font-bold">
                                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                                        </p>
                                        {apt.actualCost && apt.actualCost !== totalCost && (
                                          <p className="text-xs opacity-90 mt-1">
                                            Thực tế: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(apt.actualCost)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Notes */}
                                  {apt.notes && (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm font-medium">Ghi chú</span>
                                      </div>
                                      <p className="text-gray-700">{apt.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <ConfirmAppointmentModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          appointment={selectedAppointment}
          onConfirm={confirmAppointment}
        />

        <CancelAppointmentModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          appointment={selectedAppointment}
          onCancel={cancelAppointment}
        />

        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadAppointments(true)}
        />

        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          appointment={detailAppointment}
        />
      </div>
    </div>
  );
}
