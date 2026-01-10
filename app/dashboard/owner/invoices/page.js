/**
 * Invoices Page - Premium UI v2
 * 
 * Features:
 * - Stunning gradient header với floating decorations
 * - 4 Premium stats cards với glassmorphism
 * - Filter tabs với gradient selection
 * - Premium invoice cards với status indicators
 * - Beautiful detail modal
 * - VNPay payment integration
 */

"use client";
import { useState, useEffect } from "react";
import { 
  Receipt, Eye, Clock, CheckCircle, X,
  CreditCard, DollarSign, Calendar, Wallet, Loader2, Sparkles
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
  const [processingPayment, setProcessingPayment] = useState(null);

  const filterTabs = [
    { value: "all", label: "Tất cả", icon: "📋", gradient: "from-purple-500 to-pink-500" },
    { value: "pending", label: "Chờ thanh toán", icon: "⏳", gradient: "from-amber-500 to-orange-500" },
    { value: "paid", label: "Đã thanh toán", icon: "✅", gradient: "from-green-500 to-emerald-500" }
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
    const paidAmount = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    return { total, paid, pending, totalAmount, paidAmount };
  };

  const handlePayment = async (invoiceId) => {
    try {
      setProcessingPayment(invoiceId);
      
      const response = await apiClient.post('/payments/online/initiate', {
        invoiceId: invoiceId,
        paymentMethod: 'VNPAY',
        returnUrl: window.location.href,
        locale: 'vi'
      });

      const data = response.data || response;
      
      if (data.paymentUrl) {
        showToast("Đang chuyển đến VNPay...", "success");
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
      PENDING: { className: "bg-amber-500", label: "⏳ Chờ thanh toán", color: "amber" },
      UNPAID: { className: "bg-amber-500", label: "⏳ Chưa thanh toán", color: "amber" },
      PROCESSING_ONLINE: { className: "bg-blue-500", label: "🔄 Đang xử lý", color: "blue" },
      PAID: { className: "bg-green-500", label: "✅ Đã thanh toán", color: "green" },
      CANCELLED: { className: "bg-red-500", label: "❌ Đã hủy", color: "red" },
      FAILED: { className: "bg-red-500", label: "⚠️ Thất bại", color: "red" }
    };
    return variants[status] || variants.PENDING;
  };

  const getPetIcon = (species) => {
    const s = species?.toLowerCase() || '';
    if (s.includes('chó') || s.includes('dog')) return '🐕';
    if (s.includes('mèo') || s.includes('cat')) return '🐈';
    return '🐾';
  };

  const stats = getStats();
  const filteredInvoices = getFilteredInvoices();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">🧾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">💳</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải hóa đơn...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* 🌈 Premium Gradient Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-3xl animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              {['💳', '🧾', '💰', '✅', '💵', '🎫'][i]}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                💳
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  Thanh Toán & Hóa Đơn
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </h1>
                <p className="text-white/80 mt-1">
                  Quản lý và thanh toán các hóa đơn dịch vụ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 📊 Premium Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('all')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Tổng hóa đơn</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                  <p className="text-white/70 text-xs mt-1">hóa đơn</p>
                </div>
                <div className="text-5xl opacity-80">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('paid')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Đã thanh toán</p>
                  <p className="text-4xl font-bold">{stats.paid}</p>
                  <p className="text-white/70 text-xs mt-1">hóa đơn</p>
                </div>
                <div className="text-5xl opacity-80">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setFilter('pending')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Chờ thanh toán</p>
                  <p className="text-4xl font-bold">{stats.pending}</p>
                  <p className="text-white/70 text-xs mt-1">hóa đơn</p>
                </div>
                <div className="text-5xl opacity-80">⏳</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:scale-105 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Đã chi</p>
                  <p className="text-2xl font-bold">{stats.paidAmount.toLocaleString('vi-VN')}</p>
                  <p className="text-white/70 text-xs mt-1">VNĐ</p>
                </div>
                <div className="text-5xl opacity-80">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔘 Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300
                ${filter === tab.value 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105` 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.value ? 'bg-white/30' : 'bg-gray-100'
              }`}>
                {tab.value === 'all' ? stats.total : 
                 tab.value === 'pending' ? stats.pending : stats.paid}
              </span>
            </button>
          ))}
        </div>

        {/* 🧾 Invoice List */}
        {filteredInvoices.length > 0 ? (
          <div className="space-y-4">
            {filteredInvoices.map((invoice, idx) => {
              const status = getStatusBadge(invoice.status);
              const isPending = invoice.status === 'PENDING' || invoice.status === 'UNPAID';
              const invoiceDate = new Date(invoice.createdAt || invoice.invoiceDate);
              
              return (
                <Card 
                  key={invoice.invoiceId || invoice.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex">
                    {/* Status Indicator */}
                    <div className={`w-2 ${
                      invoice.status === 'PAID' ? 'bg-green-500' :
                      isPending ? 'bg-amber-500' : 'bg-gray-300'
                    }`}></div>

                    <CardContent className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                              🧾
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">Hóa đơn</span>
                                <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">
                                  #{invoice.invoiceId || invoice.id}
                                </span>
                              </div>
                              <Badge className={status.className}>{status.label}</Badge>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-500 text-xs mb-1">📅 Ngày tạo</p>
                              <p className="font-semibold text-gray-800">
                                {invoiceDate.toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            
                            {invoice.pet && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1">🐾 Thú cưng</p>
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                  {getPetIcon(invoice.pet.species)} {invoice.pet.name}
                                </p>
                              </div>
                            )}
                            
                            {invoice.appointment?.service && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1">💉 Dịch vụ</p>
                                <p className="font-semibold text-gray-800 truncate">
                                  {invoice.appointment.service.serviceName}
                                </p>
                              </div>
                            )}

                            {invoice.paymentMethod && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1">💳 PT Thanh toán</p>
                                <p className="font-semibold text-gray-800">
                                  {invoice.paymentMethod}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col items-end justify-between min-w-[180px]">
                          <div className="text-right mb-3">
                            <p className="text-xs text-gray-500">Tổng tiền</p>
                            <p className="text-3xl font-bold text-gray-800">
                              {(invoice.totalAmount || 0).toLocaleString('vi-VN')}
                              <span className="text-lg text-gray-500">đ</span>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedInvoice(invoice)}
                              variant="outline"
                              size="sm"
                              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                            
                            {isPending && (
                              <Button
                                onClick={() => handlePayment(invoice.invoiceId || invoice.id)}
                                disabled={processingPayment === (invoice.invoiceId || invoice.id)}
                                size="sm"
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:scale-105 transition-transform"
                              >
                                {processingPayment === (invoice.invoiceId || invoice.id) ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Đang xử lý
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="h-4 w-4 mr-1" />
                                    Thanh toán
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4 animate-bounce">🧾</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
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

      {/* 📋 Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full overflow-hidden border-0 rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-8xl opacity-20 rotate-12">🧾</div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                    🧾
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi Tiết Hóa Đơn</h2>
                    <p className="text-white/80 text-sm font-mono">
                      #{selectedInvoice.invoiceId || selectedInvoice.id}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <CardContent className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Invoice Number */}
              {selectedInvoice.invoiceNumber && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-600">🔢 Số hóa đơn</span>
                  <span className="font-mono font-bold text-purple-600">{selectedInvoice.invoiceNumber}</span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Trạng thái</span>
                <Badge className={getStatusBadge(selectedInvoice.status).className}>
                  {getStatusBadge(selectedInvoice.status).label}
                </Badge>
              </div>

              {/* Issue Date */}
              {selectedInvoice.issueDate && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">📄 Ngày phát hành</span>
                  <span className="font-semibold">
                    {new Date(selectedInvoice.issueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">📅 Ngày tạo</span>
                <span className="font-semibold">
                  {new Date(selectedInvoice.createdAt || selectedInvoice.invoiceDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Updated At */}
              {selectedInvoice.updatedAt && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">🔄 Cập nhật lần cuối</span>
                  <span className="font-semibold text-sm">
                    {new Date(selectedInvoice.updatedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}

              {/* Paid At */}
              {selectedInvoice.paidAt && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-green-700">✅ Đã thanh toán lúc</span>
                  <span className="font-semibold text-green-700">
                    {new Date(selectedInvoice.paidAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}

              {selectedInvoice.pet && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">🐾 Thú cưng</span>
                  <span className="font-semibold flex items-center gap-1">
                    {getPetIcon(selectedInvoice.pet.species)} {selectedInvoice.pet.name}
                  </span>
                </div>
              )}

              {selectedInvoice.appointment?.service && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">💉 Dịch vụ</span>
                  <span className="font-semibold">{selectedInvoice.appointment.service.serviceName}</span>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-700 text-sm font-semibold">📝 Ghi chú:</span>
                  <p className="text-gray-700 mt-1">{selectedInvoice.notes}</p>
                </div>
              )}

              <hr className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold">
                    {(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>🎁 Giảm giá</span>
                    <span className="font-semibold">
                      -{(selectedInvoice.discount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
                
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>📋 Thuế</span>
                    <span className="font-semibold">
                      +{(selectedInvoice.tax || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <span className="text-lg font-semibold">💰 Tổng tiền</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {(selectedInvoice.totalAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* Appointment Details */}
              {selectedInvoice.appointment && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                  <p className="text-blue-700 font-semibold text-sm">📅 Chi tiết cuộc hẹn:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-1 font-mono">#{selectedInvoice.appointment.appointmentId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày:</span>
                      <span className="ml-1">{new Date(selectedInvoice.appointment.appointmentDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Giờ:</span>
                      <span className="ml-1">{selectedInvoice.appointment.startTime} - {selectedInvoice.appointment.endTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className="ml-1">{selectedInvoice.appointment.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <Button
                onClick={() => setSelectedInvoice(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Đóng
              </Button>
              
              {(selectedInvoice.status === 'PENDING' || selectedInvoice.status === 'UNPAID') && (
                <Button
                  onClick={() => handlePayment(selectedInvoice.invoiceId || selectedInvoice.id)}
                  disabled={processingPayment === (selectedInvoice.invoiceId || selectedInvoice.id)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg"
                >
                  {processingPayment === (selectedInvoice.invoiceId || selectedInvoice.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Thanh toán VNPay 💳
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
