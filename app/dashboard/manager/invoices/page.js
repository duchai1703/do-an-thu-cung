/**
 * Invoice Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/invoices
 * 
 * Features:
 * - Gradient header (Rose → Pink)
 * - Stats cards: Total, Pending, Paid, Revenue
 * - Status tabs & filters
 * - Invoice cards với customer info
 * - Payment status management
 * - Invoice detail modal
 * 
 * APIs:
 * - GET /invoices
 * - GET /invoices/:id
 * - PUT /invoices/:id/status
 * - GET /invoices/stats
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/components/ui/usePagination";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

export default function InvoicesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  // DateRangeFilter state
  const [dateRange, setDateRange] = useState({ start: null, end: null, preset: "all" });

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredInvoices, 10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [saving, setSaving] = useState(false);

  // Completed appointments without invoices
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    revenue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInvoices();
    calculateStats();
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [invoicesRes, appointmentsRes] = await Promise.all([
        apiClient.get('/invoices?includeAppointment=true&includePet=true&includePetOwner=true'),
        apiClient.get('/appointments?status=COMPLETED').catch(() => ({ data: [] }))
      ]);
      
      console.log('Invoices response:', invoicesRes.data);
      
      const invoicesData = Array.isArray(invoicesRes.data) ? invoicesRes.data : 
                  (invoicesRes.data?.data || []);
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : 
                  (appointmentsRes.data?.data || []);
      
      console.log('Parsed invoices:', invoicesData);
      console.log('Parsed appointments:', appointmentsData);
      
      // Filter appointments that don't have invoices yet
      const invoicedAppointmentIds = new Set(
        invoicesData.map(inv => inv.appointmentId || inv.appointment?.appointmentId).filter(Boolean)
      );
      const pendingAppointments = appointmentsData.filter(
        apt => !invoicedAppointmentIds.has(apt.appointmentId || apt.id)
      );
      
      setInvoices(invoicesData);
      setCompletedAppointments(pendingAppointments);
    } catch (error) {
      console.error("Error loading invoices:", error);
      showToast("Không thể tải danh sách hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => {
        const status = inv.paymentStatus || inv.status;
        return status?.toUpperCase() === statusFilter.toUpperCase();
      });
    }

    // Filter by date - either single date or date range
    if (dateFilter) {
      filtered = filtered.filter(inv => {
        const invoiceDate = (inv.createdAt || inv.invoiceDate)?.split('T')[0];
        return invoiceDate === dateFilter;
      });
    } else if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(inv => {
        const invoiceDate = new Date(inv.createdAt || inv.invoiceDate);
        if (dateRange.start && invoiceDate < dateRange.start) return false;
        if (dateRange.end && invoiceDate > dateRange.end) return false;
        return true;
      });
    }

    // Filter by search - Check all relevant fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => {
        const invoiceNum = (inv.invoiceNumber || inv.invoiceId || inv.id || '');
        const customerName = (inv.customer?.fullName || inv.owner?.fullName || inv.petOwner?.fullName || '');
        const petName = (inv.pet?.name || '');
        
        return invoiceNum.toString().toLowerCase().includes(term) ||
               customerName.toLowerCase().includes(term) ||
               petName.toLowerCase().includes(term);
      });
    }

    setFilteredInvoices(filtered);
  };

  const calculateStats = () => {
    const total = invoices.length;
    const pending = invoices.filter(inv => {
      const status = (inv.paymentStatus || inv.status)?.toUpperCase();
      return status === 'PENDING' || status === 'UNPAID';
    }).length;
    const paid = invoices.filter(inv => {
      const status = (inv.paymentStatus || inv.status)?.toUpperCase();
      return status === 'PAID' || status === 'COMPLETED';
    }).length;
    const revenue = invoices
      .filter(inv => {
        const status = (inv.paymentStatus || inv.status)?.toUpperCase();
        return status === 'PAID' || status === 'COMPLETED';
      })
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);

    setStats({ total, pending, paid, revenue });
  };

  const handleViewInvoice = async (invoice) => {
    // Invoice from list already has all relations (petOwner, pet, service)
    // so we use it directly instead of fetching again
    console.log('📋 Invoice data:', invoice);
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleUpdateStatus = async (invoice, newStatus) => {
    const id = invoice.invoiceId || invoice.id;
    
    try {
      setSaving(true);
      // Backend uses different endpoints for different status changes
      if (newStatus === 'PAID') {
        await apiClient.put(`/invoices/${id}/mark-paid`);
      } else if (newStatus === 'FAILED') {
        await apiClient.put(`/invoices/${id}/mark-failed`);
      } else if (newStatus === 'PROCESSING') {
        await apiClient.put(`/invoices/${id}/mark-processing`);
      } else {
        throw new Error('Invalid status');
      }
      showToast(`Đã cập nhật trạng thái hóa đơn! ✅`, "success");
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating invoice:", error);
      showToast(error.response?.data?.message || "Không thể cập nhật hóa đơn", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvoice = async (appointment) => {
    const appointmentId = appointment.appointmentId || appointment.id;
    
    try {
      setSaving(true);
      console.log('Creating invoice for appointmentId:', appointmentId);
      const response = await apiClient.post('/invoices', { appointmentId });
      console.log('Create invoice response:', response.data);
      showToast(`Đã tạo hóa đơn thành công! 🧾`, "success");
      loadData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
      console.error("Error response:", error.response?.data);
      showToast(error.response?.data?.message || "Không thể tạo hóa đơn", "error");
    } finally {
      setSaving(false);
    }
  };

  // UI Helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const configs = {
      'PENDING': { label: 'Chờ thanh toán', emoji: '🟡', bg: 'bg-yellow-100 text-yellow-700', color: 'yellow' },
      'UNPAID': { label: 'Chưa thanh toán', emoji: '🔴', bg: 'bg-red-100 text-red-700', color: 'red' },
      'PAID': { label: 'Đã thanh toán', emoji: '🟢', bg: 'bg-green-100 text-green-700', color: 'green' },
      'COMPLETED': { label: 'Hoàn thành', emoji: '✅', bg: 'bg-green-100 text-green-700', color: 'green' },
      'CANCELLED': { label: 'Đã hủy', emoji: '❌', bg: 'bg-gray-100 text-gray-700', color: 'gray' },
      'REFUNDED': { label: 'Đã hoàn tiền', emoji: '↩️', bg: 'bg-purple-100 text-purple-700', color: 'purple' }
    };
    return configs[s] || configs.PENDING;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'CASH': '💵 Tiền mặt',
      'CARD': '💳 Thẻ',
      'TRANSFER': '🏦 Chuyển khoản',
      'MOMO': '📱 MoMo',
      'VNPAY': '📱 VNPay',
      'ZALOPAY': '📱 ZaloPay'
    };
    return methods[method?.toUpperCase()] || method || 'N/A';
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', count: invoices.length },
    { id: 'PENDING', label: '🟡 Chờ TT', count: stats.pending },
    { id: 'PAID', label: '🟢 Đã TT', count: stats.paid },
    { id: 'CANCELLED', label: '❌ Đã hủy', count: invoices.filter(i => (i.paymentStatus || i.status)?.toUpperCase() === 'CANCELLED').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🧾</div>
          <p className="text-gray-500 text-lg">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">🧾</span>
                Quản Lý Hóa Đơn
              </h1>
              <p className="text-white/90">
                Theo dõi thanh toán và doanh thu
              </p>
            </div>
            <div className="flex gap-2">
              {completedAppointments.length > 0 && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
                >
                  ➕ Tạo hóa đơn ({completedAppointments.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">🧾 Tổng hóa đơn</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">🟡 Chờ thanh toán</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-sm text-gray-500">🟢 Đã thanh toán</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-rose-600">{formatCurrency(stats.revenue)}</p>
              <p className="text-sm text-gray-500">💰 Tổng doanh thu</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Filter */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <DateRangeFilter
              onChange={(start, end, preset) => setDateRange({ start, end, preset })}
              defaultPreset="all"
              showCustomRange={true}
              theme="pink"
              size="sm"
              showLabel={true}
              compact={false}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo mã HĐ, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter (single date) - Optional alongside date range */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-auto"
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter("")}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Invoice Count */}
        <p className="text-sm text-gray-500 mb-4">
          Hiển thị {filteredInvoices.length} / {invoices.length} hóa đơn
        </p>

        {/* Invoice List */}
        {filteredInvoices.length > 0 ? (
          <div className="space-y-3">
            {paginatedData.map((invoice, idx) => {
              const invoiceId = invoice.invoiceId || invoice.id;
              const status = getStatusConfig(invoice.paymentStatus || invoice.status);
              const customer = invoice.petOwner || invoice.customer || invoice.owner;
              const pet = invoice.pet;
              const serviceName = invoice.service?.serviceName;
              
              return (
                <Card 
                  key={invoiceId || idx} 
                  className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Invoice Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                        status.color === 'green' ? 'bg-green-100' :
                        status.color === 'yellow' ? 'bg-yellow-100' :
                        status.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        🧾
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">
                            #{invoice.invoiceNumber || invoiceId}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}>
                            {status.emoji} {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          👤 {customer?.fullName || 'Khách vãng lai'}
                          {pet && <> • 🐾 {pet.name}</>}
                          {serviceName && <> • 💼 {serviceName}</>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          📆 {formatDateTime(invoice.createdAt || invoice.issueDate)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-rose-600">
                          {formatCurrency(invoice.totalAmount || invoice.total)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {/* Show service count: 1 if service exists, otherwise check items array */}
                          {(invoice.service || invoice.appointment?.service) ? 
                            '1 dịch vụ' : 
                            `${invoice.items?.length || invoice.invoiceItems?.length || 0} dịch vụ`
                          }
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        {(status.color === 'yellow' || status.color === 'red') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice, 'PAID'); }}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100"
                          >
                            💰 Thanh toán
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}
                          className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white shadow-xl">
            <CardContent className="py-16 text-center">
              <span className="text-8xl block mb-4">🧾</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy hóa đơn</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Invoice Detail Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🧾 Chi tiết hóa đơn #{selectedInvoice.invoiceNumber || selectedInvoice.invoiceId || selectedInvoice.id}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedInvoice.paymentStatus || selectedInvoice.status).bg}`}>
                    {getStatusConfig(selectedInvoice.paymentStatus || selectedInvoice.status).emoji} {getStatusConfig(selectedInvoice.paymentStatus || selectedInvoice.status).label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  📆 {formatDateTime(selectedInvoice.createdAt || selectedInvoice.invoiceDate)}
                </p>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">👤 Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Họ tên: <span className="font-medium">{selectedInvoice.petOwner?.fullName || selectedInvoice.customer?.fullName || 'N/A'}</span></p>
                  <p>SĐT: <span className="font-medium">{selectedInvoice.petOwner?.phoneNumber || selectedInvoice.customer?.phoneNumber || 'N/A'}</span></p>
                  <p>Địa chỉ: <span className="font-medium">{selectedInvoice.petOwner?.address || 'N/A'}</span></p>
                  {selectedInvoice.pet && (
                    <p>Thú cưng: <span className="font-medium">🐾 {selectedInvoice.pet.name} ({selectedInvoice.pet.species})</span></p>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">📋 Chi tiết dịch vụ</h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">Dịch vụ</th>
                        <th className="text-center p-3">SL</th>
                        <th className="text-right p-3">Đơn giá</th>
                        <th className="text-right p-3">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Display items from backend if available */}
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className={`border-t ${item.itemType === 'ADDITIONAL' ? 'bg-blue-50' : ''}`}>
                            <td className="p-3">
                              {item.itemType === 'ADDITIONAL' && '💡 '}
                              {item.description}
                            </td>
                            <td className="text-center p-3">{item.quantity}</td>
                            <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right p-3 font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          {/* Fallback: Display service info if available but no items */}
                          {(selectedInvoice.service || selectedInvoice.appointment?.service) && (
                            <tr className="border-t">
                              <td className="p-3">{selectedInvoice.service?.serviceName || selectedInvoice.appointment?.service?.serviceName}</td>
                              <td className="text-center p-3">1</td>
                              <td className="text-right p-3">{formatCurrency(selectedInvoice.service?.basePrice || selectedInvoice.appointment?.service?.basePrice)}</td>
                              <td className="text-right p-3 font-medium">{formatCurrency(selectedInvoice.service?.basePrice || selectedInvoice.appointment?.service?.basePrice)}</td>
                            </tr>
                          )}
                          {/* No items and no service */}
                          {!(selectedInvoice.service || selectedInvoice.appointment?.service) && (
                            <tr className="border-t">
                              <td colSpan="4" className="p-3 text-center text-gray-500">Không có chi tiết dịch vụ</td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      {/* Subtotal */}
                      <tr className="border-t">
                        <td colSpan="3" className="p-3 text-right text-gray-600">Tạm tính:</td>
                        <td className="p-3 text-right">
                          {formatCurrency(selectedInvoice.subtotal || (selectedInvoice.service?.basePrice || selectedInvoice.appointment?.service?.basePrice || 0))}
                        </td>
                      </tr>
                      {/* Additional services - show calculated difference if exists */}
                      {(() => {
                        const additionalAmount = (selectedInvoice.totalAmount || selectedInvoice.total || 0) - 
                          (selectedInvoice.subtotal || 0) - 
                          (selectedInvoice.tax || 0) + 
                          (selectedInvoice.discount || 0);
                        return additionalAmount > 0 && !selectedInvoice.notes?.includes('+') && (
                          <tr>
                            <td colSpan="3" className="p-3 text-right text-gray-600">
                              <span className="flex items-center justify-end gap-1">
                                Dịch vụ bổ sung:
                                <span className="text-xs text-gray-400" title="Chi tiết trong ghi chú">ℹ️</span>
                              </span>
                            </td>
                            <td className="p-3 text-right text-blue-600">
                              {formatCurrency(additionalAmount)}
                            </td>
                          </tr>
                        );
                      })()}
                      {/* Discount - only show if has discount */}
                      {selectedInvoice.discount > 0 && (
                        <tr>
                          <td colSpan="3" className="p-3 text-right text-gray-600">Giảm giá:</td>
                          <td className="p-3 text-right text-green-600">
                            - {formatCurrency(selectedInvoice.discount)}
                          </td>
                        </tr>
                      )}
                      {/* Tax */}
                      {selectedInvoice.tax > 0 && (
                        <tr>
                          <td colSpan="3" className="p-3 text-right text-gray-600">Thuế VAT:</td>
                          <td className="p-3 text-right">
                            {formatCurrency(selectedInvoice.tax || 0)}
                          </td>
                        </tr>
                      )}
                      {/* Total */}
                      <tr className="border-t font-bold">
                        <td colSpan="3" className="p-3 text-right">Tổng cộng:</td>
                        <td className="p-3 text-right text-rose-600 text-lg">
                          {formatCurrency(selectedInvoice.totalAmount || selectedInvoice.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              {selectedInvoice.paymentMethod && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">💳 Thông tin thanh toán</h3>
                  <p className="text-sm">
                    Phương thức: <span className="font-medium">{getPaymentMethodLabel(selectedInvoice.paymentMethod)}</span>
                  </p>
                  {selectedInvoice.paidAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán lúc: {formatDateTime(selectedInvoice.paidAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📝 Ghi chú</h3>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseModal}>
                  Đóng
                </Button>
                {((selectedInvoice.paymentStatus || selectedInvoice.status)?.toUpperCase() === 'PENDING' ||
                  (selectedInvoice.paymentStatus || selectedInvoice.status)?.toUpperCase() === 'UNPAID') && (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedInvoice, 'PAID')}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    {saving ? '⏳ Đang xử lý...' : '💰 Xác nhận thanh toán'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                ➕ Tạo hóa đơn từ lịch hẹn
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                {completedAppointments.length} lịch hẹn đã hoàn thành chưa có hóa đơn
              </p>

              {completedAppointments.length > 0 ? (
                <div className="space-y-3">
                  {completedAppointments.map((apt, idx) => {
                    const aptId = apt.appointmentId || apt.id;
                    return (
                      <div 
                        key={aptId || idx} 
                        className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl">
                          ✅
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            🐾 {apt.pet?.name || 'N/A'} - {apt.service?.serviceName || apt.serviceName || 'Dịch vụ'}
                          </p>
                          <p className="text-sm text-gray-500">
                            👤 {apt.pet?.owner?.fullName || apt.owner?.fullName || 'Chủ thú cưng'}
                            {' • '}📅 {formatDateTime(apt.appointmentDate || apt.scheduledDate)}
                          </p>
                          <p className="text-sm text-rose-600 font-medium">
                            💰 {formatCurrency(apt.service?.basePrice || apt.totalAmount || 0)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCreateInvoice(apt)}
                          disabled={saving}
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                        >
                          {saving ? '⏳' : '🧾 Tạo HĐ'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl block mb-3">✅</span>
                  <p className="text-gray-500">Tất cả lịch hẹn đã được tạo hóa đơn</p>
                </div>
              )}

              <div className="flex justify-end pt-4 mt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
