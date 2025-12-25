"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, DollarSign, Clock, ClipboardList, Sparkles } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { serviceApi, serviceCategoryApi, getToken } from "@/lib/api";

export default function OwnerServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Load services and categories in parallel
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceApi.getAll(),
        serviceCategoryApi?.getAll ? serviceCategoryApi.getAll() : Promise.resolve({ success: true, data: [] })
      ]);
      
      if (servicesResponse.success && servicesResponse.data) {
        const categoryMap = {};
        if (categoriesResponse.success && categoriesResponse.data) {
          categoriesResponse.data.forEach(category => {
            categoryMap[category.id] = category;
          });
          setCategories(categoriesResponse.data);
        }

        // Map backend data to frontend format
        const mappedServices = servicesResponse.data.map(srv => {
          const category = categoryMap[srv.categoryId];
          console.log("Mapping service:", srv, "with category:", `${getCategoryIcon(srv.categoryId)} ${category.categoryName}`);
          
          return {
            id: srv.id,
            name: srv.serviceName,
            category: category ? `${getCategoryIcon(srv.categoryId)} ${category.categoryName}` : 'Dịch vụ',
            price: srv.price || 0,
            duration: srv.duration || 30,
            icon: getCategoryIcon(srv.categoryId),
            description: srv.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp'
          };
        });
        
        setServices(mappedServices);
      } else {
        console.error("Failed to load services:", servicesResponse.error);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      1: '🏥', // Medical examination
      2: '💉', // Vaccination
      3: '🛁', // Bathing
      4: '✂️', // Grooming
      5: '💆', // Spa
    };
    return iconMap[categoryId] || '🐾';
  };

  const handleBookService = (serviceId) => {
    router.push(`/dashboard/owner/appointments?action=book&serviceId=${serviceId}`);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Xem dịch vụ"
        subtitle="Khám phá các dịch vụ chăm sóc thú cưng của chúng tôi"
      />

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách dịch vụ
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredServices.length} dịch vụ
          </Badge>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground font-medium">Đang tải dịch vụ...</p>
            </CardContent>
          </Card>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{service.icon}</div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {service.category}
                      </Badge>
                      <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Giá:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-semibold text-foreground">
                        {service.duration} phút
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookService(service.id)}
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy dịch vụ nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
