// components/modals/BookAppointmentModal.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  PawPrint, 
  ShoppingBag, 
  Clock, 
  FileText, 
  X, 
  Check,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    petId: "",
    serviceId: "",
    date: "",
    time: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      // Import APIs
      const { petApi, serviceApi, authApi } = await import('@/lib/api');

      // Get current user's petOwnerId
      const userRes = await authApi.getCurrentUser();
      let petOwnerId = null;
      
      if (userRes.success && userRes.data) {
        const profileRes = await authApi.getFullProfile(userRes.data.accountId);
        if (profileRes.success && profileRes.data?.profile) {
          petOwnerId = profileRes.data.profile.petOwnerId;
        }
      }

      // Load owner's pets
      if (petOwnerId) {
        const petsRes = await petApi.getByOwner(petOwnerId);
        if (petsRes.success && petsRes.data) {
          setPets(petsRes.data.map(pet => ({
            id: pet.petID || pet.id,
            name: pet.name
          })));
        }
      }

      // Load services
      const servicesRes = await serviceApi.getAll();
      console.log("Services response:", servicesRes);
      
      if (servicesRes.success && servicesRes.data) {
        // Handle both array and nested data structure
        const servicesData = Array.isArray(servicesRes.data) 
          ? servicesRes.data 
          : (servicesRes.data.data || servicesRes.data.services || []);
        
        setServices(servicesData.map(service => ({
          id: service.serviceId || service.serviceID || service.id,
          name: service.name || service.serviceName
        })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

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

    if (!formData.serviceId) {
      newErrors.serviceId = "Vui lòng chọn dịch vụ";
    }

    if (!formData.date) {
      newErrors.date = "Vui lòng chọn ngày";
    }

    if (!formData.time) {
      newErrors.time = "Vui lòng chọn giờ";
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
      const pet = pets.find(p => p.id === formData.petId);
      const service = services.find(s => s.id === formData.serviceId);
      
      const appointmentData = {
        petId: formData.petId,
        petName: pet.name,
        serviceId: formData.serviceId,
        serviceName: service.name,
        date: formData.date,
        time: formData.time,
        notes: formData.notes
      };
      
      setLoading(false);
      onSuccess(appointmentData);
      onClose();
      
      // Reset form
      setFormData({
        petId: "",
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      });
      setErrors({});
    }, 1000);
  };

  const handleClose = () => {
    setFormData({
      petId: "",
      serviceId: "",
      date: "",
      time: "",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Đặt lịch mới</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn thú cưng */}
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
              className={cn(errors.petId && "border-destructive")}
            >
              <option value="">-- Chọn thú cưng --</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </Select>
            {errors.petId && (
              <p className="text-sm text-destructive">{errors.petId}</p>
            )}
          </div>

          {/* Chọn dịch vụ */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              Chọn dịch vụ
              <span className="text-destructive">*</span>
            </Label>
            <Select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              className={cn(errors.serviceId && "border-destructive")}
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
            {errors.serviceId && (
              <p className="text-sm text-destructive">{errors.serviceId}</p>
            )}
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ngày"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              error={errors.date}
              icon={Calendar}
              required
            />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Giờ
                <span className="text-destructive">*</span>
              </Label>
              <Select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={cn(errors.time && "border-destructive")}
              >
                <option value="">-- Chọn giờ --</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Ghi chú
            </Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Thông tin thêm về yêu cầu của bạn..."
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
                  Đang đặt...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Đặt lịch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

