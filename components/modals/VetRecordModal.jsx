// components/modals/VetRecordModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  X, 
  Save, 
  Loader2, 
  PawPrint, 
  Hospital, 
  Clock, 
  User,
  Stethoscope, 
  Microscope, 
  Pill, 
  Syringe, 
  FileText, 
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function VetRecordModal({ isOpen, onClose, onSuccess, appointment }) {
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    prescription: "",
    treatment: "",
    notes: "",
    followUpDate: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment && isOpen) {
      // Pre-fill symptoms if available
      setFormData(prev => ({
        ...prev,
        symptoms: appointment.symptoms || ""
      }));
    }
  }, [appointment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = "Vui lòng nhập triệu chứng";
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Vui lòng nhập chẩn đoán";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Import API modules
      const { medicalRecordApi, appointmentApi, authApi } = await import('@/lib/api');
      
      // Get current vet user
      const userRes = await authApi.me();
      if (!userRes.success || !userRes.data?.employee?.employeeId) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      
      const veterinarianId = Number(userRes.data.employee.employeeId);
      const petId = Number(appointment.petId);
      
      // Create medical record
      const recordData = {
        petId: petId,
        veterinarianId: veterinarianId,
        appointmentId: appointment.id ? Number(appointment.id) : null,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment || '',
        medicalSummary: {
          symptoms: formData.symptoms,
          prescription: formData.prescription,
          notes: formData.notes
        },
        followUpDate: formData.followUpDate || null,
        examinationDate: new Date().toISOString()
      };
      
      const recordRes = await medicalRecordApi.create(recordData);
      
      if (!recordRes.success) {
        throw new Error(recordRes.error || 'Lỗi khi tạo hồ sơ bệnh án');
      }
      
      // Complete appointment if there's one
      if (appointment.id) {
        await appointmentApi.complete(appointment.id);
      }
      
      // Success
      onSuccess({
        appointmentId: appointment.id,
        recordData: { ...formData, recordId: recordRes.data?.recordId }
      });
      
      // Reset form
      setFormData({
        symptoms: "",
        diagnosis: "",
        prescription: "",
        treatment: "",
        notes: "",
        followUpDate: ""
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating medical record:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu hồ sơ' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      symptoms: "",
      diagnosis: "",
      prescription: "",
      treatment: "",
      notes: "",
      followUpDate: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Hồ sơ khám bệnh</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Info Card */}
          <div className="p-5 bg-pink-50 rounded-lg border-2 border-pink-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{appointment.petIcon || "🐾"}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {appointment.petName}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{appointment.petType}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Chủ: {appointment.ownerName} - {appointment.ownerPhone}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-pink-200 flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                {appointment.serviceIcon || "🏥"} {appointment.serviceName}
              </Badge>
              <Badge variant="outline" className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {appointment.time}
              </Badge>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              Triệu chứng
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Mô tả các triệu chứng quan sát được..."
              rows={3}
              className={cn(errors.symptoms && "border-destructive")}
            />
            {errors.symptoms && (
              <p className="text-sm text-destructive">{errors.symptoms}</p>
            )}
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-muted-foreground" />
              Chẩn đoán
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Nhập kết quả chẩn đoán..."
              rows={3}
              className={cn(errors.diagnosis && "border-destructive")}
            />
            {errors.diagnosis && (
              <p className="text-sm text-destructive">{errors.diagnosis}</p>
            )}
          </div>

          {/* Prescription */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
              Đơn thuốc
            </Label>
            <Textarea
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Kê đơn thuốc (tên thuốc, liều lượng, cách dùng)..."
              rows={4}
            />
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-muted-foreground" />
              Điều trị
            </Label>
            <Textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Mô tả các phương pháp điều trị đã thực hiện..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Ghi chú thêm
            </Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Lưu ý về chế độ chăm sóc, dinh dưỡng..."
              rows={3}
            />
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Ngày tái khám (nếu có)
            </Label>
            <Input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Submit Error Display */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu hồ sơ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

