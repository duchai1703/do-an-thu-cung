// components/modals/EditPetModal.jsx
"use client";
import { useState, useEffect } from "react";
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
  Save,
  Loader2,
  Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function EditPetModal({ isOpen, onClose, onSuccess, pet }) {
  const [formData, setFormData] = useState({
    id: "",
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

  useEffect(() => {
    if (pet && isOpen) {
      setFormData({
        id: pet.petId || pet.id, // Handle both petId and id
        name: pet.name || "",
        type: pet.species || pet.type || "", // Backend uses species
        breed: pet.breed || "",
        gender: pet.gender || "",
        weight: pet.weight || "",
        color: pet.color || "",
        dateOfBirth: pet.birthDate || pet.dateOfBirth || "", // Backend uses birthDate
        medicalHistory: pet.initialHealthStatus || pet.medicalHistory || "",
        notes: pet.specialNotes || pet.notes || ""
      });
    }
  }, [pet, isOpen]);

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

    if (!formData.breed.trim()) {
      newErrors.breed = "Vui lòng nhập giống";
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
      const updatedPet = {
        ...formData,
        age: calculateAge(formData.dateOfBirth),
      };
      
      setLoading(false);
      onSuccess(updatedPet);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !pet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Chỉnh sửa thông tin thú cưng</DialogTitle>
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
              </Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
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
            </div>

            <Input
              label="Giống"
              name="breed"
              type="text"
              value={formData.breed}
              onChange={handleChange}
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
              </Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </Select>
            </div>

            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              icon={Cake}
            />
          </div>

          {/* Cân nặng & Màu lông (2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cân nặng"
              name="weight"
              type="text"
              value={formData.weight}
              onChange={handleChange}
              placeholder="VD: 5 kg"
              icon={Scale}
            />

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

