// components/modals/VetPatientDetailModal.jsx
"use client";
import { 
  Eye, 
  X, 
  PawPrint, 
  BarChart3, 
  Scale, 
  Palette, 
  Cake, 
  User, 
  Phone,
  Calendar,
  Hash,
  FileText,
  TrendingUp,
  Syringe,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils.js";

export default function VetPatientDetailModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Premium Gradient Header */}
        <div className={cn(
          "relative overflow-hidden rounded-t-lg",
          patient.type === 'dog' 
            ? "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500"
            : "bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500"
        )}>
          {/* Floating decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[patient.icon || "🐾", "💊", "💉", "🏥"].map((icon, i) => (
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
              <div className="text-6xl w-24 h-24 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl shrink-0">
                {patient.icon || "🐾"}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 drop-shadow-sm">
                  {patient.name}
                </h1>
                <p className="text-white/80 text-lg mb-3">
                  {patient.breed}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {patient.type === 'dog' ? '🐕 Chó' : '🐈 Mèo'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {patient.gender}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {patient.age}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Profile Card */}
          <div className="p-5 bg-card rounded-lg border-2 border-border">

            {/* Basic Info */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background flex-shrink-0">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Cân nặng</p>
                    <p className="text-base font-bold text-foreground">{patient.weight}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background flex-shrink-0">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Màu lông</p>
                    <p className="text-base font-bold text-foreground">{patient.color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg md:col-span-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background flex-shrink-0">
                    <Cake className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Ngày sinh</p>
                    <p className="text-base font-bold text-foreground">{patient.dateOfBirth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Info - Enhanced với đầy đủ fields */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                Thông tin chủ nuôi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Owner Name & ID */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex-shrink-0 shadow-md">
                    {(patient.ownerName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Chủ nuôi</p>
                    <p className="text-base font-bold text-foreground truncate">{patient.ownerName}</p>
                    {patient.ownerId && (
                      <p className="text-xs text-muted-foreground">ID: #{patient.ownerId}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-1">Điện thoại</p>
                    <p className="text-base font-bold text-foreground truncate">{patient.ownerPhone}</p>
                  </div>
                </div>

                {/* Email - NEW */}
                {patient.ownerEmail && patient.ownerEmail !== 'N/A' && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 flex-shrink-0">
                      <span className="text-lg">📧</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Email</p>
                      <p className="text-sm font-medium text-foreground truncate" title={patient.ownerEmail}>{patient.ownerEmail}</p>
                    </div>
                  </div>
                )}

                {/* Address - NEW */}
                {patient.ownerAddress && patient.ownerAddress !== 'N/A' && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 flex-shrink-0">
                      <span className="text-lg">🏠</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Địa chỉ</p>
                      <p className="text-sm font-medium text-foreground line-clamp-2" title={patient.ownerAddress}>{patient.ownerAddress}</p>
                    </div>
                  </div>
                )}

                {/* Account Status - NEW */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 flex-shrink-0">
                    {patient.ownerActive ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Trạng thái tài khoản</p>
                    <Badge variant={patient.ownerActive ? "success" : "destructive"} className="text-xs">
                      {patient.ownerActive ? '✅ Đang hoạt động' : '❌ Không hoạt động'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Pet Statistics */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                Thống kê khám
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-rose-600 uppercase mb-1">Lần khám gần nhất</p>
                    <p className="text-base font-bold text-foreground">{patient.lastVisit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 flex-shrink-0">
                    <Hash className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-violet-600 uppercase mb-1">Tổng số lần khám</p>
                    <p className="text-base font-bold text-foreground">{patient.totalVisits} lần</p>
                  </div>
                </div>

                {patient.vaccinationCount !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-lg border border-fuchsia-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-100 flex-shrink-0">
                      <Syringe className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-fuchsia-600 uppercase mb-1">Đã tiêm phòng</p>
                      <p className="text-base font-bold text-foreground">{patient.vaccinationCount} mũi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Date - NEW */}
            {patient.createdAt && (
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 flex-shrink-0">
                    <span className="text-lg">📝</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-sky-600 uppercase mb-1">Ngày đăng ký</p>
                    <p className="text-sm font-bold text-sky-700">
                      {new Date(patient.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History */}
            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lịch sử khám bệnh
                </h3>
                <div className="space-y-3">
                  {patient.medicalHistory.map((record, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg border border-border">
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {record.date}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong className="text-foreground">Chẩn đoán:</strong>{' '}
                          <span className="text-muted-foreground">{record.diagnosis}</span>
                        </p>
                        <p>
                          <strong className="text-foreground">Điều trị:</strong>{' '}
                          <span className="text-muted-foreground">{record.treatment}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vaccination History */}
            {patient.vaccinationHistory && patient.vaccinationHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  Lịch sử tiêm phòng ({patient.vaccinationHistory.length} lần)
                </h3>
                <div className="space-y-3">
                  {patient.vaccinationHistory.map((vac, index) => {
                    const isOverdue = vac.daysUntilDue !== null && vac.daysUntilDue < 0;
                    const isUpcoming = vac.daysUntilDue !== null && vac.daysUntilDue >= 0 && vac.daysUntilDue <= 14;
                    return (
                      <div key={index} className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : isUpcoming ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{vac.vaccineName || 'Vaccine'}</p>
                            {vac.manufacturer && (
                              <p className="text-xs text-muted-foreground">{vac.manufacturer}</p>
                            )}
                          </div>
                          {isOverdue ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Quá hạn
                            </Badge>
                          ) : isUpcoming ? (
                            <Badge variant="warning" className="flex items-center gap-1 bg-yellow-500">
                              <AlertCircle className="h-3 w-3" /> Sắp đến hạn
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1 bg-green-500">
                              <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ngày tiêm: {vac.date ? new Date(vac.date).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                        <div className="space-y-1 text-sm">
                          {vac.nextDue && (
                            <p>
                              <strong className="text-foreground">Hạn tiếp theo:</strong>{' '}
                              <span className="text-muted-foreground">{new Date(vac.nextDue).toLocaleDateString('vi-VN')}</span>
                            </p>
                          )}
                          {vac.site && (
                            <p>
                              <strong className="text-foreground">Vị trí tiêm:</strong>{' '}
                              <span className="text-muted-foreground">{vac.site}</span>
                            </p>
                          )}
                          {vac.batchNumber && (
                            <p>
                              <strong className="text-foreground">Mã lô:</strong>{' '}
                              <span className="font-mono text-muted-foreground">{vac.batchNumber}</span>
                            </p>
                          )}
                          {vac.reactions && (
                            <p>
                              <strong className="text-foreground">Phản ứng phụ:</strong>{' '}
                              <span className="text-red-600">{vac.reactions}</span>
                            </p>
                          )}
                          {vac.administeredByName && (
                            <p>
                              <strong className="text-foreground">Bác sĩ tiêm:</strong>{' '}
                              <span className="text-muted-foreground">{vac.administeredByName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No vaccination history message */}
            {(!patient.vaccinationHistory || patient.vaccinationHistory.length === 0) && (
              <div className="p-4 bg-muted rounded-lg border border-border text-center">
                <Syringe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chưa có lịch sử tiêm phòng</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            <X className="h-4 w-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

