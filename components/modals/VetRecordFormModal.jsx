// components/modals/VetRecordFormModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Edit, 
  Plus, 
  X, 
  Save, 
  Check, 
  Loader2, 
  PawPrint, 
  Stethoscope, 
  Microscope, 
  Pill, 
  Syringe, 
  FileText, 
  RefreshCw,
  User,
  Phone
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";
import { medicalRecordApi, authApi } from "@/lib/api";

export default function VetRecordFormModal({ isOpen, onClose, onSuccess, record }) {
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    petIcon: "",
    petType: "",
    ownerId: "",
    ownerName: "",
    ownerPhone: "",
    symptoms: "",
    diagnosis: "",
    prescription: "",
    treatment: "",
    notes: "",
    followUpDate: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [pets, setPets] = useState([]);

  // Load pets from API when modal opens
  useEffect(() => {
    if (isOpen && !record) {
      loadPets();
    }
  }, [isOpen, record]);

  const loadPets = async () => {
    try {
      setLoadingPets(true);
      const { petApi } = await import('@/lib/api');
      const response = await petApi.getAll();
      
      if (response.success && response.data) {
        const mappedPets = response.data.map(pet => ({
          id: pet.petId,
          name: pet.name,
          icon: pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          type: `${pet.species || ''} ${pet.breed || ''}`.trim(),
          ownerId: pet.owner?.petOwnerId,
          ownerName: pet.owner?.fullName || pet.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: pet.owner?.phoneNumber || 'N/A',
          ownerEmail: pet.owner?.account?.email || 'N/A'
        }));
        setPets(mappedPets);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    if (record && isOpen) {
      // Edit mode
      setFormData({
        petId: record.petId,
        petName: record.petName,
        petIcon: record.petIcon,
        petType: record.petType,
        ownerId: record.ownerId,
        ownerName: record.ownerName,
        ownerPhone: record.ownerPhone,
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        treatment: record.treatment,
        notes: record.notes,
        followUpDate: record.followUpDate
      });
    } else if (isOpen) {
      // Create mode
      setFormData({
        petId: "",
        petName: "",
        petIcon: "",
        petType: "",
        ownerId: "",
        ownerName: "",
        ownerPhone: "",
        symptoms: "",
        diagnosis: "",
        prescription: "",
        treatment: "",
        notes: "",
        followUpDate: ""
      });
    }
  }, [record, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePetSelect = (e) => {
    const petId = e.target.value;
    // Convert to string for comparison since select value is always string
    const selectedPet = pets.find(p => String(p.id) === String(petId));
    
    if (selectedPet) {
      setFormData(prev => ({
        ...prev,
        petId: selectedPet.id,
        petName: selectedPet.name,
        petIcon: selectedPet.icon,
        petType: selectedPet.type,
        ownerId: selectedPet.ownerId,
        ownerName: selectedPet.ownerName,
        ownerPhone: selectedPet.ownerPhone
      }));
      
      if (errors.petId) {
        setErrors(prev => ({ ...prev, petId: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.petId) {
      newErrors.petId = "Vui lòng chọn thú cưng";
    }

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
    setErrors({});

    try {
      // Get vet info
      const userRes = await authApi.me();
      if (!userRes.success || !userRes.data?.employee?.employeeId) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      const veterinarianId = Number(userRes.data.employee.employeeId);

      const recordData = {
        petId: Number(formData.petId),
        veterinarianId,
        examinationDate: new Date().toISOString(),
        medicalSummary: {
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          prescription: formData.prescription,
          treatment: formData.treatment,
          notes: formData.notes
        },
        followUpDate: formData.followUpDate || null
      };

      let response;
      if (record?.id) {
        // Update existing record
        response = await medicalRecordApi.update(record.id, recordData);
      } else {
        // Create new record
        response = await medicalRecordApi.create(recordData);
      }

      if (response.success) {
        onSuccess(response.data || formData);
        onClose();
      } else {
        throw new Error(response.error || 'Lỗi khi lưu hồ sơ');
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu hồ sơ' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!record;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              {isEditMode ? (
                <Edit className="h-5 w-5 text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            <DialogTitle>
              {isEditMode ? 'Chỉnh sửa hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án mới'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Pet (only in create mode) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                Chọn thú cưng
                <span className="text-destructive">*</span>
              </Label>
              <Select
                name="petId"
                value={formData.petId}
                onChange={handlePetSelect}
                className={cn(errors.petId && "border-destructive")}
                disabled={loadingPets}
              >
                <option value="">
                  {loadingPets ? "Đang tải danh sách..." : "-- Chọn thú cưng --"}
                </option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.icon} {pet.name} - {pet.ownerName}
                  </option>
                ))}
              </Select>
              {errors.petId && (
                <p className="text-sm text-destructive">{errors.petId}</p>
              )}
            </div>
          )}

          {/* Show pet info if selected */}
          {formData.petId && (
            <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{formData.petIcon}</div>
                <div>
                  <p className="text-lg font-bold text-foreground">{formData.petName}</p>
                  <p className="text-sm text-muted-foreground">{formData.petType}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-pink-200 space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Chủ nuôi:</span>
                  <span className="font-semibold text-foreground">{formData.ownerName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Điện thoại:</span>
                  <span className="font-semibold text-foreground">{formData.ownerPhone}</span>
                </p>
              </div>
            </div>
          )}

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
                  {isEditMode ? 'Đang lưu...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Tạo hồ sơ
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

