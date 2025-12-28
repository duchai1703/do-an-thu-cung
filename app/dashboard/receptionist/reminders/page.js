"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Calendar, Clock, CheckCircle2, Send, Bell, Search, PawPrint, Cat, Stethoscope, Bath, Scissors, ClipboardList, Phone, Loader2 } from "lucide-react";
import { cn, formatAppointmentId } from "@/lib/utils";
import { appointmentApi, getToken } from "@/lib/api";

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

      // Get appointments that are upcoming (in the next 3 days)
      const response = await appointmentApi.getAll();
      
      if (response.success && response.data) {
        const now = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);

        // TODO: Fix this. Don't filter on client side.
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

  const pendingCount = reminders.filter(r => !r.reminderSent).length;
  const sentCount = reminders.filter(r => r.reminderSent).length;

  const handleSendReminder = async (appointmentId) => {
    try {
      const reminder = reminders.find(r => r.appointmentId === appointmentId);
      // In a real implementation, this would send an email/SMS
      // For now, we'll just update the appointment to mark reminder as sent
      const response = await appointmentApi.update(appointmentId, {
        status: 'PENDING',
        // lastReminderDate: new Date().toISOString()
      });

      if (response.success) {
        alert(`✅ Đã gửi nhắc lịch cho ${reminder.pet?.owner?.fullName || 'khách hàng'}`);
        await loadReminders();
      } else {
        alert('Lỗi khi gửi nhắc lịch: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Lỗi khi gửi nhắc lịch');
    }
  };

  const handleSendAll = async () => {
    if (confirm(`Gửi nhắc lịch cho tất cả ${pendingCount} khách hàng?`)) {
      try {
        const pendingReminders = reminders.filter(r => !r.reminderSent);
        
        // Send reminders for all pending appointments
        await Promise.all(
          pendingReminders.map(reminder => 
            appointmentApi.update(reminder.appointmentId, {
              reminderSent: true,
              lastReminderDate: new Date().toISOString()
            })
          )
        );

        alert(`✅ Đã gửi ${pendingCount} nhắc lịch`);
        await loadReminders();
      } catch (error) {
        console.error('Error sending all reminders:', error);
        alert('Lỗi khi gửi nhắc lịch');
      }
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Gửi nhắc lịch"
        subtitle="Gửi thông báo nhắc lịch cho khách hàng trước giờ hẹn"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch sắp tới</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reminders.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Cần gửi nhắc</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Đã gửi</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{sentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Danh sách lịch sắp tới</h3>
                <p className="text-sm text-muted-foreground">{filteredReminders.length} lịch hẹn cần nhắc</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSendAll} disabled={pendingCount === 0}>
                <Send className="h-4 w-4 mr-2" /> Gửi tất cả nhắc lịch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Thú cưng</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Lần gửi cuối</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <Bell className="mx-auto h-8 w-8 mb-2" />
                    Không có lịch hẹn nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredReminders.map((reminder) => {
                  const statusBadge = reminder.status == 'PENDING'
                    ? { label: 'Đã gửi', variant: 'success', icon: CheckCircle2 }
                    : { label: 'Cần gửi', variant: 'warning', icon: Clock };
                  const PetIcon = reminder.pet?.species === 'DOG' ? PawPrint : Cat;
                  const serviceIcon = getServiceIconFromType(reminder.service?.serviceCategory?.categoryName);
                  const ServiceIcon = getServiceIcon(serviceIcon);
                  const customerName = reminder.pet?.owner?.fullName || 'N/A';
                  const phone = reminder.pet?.owner?.phoneNumber || 'N/A';
                  const petName = reminder.pet?.name || 'N/A';
                  const serviceName = reminder.service?.serviceName || 'N/A';
                  const date = reminder.appointmentDate ? new Date(reminder.appointmentDate).toISOString().split('T')[0] : 'N/A';
                  const time = reminder.startTime || 'N/A';
                  const lastReminder = reminder.status == 'PENDING' ? 'Chưa gửi': (reminder.lastReminderDate ? new Date(reminder.lastReminderDate).toLocaleString('vi-VN') : 'Đã gửi');
                  
                  return (
                    <TableRow key={reminder.appointmentId}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">{formatAppointmentId(reminder.appointmentId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customerName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PetIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{petName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                          <span>{serviceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {date}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{lastReminder}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handleSendReminder(reminder.appointmentId)}
                          disabled={reminder.reminderSent}
                          variant={!reminder.reminderSent ? 'default' : 'secondary'}
                        >
                          <Send className="h-4 w-4 mr-2" /> Gửi
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
