"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Send, 
  Bell, 
  Search, 
  PawPrint, 
  Cat, 
  Stethoscope, 
  Bath, 
  Scissors, 
  ClipboardList, 
  Phone, 
  Loader2,
  MessageCircle,
  Zap,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  MoreHorizontal,
  EyeIcon,
  Mail,
  PhoneCall
} from "lucide-react";
import { cn, formatAppointmentId } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await appointmentApi.getAll();
      
      if (response.success && response.data) {
        const now = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);

        const upcomingAppointments = response.data.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
          return aptDate && aptDate >= now && aptDate <= threeDaysLater && 
                 (apt.status === 'PENDING' || apt.status === 'CONFIRMED');
        });

        setReminders(upcomingAppointments);
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
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

  const filteredReminders = reminders.filter(reminder =>
    (reminder.pet?.owner?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reminder.pet?.owner?.phoneNumber || '').includes(searchTerm) ||
    formatAppointmentId(reminder.appointmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '🛁': return Bath;
      case '✂️': return Scissors;
      default: return ClipboardList;
    }
  };

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pendingCount = reminders.filter(r => !r.reminderSent).length;
  const sentCount = reminders.filter(r => r.reminderSent).length;

  const handleSendReminder = async (appointmentId) => {
    try {
      setSendingId(appointmentId);
      const reminder = reminders.find(r => r.appointmentId === appointmentId);
      
      await appointmentApi.update(appointmentId, {
        status: 'PENDING'
      });

      alert(`✅ Đã gửi nhắc lịch cho ${reminder.pet?.owner?.fullName || 'khách hàng'}`);
      await loadReminders();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Lỗi khi gửi nhắc lịch');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAll = async () => {
    if (confirm(`Gửi nhắc lịch cho tất cả ${pendingCount} khách hàng?`)) {
      try {
        setSendingAll(true);
        const pendingReminders = reminders.filter(r => !r.reminderSent);
        
        await Promise.all(
          pendingReminders.map(reminder => 
            appointmentApi.update(reminder.appointmentId, {
              reminderSent: true,
              lastReminderDate: new Date().toISOString()
            })
          )
        );

        alert(`✅ Đã gửi ${pendingCount} nhắc lịch thành công!`);
        await loadReminders();
      } catch (error) {
        console.error('Error sending all reminders:', error);
        alert('Lỗi khi gửi nhắc lịch');
      } finally {
        setSendingAll(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải danh sách nhắc lịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-200/40 to-amber-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gửi nhắc lịch</h1>
              <p className="text-gray-500">Thông báo nhắc lịch hẹn cho khách hàng</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => loadReminders()}
              variant="outline"
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
            <Button 
              onClick={handleSendAll} 
              disabled={pendingCount === 0 || sendingAll}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
            >
              {sendingAll ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Gửi tất cả ({pendingCount})
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Lịch sắp tới</p>
                  <p className="text-4xl font-bold mt-1">{reminders.length}</p>
                  <p className="text-white/70 text-xs mt-2">📅 Trong 3 ngày tới</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Cần gửi nhắc</p>
                  <p className="text-4xl font-bold mt-1">{pendingCount}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Cần xử lý
                  </p>
                </div>
                <div className="relative w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Đã gửi</p>
                  <p className="text-4xl font-bold mt-1">{sentCount}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Danh sách lịch sắp tới</h3>
                  <p className="text-sm text-gray-500">{filteredReminders.length} lịch hẹn cần nhắc</p>
                </div>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã..."
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
                    <TableHead className="font-bold text-gray-700">Mã</TableHead>
                    <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
                    <TableHead className="font-bold text-gray-700">Thú cưng</TableHead>
                    <TableHead className="font-bold text-gray-700">Dịch vụ</TableHead>
                    <TableHead className="font-bold text-gray-700">Ngày hẹn</TableHead>
                    <TableHead className="font-bold text-gray-700">Còn lại</TableHead>
                    <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-40">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium">Không có lịch hẹn nào</p>
                          <p className="text-sm">Tất cả đã được nhắc hoặc không có lịch sắp tới</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReminders.map((reminder) => {
                      const PetIcon = reminder.pet?.species === 'DOG' ? PawPrint : Cat;
                      const serviceIcon = getServiceIconFromType(reminder.service?.serviceCategory?.categoryName);
                      const ServiceIcon = getServiceIcon(serviceIcon);
                      const daysUntil = getDaysUntil(reminder.appointmentDate);
                      
                      return (
                        <TableRow 
                          key={reminder.appointmentId} 
                          className="group hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all"
                        >
                          <TableCell>
                            <Badge variant="outline" className="font-mono bg-gray-50 border-gray-200">
                              {formatAppointmentId(reminder.appointmentId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 font-bold">
                                {(reminder.pet?.owner?.fullName || 'N')[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{reminder.pet?.owner?.fullName || 'N/A'}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {reminder.pet?.owner?.phoneNumber || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <PetIcon className="w-4 h-4 text-amber-600" />
                              </div>
                              <span className="font-medium text-gray-700">{reminder.pet?.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ServiceIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-700">{reminder.service?.serviceName || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {reminder.appointmentDate ? new Date(reminder.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {reminder.startTime || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "shadow-lg border-0",
                              daysUntil <= 1 
                                ? "bg-gradient-to-r from-rose-400 to-red-500 text-white"
                                : daysUntil <= 2
                                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                                  : "bg-gradient-to-r from-emerald-400 to-green-500 text-white"
                            )}>
                              {daysUntil === 0 ? '🔥 Hôm nay' : daysUntil === 1 ? '⚡ Ngày mai' : `📅 ${daysUntil} ngày`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "shadow-lg border-0",
                              reminder.status === 'CONFIRMED' 
                                ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white"
                                : "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                            )}>
                              {reminder.status === 'CONFIRMED' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác nhận</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Chờ xác nhận</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSendReminder(reminder.appointmentId)}
                                disabled={sendingId === reminder.appointmentId}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
                              >
                                {sendingId === reminder.appointmentId ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4 mr-1" />
                                )}
                                Gửi
                              </Button>
                              
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
                                    onClick={() => alert(`Xem chi tiết lịch hẹn #${reminder.appointmentId}`)}
                                  >
                                    <EyeIcon className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>Xem chi tiết</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => alert(`Gọi điện: ${reminder.pet?.owner?.phoneNumber}`)}
                                  >
                                    <PhoneCall className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>Gọi điện</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => alert(`Gửi SMS: ${reminder.pet?.owner?.phoneNumber}`)}
                                  >
                                    <MessageCircle className="mr-2 h-4 w-4 text-violet-500" />
                                    <span>Gửi SMS</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => alert(`Gửi Email`)}
                                  >
                                    <Mail className="mr-2 h-4 w-4 text-rose-500" />
                                    <span>Gửi Email</span>
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
