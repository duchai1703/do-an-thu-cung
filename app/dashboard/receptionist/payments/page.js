"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  Search, 
  Calendar, 
  Phone, 
  Stethoscope, 
  Bath, 
  Scissors, 
  ClipboardList, 
  Banknote, 
  Building2, 
  Loader2,
  Filter,
  TrendingUp,
  Wallet,
  Receipt,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  MoreHorizontal,
  EyeIcon,
  Printer,
  FileText,
  Plus,
  Smartphone
} from "lucide-react";
import InvoiceDetailModal from "@/components/receptionist/InvoiceDetailModal";
import { cn } from "@/lib/utils";
import { invoiceApi, paymentApi, getToken } from "@/lib/api";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await invoiceApi.getAll({
        includePetOwner: true,
        includeAppointment: true,
        includePayment: true,
      });

      if (response.success && response.data) {
        console.log("=== INVOICE API RESPONSE ===" );
        console.log("Total invoices:", response.data.length);
        if (response.data[0]) {
          console.log("Sample invoice:", response.data[0]);
          console.log("petOwner:", response.data[0].petOwner);
          console.log("appointment:", response.data[0].appointment);
        }
        console.log(response.data);
        
        const formattedPayments = response.data.map(invoice => {
          const isPaid = invoice.status === 'PAID';
          
          // Get payment method from successful payments only
          const successfulPayment = invoice.payments?.find(p => p.paymentStatus === 'SUCCESS');
          const paymentMethod = successfulPayment?.paymentMethod || null;

          return {
            id: invoice.invoiceId || invoice.id,
            invoiceId: invoice.invoiceId || invoice.id,
            invoiceNumber: invoice.invoiceNumber || `INV-${invoice.invoiceId}`,
            customerName: invoice.petOwner?.fullName || 'N/A',
            phone: invoice.petOwner?.phoneNumber || 'N/A',
            email: invoice.petOwner?.account?.email || 'N/A',
            service: invoice.appointment?.service?.serviceName || 'N/A',
            serviceIcon: '📋',
            amount: invoice.totalAmount || 0,
            date: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('vi-VN') : 'N/A',
            dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
            dueDateFormatted: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : 'N/A',
            time: invoice.createdAt ? new Date(invoice.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            status: isPaid ? 'paid' : 'pending',
            paymentMethod: paymentMethod,
            rawData: invoice
          };
        });
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchFilter = filter === "all" || payment.status === filter;
    const matchSearch = payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone?.includes(searchTerm) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
    return matchFilter && matchSearch && matchMethod;
  });

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🏥': return Stethoscope;
      case '🛁': return Bath;
      case '✂️': return Scissors;
      default: return ClipboardList;
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      alert("⚠️ Vui lòng chọn phương thức thanh toán!");
      return;
    }

    try {
      setProcessing(true);
      
      // Handle VNPay separately - online payment gateway
      if (selectedMethod === "VNPay") {
        // Build return URL for VNPay callback
        const baseUrl = window.location.origin;
        const returnUrl = `${baseUrl}/dashboard/receptionist/payments/vnpay-return`;
        
        console.log("🔄 Initiating VNPay payment with return URL:", returnUrl);
        
        const response = await paymentApi.initiateOnline({
          invoiceId: selectedPayment.invoiceId,
          paymentMethod: 'VNPAY',
          returnUrl: returnUrl,
          locale: 'vn'
        });

        const data = response.data || response;
        
        if (data.paymentUrl) {
          alert('✅ Đang chuyển đến VNPay...');
          // Redirect to VNPay payment page
          window.location.href = data.paymentUrl;
        } else {
          alert('❌ Không thể khởi tạo thanh toán VNPay');
          setProcessing(false);
        }
        return;
      }
      
      const methodMap = {
        "Tiền mặt": "CASH",
        "Chuyển khoản": "BANK_TRANSFER"
      };

      const paymentData = {
        invoiceId: selectedPayment.invoiceId,
        amount: selectedPayment.amount,
        paymentMethod: methodMap[selectedMethod] || "CASH",
        notes: paymentNotes || undefined
      };

      const response = await paymentApi.create(paymentData);

      if (response.success) {
        alert(`✅ Đã xác nhận thanh toán ${formatCurrency(selectedPayment.amount)} qua ${selectedMethod}`);
        await loadPayments();
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setSelectedMethod("");
        setPaymentNotes("");
      } else {
        alert('Lỗi khi xác nhận thanh toán: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Lỗi khi xác nhận thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý thanh toán</h1>
              <p className="text-gray-500">Theo dõi và xác nhận thanh toán từ khách hàng</p>
            </div>
          </div>
          
          <Button 
            onClick={() => loadPayments()}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {paidCount} đơn đã thanh toán
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Chờ thanh toán</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(pendingAmount)}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {pendingCount} đơn chờ xử lý
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng hóa đơn</p>
                  <p className="text-4xl font-bold mt-1">{payments.length}</p>
                  <p className="text-white/70 text-xs mt-2">📅 Hôm nay</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Receipt className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-100/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-gray-500">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Lọc:</span>
                </div>
                <Tabs value={filter} onValueChange={setFilter} className="w-full lg:w-auto">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100/80">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Tất cả
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                      Chờ thanh toán
                    </TabsTrigger>
                    <TabsTrigger value="paid" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Đã thanh toán
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã hóa đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 bg-white rounded-xl"
                />
              </div>
            </div>
            
            {/* Method Filter */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Phương thức:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Tất cả', color: 'gray', count: payments.length },
                  { value: 'CASH', label: '💵 Tiền mặt', color: 'emerald', count: payments.filter(p => p.paymentMethod === 'CASH').length },
                  { value: 'BANK_TRANSFER', label: '🏦 Chuyển khoản', color: 'blue', count: payments.filter(p => p.paymentMethod === 'BANK_TRANSFER').length },
                  { value: 'VNPAY', label: '📱 VNPay', color: 'rose', count: payments.filter(p => p.paymentMethod === 'VNPAY').length },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setMethodFilter(method.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                      methodFilter === method.value
                        ? method.value === 'CASH' ? "bg-emerald-500 text-white shadow-lg" :
                          method.value === 'BANK_TRANSFER' ? "bg-blue-500 text-white shadow-lg" :
                          method.value === 'VNPAY' ? "bg-rose-500 text-white shadow-lg" :
                          "bg-gray-800 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <span>{method.label}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs font-bold",
                      methodFilter === method.value 
                        ? "bg-white/30" 
                        : "bg-gray-200 text-gray-700"
                    )}>
                      {method.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-100/50 overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                  <CreditCard className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Danh sách thanh toán</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm px-4 py-1">
                  ℹ️ Hóa đơn tự động được tạo sau khi hoàn thành dịch vụ
                </Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm px-4 py-1">
                  {filteredPayments.length} hóa đơn
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-bold text-gray-700">Số HĐ</TableHead>
                    <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
                    <TableHead className="font-bold text-gray-700">Ngày lập</TableHead>
                    <TableHead className="font-bold text-gray-700 text-right">Số tiền</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Trạng thái</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">PT Thanh toán</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <CreditCard className="w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium">Không tìm thấy hóa đơn</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => {
                      const ServiceIcon = getServiceIcon(payment.serviceIcon);
                      return (
                        <TableRow 
                          key={payment.id} 
                          className="group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all"
                        >
                          <TableCell>
                            <Badge className="font-mono bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
                              {payment.invoiceNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-bold">
                                {(payment.customerName || 'N')[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{payment.customerName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {payment.phone}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" /> {payment.date}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <span className="text-xl font-bold text-emerald-600 font-mono">
                              {formatCurrency(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn(
                              "shadow-lg border-0",
                              payment.status === 'paid' 
                                ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white"
                                : "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                            )}>
                              {payment.status === 'paid' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Chờ thanh toán</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {payment.paymentMethod ? (
                              <Badge className={cn(
                                "shadow-sm font-medium",
                                payment.paymentMethod === 'CASH' ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                                payment.paymentMethod === 'BANK_TRANSFER' ? "bg-blue-100 text-blue-700 border border-blue-300" :
                                payment.paymentMethod === 'VNPAY' ? "bg-rose-100 text-rose-700 border border-rose-300" :
                                "bg-gray-100 text-gray-600"
                              )}>
                                {payment.paymentMethod === 'CASH' ? '💵 Tiền mặt' :
                                 payment.paymentMethod === 'BANK_TRANSFER' ? '🏦 Chuyển khoản' :
                                 payment.paymentMethod === 'VNPAY' ? '📱 VNPay' :
                                 payment.paymentMethod}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-2">
                              {payment.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowPaymentModal(true);
                                  }}
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Xác nhận
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setSelectedInvoiceId(payment.invoiceId);
                                      setShowInvoiceDetailModal(true);
                                    }}
                                  >
                                    <EyeIcon className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>Xem chi tiết</span>
                                  </DropdownMenuItem>
                                  
                                  {payment.status === 'paid' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="cursor-pointer"
                                        onClick={async () => {
                                          try {
                                            // Find payment ID from invoice
                                            if (payment.rawData?.payments?.[0]?.paymentId) {
                                              const paymentId = payment.rawData.payments[0].paymentId;
                                              const receiptResponse = await paymentApi.generateReceipt?.(paymentId);
                                              if (receiptResponse?.success) {
                                                alert('✅ Biên nhận đã được tạo');
                                                // Can trigger print dialog or download
                                                window.print();
                                              }
                                            } else {
                                              alert('⚠️ Chưa có thông tin thanh toán');
                                            }
                                          } catch (error) {
                                            console.error(error);
                                            alert('❌ Lỗi khi in biên nhận');
                                          }
                                        }}
                                      >
                                        <Printer className="mr-2 h-4 w-4 text-gray-600" />
                                        <span>In biên nhận</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="cursor-pointer"
                                        onClick={async () => {
                                          try {
                                            const pdfResponse = await invoiceApi.generatePdf?.(payment.invoiceId);
                                            if (pdfResponse?.success && pdfResponse?.data) {
                                              // Create blob URL and download
                                              const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
                                              const link = document.createElement('a');
                                              link.href = url;
                                              link.setAttribute('download', `${payment.invoiceNumber}.pdf`);
                                              document.body.appendChild(link);
                                              link.click();
                                              link.remove();
                                              alert('✅ Đã xuất PDF');
                                            } else {
                                              alert('⚠️ Không thể xuất PDF');
                                            }
                                          } catch (error) {
                                            console.error(error);
                                            alert('❌ Lỗi khi xuất PDF');
                                          }
                                        }}
                                      >
                                        <FileText className="mr-2 h-4 w-4 text-violet-500" />
                                        <span>Xuất PDF</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Modal */}
        <Dialog open={showPaymentModal} onOpenChange={() => {
          setShowPaymentModal(false);
          setSelectedPayment(null);
          setSelectedMethod("");
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                  <CreditCard className="w-6 h-6" />
                </div>
                <DialogTitle className="text-xl font-bold">Xác nhận thanh toán</DialogTitle>
              </div>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Mã hóa đơn</span>
                      <Badge variant="outline" className="font-mono bg-white">{selectedPayment.id}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Khách hàng</span>
                      <span className="font-bold text-gray-800">{selectedPayment.customerName}</span>
                    </div>
                    <div className="pt-3 border-t border-emerald-200">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700 font-bold">Tổng thanh toán</span>
                        <span className="text-3xl font-bold text-emerald-600">{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="font-bold text-gray-700">
                    Chọn phương thức thanh toán <span className="text-red-500">*</span>
                  </p>

                  <button
                    onClick={() => setSelectedMethod("Tiền mặt")}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      selectedMethod === "Tiền mặt" 
                        ? "border-emerald-500 bg-emerald-50" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      selectedMethod === "Tiền mặt" ? "bg-emerald-500 text-white" : "bg-gray-100"
                    )}>
                      <Banknote className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800">Tiền mặt</p>
                      <p className="text-sm text-gray-500">Thanh toán trực tiếp tại quầy</p>
                    </div>
                    {selectedMethod === "Tiền mặt" && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedMethod("Chuyển khoản")}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                      selectedMethod === "Chuyển khoản" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      selectedMethod === "Chuyển khoản" ? "bg-blue-500 text-white" : "bg-gray-100"
                    )}>
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800">Chuyển khoản</p>
                      <p className="text-sm text-gray-500">Thanh toán qua ngân hàng / ví điện tử</p>
                    </div>
                    {selectedMethod === "Chuyển khoản" && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedMethod("VNPay")}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:shadow-lg",
                      selectedMethod === "VNPay" 
                        ? "border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg" 
                        : "border-gray-200 hover:border-rose-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shadow-md",
                      selectedMethod === "VNPay" ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "bg-gray-100"
                    )}>
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        VNPay 
                        <span className="text-xs px-2 py-0.5 bg-rose-500 text-white rounded-full">Online</span>
                      </p>
                      <p className="text-sm text-gray-500">Thanh toán online qua cổng VNPay</p>
                      <p className="text-xs text-gray-400 mt-1">💳 Hỗ trợ thẻ ATM, visa, QR code</p>
                    </div>
                    {selectedMethod === "VNPay" && (
                      <CheckCircle2 className="w-6 h-6 text-rose-500" />
                    )}
                  </button>
                </div>

                {/* Payment Notes */}
                <div className="space-y-2">
                  <label className="font-medium text-gray-700">Ghi chú thanh toán</label>
                  <textarea 
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder={selectedMethod === "VNPay" 
                      ? "Ghi chú sẽ được lưu khi thanh toán hoàn tất..." 
                      : "Nhập ghi chú cho thanh toán..."}
                    className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={selectedMethod === "VNPay"}
                  />
                  {selectedMethod === "VNPay" && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      ℹ️ Khách hàng sẽ được chuyển đến trang VNPay để hoàn tất thanh toán
                    </p>
                  )}
                </div>

                <DialogFooter className="gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPayment(null);
                      setSelectedMethod("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleConfirmPayment} 
                    disabled={!selectedMethod || processing}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {selectedMethod === "VNPay" ? "Đang chuyển hướng..." : "Đang xử lý..."}
                      </>
                    ) : (
                      <>
                        {selectedMethod === "VNPay" ? (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Thanh toán VNPay 💳
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Xác nhận thanh toán
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <InvoiceDetailModal
          isOpen={showInvoiceDetailModal}
          onClose={() => setShowInvoiceDetailModal(false)}
          invoiceId={selectedInvoiceId}
        />
      </div>
    </div>
  );
}
