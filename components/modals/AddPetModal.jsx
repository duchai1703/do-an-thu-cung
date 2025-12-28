// components/modals/AddPetModal.jsx
"use client";
import { useState } from "react";
import { 
  PawPrint, 
  FileText, 
  Tag, 
  Users, 
  Cake, 
  Scale, 
  Palette, 
  Hospital, 
  X, 
  Check,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function AddPetModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    weight: "",
    color: "",
    dateOfBirth: "",
    medicalHistory: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên thú cưng";
    }

    if (!formData.type) {
      newErrors.type = "Vui lòng chọn loại thú cưng";
    }

    if (!formData.breed.trim()) {
      newErrors.breed = "Vui lòng nhập giống";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Map frontend fields to backend DTO
      const petData = {
        name: formData.name,
        species: formData.type, // Backend expects 'species', frontend uses 'type'
        breed: formData.breed || undefined,
        birthDate: formData.dateOfBirth || undefined, // Backend expects 'birthDate'
        gender: formData.gender || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined, // Must be number
        color: formData.color || undefined,
        initialHealthStatus: formData.medicalHistory || undefined, // Backend uses 'initialHealthStatus'
        specialNotes: formData.notes || undefined // Backend uses 'specialNotes'
      };
      
      setLoading(false);
      onSuccess(petData);
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        breed: "",
        gender: "",
        weight: "",
        color: "",
        dateOfBirth: "",
        medicalHistory: "",
        notes: ""
      });
      setErrors({});
    }, 500);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "",
      breed: "",
      gender: "",
      weight: "",
      color: "",
      dateOfBirth: "",
      medicalHistory: "",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Thêm thú cưng mới</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên thú cưng */}
          <Input
            label="Tên thú cưng"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Lucky, Miu, Coco..."
            error={errors.name}
            icon={FileText}
            required
          />

          {/* Loại & Giống (2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                Loại thú cưng
                <span className="text-destructive">*</span>
              </Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={cn(errors.type && "border-destructive")}
              >
                <option value="">-- Chọn loại --</option>
                <option value="Dog">Chó</option>
                <option value="Cat">Mèo</option>
                <option value="Bird">Chim</option>
                <option value="Hamster">Chuột Hamster</option>
                <option value="Rabbit">Thỏ</option>
                <option value="Turtle">Rùa</option>
                <option value="Fish">Cá</option>
                <option value="Other">Khác</option>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            <Input
              label="Giống"
              name="breed"
              type="text"
              value={formData.breed}
              onChange={handleChange}
              placeholder="VD: Golden Retriever, Mèo Ba Tư..."
              error={errors.breed}
              icon={Tag}
              required
            />
          </div>

          {/* Giới tính & Ngày sinh (2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Giới tính
                <span className="text-destructive">*</span>
              </Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={cn(errors.gender && "border-destructive")}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>

            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              error={errors.dateOfBirth}
              icon={Cake}
              required
            />
          </div>

          {/* Cân nặng & Màu lông (2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Cân nặng
              </Label>
              <div className="flex items-center gap-2">
                <input
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="VD: 5"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">kg</span>
              </div>
            </div>

            <Input
              label="Màu lông"
              name="color"
              type="text"
              value={formData.color}
              onChange={handleChange}
              placeholder="VD: Vàng, Trắng, Nâu..."
              icon={Palette}
            />
          </div>

          {/* Lịch sử y tế */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hospital className="h-4 w-4 text-muted-foreground" />
              Lịch sử y tế
            </Label>
            <Textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Ghi chú về tiêm phòng, bệnh lý, phẫu thuật..."
              rows={3}
            />
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Ghi chú thêm
            </Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Thói quen, sở thích, điều cần lưu ý..."
              rows={3}
            />
          </div>

          {/* Buttons */}
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
                  Đang thêm...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Thêm thú cưng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

