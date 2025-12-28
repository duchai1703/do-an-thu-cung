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
  Phone,
  Home
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";
import { medicalRecordApi, authApi, petApi } from "@/lib/api";

export default function VetRecordFormModal({ isOpen, onClose, onSuccess, record, appointment }) {
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    petIcon: "",
    petType: "",
    ownerId: "",
    ownerName: "",
    ownerPhone: "",
    // Medical info
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
  const [includeVaccination, setIncludeVaccination] = useState(false);
  const [vaccineTypes, setVaccineTypes] = useState([]);
  const [vaccinationData, setVaccinationData] = useState({
    vaccineTypeId: "",
    site: "",
    reactions: ""
  });
  
  // Cage assignment state (for inpatient treatment)
  const [requiresCage, setRequiresCage] = useState(false);
  const [availableCages, setAvailableCages] = useState([]);
  const [loadingCages, setLoadingCages] = useState(false);
  const [petCurrentCage, setPetCurrentCage] = useState(null); // Current cage assignment of pet
  const [cageData, setCageData] = useState({
    cageId: "",
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: ""
  });

  // Load pets and vaccine types from API when modal opens
  useEffect(() => {
    if (isOpen && !record) {
      loadPets();
      loadVaccineTypes();
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

  const loadVaccineTypes = async () => {
    try {
      const response = await medicalRecordApi.getVaccineTypes();
      if (response.success && response.data) {
        setVaccineTypes(response.data);
      }
    } catch (error) {
      console.error('Error loading vaccine types:', error);
    }
  };

  // Load available cages when requiresCage is checked
  const loadAvailableCages = async () => {
    try {
      setLoadingCages(true);
      const { cageApi } = await import('@/lib/api');
      const response = await cageApi.getAvailable();
      
      if (response.success && response.data) {
        setAvailableCages(response.data);
      }
    } catch (error) {
      console.error('Error loading available cages:', error);
    } finally {
      setLoadingCages(false);
    }
  };

  // Check if pet already has an active cage assignment
  const checkPetCageAssignment = async (petId) => {
    if (!petId) {
      setPetCurrentCage(null);
      return;
    }
    
    try {
      const { cageApi } = await import('@/lib/api');
      const response = await cageApi.getActiveAssignments();
      
      if (response.success && response.data) {
        // Find active assignment for this pet
        const activeAssignment = response.data.find(
          assignment => assignment.petId === Number(petId) && assignment.status === 'ACTIVE'
        );
        
        if (activeAssignment) {
          setPetCurrentCage({
            cageNumber: activeAssignment.cage?.cageNumber || 'N/A',
            size: activeAssignment.cage?.size || '',
            location: activeAssignment.cage?.location || '',
            checkInDate: activeAssignment.checkInDate,
            expectedCheckOutDate: activeAssignment.expectedCheckOutDate,
            assignmentId: activeAssignment.assignmentId
          });
        } else {
          setPetCurrentCage(null);
        }
      }
    } catch (error) {
      console.error('Error checking pet cage assignment:', error);
      setPetCurrentCage(null);
    }
  };

  // Load cages when requiresCage is enabled
  useEffect(() => {
    if (requiresCage && isOpen) {
      loadAvailableCages();
    }
  }, [requiresCage, isOpen]);

  // Check pet cage assignment when petId changes
  useEffect(() => {
    if (formData.petId && isOpen && !record) {
      checkPetCageAssignment(formData.petId);
    }
  }, [formData.petId, isOpen, record]);

  useEffect(() => {
    if (record && isOpen) {
      // Edit mode - load clinical fields from medicalSummary
      const summary = record.medicalSummary || {};
      setFormData({
        petId: record.petId,
        petName: record.petName,
        petIcon: record.petIcon,
        petType: record.petType,
        ownerId: record.ownerId,
        ownerName: record.ownerName,
        ownerPhone: record.ownerPhone,
        appointmentId: record.appointmentId || null,
        // Medical info
        symptoms: record.symptoms || summary.symptoms || "",
        diagnosis: record.diagnosis,
        prescription: record.prescription || summary.prescription || "",
        treatment: record.treatment,
        notes: record.notes || summary.notes || "",
        followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : ''
      });
    } else if (appointment && isOpen) {
      // Create from appointment mode - auto-fill pet/owner info
      setFormData({
        petId: appointment.petId || "",
        petName: appointment.petName || "",
        petIcon: appointment.petIcon || "🐾",
        petType: appointment.petType || "",
        ownerId: appointment.ownerId || "",
        ownerName: appointment.ownerName || "",
        ownerPhone: appointment.ownerPhone || "",
        appointmentId: appointment.id || appointment.appointmentId || null,
        // Medical info - symptoms might come from appointment notes
        symptoms: appointment.symptoms || appointment.notes || "",
        diagnosis: "",
        prescription: "",
        treatment: "",
        notes: "",
        followUpDate: ""
      });
    } else if (isOpen) {
      // Create mode without appointment
      setFormData({
        petId: "",
        petName: "",
        petIcon: "",
        petType: "",
        ownerId: "",
        ownerName: "",
        ownerPhone: "",
        appointmentId: null,
        // Medical info
        symptoms: "",
        diagnosis: "",
        prescription: "",
        treatment: "",
        notes: "",
        followUpDate: ""
      });
    }
  }, [record, appointment, isOpen]);

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
      const userRes = await authApi.getCurrentUser();
      if (!userRes.success || !userRes.data?.employee?.employeeId) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      const veterinarianId = Number(userRes.data.employee.employeeId);

      // Common data for both create and update
      const commonData = {
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medicalSummary: {
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          prescription: formData.prescription,
          treatment: formData.treatment,
          notes: formData.notes
        }
      };

      // Only add followUpDate if it has a valid value
      if (formData.followUpDate && formData.followUpDate.trim() !== '') {
        commonData.followUpDate = formData.followUpDate;
      }

      console.log('[VetRecordFormModal] Submitting data:', JSON.stringify(commonData, null, 2));

      let response;
      if (record?.id) {
        // Update existing record - NO petId, NO veterinarianId
        response = await medicalRecordApi.update(record.id, commonData);
      } else {
        // Create new record - NEED petId and veterinarianId
        const createData = {
          petId: Number(formData.petId),
          veterinarianId,
          ...commonData
        };
        
        // Add appointmentId if creating from appointment
        if (formData.appointmentId) {
          createData.appointmentId = Number(formData.appointmentId);
        }
        
        response = await medicalRecordApi.create(createData);
      }

      if (!response.success) {
        throw new Error(response.error || 'Lỗi khi lưu hồ sơ');
      }

      console.log('[VetRecordFormModal] Medical record created:', response.data);
      console.log('[VetRecordFormModal] includeVaccination:', includeVaccination, 'vaccineTypeId:', vaccinationData.vaccineTypeId);
      console.log('[VetRecordFormModal] requiresCage:', requiresCage, 'cageId:', cageData.cageId);

      // If vaccination is included, create vaccination record
      if (includeVaccination && !record?.id && vaccinationData.vaccineTypeId) {
        console.log('[VetRecordFormModal] Creating vaccination record...');
        const vacResponse = await petApi.addVaccination(Number(formData.petId), {
          vaccineTypeId: Number(vaccinationData.vaccineTypeId),
          administeredBy: veterinarianId,
          administrationDate: new Date().toISOString(),
          site: vaccinationData.site || undefined,
          reactions: vaccinationData.reactions || undefined,
          medicalRecordId: response.data?.recordId || response.data?.id,
          notes: `Tiêm phòng kèm hồ sơ bệnh án - ${formData.diagnosis}`
        });

        if (!vacResponse.success) {
          console.error('Vaccination creation failed:', vacResponse.error);
          // Continue anyway - medical record was created successfully
        }
      }

      // If creating from appointment, complete the appointment
      if (appointment && formData.appointmentId && !record?.id) {
        try {
          const { appointmentApi } = await import('@/lib/api');
          const completeRes = await appointmentApi.complete(Number(formData.appointmentId));
          if (!completeRes.success) {
            console.warn('Failed to complete appointment:', completeRes.error);
          }
        } catch (err) {
          console.warn('Error completing appointment:', err);
        }
      }

      // If cage is required for inpatient treatment, assign pet to cage
      if (requiresCage && cageData.cageId && !record?.id) {
        console.log('[VetRecordFormModal] Creating cage assignment...');
        try {
          const { cageApi } = await import('@/lib/api');
          const cageRes = await cageApi.assignPet(Number(cageData.cageId), {
            petId: Number(formData.petId),
            checkInDate: cageData.checkInDate,
            expectedCheckOutDate: cageData.expectedCheckOutDate || null,
            notes: `Điều trị nội trú - ${formData.diagnosis}`
          });
          if (!cageRes.success) {
            console.warn('Failed to assign cage:', cageRes.error);
          }
        } catch (err) {
          console.warn('Error assigning cage:', err);
        }
      }

      onSuccess(response.data || formData);
      onClose();
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
          {/* Select Pet (only in create mode AND no appointment) */}
          {!isEditMode && !appointment && (
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

          {/* Vaccination Section - Only for new records */}
          {!record?.id && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeVaccination"
                  checked={includeVaccination}
                  onChange={(e) => setIncludeVaccination(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="includeVaccination" className="flex items-center gap-2 cursor-pointer">
                  <Syringe className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Có kèm tiêm phòng</span>
                </Label>
              </div>

              {includeVaccination && (
                <div className="space-y-4 pt-2">
                  {/* Vaccine Type Dropdown - ƯU TIÊN HÀNG ĐẦU */}
                  <div className="space-y-2">
                    <Label className="text-blue-800 font-semibold">Loại vaccine *</Label>
                    <Select
                      value={vaccinationData.vaccineTypeId}
                      onChange={(e) => setVaccinationData({...vaccinationData, vaccineTypeId: e.target.value})}
                      className="border-blue-200"
                    >
                      <option value="">-- Chọn loại vaccine --</option>
                      {vaccineTypes.map(vt => (
                        <option key={vt.vaccineTypeId} value={vt.vaccineTypeId}>
                          {vt.vaccineName} {vt.manufacturer ? `(${vt.manufacturer})` : ''}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-800">Vị trí tiêm</Label>
                    <Input
                      value={vaccinationData.site}
                      onChange={(e) => setVaccinationData({...vaccinationData, site: e.target.value})}
                      placeholder="VD: Vai trái, đùi phải..."
                      className="border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-800">Phản ứng phụ (nếu có)</Label>
                    <Input
                      value={vaccinationData.reactions}
                      onChange={(e) => setVaccinationData({...vaccinationData, reactions: e.target.value})}
                      placeholder="VD: Sưng nhẹ tại chỗ tiêm, sốt nhẹ..."
                      className="border-blue-200"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cage Assignment Section (for inpatient treatment) */}
          {!isEditMode && (
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 space-y-4">
              {/* If pet already has active cage - show info */}
              {petCurrentCage ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Home className="h-5 w-5" />
                    <span className="font-semibold">Thú cưng đang nội trú</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-300">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Chuồng:</span>
                        <span className="ml-2 font-semibold">{petCurrentCage.cageNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kích thước:</span>
                        <span className="ml-2 font-semibold">{petCurrentCage.size}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vị trí:</span>
                        <span className="ml-2 font-semibold">{petCurrentCage.location || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ngày nhập:</span>
                        <span className="ml-2 font-semibold">
                          {petCurrentCage.checkInDate ? new Date(petCurrentCage.checkInDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 italic">
                    ⚠️ Pet này đang có chuồng. Checkout chuồng hiện tại trước khi đặt chuồng mới.
                  </p>
                </div>
              ) : (
                <>
                  {/* Checkbox to enable cage assignment */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresCage"
                      checked={requiresCage}
                      onChange={(e) => setRequiresCage(e.target.checked)}
                      className="w-4 h-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="requiresCage" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Cần điều trị nội trú / Lưu trú chuồng nuôi</span>
                    </Label>
                  </div>

                  {requiresCage && (
                    <div className="space-y-4 pt-2">
                      {/* Cage Selection */}
                      <div className="space-y-2">
                        <Label className="text-orange-800 font-semibold">Chọn chuồng *</Label>
                        <Select
                          value={cageData.cageId}
                          onChange={(e) => setCageData({...cageData, cageId: e.target.value})}
                          className="border-orange-200"
                          disabled={loadingCages}
                        >
                          <option value="">
                            {loadingCages ? "Đang tải danh sách..." : "-- Chọn chuồng --"}
                          </option>
                          {availableCages.map(cage => (
                            <option key={cage.cageId} value={cage.cageId}>
                              {cage.cageNumber} - {cage.size} - {cage.location || 'N/A'} ({Number(cage.dailyRate).toLocaleString()}đ/ngày)
                            </option>
                          ))}
                        </Select>
                        {availableCages.length === 0 && !loadingCages && (
                          <p className="text-sm text-orange-600">Không có chuồng trống</p>
                        )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-orange-800">Ngày nhập viện *</Label>
                      <Input
                        type="date"
                        value={cageData.checkInDate}
                        onChange={(e) => setCageData({...cageData, checkInDate: e.target.value})}
                        className="border-orange-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-orange-800">Dự kiến xuất viện</Label>
                      <Input
                        type="date"
                        value={cageData.expectedCheckOutDate}
                        onChange={(e) => setCageData({...cageData, expectedCheckOutDate: e.target.value})}
                        min={cageData.checkInDate}
                        className="border-orange-200"
                      />
                      </div>
                    </div>
                  </div>
                )}
                </>
              )}
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

