/**
 * Pet Owner Dashboard - Premium UI v2
 * 
 * Features:
 * - Animated gradient header với welcome message
 * - Glassmorphism Stats cards với hover effects
 * - Pet Gallery carousel với ảnh động
 * - Timeline appointments với animations
 * - Quick Actions với micro-interactions
 * - Seasonal decorations (paw prints, hearts)
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Calendar, CreditCard, Star, Clock, AlertCircle,
  Syringe, Heart, Plus, ChevronRight, Sparkles, Bell, Gift
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import PetIdBadge from "@/components/ui/PetIdBadge";

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
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const userResponse = await apiClient.get('/auth/me');
      const user = userResponse.data || userResponse;
      setUserData(user);

      const [petsRes, appointmentsRes, invoicesRes] = await Promise.all([
        apiClient.get('/pets/me'),
        apiClient.get('/appointments'),
        apiClient.get('/invoices')
      ]);

      const petsData = petsRes.data || petsRes || [];
      const appointmentsData = appointmentsRes.data || appointmentsRes || [];
      const invoicesData = invoicesRes.data || invoicesRes || [];

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

      setPets(petsData.slice(0, 6));
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
    if (hour < 12) return { text: "Chào buổi sáng", emoji: "🌅" };
    if (hour < 18) return { text: "Chào buổi chiều", emoji: "☀️" };
    return { text: "Chào buổi tối", emoji: "🌙" };
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
      PENDING: { className: "bg-amber-500", label: "Chờ xác nhận", icon: "⏳" },
      CONFIRMED: { className: "bg-blue-500", label: "Đã xác nhận", icon: "✅" },
      COMPLETED: { className: "bg-green-500", label: "Hoàn thành", icon: "🎉" },
      CANCELLED: { className: "bg-red-500", label: "Đã hủy", icon: "❌" }
    };
    return variants[status] || variants.PENDING;
  };

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">🐾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">💖</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải thông tin...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* 🌈 Premium Animated Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"></div>
        
        {/* Floating paw prints decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-4xl animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              🐾
            </span>
          ))}
        </div>

        <div className="relative text-white p-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-xl border-4 border-white/30">
                    🐾
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-lg">
                    {stats.totalPets}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{greeting.emoji}</span>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {greeting.text}!
                    </h1>
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-white/90">
                    {userData?.fullName || 'Chủ thú cưng yêu'}
                  </p>
                  <p className="text-white/80 mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Chúc bạn và các bé một ngày tuyệt vời!
                  </p>
                </div>
              </div>

              {/* Time & Date Card */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-white/80" />
                  <div>
                    <div className="text-3xl font-bold tracking-wide">{formatTime()}</div>
                    <div className="text-white/80 text-sm">{formatDate()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {/* 📊 Premium Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: "Thú cưng", 
              value: stats.totalPets, 
              icon: "🐾", 
              gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
              description: "bé yêu",
              link: "/dashboard/owner/pets"
            },
            { 
              title: "Lịch sắp tới", 
              value: stats.upcomingAppointments, 
              icon: "📅", 
              gradient: "from-blue-500 via-cyan-500 to-teal-500",
              description: "cuộc hẹn",
              link: "/dashboard/owner/appointments"
            },
            { 
              title: "Chờ thanh toán", 
              value: stats.pendingPayments, 
              icon: "💳", 
              gradient: "from-amber-500 via-orange-500 to-red-500",
              description: "hóa đơn",
              link: "/dashboard/owner/invoices"
            },
            { 
              title: "Dịch vụ đã dùng", 
              value: stats.totalServices, 
              icon: "⭐", 
              gradient: "from-green-500 via-emerald-500 to-teal-500",
              description: "lần sử dụng",
              link: "/dashboard/owner/services"
            }
          ].map((stat, idx) => (
            <Card 
              key={idx}
              onClick={() => router.push(stat.link)}
              className={`
                bg-gradient-to-br ${stat.gradient} text-white border-0 
                shadow-xl hover:shadow-2xl transition-all duration-300 
                cursor-pointer group hover:scale-105 hover:-translate-y-1
                overflow-hidden relative
              `}
            >
              {/* Decorative circle */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-4xl md:text-5xl font-bold">{stat.value}</p>
                    <p className="text-white/70 text-xs mt-1">{stat.description}</p>
                  </div>
                  <div className="text-5xl opacity-80 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 🐕 Pet Gallery - Premium Cards */}
        <Card className="shadow-xl mb-8 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🐾</span>
                Gia Đình Thú Cưng
              </h2>
              <Button
                onClick={() => router.push('/dashboard/owner/pets')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm bé mới
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            {pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pets.map((pet, idx) => (
                  <div
                    key={pet.petId || pet.id}
                    onClick={() => router.push(`/dashboard/owner/pets/${pet.petId || pet.id}`)}
                    className="group relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 cursor-pointer
                      transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl
                      border-2 border-transparent hover:border-amber-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Pet Icon with glow */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-5xl shadow-lg group-hover:shadow-amber-300/50">
                          {getPetIcon(pet.species)}
                        </div>
                        {/* Health indicator */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                          {pet.name}
                        </h3>
                        <PetIdBadge petId={pet.petId || pet.id} size="xs" className="my-1" />
                        <p className="text-sm text-gray-600 truncate">{pet.species} • {pet.breed}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs bg-white/50 border-gray-200">
                            {pet.gender === 'MALE' || pet.gender === 'male' ? '♂️ Đực' : '♀️ Cái'}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-white/50 border-gray-200">
                            ⚖️ {pet.weight ? `${pet.weight}kg` : 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Quick action on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/90 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-end justify-center pb-4">
                      <span className="text-white font-semibold flex items-center gap-2">
                        👁️ Xem chi tiết
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-4 animate-bounce">🐾</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có thú cưng nào!</h3>
                <p className="text-gray-500 mb-6">Hãy thêm bé yêu đầu tiên vào gia đình nhé</p>
                <Button 
                  onClick={() => router.push('/dashboard/owner/pets')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm thú cưng ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 📅 Upcoming Appointments - Timeline Style */}
        <Card className="shadow-xl mb-8 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📅</span>
                Lịch Hẹn Sắp Tới
              </h2>
              <Button
                onClick={() => router.push('/dashboard/owner/appointments')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                size="sm"
              >
                Xem tất cả
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt, idx) => {
                  const status = getStatusBadge(apt.status);
                  return (
                    <div 
                      key={apt.appointmentId}
                      onClick={() => router.push('/dashboard/owner/appointments')}
                      className="group flex gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 
                        border-l-4 border-blue-500 cursor-pointer
                        hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl 
                        flex flex-col items-center justify-center text-white shadow-lg">
                        <span className="text-2xl font-bold">
                          {new Date(apt.appointmentDate).getDate()}
                        </span>
                        <span className="text-xs uppercase">
                          {new Date(apt.appointmentDate).toLocaleDateString('vi-VN', { month: 'short' })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={status.className}>
                            {status.icon} {status.label}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {apt.startTime}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {apt.pet?.name || `Pet #${apt.petId}`}
                          <span className="text-gray-500 font-normal ml-2">
                            - {apt.service?.serviceName || 'Dịch vụ'}
                          </span>
                        </h4>
                        {apt.employee && (
                          <p className="text-sm text-gray-500 mt-1">
                            👨‍⚕️ {apt.employee.fullName}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-gray-900">
                          {apt.estimatedCost?.toLocaleString('vi-VN')}đ
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 ml-auto transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có lịch hẹn!</h3>
                <p className="text-gray-500 mb-6">Đặt lịch chăm sóc cho bé yêu ngay nào!</p>
                <Button 
                  onClick={() => router.push('/dashboard/owner/appointments')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Đặt lịch ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ⚡ Quick Actions - Premium Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Thao Tác Nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: "Quản lý thú cưng", 
                icon: "🐾", 
                gradient: "from-purple-500 to-pink-500",
                hoverGradient: "hover:from-purple-600 hover:to-pink-600",
                link: "/dashboard/owner/pets"
              },
              { 
                label: "Đặt lịch khám", 
                icon: "📅", 
                gradient: "from-blue-500 to-cyan-500",
                hoverGradient: "hover:from-blue-600 hover:to-cyan-600",
                link: "/dashboard/owner/appointments"
              },
              { 
                label: "Thanh toán", 
                icon: "💳", 
                gradient: "from-amber-500 to-orange-500",
                hoverGradient: "hover:from-amber-600 hover:to-orange-600",
                link: "/dashboard/owner/invoices"
              },
              { 
                label: "Xem dịch vụ", 
                icon: "⭐", 
                gradient: "from-green-500 to-emerald-500",
                hoverGradient: "hover:from-green-600 hover:to-emerald-600",
                link: "/dashboard/owner/services"
              }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => router.push(action.link)}
                className={`
                  relative overflow-hidden group
                  h-28 md:h-32 rounded-2xl
                  bg-gradient-to-br ${action.gradient} ${action.hoverGradient}
                  text-white font-semibold shadow-lg
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-xl
                  active:scale-95
                `}
              >
                {/* Decorative */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full 
                  group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-4xl md:text-5xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    {action.icon}
                  </span>
                  <span className="text-sm md:text-base font-bold">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 💡 Tips Banner */}
        <Card className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">💡</div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Mẹo chăm sóc hôm nay</h3>
                <p className="text-amber-700">
                  Đừng quên cho thú cưng uống đủ nước và tắm nắng buổi sáng để tăng cường miễn dịch nhé! 🌞
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS Animation cho floating paws */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
