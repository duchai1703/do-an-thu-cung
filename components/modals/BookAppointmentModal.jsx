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
  Loader2,
  User
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, formatEmployeeId, formatPetId, formatServiceId } from "@/lib/utils.js";
import { petApi, serviceApi, employeeApi, appointmentApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    petId: "",
    services: [], // Array of { serviceId, quantity, notes }
    employeeId: "",
    date: "",
    time: "",
    notes: ""
  });
  const [selectedServices, setSelectedServices] = useState({}); // { serviceId: { quantity, notes } }

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      
      // Load pets, services, and employees in parallel
      const [petsResponse, servicesResponse, employeesResponse] = await Promise.all([
        petApi.getOwnedPet(),
        serviceApi.getAvailable(),
        employeeApi.getAll({ role: 'VETERINARIAN', available: true })
      ]);

      if (petsResponse.success && petsResponse.data) {
        setPets(petsResponse.data.map(pet => ({
          id: pet.id,
          name: pet.name,
          species: pet.breed
        })));
      } else {
        showToast("Không thể tải danh sách thú cưng", "error");
      }

      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data.map(service => ({
          id: service.id,
          name: service.serviceName,
          description: service.description,
          basePrice: service.basePrice,
          duration: service.estimatedDuration
        })));
      } else {
        showToast("Không thể tải danh sách dịch vụ", "error");
      }

      if (employeesResponse.success && employeesResponse.data) {
        setEmployees(employeesResponse.data.map(emp => ({
          id: emp.employeeId,
          name: emp.fullName,
          specialization: emp.expertise
        })));
      } else {
        showToast("Không thể tải danh sách bác sĩ", "error");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setDataLoading(false);
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

    if (Object.keys(selectedServices).length === 0) {
      newErrors.services = "Vui lòng chọn ít nhất một dịch vụ";
    }

    if (!formData.employeeId) {
      newErrors.employeeId = "Vui lòng chọn bác sĩ";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate total duration from all services
      const servicesArray = Object.entries(selectedServices).map(([serviceId, data]) => ({
        serviceId: parseInt(serviceId),
        quantity: data.quantity,
        notes: data.notes || undefined
      }));
      
      const totalDuration = servicesArray.reduce((total, item) => {
        const service = services.find(s => s.id === item.serviceId);
        return total + ((service?.duration || 60) * item.quantity);
      }, 0);
      
      const [hours, minutes] = formData.time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + totalDuration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      const appointmentData = {
        petId: parseInt(formData.petId),
        employeeId: parseInt(formData.employeeId),
        services: servicesArray,
        appointmentDate: formData.date,
        startTime: formData.time,
        endTime: endTime,
        notes: formData.notes || undefined
      };
      
      const response = await appointmentApi.createMyAppointment(appointmentData);
      
      if (response.success) {
        showToast("Đặt lịch thành công!", "success");
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        showToast(response.error || "Không thể đặt lịch", "error");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      showToast("Lỗi khi đặt lịch", "error");
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      petId: "",
      services: [],
      employeeId: "",
      date: "",
      time: "",
      notes: ""
    });
    setSelectedServices({});
    setErrors({});
    onClose();
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      const newSelected = { ...prev };
      if (newSelected[serviceId]) {
        delete newSelected[serviceId];
      } else {
        newSelected[serviceId] = { quantity: 1, notes: '' };
      }
      return newSelected;
    });
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: "" }));
    }
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], quantity: Math.max(1, parseInt(quantity) || 1) }
    }));
  };

  const handleServiceNotesChange = (serviceId, notes) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], notes }
    }));
  };

  const calculateTotalCost = () => {
    return Object.entries(selectedServices).reduce((total, [serviceId, data]) => {
      const service = services.find(s => s.id === parseInt(serviceId));
      return total + ((service?.basePrice || 0) * data.quantity);
    }, 0);
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
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
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
                  disabled={pets.length === 0}
                >
                  <option value="">{pets.length === 0 ? "-- Không có thú cưng --" : "-- Chọn thú cưng --"}</option>
                  {pets.map(pet => (
                    <option key={formatPetId(pet.id)} value={pet.id}>
                      {pet.name} ({pet.species})
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
                <div className={cn(
                  "border rounded-lg p-3 space-y-3 max-h-[300px] overflow-y-auto",
                  errors.services && "border-destructive"
                )}>
                  {services.map(service => (
                    <div key={formatServiceId(service.id)} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={!!selectedServices[service.id]}
                          onChange={() => handleServiceToggle(service.id)}
                          className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor={`service-${service.id}`} className="cursor-pointer">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.basePrice?.toLocaleString('vi-VN')} đ
                              {service.duration && ` • ${service.duration} phút`}
                            </div>
                          </label>
                          
                          {selectedServices[service.id] && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Số lượng:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={selectedServices[service.id].quantity}
                                  onChange={(e) => handleServiceQuantityChange(service.id, e.target.value)}
                                  className="h-8 w-20 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Ghi chú:</Label>
                                <Input
                                  type="text"
                                  placeholder="Ghi chú cho dịch vụ này..."
                                  value={selectedServices[service.id].notes}
                                  onChange={(e) => handleServiceNotesChange(service.id, e.target.value)}
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.services && (
                  <p className="text-sm text-destructive">{errors.services}</p>
                )}
                
                {/* Hiển thị tổng chi phí */}
                {Object.keys(selectedServices).length > 0 && (
                  <div className="bg-primary/5 rounded-lg p-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng chi phí dự kiến:</span>
                      <span className="text-lg font-bold text-primary">
                        {calculateTotalCost().toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.keys(selectedServices).length} dịch vụ đã chọn
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn bác sĩ */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Chọn bác sĩ
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={cn(errors.employeeId && "border-destructive")}
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {employees.map(employee => (
                    <option key={formatEmployeeId(employee.id)} value={employee.id}>
                      {employee.name} {employee.specialization ? `- ${employee.specialization}` : ''}
                    </option>
                  ))}
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-destructive">{errors.employeeId}</p>
                )}
              </div>
            </>
          )}

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
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || dataLoading || pets.length === 0}
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

