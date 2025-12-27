"use client";
import { useState, useEffect } from "react";
import { 
  PawPrint, 
  Calendar,
  X, 
  Save, 
  Loader2,
  Home
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AssignPetModal({ isOpen, onClose, onSuccess, cage, pets = [] }) {
  const [formData, setFormData] = useState({
    petId: "",
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        petId: "",
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: "",
        notes: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.petId) {
      newErrors.petId = "Vui lòng chọn thú cưng";
    }
    
    if (!formData.checkInDate) {
      newErrors.checkInDate = "Vui lòng nhập ngày check-in";
    }
    
    if (formData.expectedCheckOutDate && formData.expectedCheckOutDate < formData.checkInDate) {
      newErrors.expectedCheckOutDate = "Ngày check-out phải sau ngày check-in";
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
    
    try {
      await onSuccess({
        petId: parseInt(formData.petId),
        checkInDate: formData.checkInDate,
        expectedCheckOutDate: formData.expectedCheckOutDate || undefined,
        notes: formData.notes || undefined
      });
      onClose();
    } catch (error) {
      console.error("Error assigning pet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !cage) return null;

  // Get pet icon based on species
  const getPetIcon = (pet) => {
    if (!pet?.species) return "🐾";
    const species = pet.species.toUpperCase();
    if (species === 'DOG') return "🐕";
    if (species === 'CAT') return "🐈";
    return "🐾";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Gán thú cưng vào chuồng</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cage Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{cage.code}</p>
                <p className="text-sm text-muted-foreground">
                  Loại: {cage.type === 'small' ? 'Nhỏ' : cage.type === 'medium' ? 'Trung' : 'Lớn'}
                </p>
              </div>
            </div>
          </div>

          {/* Pet Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-muted-foreground" />
              Chọn thú cưng
              <span className="text-destructive">*</span>
            </Label>
            <Select
              name="petId"
              value={formData.petId}
              onChange={handleChange}
            >
              <option value="">-- Chọn thú cưng --</option>
              {pets.map((pet) => (
                <option key={pet.petId || pet.id} value={pet.petId || pet.id}>
                  {getPetIcon(pet)} {pet.name} - {pet.breed || 'N/A'} ({pet.petOwner?.fullName || pet.ownerName || 'N/A'})
                </option>
              ))}
            </Select>
            {errors.petId && (
              <p className="text-sm text-destructive">{errors.petId}</p>
            )}
            {pets.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Không có thú cưng nào trong hệ thống</p>
            )}
          </div>

          {/* Check-in Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Ngày check-in
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              required
            />
            {errors.checkInDate && (
              <p className="text-sm text-destructive">{errors.checkInDate}</p>
            )}
          </div>

          {/* Expected Check-out Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Ngày check-out dự kiến
            </Label>
            <Input
              type="date"
              name="expectedCheckOutDate"
              value={formData.expectedCheckOutDate}
              onChange={handleChange}
              min={formData.checkInDate}
            />
            {errors.expectedCheckOutDate && (
              <p className="text-sm text-destructive">{errors.expectedCheckOutDate}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú đặc biệt về lưu trú..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Gán thú cưng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
