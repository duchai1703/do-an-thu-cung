"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  PawPrint, 
  Stethoscope,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Printer,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppointmentDetailModal({ isOpen, onClose, appointment }) {
  const [printing, setPrinting] = useState(false);
  const [emailing, setEmailing] = useState(false);

  if (!appointment) return null;

  const handlePrint = async () => {
    setPrinting(true);
    // Wait a bit for the print dialog to render
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  };

  const handleSendEmail = async () => {
    setEmailing(true);
    try {
      // TODO: Integrate with backend email API
      // await appointmentApi.sendEmail(appointment.appointmentId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('✅ Đã gửi email xác nhận tới ' + (appointment.pet?.owner?.account?.email || 'khách hàng'));
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Lỗi khi gửi email');
    } finally {
      setEmailing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "--";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { label: 'Chờ xác nhận', className: 'from-amber-400 to-orange-500', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', className: 'from-blue-400 to-cyan-500', icon: CheckCircle2 };
      case 'IN_PROGRESS':
        return { label: 'Đang thực hiện', className: 'from-violet-400 to-purple-500', icon: Stethoscope };
      case 'COMPLETED':
        return { label: 'Hoàn thành', className: 'from-emerald-400 to-green-500', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Đã hủy', className: 'from-gray-400 to-gray-500', icon: XCircle };
      default:
        return { label: status, className: 'from-gray-400 to-gray-500', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header with gradient */}
        <div className={cn(
          "relative overflow-hidden p-6 text-white bg-gradient-to-r",
          statusConfig.className
        )}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                {appointment.pet?.species === 'DOG' ? '🐕' : appointment.pet?.species === 'CAT' ? '🐈' : '🐾'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{appointment.pet?.name}</h2>
                <p className="text-white/80">{appointment.pet?.breed || appointment.pet?.species}</p>
              </div>
            </div>
            
            <Badge className="bg-white/20 text-white border-0 px-4 py-2">
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
          {/* Appointment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Ngày hẹn</span>
              </div>
              <p className="text-gray-800 font-semibold">{formatDate(appointment.appointmentDate)}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Thời gian</span>
              </div>
              <p className="text-gray-800 font-semibold">
                {appointment.startTime || '--:--'} - {appointment.endTime || '--:--'}
              </p>
            </div>
          </div>

          {/* Service */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Stethoscope className="w-5 h-5" />
              <span className="font-medium">Dịch vụ</span>
            </div>
            <p className="text-gray-800 font-semibold text-lg">{appointment.service?.serviceName || 'N/A'}</p>
            <p className="text-gray-500 text-sm">{appointment.service?.serviceCategory?.categoryName || ''}</p>
          </div>

          {/* Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Chi phí ước tính</span>
              </div>
              <p className="text-amber-700 font-bold text-xl">{formatCurrency(appointment.estimatedCost)}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Chi phí thực tế</span>
              </div>
              <p className="text-green-700 font-bold text-xl">{formatCurrency(appointment.actualCost)}</p>
            </div>
          </div>

          {/* Employee */}
          {appointment.employee && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Nhân viên phụ trách</span>
              </div>
              <p className="text-gray-800 font-semibold">{appointment.employee.fullName}</p>
            </div>
          )}

          {/* Customer Info */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <User className="w-5 h-5" />
              <span className="font-medium">Thông tin chủ thú cưng</span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-800 font-semibold text-lg">{appointment.pet?.owner?.fullName || 'N/A'}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{appointment.pet?.owner?.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{appointment.pet?.owner?.account?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Ghi chú</span>
              </div>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0 flex gap-3">
          <Button 
            onClick={handlePrint}
            disabled={printing}
            variant="outline"
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {printing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            In phiếu
          </Button>
          
          <Button 
            onClick={handleSendEmail}
            disabled={emailing || !appointment.pet?.owner?.account?.email}
            variant="outline"
            className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            {emailing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Gửi email
          </Button>
          
          <Button 
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
