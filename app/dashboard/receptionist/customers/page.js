"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { CustomerHistoryTabs } from "@/components/receptionist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  PawPrint, 
  Eye, 
  Loader2,
  TrendingUp,
  Heart,
  Star,
  Crown,
  Sparkles,
  Filter,
  RefreshCw,
  X,
  Plus
} from "lucide-react";
import { petOwnerApi, invoiceApi, getToken } from "@/lib/api";
import { formatCustomerId } from "@/lib/utils";

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

      const [ownersResponse, statsResponse] = await Promise.all([
        petOwnerApi.getAll(),
        invoiceApi.getCustomerStatistics()
      ]);
      
      if (ownersResponse.success && ownersResponse.data) {
        const customersWithStats = ownersResponse.data.map(owner => {
          const stats = statsResponse.data.find(stat => stat.petOwnerId === owner.petOwnerId) || {};
          return {
            ...owner,
            totalVisits: stats.totalVisits || 0,
            totalSpent: stats.totalSpent || 0,
            lastVisit: stats.lastVisit || null
          }
        });
        setCustomers(customersWithStats);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerId = (owner) => owner.petOwnerId || owner.id;
  
  const getCustomerStats = (owner) => {
    return owner || { totalVisits: 0, totalSpent: 0, lastVisit: null };
  };

  const getTotalSpent = (owner) => getCustomerStats(owner).totalSpent;
  const getTotalVisits = (owner) => getCustomerStats(owner).totalVisits;

  const getLastVisit = (owner) => {
    const stats = getCustomerStats(owner);
    if (!stats.lastVisit) return 'Chưa có';
    return new Date(stats.lastVisit).toLocaleDateString('vi-VN');
  };

  const getCustomerStatus = (owner) => {
    return owner.account?.isActive ? 'active' : 'inactive';
  };

  const getCustomerTier = (totalSpent) => {
    if (totalSpent >= 5000000) return { label: 'VIP', color: 'from-amber-400 to-yellow-500', icon: Crown };
    if (totalSpent >= 2000000) return { label: 'Thân thiết', color: 'from-purple-400 to-violet-500', icon: Star };
    return { label: 'Thường', color: 'from-gray-400 to-gray-500', icon: Users };
  };

  const filteredCustomers = customers.filter(owner => {
    const status = getCustomerStatus(owner);
    const matchFilter = filter === "all" || status === filter;
    const name = owner.fullName || '';
    const phone = owner.phoneNumber || '';
    const email = owner.account?.email || '';
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       phone.includes(searchTerm) ||
                       email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => getCustomerStatus(c) === 'active').length;
  const inactiveCustomers = customers.filter(c => getCustomerStatus(c) === 'inactive').length;
  const totalRevenue = customers.reduce((sum, c) => sum + getTotalSpent(c), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 animate-pulse">Đang tải khách hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/30">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý khách hàng</h1>
              <p className="text-gray-500">Theo dõi và quản lý thông tin khách hàng thân yêu</p>
            </div>
          </div>
          
          <Button 
            onClick={() => loadCustomers()}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng khách hàng</p>
                  <p className="text-4xl font-bold mt-1">{totalCustomers}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Gia đình PAW LOVERS
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Khách hàng Active</p>
                  <p className="text-4xl font-bold mt-1">{activeCustomers}</p>
                  <p className="text-white/70 text-xs mt-2">
                    📊 {totalCustomers > 0 ? Math.round((activeCustomers/totalCustomers)*100) : 0}% tổng số
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-red-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Cần chăm sóc lại</p>
                  <p className="text-4xl font-bold mt-1">{inactiveCustomers}</p>
                  <p className="text-white/70 text-xs mt-2">⏰ Inactive accounts</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Từ {totalCustomers} khách
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
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
                    <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                      Inactive
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 bg-white rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-100/50 overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Danh sách khách hàng</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-sm px-4 py-1">
                {filteredCustomers.length} khách hàng
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
                    <TableHead className="font-bold text-gray-700">Hạng</TableHead>
                    <TableHead className="font-bold text-gray-700">Thú cưng</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Lượt đến</TableHead>
                    <TableHead className="font-bold text-gray-700 text-right">Tổng chi tiêu</TableHead>
                    <TableHead className="font-bold text-gray-700">Lần cuối</TableHead>
                    <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-40">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8" />
                          </div>
                          <p className="text-lg font-medium">Không tìm thấy khách hàng</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer, index) => {
                      const status = getCustomerStatus(customer);
                      const tier = getCustomerTier(customer.totalSpent);
                      const TierIcon = tier.icon;
                      
                      return (
                        <TableRow 
                          key={getCustomerId(customer)} 
                          className="group hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-rose-50/50 transition-all"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold">
                                  {customer.fullName?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-gray-800">{customer.fullName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {customer.phoneNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`bg-gradient-to-r ${tier.color} text-white border-0 shadow-lg flex items-center gap-1 w-fit`}>
                              <TierIcon className="w-3 h-3" /> {tier.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {customer.pets?.slice(0, 3).map((pet, idx) => (
                                <Badge key={idx} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1">
                                  <PawPrint className="w-3 h-3" /> {pet.name}
                                </Badge>
                              ))}
                              {customer.pets?.length > 3 && (
                                <Badge variant="outline" className="bg-gray-50">+{customer.pets.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-2xl font-bold text-violet-600">{customer.totalVisits}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-lg font-bold text-emerald-600 font-mono">
                              {formatCurrency(customer.totalSpent)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-gray-100 flex items-center gap-1 w-fit">
                              <Calendar className="w-3 h-3" /> {getLastVisit(customer)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={status === 'active' 
                              ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 shadow-lg"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                            }>
                              {status === 'active' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                              ) : (
                                <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedCustomer(customer)}
                              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 border-0"
                            >
                              <Eye className="w-4 h-4 mr-1" /> Xem
                            </Button>
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

        {/* Customer Detail Modal */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            {selectedCustomer && (
              <>
                {/* Premium Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 p-8 text-white">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="relative flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-white/30 shadow-2xl">
                      <AvatarFallback className="bg-white text-rose-500 text-3xl font-bold">
                        {selectedCustomer.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedCustomer.fullName}</h2>
                      <p className="text-white/80 font-mono">{formatCustomerId(getCustomerId(selectedCustomer))}</p>
                      {(() => {
                        const tier = getCustomerTier(selectedCustomer.totalSpent);
                        const TierIcon = tier.icon;
                        return (
                          <Badge className={`mt-2 bg-white/20 text-white border-0`}>
                            <TierIcon className="w-4 h-4 mr-1" /> Hạng {tier.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Điện thoại</p>
                        <p className="font-bold text-gray-800">{selectedCustomer.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Email</p>
                        <p className="font-bold text-gray-800 text-sm">{selectedCustomer.account?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100">
                      <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-rose-600 font-medium">Địa chỉ</p>
                        <p className="font-bold text-gray-800 text-sm truncate">{selectedCustomer.address || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600 font-medium">Liên hệ khẩn cấp</p>
                        <p className="font-bold text-gray-800">{selectedCustomer.emergencyContact || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preferences Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-cyan-600 font-medium">Phương thức liên hệ ưa thích</p>
                        <Badge className="mt-1 bg-cyan-100 text-cyan-700 border-0">
                          {selectedCustomer.preferredContactMethod === 'PHONE' ? '📞 Điện thoại' : 
                           selectedCustomer.preferredContactMethod === 'EMAIL' ? '📧 Email' : 
                           selectedCustomer.preferredContactMethod === 'SMS' ? '💬 SMS' : 
                           selectedCustomer.preferredContactMethod || 'Chưa chọn'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
                      <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-teal-600 font-medium">Lần đến gần nhất</p>
                        <p className="font-bold text-gray-800">{getLastVisit(selectedCustomer)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <PawPrint className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-amber-800">Thú cưng ({selectedCustomer.pets?.length || 0})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.pets?.map((pet, idx) => (
                        <Badge key={idx} className="bg-white border border-amber-200 text-amber-700 px-3 py-2">
                          <PawPrint className="w-4 h-4 mr-2" />
                          <span className="font-bold">{pet.name}</span>
                          <span className="text-amber-500 ml-2">({pet.breed || pet.species})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* History Tabs */}
                  <CustomerHistoryTabs 
                    customerId={selectedCustomer.petOwnerId} 
                    customerName={selectedCustomer.fullName}
                  />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-center">
                      <p className="text-4xl font-bold">{selectedCustomer.totalVisits}</p>
                      <p className="text-white/80 text-sm mt-1">Lượt đến</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-center">
                      <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</p>
                      <p className="text-white/80 text-sm mt-1">Tổng chi tiêu</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 pt-0 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCustomer(null)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
