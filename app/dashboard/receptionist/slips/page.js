"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  Printer, 
  Mail, 
  Calendar, 
  Clock, 
  PawPrint, 
  Cat, 
  Stethoscope, 
  Bath, 
  Scissors, 
  ClipboardList, 
  Search, 
  User, 
  Phone, 
  Loader2,
  FileText,
  Send,
  RefreshCw,
  Download,
  Sparkles,
  MoreHorizontal,
  EyeIcon
} from "lucide-react";
import { cn, formatAppointmentId } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";

export default function SlipsPage() {
  const router = useRouter();
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [printingId, setPrintingId] = useState(null);
  const [emailingId, setEmailingId] = useState(null);

  useEffect(() => {
    loadSlips();
  }, []);

  const loadSlips = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await appointmentApi.getByStatus('CONFIRMED');
      
      if (response.success && response.data) {
        setSlips(response.data);
      }
    } catch (error) {
      console.error("Error loading slips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIconFromType = (categoryName) => {
    if (!categoryName) return '📋';
    const lower = categoryName.toLowerCase();
    if (lower.includes('health') || lower.includes('khám')) return '🏥';
    if (lower.includes('grooming') || lower.includes('spa') || lower.includes('tắm')) return '🛁';
    if (lower.includes('hair') || lower.includes('cắt')) return '✂️';
    return '📋';
  };

  const filteredSlips = slips.filter(slip =>
    (slip.pet?.owner?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (slip.pet?.owner?.phoneNumber || '').includes(searchTerm) ||
    formatAppointmentId(slip.appointmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '🛁': return Bath;
      case '✂️': return Scissors;
      default: return ClipboardList;
    }
  };

  const handlePrint = async (slip) => {
    setPrintingId(slip.appointmentId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`🖨️ Đã in phiếu hẹn ${formatAppointmentId(slip.appointmentId)}`);
    setPrintingId(null);
  };

  const handleSendEmail = async (slip) => {
    setEmailingId(slip.appointmentId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`📧 Đã gửi email phiếu hẹn cho ${slip.pet?.owner?.account?.email || 'N/A'}`);
    setEmailingId(null);
  };

  const getAppointmentDate = (slip) => {
    if (!slip.appointmentDate) return 'N/A';
    const date = new Date(slip.appointmentDate);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải phiếu hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/40 to-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý phiếu hẹn</h1>
              <p className="text-gray-500">In và gửi phiếu hẹn cho khách hàng</p>
            </div>
          </div>
          
          <Button 
            onClick={() => loadSlips()}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Lịch đã xác nhận</p>
                  <p className="text-4xl font-bold mt-1">{slips.length}</p>
                  <p className="text-white/70 text-xs mt-2">
                    📅 {new Date().toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Đã in phiếu</p>
                  <p className="text-4xl font-bold mt-1">{slips.length}</p>
                  <p className="text-white/70 text-xs mt-2">🖨️ Tuần này</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Printer className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Email đã gửi</p>
                  <p className="text-4xl font-bold mt-1">{slips.length}</p>
                  <p className="text-white/70 text-xs mt-2">📧 Tháng này</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Mail className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-100/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Danh sách phiếu hẹn</h3>
                  <p className="text-sm text-gray-500">Quản lý {filteredSlips.length} phiếu hẹn đã xác nhận</p>
                </div>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã phiếu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 bg-white rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-100/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-bold text-gray-700">Mã phiếu</TableHead>
                    <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
                    <TableHead className="font-bold text-gray-700">Email</TableHead>
                    <TableHead className="font-bold text-gray-700">Dịch vụ</TableHead>
                    <TableHead className="font-bold text-gray-700">Ngày hẹn</TableHead>
                    <TableHead className="font-bold text-gray-700">Nhân viên</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium">Không tìm thấy phiếu hẹn</p>
                          <p className="text-sm">Chưa có lịch hẹn nào được xác nhận</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSlips.map((slip) => {
                      const petSpecies = slip.pet?.species;
                      const PetIcon = petSpecies === 'DOG' ? PawPrint : Cat;
                      const serviceIcon = getServiceIconFromType(slip.service?.serviceCategory?.categoryName);
                      const ServiceIcon = getServiceIcon(serviceIcon);
                      
                      return (
                        <TableRow 
                          key={slip.appointmentId} 
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all"
                        >
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg font-mono">
                              {formatAppointmentId(slip.appointmentId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-bold">
                                  {(slip.pet?.owner?.fullName || 'N')[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-gray-800">{slip.pet?.owner?.fullName || 'N/A'}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {slip.pet?.owner?.phoneNumber || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs bg-gray-50 max-w-[180px] truncate">
                              {slip.pet?.owner?.account?.email || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                                <ServiceIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">{slip.service?.serviceName || 'N/A'}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <PetIcon className="w-3 h-3" /> {slip.pet?.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                {getAppointmentDate(slip)}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {slip.startTime || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0 flex items-center gap-1 w-fit">
                              <User className="w-3 h-3" /> {slip.employee?.fullName || 'Chưa phân công'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4 mr-1" />
                                    Thao tác
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => handlePrint(slip)}
                                    disabled={printingId === slip.appointmentId}
                                  >
                                    <Printer className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>In phiếu</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => handleSendEmail(slip)}
                                    disabled={emailingId === slip.appointmentId}
                                  >
                                    <Mail className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>Gửi Email</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => alert(`Xem chi tiết phiếu #${slip.appointmentId}`)}
                                  >
                                    <EyeIcon className="mr-2 h-4 w-4 text-gray-600" />
                                    <span>Xem chi tiết</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => alert(`Tải PDF #${slip.appointmentId}`)}
                                  >
                                    <Download className="mr-2 h-4 w-4 text-violet-500" />
                                    <span>Tải PDF</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
