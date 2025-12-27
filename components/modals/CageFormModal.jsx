// components/modals/CageFormModal.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Edit,
  Plus,
  X,
  Save,
  Check,
  Loader2,
  Hash,
  Home,
  RefreshCw,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

const CAGE_TYPES = [
  { value: "small", label: "Nhỏ", icon: Home, capacity: 1, description: "Dành cho mèo hoặc chó nhỏ" },
  { value: "medium", label: "Trung", icon: Home, capacity: 2, description: "Dành cho chó cỡ trung" },
  { value: "large", label: "Lớn", icon: Home, capacity: 3, description: "Dành cho chó lớn hoặc nhiều thú cưng" }
];

export default function CageFormModal({ isOpen, onClose, onSuccess, cage = null }) {
  const [form, setForm] = useState({
    code: "",
    type: "",
    capacity: 1,
    notes: "",
    status: "available"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cage && isOpen) {
      setForm({
        code: cage.code || "",
        type: cage.type || "",
        capacity: cage.capacity || 1,
        notes: cage.notes || "",
        status: cage.status || "available"
      });
    } else {
      setForm({
        code: "",
        type: "",
        capacity: 1,
        notes: "",
        status: "available"
      });
    }
  }, [cage, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeSelect = (type) => {
    const selectedType = CAGE_TYPES.find(t => t.value === type);
    setForm(prev => ({
      ...prev,
      type: type,
      capacity: selectedType.capacity
    }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = "Vui lòng nhập mã chuồng";
    if (!/^[A-Z0-9]{2,6}$/.test(form.code.toUpperCase())) {
      newErrors.code = "Mã chuồng phải là 2-6 ký tự chữ và số (ví dụ: A01, B12)";
    }
    if (!form.type) newErrors.type = "Vui lòng chọn loại chuồng";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ ...form, code: form.code.toUpperCase() });
      setForm({ code: "", type: "", capacity: 1, notes: "", status: "available" });
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              {cage ? (
                <Edit className="h-5 w-5 text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            <DialogTitle>
              {cage ? 'Chỉnh sửa chuồng' : 'Thêm chuồng mới'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã chuồng */}
          <Input
            label="Mã chuồng"
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            placeholder="Ví dụ: A01, B12, C03..."
            disabled={!!cage}
            error={errors.code}
            icon={Hash}
            required
          />
          {cage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              <span>Không thể thay đổi mã chuồng sau khi tạo</span>
            </div>
          )}

          {/* Loại chuồng */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              Loại chuồng
              <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CAGE_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = form.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-input bg-background hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{type.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Sức chứa: {type.capacity} thú cưng
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Trạng thái (chỉ khi edit) */}
          {cage && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                Trạng thái
              </Label>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="available">Trống</option>
                <option value="occupied">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
              </Select>
            </div>
          )}

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Ghi chú
            </Label>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Ghi chú về chuồng (vị trí, đặc điểm...)"
              rows={3}
            />
          </div>

          {/* Footer */}
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
                  {cage ? 'Đang cập nhật...' : 'Đang thêm...'}
                </>
              ) : (
                <>
                  {cage ? (
                    <>
                      <Save className="h-4 w-4" />
                      Cập nhật
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Thêm chuồng
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

