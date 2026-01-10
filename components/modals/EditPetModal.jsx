// components/modals/EditPetModal.jsx - Premium UI v2
"use client";
import { useState, useEffect } from "react";
import { 
  PawPrint, FileText, Tag, Users, Cake, Scale, Palette, Hospital, X, Save, Loader2, Edit, Sparkles, Heart
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

  const petTypes = [
    { value: "Dog", label: "Chó", icon: "🐕" },
    { value: "Cat", label: "Mèo", icon: "🐈" },
    { value: "Rabbit", label: "Thỏ", icon: "🐰" },
    { value: "Bird", label: "Chim", icon: "🐦" },
    { value: "Hamster", label: "Hamster", icon: "🐹" },
    { value: "Turtle", label: "Rùa", icon: "🐢" },
    { value: "Fish", label: "Cá", icon: "🐟" },
    { value: "Other", label: "Khác", icon: "🐾" }
  ];

  useEffect(() => {
    if (pet && isOpen) {
      setFormData({
        id: pet.petId || pet.id,
        name: pet.name || "",
        type: pet.species || pet.type || "",
        breed: pet.breed || "",
        gender: pet.gender || "",
        weight: pet.weight || "",
        color: pet.color || "",
        dateOfBirth: pet.birthDate || pet.dateOfBirth || "",
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

  const selectPetType = (type) => {
    setFormData(prev => ({ ...prev, type }));
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
    }, 500);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const getSelectedPetIcon = () => {
    const pet = petTypes.find(p => p.value === formData.type);
    return pet?.icon || "🐾";
  };

  if (!isOpen || !pet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 border-0 rounded-2xl shadow-2xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -right-4 -top-4 text-8xl opacity-20 rotate-12">✏️</div>
          <div className="absolute right-20 bottom-2 text-4xl opacity-30 animate-pulse">💖</div>
          
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
              {getSelectedPetIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Chỉnh Sửa {formData.name || 'Thú Cưng'}
                <Edit className="w-5 h-5" />
              </h2>
              <p className="text-white/80 text-sm">Cập nhật thông tin cho bé</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
          {/* Pet Name */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              ✏️ Tên thú cưng
            </Label>
            <Input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thú cưng..."
              className={cn(
                "text-lg h-12 px-4 rounded-xl border-2 transition-all",
                errors.name ? "border-red-400" : "border-gray-200 focus:border-blue-500"
              )}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Pet Type Selection Grid */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              🐾 Loại thú cưng
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {petTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => selectPetType(type.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-blue-300"
                  )}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Breed & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-semibold">
                🏷️ Giống
              </Label>
              <Input
                name="breed"
                type="text"
                value={formData.breed}
                onChange={handleChange}
                placeholder="VD: Golden Retriever"
                className={cn(
                  "h-12 rounded-xl border-2",
                  errors.breed ? "border-red-400" : "border-gray-200 focus:border-blue-500"
                )}
              />
              {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-semibold">
                ⚧️ Giới tính
              </Label>
              <div className="flex gap-2">
                {[
                  { value: "Đực", label: "♂️ Đực", color: "blue" },
                  { value: "Cái", label: "♀️ Cái", color: "pink" }
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: g.value }))}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 font-semibold transition-all",
                      formData.gender === g.value
                        ? g.color === "blue" 
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Birth Date & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-semibold">
                🎂 Ngày sinh
              </Label>
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-semibold">
                ⚖️ Cân nặng (kg)
              </Label>
              <Input
                name="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={handleChange}
                placeholder="VD: 5.5"
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              🎨 Màu lông
            </Label>
            <Input
              name="color"
              type="text"
              value={formData.color}
              onChange={handleChange}
              placeholder="VD: Vàng, Trắng đen, Nâu..."
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Health Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              💚 Tình trạng sức khỏe
            </Label>
            <Textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Ghi chú về tiêm phòng, bệnh lý, dị ứng..."
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold">
              📝 Ghi chú đặc biệt
            </Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Thói quen, sở thích, điều cần lưu ý..."
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2 fill-white" />
                Lưu Thay Đổi ✨
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
