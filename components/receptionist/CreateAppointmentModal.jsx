"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  PawPrint, 
  Search, 
  Loader2,
  Stethoscope,
  Bath,
  Scissors,
  ClipboardList,
  DollarSign,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appointmentApi, petOwnerApi, serviceApi } from "@/lib/api";

export default function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Customer, 2: Pet, 3: Service, 4: Schedule
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data lists
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Search
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Form data
  const [formData, setFormData] = useState({
    petId: null,
    employeeId: null,
    serviceId: null,
    appointmentDate: "",
    startTime: "",
    endTime: "",
    notes: "",
    estimatedCost: 0
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Mock employees data
  const MOCK_EMPLOYEES = [
    { employeeId: 1, fullName: "BS. Nguyễn Văn A", specialty: "Khám tổng quát" },
    { employeeId: 2, fullName: "BS. Trần Thị B", specialty: "Nội khoa" },
    { employeeId: 3, fullName: "BS. Lê Minh C", specialty: "Ngoại khoa" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [customersRes, servicesRes] = await Promise.all([
        petOwnerApi.getAll(),
        serviceApi?.getAll ? serviceApi.getAll() : { success: true, data: [] }
      ]);
      
      if (customersRes.success) {
        setCustomers(customersRes.data || []);
      }
      if (servicesRes.success) {
        setServices(servicesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phoneNumber?.includes(customerSearch)
  );

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSelectedPet(null);
    setFormData(prev => ({ ...prev, petId: null }));
    setStep(2);
  };

  const handleSelectPet = (pet) => {
    setSelectedPet(pet);
    setFormData(prev => ({ ...prev, petId: pet.petId }));
    setStep(3);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setFormData(prev => ({ 
      ...prev, 
      serviceId: service.serviceId,
      estimatedCost: service.price || 0
    }));
    setStep(4);
  };

  const getServiceIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'khám bệnh': return Stethoscope;
      case 'spa': return Bath;
      case 'cắt tỉa': return Scissors;
      default: return ClipboardList;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Set default employeeId if not selected
      const submitData = {
        ...formData,
        employeeId: formData.employeeId || 1 // Default to first employee
      };
      
      const response = await appointmentApi.create(submitData);
      
      if (response.success) {
        onSuccess?.();
        handleClose();
      } else {
        alert("Lỗi khi tạo lịch hẹn: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Lỗi khi tạo lịch hẹn");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      petId: null,
      employeeId: null,
      serviceId: null,
      appointmentDate: "",
      startTime: "",
      endTime: "",
      notes: "",
      estimatedCost: 0
    });
    setSelectedCustomer(null);
    setSelectedPet(null);
    setSelectedService(null);
    setCustomerSearch("");
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const canSubmit = formData.petId && formData.serviceId && formData.appointmentDate && formData.startTime && formData.endTime && formData.employeeId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Đặt lịch hẹn mới</h2>
              <p className="text-white/80">Bước {step}/4 - {
                step === 1 ? "Chọn khách hàng" : 
                step === 2 ? "Chọn thú cưng" : 
                step === 3 ? "Chọn dịch vụ" : 
                "Chọn thời gian"
              }</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative mt-6 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all",
                  s <= step ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <>
              {/* Step 1: Select Customer */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="Tìm khách hàng theo tên hoặc SĐT..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-12 h-12 border-gray-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.petOwnerId}
                        onClick={() => handleSelectCustomer(customer)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                          selectedCustomer?.petOwnerId === customer.petOwnerId
                            ? "border-violet-500 bg-violet-50"
                            : "border-gray-100 hover:border-violet-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-bold text-lg">
                            {customer.fullName?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{customer.fullName}</p>
                            <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <PawPrint className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-amber-600">{customer.pets?.length || 0} thú cưng</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Pet */}
              {step === 2 && selectedCustomer && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <User className="w-5 h-5 text-violet-500" />
                    <span className="text-violet-700 font-medium">Khách hàng: {selectedCustomer.fullName}</span>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="ml-auto text-xs">
                      Đổi
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800">Chọn thú cưng:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCustomer.pets?.map((pet) => (
                      <div
                        key={pet.petId}
                        onClick={() => handleSelectPet(pet)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                          selectedPet?.petId === pet.petId
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-100 hover:border-amber-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-3xl">
                            {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : '🐾'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{pet.name}</p>
                            <p className="text-sm text-gray-500">{pet.breed || pet.species}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Service */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-violet-100 text-violet-700 border-0 flex items-center gap-1">
                      <User className="w-3 h-3" /> {selectedCustomer?.fullName}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-0 flex items-center gap-1">
                      <PawPrint className="w-3 h-3" /> {selectedPet?.name}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800">Chọn dịch vụ:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                    {services.length > 0 ? services.map((service) => {
                      const ServiceIcon = getServiceIcon(service.serviceCategory?.categoryName);
                      return (
                        <div
                          key={service.serviceId}
                          onClick={() => handleSelectService(service)}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                            selectedService?.serviceId === service.serviceId
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-100 hover:border-emerald-200"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                              <ServiceIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{service.serviceName}</p>
                              <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-emerald-600 font-bold">{formatCurrency(service.price)}</span>
                                <span className="text-xs text-gray-400">{service.duration} phút</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      // Mock services if API not available
                      [
                        { serviceId: 1, serviceName: "Khám tổng quát", price: 250000, duration: 30 },
                        { serviceId: 2, serviceName: "Tắm spa", price: 200000, duration: 45 },
                        { serviceId: 3, serviceName: "Cắt tỉa lông", price: 150000, duration: 60 },
                      ].map((service) => (
                        <div
                          key={service.serviceId}
                          onClick={() => handleSelectService(service)}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                            selectedService?.serviceId === service.serviceId
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-100 hover:border-emerald-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                              <Stethoscope className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{service.serviceName}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-emerald-600 font-bold">{formatCurrency(service.price)}</span>
                                <span className="text-xs text-gray-400">{service.duration} phút</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Schedule */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-violet-100 text-violet-700 border-0 flex items-center gap-1">
                      <User className="w-3 h-3" /> {selectedCustomer?.fullName}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-0 flex items-center gap-1">
                      <PawPrint className="w-3 h-3" /> {selectedPet?.name}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" /> {selectedService?.serviceName}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" /> Ngày hẹn *
                      </label>
                      <Input 
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" /> Bắt đầu *
                        </label>
                        <Input 
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kết thúc *
                        </label>
                        <Input 
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employee Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" /> Bác sĩ phụ trách *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {MOCK_EMPLOYEES.map((emp) => (
                        <div
                          key={emp.employeeId}
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setFormData(prev => ({ ...prev, employeeId: emp.employeeId }));
                          }}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all",
                            formData.employeeId === emp.employeeId
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-100 hover:border-indigo-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 font-bold">
                              {emp.fullName.split(' ').pop()?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{emp.fullName}</p>
                              <p className="text-xs text-gray-500">{emp.specialty}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" /> Ghi chú
                    </label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú cho lịch hẹn..."
                      className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  
                  {/* Summary card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-700 font-medium">Chi phí ước tính:</span>
                      <span className="text-2xl font-bold text-violet-600">{formatCurrency(formData.estimatedCost)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0 flex gap-3">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Quay lại
            </Button>
          )}
          
          {step < 4 ? (
            <Button 
              onClick={() => {
                if (step === 1 && selectedCustomer) setStep(2);
                else if (step === 2 && selectedPet) setStep(3);
                else if (step === 3 && selectedService) setStep(4);
              }}
              disabled={
                (step === 1 && !selectedCustomer) ||
                (step === 2 && !selectedPet) ||
                (step === 3 && !selectedService)
              }
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              Tiếp tục
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Xác nhận đặt lịch
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
