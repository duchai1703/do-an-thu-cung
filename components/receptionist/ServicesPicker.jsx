"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Stethoscope, 
  Bath, 
  Scissors, 
  ClipboardList,
  Search,
  Clock,
  DollarSign,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceApi } from "@/lib/api";

// Mock services for fallback
const MOCK_SERVICES = [
  { serviceId: 1, serviceName: "Khám tổng quát", description: "Kiểm tra sức khỏe toàn diện", price: 250000, duration: 30, serviceCategory: { categoryId: 1, categoryName: "Khám bệnh" } },
  { serviceId: 2, serviceName: "Tiêm phòng", description: "Tiêm vaccine phòng bệnh", price: 350000, duration: 15, serviceCategory: { categoryId: 1, categoryName: "Khám bệnh" } },
  { serviceId: 3, serviceName: "Xét nghiệm máu", description: "Phân tích máu chi tiết", price: 400000, duration: 20, serviceCategory: { categoryId: 1, categoryName: "Khám bệnh" } },
  { serviceId: 4, serviceName: "Tắm spa", description: "Tắm sạch và spa thư giãn", price: 200000, duration: 45, serviceCategory: { categoryId: 2, categoryName: "Spa" } },
  { serviceId: 5, serviceName: "Combo Spa Full", description: "Tắm, sấy, massage toàn thân", price: 350000, duration: 90, serviceCategory: { categoryId: 2, categoryName: "Spa" } },
  { serviceId: 6, serviceName: "Cắt tỉa lông", description: "Cắt tỉa và tạo kiểu lông", price: 150000, duration: 60, serviceCategory: { categoryId: 3, categoryName: "Cắt tỉa" } },
  { serviceId: 7, serviceName: "Nhuộm lông", description: "Nhuộm màu lông an toàn", price: 250000, duration: 45, serviceCategory: { categoryId: 3, categoryName: "Cắt tỉa" } },
  { serviceId: 8, serviceName: "Cắt móng", description: "Cắt và mài móng", price: 50000, duration: 15, serviceCategory: { categoryId: 3, categoryName: "Cắt tỉa" } },
];

export default function ServicesPicker({ selectedService, onSelect, className }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceApi?.getAll ? await serviceApi.getAll() : { success: false };
      
      if (response.success && response.data?.length > 0) {
        setServices(response.data);
      } else {
        setServices(MOCK_SERVICES);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      setServices(MOCK_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'khám bệnh':
        return { icon: Stethoscope, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'spa':
        return { icon: Bath, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' };
      case 'cắt tỉa':
        return { icon: Scissors, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' };
      default:
        return { icon: ClipboardList, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const categories = ['all', ...new Set(services.map(s => s.serviceCategory?.categoryName).filter(Boolean))];

  const filteredServices = services.filter(s => {
    const matchSearch = s.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || s.serviceCategory?.categoryName === selectedCategory;
    return matchSearch && matchCategory;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Tìm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-gray-200"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat === 'all' ? '✨ Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
        {filteredServices.map((service) => {
          const categoryStyle = getCategoryIcon(service.serviceCategory?.categoryName);
          const Icon = categoryStyle.icon;
          const isSelected = selectedService?.serviceId === service.serviceId;
          
          return (
            <div
              key={service.serviceId}
              onClick={() => onSelect?.(service)}
              className={cn(
                "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg group",
                isSelected
                  ? "border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/20"
                  : "border-gray-100 hover:border-violet-200 bg-white"
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  isSelected 
                    ? `bg-gradient-to-r ${categoryStyle.color} text-white`
                    : categoryStyle.bg
                )}>
                  <Icon className={cn("w-6 h-6", isSelected ? "text-white" : categoryStyle.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{service.serviceName}</h4>
                  <Badge className={cn("text-xs mt-1", categoryStyle.bg, categoryStyle.text, "border-0")}>
                    {service.serviceCategory?.categoryName}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">{service.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{service.duration} phút</span>
                </div>
                <div className={cn(
                  "font-bold text-lg",
                  isSelected ? "text-violet-600" : "text-emerald-600"
                )}>
                  {formatCurrency(service.price)}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Không tìm thấy dịch vụ phù hợp</p>
        </div>
      )}
    </div>
  );
}
