/**
 * Customers Management - SUPER CUTE Premium UI 🎀
 * 
 * Route: /dashboard/manager/customers
 * 
 * Features:
 * - Adorable gradient header with cute emojis
 * - Pastel color scheme
 * - Cute pet badges with emojis
 * - Smooth animations and hover effects
 * - Premium card design with glassmorphism
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/components/ui/usePagination";

export default function CustomersPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredCustomers, 10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/pet-owners');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast("Không thể tải danh sách khách hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(c =>
      c.fullName?.toLowerCase().includes(term) ||
      c.phoneNumber?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCustomer(null);
  };

  const getPetEmoji = (species) => {
    const emojiMap = {
      'Dog': '🐕', 'Chó': '🐕', 'DOG': '🐕',
      'Cat': '🐈', 'Mèo': '🐈', 'CAT': '🐈',
      'Bird': '🐦', 'Chim': '🐦', 'BIRD': '🐦',
      'Rabbit': '🐇', 'Thỏ': '🐇', 'RABBIT': '🐇',
      'Hamster': '🐹', 'HAMSTER': '🐹',
      'Turtle': '🐢', 'Rùa': '🐢', 'TURTLE': '🐢',
      'Fish': '🐟', 'Cá': '🐟', 'FISH': '🐟'
    };
    return emojiMap[species] || '🐾';
  };

  // Cute pastel colors for avatars
  const getAvatarGradient = (index) => {
    const gradients = [
      'from-pink-400 to-rose-400',
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400',
      'from-indigo-400 to-purple-400',
      'from-teal-400 to-green-400',
      'from-rose-400 to-pink-400'
    ];
    return gradients[index % gradients.length];
  };

  // Stats
  const stats = {
    total: customers.length,
    withPets: customers.filter(c => c.pets && c.pets.length > 0).length,
    totalPets: customers.reduce((sum, c) => sum + (c.pets?.length || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🐾</div>
          <p className="text-gray-500 text-lg font-medium">Đang tải khách hàng yêu quý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 🌈 Super Cute Gradient Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white p-8 pb-32 shadow-xl rounded-b-[3rem] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 drop-shadow-lg">
                <span className="text-5xl animate-bounce">🐾</span>
                Khách Hàng Yêu Quý
              </h1>
              <p className="text-white/95 text-lg font-medium drop-shadow">
                Quản lý thông tin chủ nuôi và thú cưng đáng yêu
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/90">Khách hàng</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                <p className="text-3xl font-bold">{stats.totalPets}</p>
                <p className="text-sm text-white/90">Thú cưng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 pb-8">
        {/* Cute Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{stats.total}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Tổng khách hàng</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🐾</div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">{stats.withPets}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Có thú cưng</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🐕</div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{stats.totalPets}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Tổng thú cưng</p>
            </CardContent>
          </Card>
        </div>

        {/* Cute Search Bar */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl mb-6 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm khách hàng yêu quý..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 h-12 text-base border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                />
              </div>
              <Button onClick={loadData} className="h-12 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all">
                🔄 Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Count */}
        <p className="text-sm text-gray-600 mb-4 font-medium">
          ✨ Hiển thị {filteredCustomers.length} / {customers.length} khách hàng
        </p>

        {/* Cute Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((customer, index) => {
              const customerId = customer.petOwnerId || customer.id;
              
              return (
                <Card 
                  key={customerId} 
                  className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden"
                  onClick={() => handleViewDetail(customer)}
                >
                  <CardContent className="p-6">
                    {/* Decorative top bar */}
                    <div className={`h-2 bg-gradient-to-r ${getAvatarGradient(index)} rounded-full mb-4 group-hover:h-3 transition-all`}></div>
                    
                    <div className="flex items-start gap-4">
                      {/* Cute Avatar */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(index)} text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        {customer.fullName?.charAt(0) || '👤'}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
                          {customer.fullName || 'N/A'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">ID: {customerId}</p>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700 truncate flex items-center gap-2">
                            <span className="text-lg">📱</span>
                            <span className="font-medium">{customer.phoneNumber || 'N/A'}</span>
                          </p>
                          <p className="text-gray-700 truncate flex items-center gap-2">
                            <span className="text-lg">📧</span>
                            <span className="font-medium">{customer.email || 'N/A'}</span>
                          </p>
                          {customer.address && (
                            <p className="text-gray-700 truncate flex items-center gap-2">
                              <span className="text-lg">📍</span>
                              <span className="font-medium">{customer.address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cute Pets Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {customer.pets && customer.pets.length > 0 ? (
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-2">🐾 Thú cưng ({customer.pets.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {customer.pets.slice(0, 3).map((pet, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                                <span className="text-base">{getPetEmoji(pet.species)}</span>
                                {pet.name}
                              </span>
                            ))}
                            {customer.pets.length > 3 && (
                              <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-medium shadow-sm">
                                +{customer.pets.length - 3} nữa
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-2">
                          <span className="text-2xl block mb-1">🐾</span>
                          Chưa có thú cưng
                        </p>
                      )}
                    </div>

                    {/* Hover effect indicator */}
                    <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-purple-600 font-semibold">👁️ Nhấn để xem chi tiết</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="py-20 text-center">
              <span className="text-9xl block mb-6">🔍</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy khách hàng</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm nhé! 💫' : 'Chưa có khách hàng nào trong hệ thống 🌟'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
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

      {/* Cute Detail Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">👤</span>
                  Thông Tin Khách Hàng
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">✖️</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600 text-sm font-semibold">Họ tên</Label>
                    <p className="font-bold text-xl text-gray-900 mt-1">
                      {selectedCustomer.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-sm font-semibold">Mã khách hàng</Label>
                    <p className="font-bold text-lg text-purple-600 mt-1">
                      #{selectedCustomer.petOwnerId || selectedCustomer.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-600 text-sm font-semibold flex items-center gap-2">
                      <span className="text-lg">📱</span> Số điện thoại
                    </Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedCustomer.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-sm font-semibold flex items-center gap-2">
                      <span className="text-lg">📧</span> Email
                    </Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="mt-4">
                    <Label className="text-gray-600 text-sm font-semibold flex items-center gap-2">
                      <span className="text-lg">📍</span> Địa chỉ
                    </Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedCustomer.address}</p>
                  </div>
                )}
              </div>

              {/* Pets */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-xl flex items-center gap-2 mb-4">
                  <span className="text-2xl">🐾</span>
                  Thú cưng ({selectedCustomer.pets?.length || 0})
                </h4>
                {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer.pets.map((pet, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow">
                        <span className="text-4xl">{getPetEmoji(pet.species)}</span>
                        <div>
                          <p className="font-bold text-lg text-gray-900">{pet.name}</p>
                          <p className="text-sm text-gray-600 font-medium">
                            {pet.breed || pet.species || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <span className="text-6xl block mb-3">🐾</span>
                    <p className="text-gray-500 font-medium">Chưa có thú cưng nào</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end bg-gray-50 rounded-b-3xl">
              <Button onClick={handleCloseModal} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 rounded-xl hover:shadow-lg transition-all">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
