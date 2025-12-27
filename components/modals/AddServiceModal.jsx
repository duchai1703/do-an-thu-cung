// components/modals/AddServiceModal.jsx
"use client";
import { useState } from "react";
import {
  Sparkles,
  FileText,
  FolderOpen,
  DollarSign,
  Clock,
  X,
  Check,
  Loader2,
  Hospital,
  Syringe,
  Droplets,
  Scissors,
  Heart,
  Home
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function AddServiceModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Categories with numeric IDs matching backend
  const categories = [
    { value: 1, label: "Khám bệnh & điều trị", icon: Hospital },
    { value: 2, label: "Tiêm phòng & xét nghiệm", icon: Syringe },
    { value: 3, label: "Spa & làm đẹp", icon: Scissors },
    { value: 4, label: "Khách sạn thú cưng", icon: Home },
    { value: 5, label: "Phẫu thuật", icon: Heart },
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

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên dịch vụ";
    }

    if (!formData.category) {
      newErrors.category = "Vui lòng chọn loại dịch vụ";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Vui lòng nhập giá dịch vụ hợp lệ";
    }

    if (!formData.duration || parseInt(formData.duration) < 15) {
      newErrors.duration = "Thời lượng tối thiểu là 15 phút";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess(formData);
      onClose();

      // Reset form
      setFormData({
        name: "",
        category: "",
        price: "",
        duration: "",
        description: ""
      });
      setErrors({});
    }, 1000);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      duration: "",
      description: ""
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
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên dịch vụ */}
          <Input
            label="Tên dịch vụ"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Tắm spa cao cấp"
            error={errors.name}
            icon={FileText}
            required
          />

          {/* Loại dịch vụ */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Loại dịch vụ
              <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: cat.value }));
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: "" }));
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      "hover:bg-accent hover:border-primary/50",
                      formData.category === cat.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-input bg-background"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Giá & Thời lượng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Giá dịch vụ (VNĐ)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="100000"
              min="0"
              step="1000"
              error={errors.price}
              icon={DollarSign}
              required
            />

            <Input
              label="Thời lượng (phút)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Tối thiểu 15 phút"
              min="15"
              error={errors.duration}
              icon={Clock}
              required
              helperText="Nhập tối thiểu 15 phút"
            />
          </div>

          {/* Mô tả dịch vụ */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Mô tả dịch vụ
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về dịch vụ, quy trình thực hiện..."
              rows={4}
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
                  Thêm dịch vụ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

