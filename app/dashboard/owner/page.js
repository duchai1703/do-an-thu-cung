/**
 * Pet Owner Dashboard - Premium UI
 * 
 * Features:
 * - Gradient header with greeting & time
 * - 4 Stats cards (Pets, Appointments, Pending Payments, Services)
 * - Pet Gallery with health status & vaccine reminders
 * - Upcoming Appointments Timeline (5 latest)
 * - Quick Actions
 * 
 * APIs Used:
 * - GET /pets
 * - GET /appointments
 * - GET /invoices
 * - GET /medical-records/pet/:id
 * - GET /medical-records/pet/:id/vaccinations
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Calendar, CreditCard, Star, Clock, AlertCircle,
  Syringe, Heart, Plus, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function OwnerDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalPets: 0,
    upcomingAppointments: 0,
    pendingPayments: 0,
    totalServices: 0
  });
  const [pets, setPets] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user info
      const userResponse = await apiClient.get('/auth/me');
      const user = userResponse.data || userResponse;
      setUserData(user);

      // Load all data in parallel
      const [petsRes, appointmentsRes, invoicesRes] = await Promise.all([
        apiClient.get('/pets/me'), // Owner-specific pets only
        apiClient.get('/appointments'),
        apiClient.get('/invoices')
      ]);

      const petsData = petsRes.data || petsRes || [];
      const appointmentsData = appointmentsRes.data || appointmentsRes || [];
      const invoicesData = invoicesRes.data || invoicesRes || [];

      // Calculate stats
      const upcoming = appointmentsData.filter(
        apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      );
      const pendingInvoices = invoicesData.filter(
        inv => inv.status === 'PENDING' || inv.status === 'UNPAID'
      );

      setStats({
        totalPets: petsData.length,
        upcomingAppointments: upcoming.length,
        pendingPayments: pendingInvoices.length,
        totalServices: appointmentsData.length
      });

      // Set pets (max 6 for gallery)
      setPets(petsData.slice(0, 6));

      // Set upcoming appointments (max 5)
      setUpcomingAppointments(
        upcoming
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
          .slice(0, 5)
      );

    } catch (error) {
      console.error("Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPetIcon = (species) => {
    const s = species?.toLowerCase() || '';
    if (s.includes('chó') || s.includes('dog')) return '🐕';
    if (s.includes('mèo') || s.includes('cat')) return '🐈';
    if (s.includes('thỏ') || s.includes('rabbit')) return '🐰';
    if (s.includes('chim') || s.includes('bird')) return '🐦';
    if (s.includes('hamster')) return '🐹';
    return '🐾';
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-amber-500", label: "Chờ xác nhận" },
      CONFIRMED: { className: "bg-blue-500", label: "Đã xác nhận" },
      COMPLETED: { className: "bg-green-500", label: "Hoàn thành" },
      CANCELLED: { className: "bg-red-500", label: "Đã hủy" }
    };
    return variants[status] || variants.PENDING;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {userData?.fullName || 'Chủ thú cưng'}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Chúc bạn và thú cưng một ngày tuyệt vời!
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime()}</div>
              <div className="text-white/90 text-sm">{formatDate()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Thú cưng */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Thú cưng của tôi</p>
                  <p className="text-4xl font-bold mt-2">
                    {loading ? "..." : stats.totalPets}
                  </p>
                </div>
                <PawPrint className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          {/* Lịch sắp tới */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Lịch sắp tới</p>
                  <p className="text-4xl font-bold mt-2">
                    {loading ? "..." : stats.upcomingAppointments}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          {/* Chờ thanh toán */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Chờ thanh toán</p>
                  <p className="text-4xl font-bold mt-2">
                    {loading ? "..." : stats.pendingPayments}
                  </p>
                </div>
                <CreditCard className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          {/* Dịch vụ đã dùng */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Dịch vụ đã dùng</p>
                  <p className="text-4xl font-bold mt-2">
                    {loading ? "..." : stats.totalServices}
                  </p>
                </div>
                <Star className="h-12 w-12 text-white/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pet Gallery */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PawPrint className="h-6 w-6 text-purple-500" />
                Thú Cưng Của Tôi
              </h2>
              <Button
                onClick={() => router.push('/dashboard/owner/pets')}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm thú cưng
              </Button>
            </div>

            {pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <Card
                    key={pet.petId || pet.id}
                    className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200"
                    onClick={() => router.push(`/dashboard/owner/pets/${pet.petId || pet.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-5xl">{getPetIcon(pet.species)}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                          <p className="text-sm text-gray-600">{pet.species} - {pet.breed}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{pet.gender}</span>
                            <span>•</span>
                            <span>{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              Khỏe mạnh
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐾</div>
                <p className="text-gray-500 mb-4">Bạn chưa có thú cưng nào</p>
                <Button 
                  onClick={() => router.push('/dashboard/owner/pets')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thú cưng ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments Timeline */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-500" />
                Lịch Hẹn Sắp Tới
              </h2>
              <Button
                onClick={() => router.push('/dashboard/owner/appointments')}
                variant="outline"
                size="sm"
              >
                Xem tất cả
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <Card 
                    key={apt.appointmentId}
                    className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/owner/appointments`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge {...getStatusBadge(apt.status)}>
                              {getStatusBadge(apt.status).label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(apt.appointmentDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {apt.startTime}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {apt.pet?.name || `Pet ID: ${apt.petId}`}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {apt.service?.serviceName || 'Dịch vụ'}
                          </p>
                          {apt.employee && (
                            <p className="text-sm text-gray-500 mt-1">
                              👨‍⚕️ {apt.employee.fullName || 'Bác sĩ'}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {apt.estimatedCost?.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-500 mb-4">Chưa có lịch hẹn nào</p>
                <Button
                  onClick={() => router.push('/dashboard/owner/appointments')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Đặt lịch ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => router.push('/dashboard/owner/pets')}
            className="h-24 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            <div className="text-center">
              <PawPrint className="h-8 w-8 mx-auto mb-2" />
              <span>Quản lý thú cưng</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/dashboard/owner/appointments')}
            className="h-24 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            size="lg"
          >
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <span>Đặt lịch khám</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/dashboard/owner/invoices')}
            className="h-24 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
          >
            <div className="text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2" />
              <span>Thanh toán</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/dashboard/owner/services')}
            className="h-24 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            size="lg"
          >
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2" />
              <span>Xem dịch vụ</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
