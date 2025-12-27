// components/modals/EditServiceModal.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Edit,
  FileText,
  FolderOpen,
  DollarSign,
  Clock,
  X,
  Save,
  Loader2,
  Hash,
  Hospital,
  Syringe,
  Droplets,
  Scissors,
  Heart,
  Home
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function EditServiceModal({ isOpen, onClose, onSuccess, service }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    duration: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        id: service.id || "",
        name: service.name || "",
        category: service.category || "",
        price: service.price?.toString() || "",
        duration: service.duration?.toString() || "",
        description: service.description || ""
      });
      setErrors({});
    }
  }, [service, isOpen]);

  const categories = [
    { value: "health", label: "Tắm & vệ sinh", icon: Droplets },
    { value: "grooming", label: "Cắt tỉa & làm đẹp", icon: Scissors },
    { value: "medical", label: "Y tế & khám bệnh", icon: Hospital },
    { value: "boarding", label: "Lưu trú & chăm sóc", icon: Home }
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
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên dịch vụ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Vui lòng nhập giá hợp lệ";
    if (!formData.duration || parseInt(formData.duration) < 15) newErrors.duration = "Thời lượng tối thiểu là 15 phút";

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

  if (!isOpen || !service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service ID */}
          <Input
            label="Mã dịch vụ"
            name="id"
            type="text"
            value={formData.id}
            disabled
            icon={Hash}
          />

          {/* Name */}
          <Input
            label="Tên dịch vụ"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Tắm spa cao cấp"
            error={errors.name}
            icon={FileText}
            required
          />

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Danh mục
              <span className="text-destructive">*</span>
            </Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={cn(errors.category && "border-destructive")}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => {
                const IconComponent = cat.icon;
                return (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                );
              })}
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Giá (VNĐ)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="150000"
              min="0"
              step="1000"
              error={errors.price}
              icon={DollarSign}
              required
            />

            <Input
              label="Thời gian (phút)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Tối thiểu 15 phút"
              min="15"
              step="5"
              error={errors.duration}
              icon={Clock}
              required
              helperText="Nhập tối thiểu 15 phút"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Mô tả
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả dịch vụ..."
              rows={4}
            />
          </div>

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
                  Lưu
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

