// components/modals/CageDetailModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Eye, 
  X, 
  BarChart3, 
  PawPrint, 
  FileText, 
  Home, 
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  History,
  DollarSign,
  MapPin,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils.js";
import { cageApi } from "@/lib/api";

export default function CageDetailModal({ isOpen, onClose, cage }) {
  const [loading, setLoading] = useState(false);
  const [cageDetails, setCageDetails] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  // Fetch cage details when modal opens
  useEffect(() => {
    if (isOpen && cage?.id) {
      fetchCageDetails();
    }
  }, [isOpen, cage?.id]);

  const fetchCageDetails = async () => {
    setLoading(true);
    try {
      // Fetch cage details
      const detailRes = await cageApi.getById(cage.id);
      if (detailRes.success && detailRes.data) {
        setCageDetails(detailRes.data);
      }

      // Fetch current assignment
      try {
        const currentRes = await cageApi.getCurrentAssignment(cage.id);
        if (currentRes.success && currentRes.data) {
          setCurrentAssignment(currentRes.data);
        } else {
          setCurrentAssignment(null);
        }
      } catch (e) {
        setCurrentAssignment(null);
      }

      // Fetch assignment history
      try {
        const historyRes = await cageApi.getAssignments(cage.id);
        if (historyRes.success && historyRes.data) {
          setAssignmentHistory(historyRes.data.slice(0, 10)); // Last 10
        }
      } catch (e) {
        setAssignmentHistory([]);
      }
    } catch (error) {
      console.error('Error fetching cage details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !cage) return null;

  const getStatusBadge = (status) => {
    const badges = {
      available: { label: "🟢 Trống", icon: CheckCircle2, bg: "bg-green-500" },
      occupied: { label: "🔴 Đang dùng", icon: AlertCircle, bg: "bg-amber-500" },
      maintenance: { label: "🔧 Bảo trì", icon: XCircle, bg: "bg-gray-500" },
      reserved: { label: "📅 Đã đặt", icon: Clock, bg: "bg-blue-500" }
    };
    return badges[status?.toLowerCase()] || badges.available;
  };

  const getSizeBadge = (size) => {
    const sizes = {
      small: { label: 'Nhỏ', icon: '🐕' },
      medium: { label: 'Vừa', icon: '🐕‍🦺' },
      large: { label: 'Lớn', icon: '🦮' }
    };
    return sizes[size?.toLowerCase()] || sizes.medium;
  };

  const statusBadge = getStatusBadge(cage.status);
  const sizeBadge = getSizeBadge(cage.size);
  const StatusIcon = statusBadge.icon;
  const data = cageDetails || cage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Premium Gradient Header based on status */}
        <div className={cn(
          "relative overflow-hidden rounded-t-lg",
          cage.status === 'available' ? "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600" :
          cage.status === 'occupied' ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" :
          cage.status === 'maintenance' ? "bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600" :
          "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600"
        )}>
          {/* Floating decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {['🏠', '🐕', '🐈', '💤'].map((icon, i) => (
              <span 
                key={i}
                className="absolute text-white/10 text-3xl"
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${20 + (i % 2) * 40}%`,
                  animation: `float ${3 + i % 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              >
                {icon}
              </span>
            ))}
          </div>
          
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-5">
              <div className="text-4xl w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl font-bold">
                {cage.number || cage.code || 'C'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1 drop-shadow-sm">
                  Chuồng {cage.number || cage.code}
                </h1>
                <p className="text-white/80 text-sm mb-3">
                  {data.location || 'Khu vực chính'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                    cage.status === 'available' ? "bg-white/30" : "bg-white/20"
                  )}>
                    {statusBadge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {sizeBadge.icon} {sizeBadge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    💰 {(data.dailyRate || 0).toLocaleString()}đ/ngày
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Cage Info Card */}
            <div className="p-5 bg-muted rounded-xl border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Thông tin chuồng
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <Badge className={statusBadge.bg}>{statusBadge.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Trạng thái</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xl">{sizeBadge.icon}</p>
                  <p className="font-semibold">{sizeBadge.label}</p>
                  <p className="text-xs text-muted-foreground">Kích cỡ</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto text-emerald-600" />
                  <p className="font-semibold">{(data.dailyRate || 0).toLocaleString()}đ</p>
                  <p className="text-xs text-muted-foreground">Giá/ngày</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <MapPin className="h-5 w-5 mx-auto text-blue-500" />
                  <p className="font-semibold text-sm">{data.location || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Vị trí</p>
                </div>
              </div>
              {data.features && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Tiện ích:</p>
                  <div className="flex flex-wrap gap-2">
                    {String(data.features).split(',').map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    📝 Ghi chú:
                  </p>
                  <div className="p-3 bg-background rounded-lg border border-dashed">
                    <p className="text-sm text-foreground">{data.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Timestamps - createdAt, updatedAt */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  📅 Tạo: {data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  🔄 Cập nhật: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            <div className={cn(
              "p-5 rounded-xl border",
              currentAssignment ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
            )}>
              <h3 className={cn(
                "text-sm font-semibold mb-4 flex items-center gap-2",
                currentAssignment ? "text-amber-800" : "text-green-800"
              )}>
                <PawPrint className="h-4 w-4" />
                {currentAssignment ? "Thú cưng đang ở" : "Chuồng trống"}
              </h3>
              {currentAssignment ? (
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {currentAssignment.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{currentAssignment.pet?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{currentAssignment.pet?.breed || 'N/A'}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        In: {currentAssignment.checkInDate ? new Date(currentAssignment.checkInDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Out: {currentAssignment.expectedCheckOutDate ? new Date(currentAssignment.expectedCheckOutDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                    {currentAssignment.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">📝 {currentAssignment.notes}</p>
                    )}
                  </div>
                  <Badge className="bg-amber-500">Đang ở</Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Sẵn sàng nhận thú cưng mới</p>
                </div>
              )}
            </div>

            {/* Assignment History */}
            <div className="p-5 bg-muted rounded-xl border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử sử dụng ({assignmentHistory.length} lượt)
              </h3>
              {assignmentHistory.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {assignmentHistory.map((asn, idx) => (
                    <div key={asn.assignmentId || idx} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="text-2xl">
                        {asn.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{asn.pet?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {asn.checkInDate ? new Date(asn.checkInDate).toLocaleDateString('vi-VN') : '?'}
                          {' → '}
                          {asn.actualCheckOutDate 
                            ? new Date(asn.actualCheckOutDate).toLocaleDateString('vi-VN') 
                            : asn.expectedCheckOutDate 
                              ? new Date(asn.expectedCheckOutDate).toLocaleDateString('vi-VN') + ' (dự kiến)'
                              : '?'}
                        </p>
                      </div>
                      <Badge 
                        variant={asn.status === 'ACTIVE' ? 'warning' : 'secondary'}
                        className={asn.status === 'ACTIVE' ? 'bg-amber-500' : ''}
                      >
                        {asn.status === 'ACTIVE' ? 'Đang ở' : 'Đã ra'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Chưa có lịch sử sử dụng</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-1" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
