"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  PawPrint, 
  Loader2,
  CheckCircle2,
  X,
  Receipt,
  Tag,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { invoiceApi, appointmentApi } from "@/lib/api";

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess, preselectedAppointment = null }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(preselectedAppointment);
  
  const [formData, setFormData] = useState({
    appointmentId: preselectedAppointment?.appointmentId || null,
    discountCode: "",
    notes: ""
  });

  const [discount, setDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompletedAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedAppointment) {
      setSelectedAppointment(preselectedAppointment);
      setFormData(prev => ({ ...prev, appointmentId: preselectedAppointment.appointmentId }));
    }
  }, [preselectedAppointment]);

  const loadCompletedAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getByStatus('COMPLETED');
      
      if (response.success && response.data) {
        // Filter out appointments that already have invoices
        const withoutInvoice = response.data.filter(apt => !apt.invoiceId);
        setCompletedAppointments(withoutInvoice);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppointment = (apt) => {
    setSelectedAppointment(apt);
    setFormData(prev => ({ ...prev, appointmentId: apt.appointmentId }));
  };

  const handleApplyDiscount = () => {
    // Simple discount logic - in real app, validate with backend
    if (formData.discountCode === "VIP10") {
      setDiscount(10);
      setDiscountApplied(true);
    } else if (formData.discountCode === "NEW20") {
      setDiscount(20);
      setDiscountApplied(true);
    } else if (formData.discountCode) {
      alert("Mã giảm giá không hợp lệ!");
      setDiscountApplied(false);
      setDiscount(0);
    }
  };

  const calculateTotal = () => {
    const baseAmount = selectedAppointment?.actualCost || selectedAppointment?.estimatedCost || selectedAppointment?.service?.price || 0;
    const discountAmount = (baseAmount * discount) / 100;
    return baseAmount - discountAmount;
  };

  const handleSubmit = async () => {
    if (!formData.appointmentId) {
      alert("Vui lòng chọn lịch hẹn!");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await invoiceApi.generate({
        appointmentId: formData.appointmentId,
        discountCode: formData.discountCode || undefined,
        notes: formData.notes || undefined
      });
      
      if (response.success) {
        onSuccess?.();
        handleClose();
      } else {
        alert("Lỗi khi tạo hóa đơn: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Lỗi khi tạo hóa đơn");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      appointmentId: null,
      discountCode: "",
      notes: ""
    });
    setSelectedAppointment(null);
    setDiscount(0);
    setDiscountApplied(false);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tạo hóa đơn mới</h2>
              <p className="text-white/80">Tạo hóa đơn từ lịch hẹn đã hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Select Appointment */}
              {!preselectedAppointment && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Chọn lịch hẹn đã hoàn thành:
                  </h3>
                  
                  {completedAppointments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Không có lịch hẹn nào đã hoàn thành cần tạo hóa đơn</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-[200px] overflow-y-auto">
                      {completedAppointments.map((apt) => (
                        <div
                          key={apt.appointmentId}
                          onClick={() => handleSelectAppointment(apt)}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                            selectedAppointment?.appointmentId === apt.appointmentId
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-100 hover:border-emerald-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                                <PawPrint className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{apt.pet?.name}</p>
                                <p className="text-sm text-gray-500">{apt.pet?.owner?.fullName} • {apt.service?.serviceName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{formatCurrency(apt.actualCost || apt.estimatedCost || 0)}</p>
                              <p className="text-xs text-gray-400">{new Date(apt.appointmentDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Appointment Summary */}
              {selectedAppointment && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl">
                      {selectedAppointment.pet?.species === 'DOG' ? '🐕' : selectedAppointment.pet?.species === 'CAT' ? '🐈' : '🐾'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 text-lg">{selectedAppointment.pet?.name}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Hoàn thành</Badge>
                      </div>
                      <p className="text-gray-600">
                        <User className="w-4 h-4 inline mr-1" />
                        {selectedAppointment.pet?.owner?.fullName}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {selectedAppointment.service?.serviceName} • {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Code */}
              <div className="space-y-3">
                <label className="font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-500" />
                  Mã giảm giá (tùy chọn)
                </label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Nhập mã giảm giá..."
                    value={formData.discountCode}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, discountCode: e.target.value.toUpperCase() }));
                      setDiscountApplied(false);
                      setDiscount(0);
                    }}
                    className="flex-1 h-12"
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    variant="outline"
                    className="h-12 px-6"
                    disabled={!formData.discountCode}
                  >
                    Áp dụng
                  </Button>
                </div>
                {discountApplied && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <Percent className="w-3 h-3 mr-1" />
                    Giảm {discount}% đã được áp dụng!
                  </Badge>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Ghi chú
                </label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú cho hóa đơn..."
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Total */}
              {selectedAppointment && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100">Tổng tiền hóa đơn</p>
                      {discount > 0 && (
                        <p className="text-sm text-emerald-200 line-through">
                          {formatCurrency(selectedAppointment.actualCost || selectedAppointment.estimatedCost || 0)}
                        </p>
                      )}
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0 flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedAppointment || submitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                Tạo hóa đơn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
