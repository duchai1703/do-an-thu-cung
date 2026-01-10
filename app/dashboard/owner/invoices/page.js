/**
 * Invoices Page - Premium UI
 * 
 * Features:
 * - Gradient header
 * - Stats cards (Total, Paid, Pending)
 * - Invoice list with status badges
 * - View invoice details
 * - VNPay Online Payment for PENDING invoices
 * 
 * APIs:
 * - GET /invoices (auto-filtered by owner)
 * - POST /payments/online/initiate (VNPay payment)
 */

"use client";
import { useState, useEffect } from "react";
import { 
  Receipt, Eye, Clock, CheckCircle, 
  CreditCard, DollarSign, Calendar, Wallet, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import { invoiceApi } from "@/lib/api";

export default function InvoicesPage() {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null); // invoiceId being processed

  const filterTabs = [
    { value: "all", label: "Tất cả", icon: Receipt },
    { value: "pending", label: "Chờ thanh toán", icon: Clock },
    { value: "paid", label: "Đã thanh toán", icon: CheckCircle }
  ];

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getMyInvoices();
      const data = response.data || response || [];
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      showToast("Không thể tải danh sách hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInvoices = () => {
    if (filter === "pending") {
      return invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'UNPAID');
    } else if (filter === "paid") {
      return invoices.filter(inv => inv.status === 'PAID');
    }
    return invoices;
  };

  const getStats = () => {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'PAID').length;
    const pending = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'UNPAID').length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    return { total, paid, pending, totalAmount };
  };

  // Initiate VNPay online payment
  const handlePayment = async (invoiceId) => {
    try {
      setProcessingPayment(invoiceId);
      
      const response = await apiClient.post('/payments/online/initiate', {
        invoiceId: invoiceId,
        paymentMethod: 'VNPAY',
        returnUrl: window.location.href, // Return to this page after payment
        locale: 'vi'
      });

      const data = response.data || response;
      
      if (data.paymentUrl) {
        // Redirect to VNPay payment page
        showToast("Đang chuyển đến trang thanh toán VNPay...", "success");
        window.location.href = data.paymentUrl;
      } else {
        showToast("Không thể khởi tạo thanh toán", "error");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      showToast(error.response?.data?.message || "Không thể thanh toán", "error");
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-amber-500", label: "Chờ thanh toán" },
      UNPAID: { className: "bg-amber-500", label: "Chưa thanh toán" },
      PROCESSING_ONLINE: { className: "bg-blue-500", label: "Đang xử lý" },
      PAID: { className: "bg-green-500", label: "Đã thanh toán" },
      CANCELLED: { className: "bg-red-500", label: "Đã hủy" },
      FAILED: { className: "bg-red-500", label: "Thất bại" }
    };
    return variants[status] || variants.PENDING;
  };

  const stats = getStats();
  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Receipt className="h-8 w-8" />
            Thanh Toán & Hóa Đơn
          </h1>
          <p className="text-white/90">
            Xem và quản lý các hóa đơn thanh toán
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng hóa đơn</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.total}</p>
                </div>
                <Receipt className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Đã thanh toán</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.paid}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Chờ thanh toán</p>
                  <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.pending}</p>
                </div>
                <Clock className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng tiền</p>
                  <p className="text-2xl font-bold mt-2">
                    {loading ? "..." : stats.totalAmount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  variant={filter === tab.value ? "default" : "outline"}
                  size="sm"
                  className={filter === tab.value ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.invoiceId || invoice.id}
                className="hover:shadow-xl transition-shadow border-l-4 border-l-emerald-500"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getStatusBadge(invoice.status).className}>
                          {getStatusBadge(invoice.status).label}
                        </Badge>
                        <span className="text-gray-600 font-mono">
                          #{invoice.invoiceId || invoice.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ngày tạo</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        
                        {invoice.appointment && (
                          <div>
                            <p className="text-gray-600">Dịch vụ</p>
                            <p className="font-medium">
                              {invoice.appointment.service?.serviceName || 'N/A'}
                            </p>
                          </div>
                        )}

                        {invoice.pet && (
                          <div>
                            <p className="text-gray-600">Thú cưng</p>
                            <p className="font-medium">{invoice.pet.name}</p>
                          </div>
                        )}

                        {invoice.paymentMethod && (
                          <div>
                            <p className="text-gray-600">Phương thức</p>
                            <p className="font-medium flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              {invoice.paymentMethod}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tổng tiền</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(invoice.totalAmount || 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => setSelectedInvoice(invoice)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Button>
                        {/* Show payment button for PENDING invoices */}
                        {(invoice.status === 'PENDING' || invoice.status === 'UNPAID') && (
                          <Button
                            onClick={() => handlePayment(invoice.invoiceId || invoice.id)}
                            disabled={processingPayment === (invoice.invoiceId || invoice.id)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500"
                          >
                            {processingPayment === (invoice.invoiceId || invoice.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Wallet className="h-4 w-4 mr-2" />
                                Thanh toán
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-8xl mb-4">🧾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có hóa đơn
              </h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "Bạn chưa có hóa đơn nào"
                  : "Không tìm thấy hóa đơn phù hợp với bộ lọc"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi Tiết Hóa Đơn</h2>
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã hóa đơn</span>
                  <span className="font-mono font-bold">
                    #{selectedInvoice.invoiceId || selectedInvoice.id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái</span>
                  <Badge className={getStatusBadge(selectedInvoice.status).className}>
                    {getStatusBadge(selectedInvoice.status).label}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span>{new Date(selectedInvoice.createdAt || selectedInvoice.invoiceDate).toLocaleDateString('vi-VN')}</span>
                </div>

                {selectedInvoice.pet && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thú cưng</span>
                    <span>{selectedInvoice.pet.name}</span>
                  </div>
                )}

                {selectedInvoice.appointment?.service && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dịch vụ</span>
                    <span>{selectedInvoice.appointment.service.serviceName}</span>
                  </div>
                )}

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền</span>
                  <span className="text-emerald-600">
                    {(selectedInvoice.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Đóng
                </Button>
                {/* Show payment button for PENDING invoices */}
                {(selectedInvoice.status === 'PENDING' || selectedInvoice.status === 'UNPAID') && (
                  <Button
                    onClick={() => handlePayment(selectedInvoice.invoiceId || selectedInvoice.id)}
                    disabled={processingPayment === (selectedInvoice.invoiceId || selectedInvoice.id)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    {processingPayment === (selectedInvoice.invoiceId || selectedInvoice.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Thanh toán VNPay
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
