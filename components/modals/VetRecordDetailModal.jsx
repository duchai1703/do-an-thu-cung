// components/modals/VetRecordDetailModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  X, 
  Calendar, 
  User, 
  Phone, 
  PawPrint, 
  Stethoscope, 
  Microscope, 
  Pill, 
  Syringe, 
  FileText, 
  RefreshCw,
  CheckCircle2,
  Hourglass,
  Hash,
  Home,
  Loader2,
  Edit,
  Save,
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils.js";
import { petApi, cageApi, medicalRecordApi } from "@/lib/api";

export default function VetRecordDetailModal({ isOpen, onClose, record, onUpdate }) {
  const [vaccination, setVaccination] = useState(null);
  const [cageAssignment, setCageAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    followUpDate: ''
  });

  // Initialize edit form when record changes
  useEffect(() => {
    if (record) {
      setEditForm({
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        prescription: record.prescription || '',
        notes: record.notes || '',
        followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : ''
      });
    }
  }, [record]);

  // Fetch related vaccination and cage data when modal opens
  useEffect(() => {
    if (isOpen && record?.id) {
      fetchRelatedData();
      setIsEditing(false);
    }
  }, [isOpen, record?.id]);

  const fetchRelatedData = async () => {
    if (!record?.petId) return;
    
    setLoading(true);
    try {
      
      // Fetch vaccination history for this pet
      const vacResponse = await petApi.getVaccinations(Number(record.petId));
      if (vacResponse.success && vacResponse.data?.length > 0) {
        // Find vaccination linked to this medical record
        let linkedVac = vacResponse.data.find(
          v => v.medicalRecordId === record.id || v.medicalRecordId === record.recordId
        );
        
        if (linkedVac) {
          // If vaccineType is not included, fetch vaccine types and map
          if (!linkedVac.vaccineType && linkedVac.vaccineTypeId) {
            try {
              const vtResponse = await medicalRecordApi.getVaccineTypes();
              if (vtResponse.success && vtResponse.data) {
                const vaccineType = vtResponse.data.find(
                  vt => vt.vaccineTypeId === linkedVac.vaccineTypeId
                );
                if (vaccineType) {
                  linkedVac = { ...linkedVac, vaccineType };
                }
              }
            } catch (e) {
              console.warn('Error fetching vaccine types:', e);
            }
          }
          setVaccination(linkedVac);
        }
      }
      
      // Fetch active cage assignment for this pet
      const cageResponse = await cageApi.getActiveAssignments();
      if (cageResponse.success && cageResponse.data?.length > 0) {
        const petCage = cageResponse.data.find(
          a => a.petId === Number(record.petId) && a.status === 'ACTIVE'
        );
        if (petCage) {
          setCageAssignment(petCage);
        }
      }
    } catch (error) {
      console.error('Error fetching related data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle save edited record
  const handleSave = async () => {
    if (!record?.id && !record?.recordId) return;
    
    setSaving(true);
    try {
      const recordId = record.recordId || record.id;
      const response = await medicalRecordApi.update(recordId, {
        diagnosis: editForm.diagnosis,
        treatment: editForm.treatment,
        medicalSummary: {
          symptoms: record.symptoms,
          prescription: editForm.prescription,
          notes: editForm.notes
        },
        followUpDate: editForm.followUpDate || null
      });
      
      if (response.success) {
        setIsEditing(false);
        if (onUpdate) onUpdate(response.data);
      } else {
        throw new Error(response.error || 'Lỗi khi cập nhật hồ sơ');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Chi tiết hồ sơ bệnh án</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Header */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground font-mono">{record.code}</span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {record.date}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {record.veterinarianName}
              </Badge>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="p-5 bg-card rounded-lg border-2 border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{record.petIcon || "🐾"}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {record.petName}
                </h3>
                <p className="text-sm text-muted-foreground">{record.petType}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Chủ nuôi:</span>
                <span className="font-semibold text-foreground">{record.ownerName}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Điện thoại:</span>
                <span className="font-semibold text-foreground">{record.ownerPhone}</span>
              </p>
            </div>
          </div>

          {/* Medical Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Triệu chứng
              </h3>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-foreground leading-relaxed">{record.symptoms}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Microscope className="h-4 w-4" />
                Chẩn đoán
              </h3>
              {isEditing ? (
                <Textarea
                  value={editForm.diagnosis}
                  onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 leading-relaxed">{record.diagnosis}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Đơn thuốc
              </h3>
              {isEditing ? (
                <Textarea
                  value={editForm.prescription}
                  onChange={(e) => setEditForm({ ...editForm, prescription: e.target.value })}
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{record.prescription}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Điều trị
              </h3>
              {isEditing ? (
                <Textarea
                  value={editForm.treatment}
                  onChange={(e) => setEditForm({ ...editForm, treatment: e.target.value })}
                  className="min-h-[80px]"
                />
              ) : (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{record.treatment}</p>
                </div>
              )}
            </div>

            {record.notes && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ghi chú
                </h3>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900 leading-relaxed">{record.notes}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Lịch tái khám
              </h3>
              <div className={cn(
                "p-4 rounded-lg border-2",
                record.isFollowUpOverdue 
                  ? "bg-red-50 border-red-300" 
                  : record.needsFollowUp 
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-green-50 border-green-200"
              )}>
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm font-semibold flex items-center gap-2",
                    record.isFollowUpOverdue ? "text-red-900" : 
                    record.needsFollowUp ? "text-yellow-900" : "text-green-900"
                  )}>
                    <Calendar className="h-4 w-4" />
                    {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString('vi-VN') : 'Chưa có lịch tái khám'}
                  </p>
                  {record.isFollowUpOverdue && (
                    <Badge variant="destructive" className="animate-pulse">
                      ⚠️ Quá hạn tái khám
                    </Badge>
                  )}
                  {!record.isFollowUpOverdue && record.needsFollowUp && (
                    <Badge variant="warning">
                      📅 Cần tái khám
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Summary Section - JSONB display */}
            {record.medicalSummary && Object.keys(record.medicalSummary).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tổng kết y tế (Chi tiết)
                </h3>
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 space-y-3">
                  {record.medicalSummary.symptoms && (
                    <div>
                      <span className="text-xs font-bold text-purple-700 uppercase">Triệu chứng:</span>
                      <p className="text-sm text-purple-900 mt-1">{record.medicalSummary.symptoms}</p>
                    </div>
                  )}
                  {record.medicalSummary.prescription && (
                    <div>
                      <span className="text-xs font-bold text-purple-700 uppercase">Đơn thuốc:</span>
                      <p className="text-sm text-purple-900 mt-1">{record.medicalSummary.prescription}</p>
                    </div>
                  )}
                  {record.medicalSummary.notes && (
                    <div>
                      <span className="text-xs font-bold text-purple-700 uppercase">Ghi chú bác sĩ:</span>
                      <p className="text-sm text-purple-900 mt-1">{record.medicalSummary.notes}</p>
                    </div>
                  )}
                  {/* Display any other fields in medicalSummary */}
                  {Object.entries(record.medicalSummary)
                    .filter(([key]) => !['symptoms', 'prescription', 'notes'].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs font-bold text-purple-700 uppercase">{key}:</span>
                        <p className="text-sm text-purple-900 mt-1">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Vaccination Section - if vaccination was included */}
          {vaccination && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Tiêm phòng kèm theo
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Loại vaccine:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {vaccination.vaccineType?.vaccineName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nhà sản xuất:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {vaccination.vaccineType?.manufacturer || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày tiêm:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {vaccination.administrationDate 
                      ? new Date(vaccination.administrationDate).toLocaleDateString('vi-VN') 
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vị trí tiêm:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    {vaccination.site || 'N/A'}
                  </span>
                </div>
                {vaccination.nextDueDate && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Hạn tiêm tiếp theo:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {new Date(vaccination.nextDueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {vaccination.reactions && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Phản ứng phụ:</span>
                    <span className="ml-2 text-yellow-700">{vaccination.reactions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cage Assignment Section - if pet is hospitalized */}
          {cageAssignment && (
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
              <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Điều trị nội trú
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Chuồng:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {cageAssignment.cage?.cageNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kích thước:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {cageAssignment.cage?.size || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vị trí:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {cageAssignment.cage?.location || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giá/ngày:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {Number(cageAssignment.dailyRate || cageAssignment.cage?.dailyRate || 0).toLocaleString()}đ
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày nhập:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {cageAssignment.checkInDate 
                      ? new Date(cageAssignment.checkInDate).toLocaleDateString('vi-VN') 
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dự kiến xuất:</span>
                  <span className="ml-2 font-semibold text-orange-900">
                    {cageAssignment.expectedCheckOutDate 
                      ? new Date(cageAssignment.expectedCheckOutDate).toLocaleDateString('vi-VN') 
                      : 'Chưa xác định'}
                  </span>
                </div>
              </div>
              <Badge className="mt-3 bg-green-600">Đang nội trú</Badge>
            </div>
          )}

          {/* Invoice Status */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            {record.invoiceCreated ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Hóa đơn</p>
                  <p className="text-sm font-bold text-foreground">Đã tạo - {record.invoiceId}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Hourglass className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Hóa đơn</p>
                  <p className="text-sm font-bold text-foreground">Chưa tạo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                <X className="h-4 w-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa hồ sơ
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                <X className="h-4 w-4 mr-1" />
                Đóng
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

