// components/modals/EditStaffModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Edit, 
  Hash, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  X, 
  Save,
  Loader2,
  GraduationCap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function EditStaffModal({ isOpen, onClose, onSuccess, staff }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    specialty: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff && isOpen) {
      setFormData({
        employeeId: staff.employeeId, // Important: copy numeric ID for API calls
        id: staff.id || "",
        name: staff.name || staff.fullName || "",
        email: staff.email || "",
        phone: staff.phone || staff.phoneNumber || "",
        role: staff.role || "",
        specialty: staff.specialty || staff.specialization || staff.expertise || ""
      });
    }
  }, [staff, isOpen]);

  const roles = [
    { value: "vet", label: "Bác sĩ thú y" },
    { value: "care_staff", label: "Nhân viên chăm sóc" },
    { value: "receptionist", label: "Lễ tân" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.role) newErrors.role = "Vui lòng chọn vai trò";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(formData);
      onClose();
    }, 1000);
  };

  if (!isOpen || !staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff ID */}
          <Input
            label="Mã nhân viên"
            name="id"
            type="text"
            value={formData.id}
            disabled
            icon={Hash}
          />

          {/* Name */}
          <Input
            label="Họ và tên"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            error={errors.name}
            icon={User}
            required
          />

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            error={errors.email}
            icon={Mail}
            required
          />

          {/* Phone */}
          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0901234567"
            error={errors.phone}
            icon={Phone}
            required
          />

          {/* Role - Display only (cannot be changed after creation) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Vai trò
            </Label>
            <input
              type="text"
              value={
                formData.role === 'veterinarian' ? 'Bác sĩ thú y' :
                formData.role === 'care_staff' ? 'Nhân viên chăm sóc' :
                formData.role === 'receptionist' ? 'Lễ tân' :
                formData.role || 'Không xác định'
              }
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground italic">
              Vai trò không thể thay đổi sau khi tạo. Nếu cần thay đổi, vui lòng xóa và tạo lại nhân viên.
            </p>
          </div>

          {/* Specialty */}
          <Input
            label="Chuyên môn"
            name="specialty"
            type="text"
            value={formData.specialty}
            onChange={handleChange}
            placeholder="VD: Bác sĩ thú y tổng quát"
            icon={GraduationCap}
          />

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

