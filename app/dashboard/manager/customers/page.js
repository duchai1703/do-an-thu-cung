"use client";
import { useState, useEffect } from "react";
import {
  Search, Eye, RefreshCw, User, Phone, Mail,
  MapPin, PawPrint, Calendar, CreditCard
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsCard from "@/components/dashboard/StatsCard";
import { petOwnerApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerCustomersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await petOwnerApi.getAll();

      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        showToast("Không thể tải danh sách khách hàng", "error");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const getPetIcon = (species) => {
    const s = species?.toUpperCase();
    if (s === 'DOG') return "🐕";
    if (s === 'CAT') return "🐈";
    return "🐾";
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(search) ||
      customer.name?.toLowerCase().includes(search) ||
      customer.phoneNumber?.includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

  // Stats
  const stats = {
    total: customers.length,
    withPets: customers.filter(c => c.pets && c.pets.length > 0).length,
    totalPets: customers.reduce((sum, c) => sum + (c.pets?.length || 0), 0)
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý khách hàng"
        subtitle="Xem thông tin và quản lý chủ nuôi thú cưng"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard icon={User} title="Tổng khách hàng" value={stats.total} color="primary" />
        <StatsCard icon={PawPrint} title="Có thú cưng" value={stats.withPets} color="success" />
        <StatsCard icon={PawPrint} title="Tổng thú cưng" value={stats.totalPets} color="info" />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline" onClick={loadCustomers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Thú cưng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                  <TableRow key={customer.petOwnerId || customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.fullName || customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {customer.petOwnerId || customer.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phoneNumber || 'N/A'}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]">
                        {customer.address || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {customer.pets && customer.pets.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {customer.pets.slice(0, 3).map((pet, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getPetIcon(pet.species)} {pet.name}
                            </Badge>
                          ))}
                          {customer.pets.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{customer.pets.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetail(customer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Thông tin khách hàng
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Họ tên</Label>
                  <p className="font-medium text-lg">
                    {selectedCustomer.fullName || selectedCustomer.name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mã khách hàng</Label>
                  <p className="font-medium">
                    #{selectedCustomer.petOwnerId || selectedCustomer.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Số điện thoại</Label>
                    <p className="font-medium">{selectedCustomer.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <Label className="text-muted-foreground text-xs">Địa chỉ</Label>
                  <p className="font-medium">{selectedCustomer.address || 'N/A'}</p>
                </div>
              </div>

              {/* Pets */}
              <div className="border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <PawPrint className="h-4 w-4 text-primary" />
                  Thú cưng ({selectedCustomer.pets?.length || 0})
                </h4>
                {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCustomer.pets.map((pet, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg flex items-center gap-3">
                        <span className="text-2xl">{getPetIcon(pet.species)}</span>
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {pet.breed || pet.species || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Chưa có thú cưng nào</p>
                )}
              </div>

              {/* Account Info */}
              {selectedCustomer.account && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Thông tin tài khoản</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground text-xs">Email đăng nhập</Label>
                      <p>{selectedCustomer.account.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Trạng thái</Label>
                      <Badge variant={selectedCustomer.account.isActive ? "success" : "destructive"}>
                        {selectedCustomer.account.isActive ? "Hoạt động" : "Khóa"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
