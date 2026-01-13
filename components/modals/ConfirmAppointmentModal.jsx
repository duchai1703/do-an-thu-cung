"use client";
import { 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Phone, 
  PawPrint, 
  Calendar, 
  Clock,
  Hash
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, formatAppointmentId } from "@/lib/utils.js";

export default function ConfirmAppointmentModal({ isOpen, onClose, appointment, onConfirm }) {
  if (!isOpen || !appointment) return null;

  const petIcon = appointment.pet?.species === 'DOG' ? '🐕' : appointment.pet?.species === 'CAT' ? '🐈' : '🐾';
  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : 'N/A';
  
  const getServiceIcon = (categoryName) => {
    if (!categoryName) return '📋';
    const lower = categoryName.toLowerCase();
    if (lower.includes('health') || lower.includes('khám')) return '🏥';
    if (lower.includes('grooming') || lower.includes('spa') || lower.includes('tắm')) return '🛁';
    if (lower.includes('hair') || lower.includes('cắt')) return '✂️';
    return '📋';
  };

  const serviceIcon = getServiceIcon(appointment.service?.serviceCategory?.categoryName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle>Xác nhận lịch hẹn</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Info Card */}
          <div className="p-5 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Khách hàng</p>
                  <p className="text-sm font-bold text-green-900">{appointment.pet?.owner?.fullName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Số điện thoại</p>
                  <p className="text-sm font-bold text-green-900">{appointment.pet?.owner?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PawPrint className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Thú cưng</p>
                  <p className="text-sm font-bold text-green-900">
                    {petIcon} {appointment.pet?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{serviceIcon}</span>
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Dịch vụ</p>
                  <p className="text-sm font-bold text-green-900">
                    {/* Use appointmentServices array if available, otherwise fall back to service */}
                    {appointment.appointmentServices && appointment.appointmentServices.length > 0
                      ? appointment.appointmentServices
                          .map(as => as.service?.serviceName || as.serviceName || 'Dịch vụ')
                          .join(', ')
                      : (appointment.service?.serviceName || appointment.allServicesDisplay || 'N/A')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Ngày & Giờ</p>
                  <p className="text-sm font-bold text-green-900">
                    {appointmentDate} - {appointment.startTime || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-green-700" />
                <div>
                  <p className="text-xs font-semibold text-green-800 uppercase">Mã lịch</p>
                  <p className="text-sm font-bold text-green-900 font-mono">{formatAppointmentId(appointment.appointmentId)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Box */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-700 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900 leading-relaxed">
              Sau khi xác nhận, hệ thống sẽ gửi thông báo cho khách hàng qua email và SMS.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
            Xác nhận lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

