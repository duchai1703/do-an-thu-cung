"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  Download,
  PawPrint,
  Calendar,
  Loader2
} from "lucide-react";
import { invoiceApi, paymentApi } from "@/lib/api";

export default function InvoiceDetailModal({ isOpen, onClose, invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceDetail();
    }
  }, [isOpen, invoiceId]);

  const loadInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getById(invoiceId, {
        includePetOwner: true,
        includeAppointment: true,
        includePayments: true
      });
      
      if (response.success) {
        setInvoice(response.data);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePrint = async () => {
    if (invoice?.payments?.[0]?.paymentId) {
      try {
        const response = await paymentApi.generateReceipt(invoice.payments[0].paymentId);
        if (response.success) {
          window.print();
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi khi in biên nhận");
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await invoiceApi.generatePdf(invoiceId);
      if (response?.success && response?.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xuất PDF");
    }
  };

  const isPaid = invoice?.status === 'PAID';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Chi tiết hóa đơn</span>
            {invoice && (
              <div className="flex gap-2">
                {isPaid && (
                  <>
                    <Button onClick={handlePrint} variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      In
                    </Button>
                    <Button onClick={handleDownloadPDF} size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : invoice ? (
          <div className="space-y-4">
            {/* Status & Amount */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Mã hóa đơn</p>
                    <p className="font-mono font-bold text-lg">{invoice.invoiceNumber}</p>
                  </div>
                  <Badge className={`text-base px-4 py-1.5 ${
                    isPaid 
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                  }`}>
                    {isPaid ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Đã thanh toán</> : <><Clock className="w-4 h-4 mr-1" /> Chờ thanh toán</>}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                      {invoice.petOwner?.fullName?.[0] || 'N'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="font-semibold">{invoice.petOwner?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">SĐT</p>
                      <p className="font-semibold">{invoice.petOwner?.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-sm">{invoice.petOwner?.account?.email || 'N/A'}</p>
                    </div>
                  </div>
                  {invoice.appointment?.pet && (
                    <div className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs text-gray-500">Thú cưng</p>
                        <p className="font-semibold">{invoice.appointment.pet.name} ({invoice.appointment.pet.species})</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            {invoice.appointment && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Lịch hẹn
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Dịch vụ</p>
                      <p className="font-semibold">{invoice.appointment.service?.serviceName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày</p>
                      <p className="font-semibold">
                        {invoice.appointment.appointmentDate ? formatDate(invoice.appointment.appointmentDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Thời gian</p>
                      <p className="font-semibold">{invoice.appointment.startTime} - {invoice.appointment.endTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Thông tin hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Ngày phát hành</p>
                    <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hạn thanh toán</p>
                    <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                  </div>
                  {isPaid && invoice.paidDate && (
                    <div>
                      <p className="text-xs text-gray-500">Ngày thanh toán</p>
                      <p className="font-semibold text-emerald-600">{formatDate(invoice.paidDate)}</p>
                    </div>
                  )}
                </div>

                {/* Payments */}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-3">Thanh toán</h4>
                    {invoice.payments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Phương thức</p>
                            <p className="font-semibold">
                              {payment.paymentMethod === 'CASH' ? '💵 Tiền mặt' :
                               payment.paymentMethod === 'BANK_TRANSFER' ? '🏦 Chuyển khoản' :
                               payment.paymentMethod === 'VNPAY' ? '📱 VNPay' : payment.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Số tiền</p>
                            <p className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                          </div>
                          {payment.notes && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Ghi chú</p>
                              <p className="text-sm">{payment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy hóa đơn
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
