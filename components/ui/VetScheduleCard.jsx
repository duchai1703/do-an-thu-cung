// components/ui/VetScheduleCard.jsx
"use client";
import { 
  Clock, 
  Coffee,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Work Schedule Card Component displaying all schedule DTO fields
 * 
 * @param {Object} props
 * @param {Object} props.schedule - Schedule data from API
 * @param {function} props.onToggleAvailability - Callback to toggle availability
 * @param {boolean} props.compact - Compact mode
 */
export default function VetScheduleCard({
  schedule,
  onToggleAvailability,
  compact = false,
  className
}) {
  if (!schedule) return null;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Day of week short
  const getDayShort = (date) => {
    if (!date) return 'N/A';
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[new Date(date).getDay()];
  };

  // Get day number
  const getDayNumber = (date) => {
    if (!date) return '--';
    return new Date(date).getDate();
  };

  // Check if today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const d = new Date(date);
    return today.toDateString() === d.toDateString();
  };

  // Calculate break duration
  const getBreakDuration = () => {
    if (!schedule.breakStart || !schedule.breakEnd) return null;
    const start = schedule.breakStart.split(':');
    const end = schedule.breakEnd.split(':');
    const startMin = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMin = parseInt(end[0]) * 60 + parseInt(end[1]);
    return endMin - startMin;
  };

  const breakDuration = getBreakDuration();
  const today = isToday(schedule.workDate);

  if (compact) {
    // Compact mode for calendar views
    return (
      <div className={cn(
        "p-3 rounded-xl border-2 transition-all",
        today ? "border-primary bg-primary/5" : "border-gray-200 bg-white",
        schedule.isAvailable 
          ? "hover:border-green-300 hover:bg-green-50" 
          : "hover:border-red-300 hover:bg-red-50 opacity-75",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-bold",
              today 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-700"
            )}>
              <span className="text-[10px] uppercase">{getDayShort(schedule.workDate)}</span>
              <span>{getDayNumber(schedule.workDate)}</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Clock className="h-3 w-3" />
                {schedule.startTime?.substring(0, 5)} - {schedule.endTime?.substring(0, 5)}
              </div>
              <div className="text-xs text-muted-foreground">
                {schedule.workingHours || 8}h làm việc
              </div>
            </div>
          </div>
          <Badge 
            className={cn(
              "gap-1",
              schedule.isAvailable 
                ? "bg-green-100 text-green-700 border-green-200" 
                : "bg-red-100 text-red-700 border-red-200"
            )}
          >
            {schedule.isAvailable ? (
              <><CheckCircle2 className="h-3 w-3" /> Nhận lịch</>
            ) : (
              <><XCircle className="h-3 w-3" /> Nghỉ</>
            )}
          </Badge>
        </div>
      </div>
    );
  }

  // Full card mode
  return (
    <div className={cn(
      "rounded-2xl border-2 overflow-hidden bg-white transition-all duration-300",
      "hover:shadow-lg",
      today ? "border-primary ring-2 ring-primary/20" : "border-gray-200",
      !schedule.isAvailable && "opacity-80",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 bg-gradient-to-r",
        today 
          ? "from-primary/10 to-primary/5" 
          : "from-gray-50 to-white"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shadow-sm",
              today 
                ? "bg-gradient-to-br from-primary to-blue-600 text-white" 
                : "bg-white text-gray-700 border border-gray-200"
            )}>
              <span className="text-xs uppercase">{getDayShort(schedule.workDate)}</span>
              <span className="text-lg">{getDayNumber(schedule.workDate)}</span>
            </div>
            <div>
              <p className="font-semibold text-lg">{formatDate(schedule.workDate)}</p>
              {today && (
                <Badge variant="default" className="bg-primary text-white">
                  Hôm nay
                </Badge>
              )}
            </div>
          </div>
          {onToggleAvailability && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAvailability(schedule)}
              className={cn(
                "gap-2",
                schedule.isAvailable 
                  ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
                  : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              )}
            >
              {schedule.isAvailable ? (
                <><XCircle className="h-4 w-4" /> Xin nghỉ</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Đi làm</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Time Display */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <Clock className="h-8 w-8 text-blue-600" />
          <div className="flex-1">
            <p className="text-2xl font-bold text-blue-900">
              {schedule.startTime?.substring(0, 5)} - {schedule.endTime?.substring(0, 5)}
            </p>
            <p className="text-sm text-blue-700">
              Tổng: <span className="font-semibold">{schedule.workingHours || 8} giờ</span>
            </p>
          </div>
          <Badge 
            className={cn(
              "text-lg px-4 py-2",
              schedule.isAvailable 
                ? "bg-green-500 text-white" 
                : "bg-gray-400 text-white"
            )}
          >
            {schedule.isAvailable ? "✅ Làm việc" : "🚫 Nghỉ"}
          </Badge>
        </div>

        {/* Break Time */}
        {schedule.breakStart && schedule.breakEnd && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <Coffee className="h-6 w-6 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Giờ nghỉ trưa</p>
              <p className="text-sm text-amber-700">
                {schedule.breakStart?.substring(0, 5)} - {schedule.breakEnd?.substring(0, 5)}
                {breakDuration && (
                  <span className="ml-2">({breakDuration} phút)</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {schedule.notes && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">📝 Ghi chú:</span> {schedule.notes}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            ID: {schedule.id}
          </div>
          {!schedule.isAvailable && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Không nhận lịch hẹn
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
