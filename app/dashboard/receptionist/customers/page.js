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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, CheckCircle2, XCircle, DollarSign, Search, Calendar, Phone, Mail, MapPin, PawPrint, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { petOwnerApi, invoiceApi, getToken } from "@/lib/api";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await petOwnerApi.getAll();
      
      if (response.success && response.data) {
        // For each customer, fetch their invoices to calculate statistics
        const customersWithStats = await Promise.all(
          response.data.map(async (owner) => {
            // Fetch invoices for this customer
            // TODO: 
            let invoices = [];
            try {
              const invoiceRes = await invoiceApi.getByCustomer(owner.ownerId || owner.id);
              if (invoiceRes.success && invoiceRes.data) {
                invoices = invoiceRes.data;
              }
            } catch (err) {
              console.log('Error fetching invoices for customer:', err);
            }

            const totalSpent = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
            const totalVisits = invoices.length;
            
            // Find last visit date
            let lastVisit = 'N/A';
            if (invoices.length > 0) {
              const sortedInvoices = [...invoices].sort((a, b) => 
                new Date(b.createdAt || b.issueDate) - new Date(a.createdAt || a.issueDate)
              );
              lastVisit = sortedInvoices[0]?.issueDate 
                ? new Date(sortedInvoices[0].issueDate).toISOString().split('T')[0]
                : new Date(sortedInvoices[0]?.createdAt).toISOString().split('T')[0];
            }

            // Determine if active (visited in last 3 months)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const lastVisitDate = lastVisit !== 'N/A' ? new Date(lastVisit) : new Date(0);
            const isActive = lastVisitDate > threeMonthsAgo;

            return {
              id: owner.petOwnerId || owner.id,
              ownerId: owner.petOwnerId || owner.id,
              name: owner.fullName || 'N/A',
              phone: owner.phoneNumber || 'N/A',
              email: owner.account?.email || 'N/A',
              address: owner.address || 'N/A',
              joinDate: owner.createdAt ? new Date(owner.createdAt).toISOString().split('T')[0] : 'N/A',
              totalVisits,
              totalSpent,
              lastVisit,
              pets: owner.pets?.map(pet => ({
                name: pet.name || 'N/A',
                type: pet.species || 'Unknown',
                icon: pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : '🐾'
              })) || [],
              status: isActive ? 'active' : 'inactive',
              rawData: owner
            };
          })
        );

        setCustomers(customersWithStats);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchFilter = filter === "all" || customer.status === filter;
    const matchSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customer.phone.includes(searchTerm) ||
                       customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Quản lý khách hàng"
        subtitle="Theo dõi và quản lý thông tin khách hàng"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Tổng khách hàng</CardTitle>
            <Users className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-white/80 mt-2">📅 Tổng hợp toàn bộ</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Khách hàng active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeCustomers}</div>
            <p className="text-xs text-green-700 mt-2">📊 {Math.round((activeCustomers/totalCustomers)*100)}% tổng số</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Khách lâu không đến</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{inactiveCustomers}</div>
            <p className="text-xs text-red-700 mt-2">⏰ Cần chăm sóc lại</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-2">📈 Từ {totalCustomers} khách hàng</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên, SĐT, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Danh sách khách hàng
          </h2>
          <Badge variant="secondary">{filteredCustomers.length} khách hàng</Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã KH</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Thú cưng</TableHead>
                <TableHead className="text-center">Lượt đến</TableHead>
                <TableHead className="text-right">Tổng chi tiêu</TableHead>
                <TableHead>Lần cuối</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 mb-2" />
                    Không tìm thấy khách hàng
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const statusBadge = customer.status === 'active'
                    ? { label: 'Active', variant: 'success', icon: CheckCircle2 }
                    : { label: 'Inactive', variant: 'destructive', icon: XCircle };
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">{customer.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {customer.pets.map((pet, idx) => (
                            <Badge key={idx} variant="outline" className="flex items-center gap-1">
                              <PawPrint className="h-3 w-3" /> {pet.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xl font-bold text-primary">{customer.totalVisits}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-green-600 font-mono">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Calendar className="h-3 w-3" /> {customer.lastVisit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                          <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" onClick={() => handleViewDetails(customer)}>
                          <Eye className="h-4 w-4 mr-2" /> Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin khách hàng</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Header */}
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {selectedCustomer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{selectedCustomer.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <div className="grid gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Số điện thoại</p>
                    </div>
                    <p className="text-base font-bold">{selectedCustomer.phone}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Email</p>
                    </div>
                    <p className="text-base font-bold">{selectedCustomer.email}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Địa chỉ</p>
                    </div>
                    <p className="text-base font-bold">{selectedCustomer.address}</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <PawPrint className="h-4 w-4 text-green-700" />
                      <p className="text-xs text-green-700 font-semibold uppercase">Thú cưng ({selectedCustomer.pets.length})</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedCustomer.pets.map((pet, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white border-green-300">
                          <PawPrint className="h-3 w-3 mr-1" /> {pet.name} ({pet.type})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-yellow-700">{selectedCustomer.totalVisits}</p>
                      <p className="text-xs text-yellow-700 font-semibold uppercase mt-2">Lượt đến</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6 text-center">
                      <p className="text-lg font-bold text-green-700">{formatCurrency(selectedCustomer.totalSpent)}</p>
                      <p className="text-xs text-green-700 font-semibold uppercase mt-2">Tổng chi tiêu</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseModal}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
