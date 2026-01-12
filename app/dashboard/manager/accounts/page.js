/**
 * Account Management Page - SUPER CUTE UI 🎀
 * 
 * Route: /dashboard/manager/accounts
 * 
 * Features:
 * - Tabbed interface for Staff and Customers
 * - Cute status badges (Active/Inactive)
 * - Activate/Deactivate account actions
 * - Premium gradient design
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/components/ui/usePagination";
import { User, Shield, ShieldAlert, CheckCircle, XCircle, Search } from "lucide-react";

export default function AccountsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("staff");
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Pagination will be handled dynamically based on active tab data
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredData, 10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [employees, customers, searchTerm, activeTab]);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both employees and customers
      const [empRes, custRes] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/pet-owners')
      ]);

      const empData = Array.isArray(empRes.data) ? empRes.data : (empRes.data?.data || []);
      const custData = Array.isArray(custRes.data) ? custRes.data : (custRes.data?.data || []);

      setEmployees(empData);
      setCustomers(custData);
    } catch (error) {
      console.error("Error loading accounts:", error);
      showToast("Không thể tải danh sách tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const sourceData = activeTab === "staff" ? employees : customers;
    
    if (!searchTerm) {
      setFilteredData(sourceData);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = sourceData.filter(item => {
      const fullName = item.fullName?.toLowerCase() || "";
      const email = item.account?.email?.toLowerCase() || "";
      const phone = item.phoneNumber || "";
      return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });
    
    setFilteredData(filtered);
  };

  const handleToggleStatus = async (accountData) => {
    const accountId = accountData.accountId || accountData.account?.accountId;
    if (!accountId) {
      showToast("Không tìm thấy ID tài khoản", "error");
      return;
    }

    const isActive = accountData.account?.isActive;
    const action = isActive ? "deactivate" : "activate";
    
    if (!confirm(`Bạn có chắc chắn muốn ${isActive ? "khóa" : "kích hoạt"} tài khoản này không?`)) {
      return;
    }

    try {
      await apiClient.put(`/auth/account/${accountId}/${action}`);
      showToast(`Đã ${isActive ? "khóa" : "kích hoạt"} tài khoản thành công!`, "success");
      
      // Update local state locally to reflect change immediately
      updateLocalAccountStatus(accountId, !isActive);
    } catch (error) {
      console.error(`Error ${action} account:`, error);
      showToast(`Lỗi khi cập nhật trạng thái: ${error.message}`, "error");
    }
  };

  const updateLocalAccountStatus = (accountId, newStatus) => {
    const updateList = (list) => list.map(item => {
      if ((item.accountId === accountId) || (item.account?.accountId === accountId)) {
        return {
          ...item,
          account: {
            ...item.account,
            isActive: newStatus
          }
        };
      }
      return item;
    });

    setEmployees(prev => updateList(prev));
    setCustomers(prev => updateList(prev));
  };

  // Helper to get role display
  const getRoleBadge = (userType) => {
    switch (userType) {
      case "MANAGER":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Quản lý</Badge>;
      case "VETERINARIAN":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Bác sĩ</Badge>;
      case "CARE_STAFF":
        return <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">Nhân viên chăm sóc</Badge>;
      case "RECEPTIONIST":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Lễ tân</Badge>;
      case "PET_OWNER":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Khách hàng</Badge>;
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔐</div>
          <p className="text-gray-500 font-medium">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-10 h-10" />
                Quản Lý Tài Khoản
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">
                Kiểm soát quyền truy cập hệ thống của nhân viên và khách hàng
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{employees.length}</p>
                <p className="text-sm opacity-90">Nhân viên</p>
              </div>
              <div className="w-px bg-white/30" />
              <div className="text-center">
                <p className="text-3xl font-bold">{customers.length}</p>
                <p className="text-sm opacity-90">Khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="staff" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    👨‍⚕️ Nhân viên
                  </TabsTrigger>
                  <TabsTrigger value="customer" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                    👥 Khách hàng
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Tìm theo tên, email, số điện thoại..." 
                  className="pl-10 border-indigo-200 focus:border-indigo-500 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="grid gap-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => {
              const account = item.account;
              const isActive = account?.isActive;

              return (
                <Card 
                  key={item.accountId || item.id} 
                  className={`
                    border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
                    ${isActive ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar / Icon */}
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                      ${isActive 
                        ? (activeTab === 'staff' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600')
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      {item.fullName?.charAt(0) || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-1">
                      <div className="flex flex-col md:flex-row items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">{item.fullName}</h3>
                        {!isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Đã khóa
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📧 {account?.email || 'Chưa có email'}
                        </span>
                        <span className="flex items-center gap-1">
                          📱 {item.phoneNumber || '---'}
                        </span>
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                      {getRoleBadge(account?.userType)}
                      <span className={`text-xs font-medium flex items-center gap-1 ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleStatus(item)}
                        className={`rounded-xl shadow-sm ${!isActive && 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {isActive ? (
                          <>
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Mở khóa
                          </>
                        )}
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-3xl">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">Không tìm thấy tài khoản nào phù hợp</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
