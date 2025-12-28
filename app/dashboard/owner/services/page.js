/**
 * Services Page - Premium UI
 * 
 * Features:
 * - Gradient header
 * - Category filter tabs
 * - Service cards with price and description
 * - Search functionality
 * 
 * APIs (READ-ONLY):
 * - GET /services
 */

"use client";
import { useState, useEffect } from "react";
import { 
  Stethoscope, Search, Syringe, Scissors, Hotel,
  Heart, Star, Clock, DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ServicesPage() {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryIcons = {
    "Khám bệnh & Điều trị": Stethoscope,
    "Tiêm phòng & Xét nghiệm": Syringe,
    "Spa & Làm đẹp": Scissors,
    "Khách sạn thú cưng": Hotel,
    "Phẫu thuật": Heart
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || Star;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Star className="h-8 w-8" />
            Dịch Vụ Của Chúng Tôi
          </h1>
          <p className="text-white/90">
            Khám phá các dịch vụ chăm sóc thú cưng chuyên nghiệp
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Search & Filter */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === cat ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    {cat === 'all' ? 'Tất cả' : cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{services.length}</p>
              <p className="text-white/80 text-sm">Dịch vụ</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{categories.length - 1}</p>
              <p className="text-white/80 text-sm">Danh mục</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-white/80 text-sm">Phục vụ</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">⭐ 5.0</p>
              <p className="text-white/80 text-sm">Đánh giá</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = getCategoryIcon(service.categoryName);
              return (
                <Card 
                  key={service.serviceId || service.id}
                  className="hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <Badge className="bg-white/20 text-white text-xs">
                          {service.categoryName || 'Khác'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.serviceName || service.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {service.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.estimatedDuration} phút</span>
                        </div>
                      )}
                      {service.isAvailable !== false && (
                        <Badge className="bg-green-100 text-green-700">
                          Đang hoạt động
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Giá từ</p>
                        <p className="text-2xl font-bold text-pink-600">
                          {(service.basePrice || service.price || 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-rose-500"
                        onClick={() => window.location.href = '/dashboard/owner/appointments'}
                      >
                        Đặt ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-8xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy dịch vụ
              </h3>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
