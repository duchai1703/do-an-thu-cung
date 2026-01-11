// components/modals/AddPetModal.jsx - Premium UI v2
"use client";
import { useState } from "react";
import { 
  PawPrint, FileText, Tag, Users, Cake, Scale, Palette, Hospital, X, Check, Loader2, Sparkles, Heart
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
  const [step, setStep] = useState(1); // Multi-step form

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const selectPetType = (type) => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên thú cưng";
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thú cưng";
    // Require breed description when "Other" is selected
    if (formData.type === "Other" && !formData.breed.trim()) {
      newErrors.breed = "Vui lòng mô tả loài của bé";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.breed.trim()) newErrors.breed = "Vui lòng nhập giống";
    if (!formData.gender) newErrors.gender = "Vui lòng chọn giới tính";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setLoading(true);

    setTimeout(() => {
      const petData = {
        name: formData.name,
        species: formData.type,
        breed: formData.breed || undefined,
        birthDate: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color || undefined,
        initialHealthStatus: formData.medicalHistory || undefined,
        specialNotes: formData.notes || undefined
      };
      
      setLoading(false);
      onSuccess(petData);
      handleClose();
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
    setStep(1);
    onClose();
  };

  const getSelectedPetIcon = () => {
    const pet = petTypes.find(p => p.value === formData.type);
    return pet?.icon || "🐾";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 border-0 rounded-2xl shadow-2xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 p-6 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -right-4 -top-4 text-8xl opacity-20 rotate-12">🐾</div>
          <div className="absolute right-20 bottom-2 text-4xl opacity-30 animate-bounce">💖</div>
          
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
              {getSelectedPetIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Thêm Bé Mới
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h2>
              <p className="text-white/80 text-sm">Chào mừng thành viên mới đến gia đình!</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                  step >= s 
                    ? "bg-white text-purple-600 shadow-lg" 
                    : "bg-white/30 text-white"
                )}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && (
                  <div className={cn(
                    "w-12 h-1 mx-1 rounded-full transition-all",
                    step > s ? "bg-white" : "bg-white/30"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2 text-xs text-white/70">
            <span className={step >= 1 ? "text-white font-semibold" : ""}>Thông tin</span>
            <span className={step >= 2 ? "text-white font-semibold" : ""}>Chi tiết</span>
            <span className={step >= 3 ? "text-white font-semibold" : ""}>Hoàn thành</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Pet Name with big input */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  ✏️ Bé tên gì?
                </Label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên thú cưng yêu thương..."
                  className={cn(
                    "text-xl h-14 px-4 rounded-xl border-2 transition-all",
                    errors.name ? "border-red-400" : "border-purple-200 focus:border-purple-500"
                  )}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Pet Type Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  🐾 Bé là loài gì?
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {petTypes.map((pet) => (
                    <button
                      key={pet.value}
                      type="button"
                      onClick={() => selectPetType(pet.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                        formData.type === pet.value
                          ? "border-purple-500 bg-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-purple-300"
                      )}
                    >
                      <div className="text-3xl mb-1">{pet.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{pet.label}</div>
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>

              {/* Show description field when "Other" is selected */}
              {formData.type === "Other" && (
                <div className="space-y-2 animate-fade-in">
                  <Label className="flex items-center gap-2 font-semibold text-purple-700">
                    📝 Bé thuộc loài gì? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="breed"
                    type="text"
                    value={formData.breed}
                    onChange={handleChange}
                    placeholder="VD: Rồng Nam Mỹ, Chuột lang, Nhím, Sóc..."
                    className={cn(
                      "h-12 rounded-xl border-2",
                      errors.breed ? "border-red-400" : "border-purple-200 focus:border-purple-500"
                    )}
                  />
                  {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
                  <p className="text-xs text-gray-500 italic">💡 Vui lòng mô tả cụ thể loài của bé để chúng tôi có thể chăm sóc tốt hơn</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
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
                      errors.breed ? "border-red-400" : "border-gray-200 focus:border-purple-500"
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
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
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
                    className={cn(
                      "h-12 rounded-xl border-2",
                      errors.dateOfBirth ? "border-red-400" : "border-gray-200 focus:border-purple-500"
                    )}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
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
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500"
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
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Health & Notes */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  ✨ Thông tin bé {formData.name}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{getSelectedPetIcon()}</div>
                  <div className="flex-1 space-y-1 text-sm">
                    <p><span className="text-gray-500">Loài:</span> <span className="font-semibold">{formData.type}</span></p>
                    <p><span className="text-gray-500">Giống:</span> <span className="font-semibold">{formData.breed}</span></p>
                    <p><span className="text-gray-500">Giới tính:</span> <span className="font-semibold">{formData.gender === 'Đực' ? '♂️ Đực' : '♀️ Cái'}</span></p>
                    <p><span className="text-gray-500">Màu:</span> <span className="font-semibold">{formData.color || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold">
                  🏥 Tình trạng sức khỏe
                </Label>
                <Textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Ghi chú về tiêm phòng, bệnh lý, dị ứng..."
                  rows={3}
                  className="rounded-xl border-2 border-gray-200 focus:border-purple-500"
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
                  className="rounded-xl border-2 border-gray-200 focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? handleClose : handleBack}
            className="rounded-xl"
          >
            {step === 1 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </>
            ) : (
              "← Quay lại"
            )}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
            >
              Tiếp theo →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-white" />
                  Thêm bé vào gia đình! 🎉
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </Dialog>
  );
}
