"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, CheckCircle2, Hourglass, Search, Eye, 
  Calendar, Receipt, ClipboardList 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import PaymentDetailModal from "@/components/modals/PaymentDetailModal";
import { cn } from "@/lib/utils";
import { invoiceApi, paymentApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function OwnerPaymentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await invoiceApi.getAll();
      
      if (response.success && response.data) {
        // Map backend data to frontend format
        const mappedInvoices = response.data.map(inv => {
          const firstService = inv.invoiceItems?.[0];
          return {
            id: inv.invoiceId || inv.id,
            invoiceCode: `INV${String(inv.invoiceId).padStart(4, '0')}`,
            serviceName: firstService?.service?.name || inv.invoiceItems?.map(i => i.service?.name).join(', ') || 'Dịch vụ',
            serviceIcon: getServiceIcon(firstService?.service?.categoryId),
            petName: inv.pet?.name || 'Unknown',
            petIcon: inv.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            serviceDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('vi-VN') : '',
            totalAmount: inv.totalAmount - (inv.discountAmount || 0) || 0,
            paymentStatus: inv.status === 'Paid' ? 'paid' : 'unpaid',
            paymentMethod: mapPaymentMethod(inv.payment?.paymentMethod),
            paidAt: inv.payment?.paymentDate ? new Date(inv.payment.paymentDate).toLocaleString('vi-VN') : null,
            // Full invoice data for detail modal
            fullInvoice: inv
          };
        });
        
        setInvoices(mappedInvoices);
      } else {
        console.error("Failed to load invoices:", response.error);
        showToast("Không thể tải danh sách hóa đơn", "error");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      showToast("Lỗi khi tải danh sách hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (categoryId) => {
    const iconMap = {
      1: '🏥', // Medical examination
      2: '💉', // Vaccination
      3: '🛁', // Bathing
      4: '✂️', // Grooming
      5: '💆', // Spa
    };
    return iconMap[categoryId] || '🐾';
  };

  const mapPaymentMethod = (method) => {
    const methodMap = {
      'CASH': 'cash',
      'TRANSFER': 'transfer',
      'ONLINE': 'online',
      'CARD': 'card'
    };
    return methodMap[method] || null;
  };

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handlePayNow = async (invoiceId) => {
    if (confirm("Xác nhận thanh toán hóa đơn này?")) {
      try {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        // Create payment for the invoice
        const paymentData = {
          invoiceId: invoiceId,
          paymentMethod: 'ONLINE',
          amount: invoice.totalAmount,
          paymentDate: new Date().toISOString()
        };

        const response = await paymentApi.create(paymentData);
        
        if (response.success) {
          // Reload invoices to get updated data
          await loadInvoices();
          showToast("Thanh toán thành công!", "success");
        } else {
          showToast("Không thể thanh toán. Vui lòng thử lại.", "error");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        showToast("Lỗi khi thanh toán hóa đơn", "error");
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchFilter = filter === "all" || invoice.paymentStatus === filter;
    const matchSearch = invoice.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       invoice.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.paymentStatus === 'paid').length,
    pending: invoices.filter(i => i.paymentStatus === 'unpaid').length
  };

  const filterOptions = [
    { value: "all", label: "Tất cả", icon: ClipboardList },
    { value: "paid", label: "Đã thanh toán", icon: CheckCircle2 },
    { value: "unpaid", label: "Chưa thanh toán", icon: Hourglass }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Thanh toán"
        subtitle="Quản lý hóa đơn và thanh toán dịch vụ"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={CreditCard}
          title="Tổng hóa đơn"
          value={loading ? "..." : stats.total}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đã thanh toán"
          value={loading ? "..." : stats.paid}
          color="success"
        />
        <StatsCard
          icon={Hourglass}
          title="Chưa thanh toán"
          value={loading ? "..." : stats.pending}
          color="warning"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground font-medium">Đang tải hóa đơn...</p>
            </CardContent>
          </Card>
        ) : filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {invoice.invoiceCode}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {invoice.serviceDate}
                      </div>
                    </div>
                    <Badge 
                      variant={invoice.paymentStatus === 'paid' ? "success" : "warning"}
                    >
                      {invoice.paymentStatus === 'paid' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Đã thanh toán
                        </>
                      ) : (
                        <>
                          <Hourglass className="h-3 w-3 mr-1" />
                          Chưa thanh toán
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-4 flex-1 p-4 bg-muted rounded-lg">
                      <div className="text-5xl">{invoice.serviceIcon}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {invoice.serviceName}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span>{invoice.petIcon}</span>
                          {invoice.petName}
                        </p>
                      </div>
                    </div>

                    <div className="sm:w-64 p-4 bg-pink-50 rounded-lg border-2 border-pink-200 text-right">
                      <p className="text-xs font-semibold text-pink-900 uppercase mb-2">
                        Tổng tiền
                      </p>
                      <h2 className="text-3xl font-bold text-pink-700 font-mono">
                        {formatCurrency(invoice.totalAmount)}
                      </h2>
                    </div>
                  </div>

                  <div className={cn(
                    "flex gap-2 pt-4 mt-4 border-t",
                    invoice.paymentStatus === 'paid' && "flex-col"
                  )}>
                    <Button
                      onClick={() => handleViewDetail(invoice)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                    {invoice.paymentStatus === 'unpaid' && (
                      <Button
                        onClick={() => handlePayNow(invoice.id)}
                        variant="default"
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Thanh toán ngay
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy hóa đơn nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}
