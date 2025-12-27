"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Receipt, CheckCircle2, Hourglass, Eye, CreditCard, 
  DollarSign, ClipboardList, XCircle 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import InvoiceDetailModal from "@/components/modals/InvoiceDetailModal";
import { cn } from "@/lib/utils";
import { invoiceApi, paymentApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function OwnerInvoicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState("all");
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

      const response = await invoiceApi.getAll({ includeAppointment: true, includePet: true, includePetOwner: true });
      
      if (response.success && response.data) {
        console.log("Fetched invoices:", response.data);
        // Map backend data to frontend format
        const mappedInvoices = response.data.map(inv => ({
          id: inv.invoiceId,
          customerName: inv.petOwner?.name || "Bạn",
          customerPhone: inv.petOwner?.phoneNumber || "",
          customerEmail: inv.petOwner?.email || "",
          petName: inv.pet?.name || "Unknown",
          petIcon: inv.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petBreed: inv.pet?.breed || "Unknown",
          petAge: calculateAge(inv.pet?.birthDate),
          date: inv.issueDate || inv.createdAt,
          services: inv.invoiceItems?.map(item => ({
            icon: getServiceIcon(item.service?.categoryId),
            name: item.service?.name || item.description || "Service",
            quantity: item.quantity || 1,
            price: item.unitPrice || 0
          })) || [],
          subtotal: inv.totalAmount || 0,
          discount: inv.discountAmount || 0,
          total: inv.totalAmount - (inv.discountAmount || 0) || 0,
          isPaid: inv.status === 'PAId',
          paymentMethod: inv.payment?.paymentMethod || null,
          paymentDate: inv.payment?.paymentDate || null,
          notes: inv.notes || ""
        }));
        
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

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
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

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handlePayInvoice = async (invoice) => {
    if (confirm("Xác nhận thanh toán hóa đơn này?")) {
      try {
        // Create payment for the invoice
        const paymentData = {
          invoiceId: invoice.id,
          paymentMethod: 'ONLINE',
          amount: invoice.total,
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

  const filteredInvoices = invoices.filter(inv => {
    if (filter === "all") return true;
    if (filter === "paid") return inv.isPaid;
    if (filter === "unpaid") return !inv.isPaid;
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalPaid = invoices.filter(i => i.isPaid).reduce((sum, i) => sum + i.total, 0);
  const totalUnpaid = invoices.filter(i => !i.isPaid).reduce((sum, i) => sum + i.total, 0);

  const filterOptions = [
    { value: "all", label: "Tất cả", icon: ClipboardList },
    { value: "paid", label: "Đã thanh toán", icon: CheckCircle2 },
    { value: "unpaid", label: "Chưa thanh toán", icon: Hourglass }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Hóa đơn của tôi"
        subtitle="Xem và quản lý hóa đơn thanh toán"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Receipt}
          title="Tổng hóa đơn"
          value={loading ? "..." : invoices.length}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đã thanh toán"
          value={loading ? "..." : invoices.filter(i => i.isPaid).length}
          change={formatCurrency(totalPaid)}
          color="success"
        />
        <StatsCard
          icon={Hourglass}
          title="Chưa thanh toán"
          value={loading ? "..." : invoices.filter(i => !i.isPaid).length}
          change={formatCurrency(totalUnpaid)}
          color="warning"
        />
      </div>

      {/* Filter Tabs */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-sm font-mono mb-1">{invoice.id}</CardTitle>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
                    </div>
                    <Badge variant={invoice.isPaid ? "success" : "warning"}>
                      {invoice.isPaid ? (
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
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{invoice.petIcon}</div>
                    <div>
                      <p className="font-semibold text-foreground">{invoice.petName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.petBreed}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Dịch vụ đã sử dụng:</p>
                    {invoice.services.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span className="flex items-center gap-2">
                          <span>{service.icon}</span>
                          <span className="text-foreground">{service.name}</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {invoice.discount > 0 && (
                    <div className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-muted-foreground">Giảm giá:</span>
                      <span className="font-semibold text-yellow-700">
                        -{formatCurrency(invoice.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-semibold text-foreground">Tổng cộng:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleViewDetail(invoice)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                    {!invoice.isPaid && (
                      <Button
                        onClick={() => handlePayInvoice(invoice)}
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Thanh toán
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
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Chưa có hóa đơn nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
