"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  CreditCard,
  Stethoscope,
  PawPrint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { petOwnerApi, invoiceApi } from "@/lib/api";

export default function CustomerHistoryTabs({ customerId, customerName }) {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadHistory();
    }
  }, [customerId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Load appointments for this customer
      const appointmentsRes = await petOwnerApi?.getAppointments 
        ? await petOwnerApi.getAppointments(customerId)
        : { success: false };
      
      // Load invoices for this customer  
      const invoicesRes = await petOwnerApi?.getInvoices
        ? await petOwnerApi.getInvoices(customerId)
        : { success: false };

      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data || []);
      }
      if (invoicesRes.success) {
        setInvoices(invoicesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading customer history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "--";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status, type) => {
    if (type === 'appointment') {
      switch (status?.toUpperCase()) {
        case 'PENDING':
          return <Badge className="bg-amber-100 text-amber-700 border-0">Chờ xác nhận</Badge>;
        case 'CONFIRMED':
          return <Badge className="bg-blue-100 text-blue-700 border-0">Đã xác nhận</Badge>;
        case 'COMPLETED':
          return <Badge className="bg-emerald-100 text-emerald-700 border-0">Hoàn thành</Badge>;
        case 'CANCELLED':
          return <Badge className="bg-gray-100 text-gray-500 border-0">Đã hủy</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-500 border-0">{status}</Badge>;
      }
    } else {
      switch (status?.toUpperCase()) {
        case 'PENDING':
          return <Badge className="bg-amber-100 text-amber-700 border-0">Chờ thanh toán</Badge>;
        case 'PAID':
          return <Badge className="bg-emerald-100 text-emerald-700 border-0">Đã thanh toán</Badge>;
        case 'OVERDUE':
          return <Badge className="bg-rose-100 text-rose-700 border-0">Quá hạn</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-500 border-0">{status}</Badge>;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveTab("appointments")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
            activeTab === "appointments"
              ? "bg-white text-violet-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Calendar className="w-4 h-4" />
          Lịch hẹn ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
            activeTab === "invoices"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <FileText className="w-4 h-4" />
          Hóa đơn ({invoices.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {activeTab === "appointments" && (
            <>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có lịch hẹn nào</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.appointmentId}
                    className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{apt.service?.serviceName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <PawPrint className="w-3 h-3" />
                            <span>{apt.pet?.name}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(apt.status, 'appointment')}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(apt.appointmentDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.startTime || '--:--'}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(apt.estimatedCost)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "invoices" && (
            <>
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có hóa đơn nào</p>
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.invoiceId}
                    className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{inv.invoiceNumber || `#${inv.invoiceId}`}</p>
                          <p className="text-sm text-gray-500">{inv.appointment?.service?.serviceName}</p>
                        </div>
                      </div>
                      {getStatusBadge(inv.status, 'invoice')}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inv.issueDate)}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(inv.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
