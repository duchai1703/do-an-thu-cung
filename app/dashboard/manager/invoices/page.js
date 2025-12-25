"use client";
import { useState, useEffect } from "react";
import { 
  Receipt, Search, Eye, FileDown, CheckCircle2, 
  Hourglass, ClipboardList, DollarSign, RefreshCw 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InvoiceDetailModal from "@/components/modals/InvoiceDetailModal";
import { cn } from "@/lib/utils";
import { invoiceApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerInvoicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

      // TODO: This is very wrong
      if (response.success && response.data) {
        const mappedInvoices = response.data.map(inv => {
          // Get pet icon based on species
          const petIcon = inv.appointment?.pet?.species === 'Dog' ? '🐕' : 
                         inv.appointment?.pet?.species === 'Cat' ? '🐈' : '🐾';

          // Map services from invoice items or appointment
          const services = inv.invoiceItems?.map(item => ({
            icon: getServiceIcon(item.serviceName),
            name: item.serviceName || item.description,
            quantity: item.quantity || 1,
            price: parseFloat(item.unitPrice || 0)
          })) || [];

          return {
            id: inv.invoiceNumber || `INV-${inv.invoiceID}`,
            customerName: inv.appointment?.petOwner?.fullName || inv.petOwner?.fullName || 'N/A',
            customerPhone: inv.appointment?.petOwner?.phoneNumber || inv.petOwner?.phoneNumber || 'N/A',
            customerEmail: inv.appointment?.petOwner?.account?.email || 'N/A',
            petName: inv.appointment?.pet?.name || 'N/A',
            petIcon: petIcon,
            petBreed: inv.appointment?.pet?.breed || 'N/A',
            petAge: calculateAge(inv.appointment?.pet?.birthDate),
            date: inv.invoiceDate || inv.createdAt,
            services: services,
            subtotal: parseFloat(inv.subtotal || 0),
            discount: parseFloat(inv.discountAmount || 0),
            total: parseFloat(inv.totalAmount || 0),
            isPaid: inv.isPaid || false,
            paymentMethod: inv.payment?.paymentMethod || null,
            paymentDate: inv.payment?.paymentDate || null,
            notes: inv.notes || '',
            rawData: inv
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

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return '✨';
    const name = serviceName.toLowerCase();
    if (name.includes('khám') || name.includes('điều trị')) return '🏥';
    if (name.includes('tiêm') || name.includes('vaccine')) return '💉';
    if (name.includes('tắm') || name.includes('spa')) return '🛁';
    if (name.includes('cắt') || name.includes('tỉa')) return '✂️';
    if (name.includes('lưu trú') || name.includes('khách sạn')) return '🏠';
    return '✨';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Removed mock data - now using API

  const filteredInvoices = invoices.filter(invoice => {
    const matchSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
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

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleExportPDF = async (invoice) => {
    try {
      const invoiceId = invoice.rawData?.invoiceID || invoice.id;
      const response = await invoiceApi.generatePdf(invoiceId);
      
      if (response.success && response.data) {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast(`Đã xuất hóa đơn ${invoice.id} thành công`, "success");
      } else {
        showToast(response.error || "Không thể xuất PDF", "error");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showToast("Lỗi khi xuất PDF", "error");
    }
  };

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.isPaid ? inv.total : 0), 0);
  const unpaidAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.isPaid ? 0 : inv.total), 0);

  const stats = {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(i => i.isPaid).length,
    unpaid: filteredInvoices.filter(i => !i.isPaid).length,
    revenue: totalRevenue,
    pending: unpaidAmount
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý hóa đơn"
        subtitle="Theo dõi và quản lý hóa đơn thanh toán"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Receipt}
          title="Tổng hóa đơn"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Đã thanh toán"
          value={stats.paid}
          change={formatCurrency(stats.revenue)}
          color="success"
        />
        <StatsCard
          icon={Hourglass}
          title="Chưa thanh toán"
          value={stats.unpaid}
          change={formatCurrency(stats.pending)}
          color="warning"
        />
        <StatsCard
          icon={DollarSign}
          title="Tổng doanh thu"
          value={formatCurrency(stats.revenue)}
          color="info"
        />
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách hóa đơn
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredInvoices.length} hóa đơn
          </Badge>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground font-medium">
                Đang tải dữ liệu...
              </p>
            </CardContent>
          </Card>
        ) : filteredInvoices.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Mã hóa đơn</TableHead>
                  <TableHead className="min-w-[150px]">Khách hàng</TableHead>
                  <TableHead className="min-w-[120px]">Thú cưng</TableHead>
                  <TableHead className="min-w-[100px]">Ngày tạo</TableHead>
                  <TableHead className="min-w-[120px]">Tổng tiền</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="min-w-[120px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {invoice.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{invoice.petIcon}</span>
                        <span className="text-sm font-medium text-foreground">{invoice.petName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(invoice.total)}
                      </span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleViewDetail(invoice)}
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleExportPDF(invoice)}
                          variant="ghost"
                          size="icon"
                          title="Xuất PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy hóa đơn nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
