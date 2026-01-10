/**
 * Services Page - Premium UI v2
 * 
 * Features:
 * - Stunning gradient header với floating decorations
 * - Premium stats cards
 * - Category filter tabs với icons
 * - Beautiful service cards với glassmorphism
 * - Search functionality
 * - Book service flow
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Stethoscope, Search, Syringe, Scissors, Hotel,
  Heart, Star, Clock, DollarSign, Sparkles, X, CalendarPlus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ServicesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryData = {
    "Khám bệnh & Điều trị": { icon: "🩺", gradient: "from-blue-500 to-cyan-500" },
    "Tiêm phòng & Xét nghiệm": { icon: "💉", gradient: "from-green-500 to-emerald-500" },
    "Spa & Làm đẹp": { icon: "✨", gradient: "from-pink-500 to-rose-500" },
    "Khách sạn thú cưng": { icon: "🏨", gradient: "from-purple-500 to-indigo-500" },
    "Phẫu thuật": { icon: "❤️‍🩹", gradient: "from-red-500 to-pink-500" },
    "Khác": { icon: "⭐", gradient: "from-amber-500 to-orange-500" }
  };

  const getCategoryData = (categoryName) => {
    return categoryData[categoryName] || categoryData["Khác"];
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/services');
      const data = response.data || response || [];
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      showToast("Không thể tải danh sách dịch vụ", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = new Set(services.map(s => s.categoryName || 'Khác'));
    return ['all', ...Array.from(categories)];
  };

  const getFilteredServices = () => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.categoryName === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.serviceName?.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const categories = getCategories();
  const filteredServices = getFilteredServices();

  const handleBookService = (service) => {
    const serviceId = service.serviceId || service.id;
    router.push(`/dashboard/owner/appointments?serviceId=${serviceId}&openDialog=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">💆</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">✨</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải dịch vụ...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* 🌈 Premium Gradient Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500"></div>
        
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
              {['💆', '✨', '🐾', '💉', '🏨', '❤️'][i]}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                ⭐
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  Dịch Vụ Của Chúng Tôi
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </h1>
                <p className="text-white/80 mt-1">
                  Khám phá các dịch vụ chăm sóc thú cưng chuyên nghiệp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 📊 Premium Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-xl hover:scale-105 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Dịch vụ</p>
                  <p className="text-4xl font-bold">{services.length}</p>
                  <p className="text-white/70 text-xs mt-1">dịch vụ</p>
                </div>
                <div className="text-5xl opacity-80">💆</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0 shadow-xl hover:scale-105 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Danh mục</p>
                  <p className="text-4xl font-bold">{categories.length - 1}</p>
                  <p className="text-white/70 text-xs mt-1">loại</p>
                </div>
                <div className="text-5xl opacity-80">📂</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0 shadow-xl hover:scale-105 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Phục vụ</p>
                  <p className="text-4xl font-bold">24/7</p>
                  <p className="text-white/70 text-xs mt-1">luôn sẵn sàng</p>
                </div>
                <div className="text-5xl opacity-80">🕐</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:scale-105 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Đánh giá</p>
                  <p className="text-4xl font-bold">5.0</p>
                  <p className="text-white/70 text-xs mt-1">⭐⭐⭐⭐⭐</p>
                </div>
                <div className="text-5xl opacity-80">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔍 Search & Filter */}
        <Card className="shadow-xl mb-6 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</div>
                <Input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-pink-200 focus:border-pink-500 rounded-xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300
                  ${selectedCategory === 'all' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                `}
              >
                <span className="text-lg">📋</span>
                <span>Tất cả</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === 'all' ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {services.length}
                </span>
              </button>
              
              {categories.filter(c => c !== 'all').map((cat) => {
                const catData = getCategoryData(cat);
                const count = services.filter(s => s.categoryName === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300
                      ${selectedCategory === cat 
                        ? `bg-gradient-to-r ${catData.gradient} text-white shadow-lg scale-105` 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                    `}
                  >
                    <span className="text-lg">{catData.icon}</span>
                    <span className="hidden md:inline">{cat}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === cat ? 'bg-white/30' : 'bg-gray-100'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 💆 Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, idx) => {
              const catData = getCategoryData(service.categoryName);
              return (
                <Card 
                  key={service.serviceId || service.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${catData.gradient} p-5 text-white relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 text-6xl opacity-20 group-hover:scale-125 transition-transform">
                      {catData.icon}
                    </div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                        {catData.icon}
                      </div>
                      <div>
                        <Badge className="bg-white/20 text-white text-xs border-0">
                          {service.categoryName || 'Khác'}
                        </Badge>
                        {service.isAvailable !== false && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-white/80">Đang hoạt động</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Service ID Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        #{service.serviceId || service.id}
                      </span>
                      {service.isBoardingService && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">🏠 Lưu trú</Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                      {service.serviceName || service.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {service.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp'}
                    </p>

                    {/* Info Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.estimatedDuration && (
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{service.estimatedDuration} phút</span>
                        </div>
                      )}
                      {service.requiredStaffType && (
                        <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-xs text-blue-700">
                          <span>👨‍⚕️ {service.requiredStaffType === 'VETERINARIAN' ? 'Bác sĩ' : 
                                 service.requiredStaffType === 'CARE_STAFF' ? 'Nhân viên' : service.requiredStaffType}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-xs text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>5.0</span>
                      </div>
                    </div>

                    {/* Category ID and Created Date - Small text */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-400">
                      <span>📂 {service.categoryName || 'Danh mục'} (#{service.categoryId})</span>
                      {service.createdAt && (
                        <span>📅 Tạo: {new Date(service.createdAt).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>

                    {/* Price & Book */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Giá từ</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          {(service.basePrice || service.price || 0).toLocaleString('vi-VN')}
                          <span className="text-sm text-gray-500">đ</span>
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleBookService(service)}
                        className={`bg-gradient-to-r ${catData.gradient} hover:scale-105 transition-transform shadow-lg`}
                      >
                        <CalendarPlus className="h-4 w-4 mr-1" />
                        Đặt ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4 animate-bounce">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Không tìm thấy dịch vụ
              </h3>
              <p className="text-gray-500 mb-4">
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                Xem tất cả dịch vụ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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
