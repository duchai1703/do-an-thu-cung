// components/ui/VetAppointmentCard.jsx
"use client";
import { 
  Clock, 
  User, 
  Phone, 
  Calendar,
  Stethoscope,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PawPrint,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Appointment Card Component displaying all appointment DTO fields
 * 
 * @param {Object} props
 * @param {Object} props.appointment - Appointment data from API
 * @param {function} props.onStart - Callback to start appointment
 * @param {function} props.onComplete - Callback to complete appointment
 * @param {function} props.onViewDetail - Callback to view detail modal
 * @param {boolean} props.compact - Compact mode for lists
 */
export default function VetAppointmentCard({
  appointment,
  onStart,
  onComplete,
  onViewDetail,
  compact = false,
  className
}) {
  if (!appointment) return null;

  // Status configuration
  const statusConfig = {
    PENDING: { 
      label: "Chờ khám", 
      icon: Clock, 
      color: "bg-amber-100 text-amber-700 border-amber-200",
      gradient: "from-amber-50 to-orange-50"
    },
    CONFIRMED: { 
      label: "Đã xác nhận", 
      icon: CheckCircle2, 
      color: "bg-blue-100 text-blue-700 border-blue-200",
      gradient: "from-blue-50 to-indigo-50"
    },
    IN_PROGRESS: { 
      label: "Đang khám", 
      icon: Stethoscope, 
      color: "bg-teal-100 text-teal-700 border-teal-200",
      gradient: "from-teal-50 to-cyan-50"
    },
    COMPLETED: { 
      label: "Hoàn thành", 
      icon: CheckCircle2, 
      color: "bg-green-100 text-green-700 border-green-200",
      gradient: "from-green-50 to-emerald-50"
    },
    CANCELLED: { 
      label: "Đã hủy", 
      icon: XCircle, 
      color: "bg-gray-100 text-gray-700 border-gray-200",
      gradient: "from-gray-50 to-slate-50"
    },
    NO_SHOW: { 
      label: "Không đến", 
      icon: AlertCircle, 
      color: "bg-red-100 text-red-700 border-red-200",
      gradient: "from-red-50 to-rose-50"
    }
  };

  const status = statusConfig[appointment.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  // Pet icon based on species
  const petIcon = appointment.pet?.species?.toLowerCase() === 'dog' ? '🐕' : 
                  appointment.pet?.species?.toLowerCase() === 'cat' ? '🐈' : '🐾';

  // Format time
  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (compact) {
    // Compact mode for tables/lists
    return (
      <div 
        onClick={onViewDetail}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl border-2 bg-gradient-to-r cursor-pointer",
          "hover:shadow-md transition-all duration-200",
          status.gradient,
          status.color.split(' ')[2], // border color
          className
        )}
      >
        {/* Time */}
        <div className="text-center w-16">
          <p className="text-lg font-bold text-foreground">{formatTime(appointment.time)}</p>
        </div>

        {/* Pet */}
        <div className="flex items-center gap-3 flex-1">
          <div className="text-3xl">{petIcon}</div>
          <div>
            <p className="font-semibold text-foreground">{appointment.pet?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{appointment.pet?.breed || appointment.pet?.species}</p>
          </div>
        </div>

        {/* Service */}
        <div className="hidden md:block flex-1">
          <p className="text-sm font-medium">{appointment.service?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">{appointment.service?.price?.toLocaleString()}đ</p>
        </div>

        {/* Status Badge */}
        <Badge className={cn("gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {appointment.status === 'CONFIRMED' && onStart && (
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={onStart}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          {appointment.status === 'IN_PROGRESS' && onComplete && (
            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Full card mode
  return (
    <div 
      onClick={onViewDetail}
      className={cn(
        "rounded-2xl border-2 overflow-hidden bg-white cursor-pointer",
        "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        status.color.split(' ')[2], // border color
        className
      )}
    >
      {/* Header with gradient */}
      <div className={cn(
        "p-4 bg-gradient-to-r",
        status.gradient
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">{formatTime(appointment.time)}</span>
            <span className="text-sm text-muted-foreground">• {formatDate(appointment.date)}</span>
          </div>
          <Badge className={cn("gap-1", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Pet Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl">
            {petIcon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{appointment.pet?.name || 'Unknown'}</h3>
              <Badge variant="outline" className="text-xs">
                {appointment.pet?.species === 'dog' ? '🐕 Chó' : '🐈 Mèo'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.pet?.breed || 'N/A'}</p>
            {appointment.pet?.weight && (
              <p className="text-xs text-muted-foreground">{appointment.pet.weight} kg</p>
            )}
          </div>
        </div>

        {/* Owner Info */}
        <div className="p-3 rounded-lg bg-gray-50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Chủ:</span>
            <span className="font-semibold">{appointment.pet?.owner?.fullName || appointment.ownerName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">SĐT:</span>
            <span className="font-semibold">{appointment.pet?.owner?.phoneNumber || appointment.ownerPhone || 'N/A'}</span>
          </div>
        </div>

        {/* Service Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">{appointment.service?.name || 'Khám tổng quát'}</p>
              <p className="text-xs text-blue-700">{appointment.service?.duration || 30} phút</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-blue-900">
              <DollarSign className="h-4 w-4" />
              <span className="font-bold">{appointment.service?.price?.toLocaleString() || '0'}đ</span>
            </div>
            {appointment.actualCost && appointment.actualCost !== appointment.service?.price && (
              <p className="text-xs text-muted-foreground">
                Thực thu: {appointment.actualCost.toLocaleString()}đ
              </p>
            )}
          </div>
        </div>

        {/* Notes if any */}
        {appointment.notes && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">📝 Ghi chú:</span> {appointment.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
          {appointment.status === 'CONFIRMED' && onStart && (
            <Button 
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              onClick={onStart}
            >
              <Play className="h-4 w-4 mr-2" />
              Bắt đầu khám
            </Button>
          )}
          {appointment.status === 'IN_PROGRESS' && onComplete && (
            <Button 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              onClick={onComplete}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          )}
          <Button 
            variant="outline"
            className="flex-1"
            onClick={onViewDetail}
          >
            <PawPrint className="h-4 w-4 mr-2" />
            Chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
}
