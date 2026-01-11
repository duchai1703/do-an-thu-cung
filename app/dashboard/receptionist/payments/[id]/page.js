"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  Printer,
  Download,
  PawPrint
} from "lucide-react";
import { invoiceApi, paymentApi } from "@/lib/api";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoiceDetail();
  }, [invoiceId]);

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
      } else {
        alert("Không tìm thấy hóa đơn");
        router.back();
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Lỗi khi tải hóa đơn");
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy hóa đơn</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Chi tiết hóa đơn</h1>
              <p className="text-gray-500 mt-1">Mã hóa đơn: <span className="font-mono font-bold">{invoice.invoiceNumber}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isPaid && (
              <>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  In biên nhận
                </Button>
                <Button onClick={handleDownloadPDF} className="bg-gradient-to-r from-violet-500 to-purple-600">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Badge className={`text-lg px-6 py-2 ${
                isPaid 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white' 
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
              }`}>
                {isPaid ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Đã thanh toán</>
                ) : (
                  <><Clock className="w-5 h-5 mr-2" /> Chờ thanh toán</>
                )}
              </Badge>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="w-5 h-5" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {invoice.petOwner?.fullName?.[0] || 'N'}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Họ tên</p>
                  <p className="font-semibold text-gray-800">{invoice.petOwner?.fullName || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-semibold text-gray-800">{invoice.petOwner?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{invoice.petOwner?.account?.email || 'N/A'}</p>
                </div>
              </div>
              
              {invoice.appointment?.pet && (
                <div className="flex items-center gap-3">
                  <PawPrint className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-gray-500">Thú cưng</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.appointment.pet.name} ({invoice.appointment.pet.species})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        {invoice.appointment && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="w-5 h-5" />
                Chi tiết lịch hẹn
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Dịch vụ</p>
                  <p className="font-semibold text-gray-800">{invoice.appointment.service?.serviceName || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Ngày hẹn</p>
                  <p className="font-semibold text-gray-800">
                    {invoice.appointment.appointmentDate ? formatDate(invoice.appointment.appointmentDate) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Thời gian</p>
                  <p className="font-semibold text-gray-800">
                    {invoice.appointment.startTime} - {invoice.appointment.endTime}
                  </p>
                </div>
                
                {invoice.appointment.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Ghi chú</p>
                    <p className="font-semibold text-gray-800">{invoice.appointment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Details */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5" />
              Chi tiết hóa đơn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Ngày phát hành</p>
                <p className="font-semibold text-gray-800">{formatDate(invoice.issueDate)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Hạn thanh toán</p>
                <p className="font-semibold text-gray-800">{formatDate(invoice.dueDate)}</p>
              </div>
              
              {isPaid && invoice.paidDate && (
                <div>
                  <p className="text-sm text-gray-500">Ngày thanh toán</p>
                  <p className="font-semibold text-emerald-600">{formatDate(invoice.paidDate)}</p>
                </div>
              )}
              
              {invoice.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="font-semibold text-gray-800">{invoice.notes}</p>
                </div>
              )}
            </div>
            
            {/* Payment Info */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-800 mb-4">Thông tin thanh toán</h4>
                {invoice.payments.map((payment, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Phương thức</p>
                        <p className="font-semibold text-gray-800">
                          {payment.paymentMethod === 'CASH' ? '💵 Tiền mặt' :
                           payment.paymentMethod === 'BANK_TRANSFER' ? '🏦 Chuyển khoản' :
                           payment.paymentMethod === 'VNPAY' ? '📱 VNPay' : payment.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số tiền</p>
                        <p className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                      </div>
                      {payment.transactionId && (
                        <div>
                          <p className="text-sm text-gray-500">Mã giao dịch</p>
                          <p className="font-mono text-sm text-gray-800">{payment.transactionId}</p>
                        </div>
                      )}
                      {payment.notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Ghi chú thanh toán</p>
                          <p className="text-gray-800">{payment.notes}</p>
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
    </div>
  );
}
