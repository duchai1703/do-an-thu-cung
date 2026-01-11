/**
 * Vet Pet Detail Page - Premium UI
 * 
 * Based on owner pet detail page but for veterinarian view
 * Features:
 * - Stunning gradient header với pet avatar
 * - Stats badges với health indicators
 * - Premium tabs navigation với gradients
 * - Glassmorphism cards
 * - Timeline style medical records
 * - PetIdBadge integration
 */

"use client";
import "../../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  PawPrint, FileText, Syringe, Calendar, 
  ArrowLeft, Download, CheckCircle, XCircle, Clock, Heart, Sparkles, AlertCircle,
  User, Phone, Scale, Palette, Cake, Hash, TrendingUp, Activity, Stethoscope
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PetIdBadge from "@/components/ui/PetIdBadge";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function VetPetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const petId = params.id;

  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vetMap, setVetMap] = useState({});
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (petId) {
      loadPetData();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      
      const petRes = await apiClient.get(`/pets/${petId}`);
      const petData = petRes.data || petRes;
      setPet(petData);

      // Fetch veterinarians for name lookup
      try {
        const vetsRes = await apiClient.get('/employees/veterinarians');
        const vets = vetsRes.data || vetsRes || [];
        const map = {};
        vets.forEach(vet => {
          map[vet.employeeId] = vet.fullName;
        });
        setVetMap(map);
      } catch (err) {
        console.log("Could not load veterinarians for name lookup");
      }

      try {
        const medicalRes = await apiClient.get(`/medical-records/pet/${petId}`);
        setMedicalRecords(medicalRes.data || medicalRes || []);
      } catch (err) {
        console.log("No medical records yet");
        setMedicalRecords([]);
      }

      try {
        // Use correct endpoint: /pets/{id}/vaccinations
        const vaccinationsRes = await apiClient.get(`/pets/${petId}/vaccinations`);
        setVaccinations(vaccinationsRes.data || vaccinationsRes || []);
      } catch (err) {
        console.log("No vaccinations yet");
        setVaccinations([]);
      }

      try {
        const appointmentsRes = await apiClient.get('/appointments');
        const allAppointments = appointmentsRes.data || appointmentsRes || [];
        setAppointments(allAppointments.filter(apt => apt.petId === parseInt(petId)));
      } catch (err) {
        console.log("No appointments yet");
        setAppointments([]);
      }

    } catch (error) {
      console.error("Error loading pet data:", error);
      showToast("Không thể tải thông tin thú cưng", "error");
    } finally {
      setLoading(false);
    }
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

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (ageInYears < 1) {
      const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + monthDiff;
      return `${ageInMonths} tháng`;
    }
    
    return `${ageInYears} tuổi`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-amber-500", label: "⏳ Chờ xác nhận", color: "amber" },
      CONFIRMED: { className: "bg-blue-500", label: "✅ Đã xác nhận", color: "blue" },
      COMPLETED: { className: "bg-green-500", label: "🎉 Hoàn thành", color: "green" },
      CANCELLED: { className: "bg-red-500", label: "❌ Đã hủy", color: "red" }
    };
    return variants[status] || variants.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">🐾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">💖</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải thông tin...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <p className="text-gray-500 text-lg">Không tìm thấy thông tin thú cưng</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/vet/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const owner = pet.owner || {};

  return (
    <div className="flex-1 space-y-6">
      {/* 🎨 Stunning Gradient Header - Vet Theme */}
      <div className="relative overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/vet/patients')}
              className="text-white hover:bg-white/20 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pet Avatar */}
              <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-7xl shadow-2xl ring-4 ring-white/30">
                {getPetIcon(pet.species)}
              </div>

              {/* Pet Info */}
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{pet.name}</h1>
                  <PetIdBadge petId={pet.petId || pet.id} size="md" className="bg-white/20" />
                </div>
                <p className="text-white/80 text-lg">
                  {pet.species} • {pet.breed || 'Không rõ giống'} • {pet.gender === 'male' ? '♂ Đực' : '♀ Cái'}
                </p>
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <Badge className="bg-white/20 text-white px-3 py-1">
                    🎂 {calculateAge(pet.birthDate)}
                  </Badge>
                  <Badge className="bg-white/20 text-white px-3 py-1">
                    ⚖️ {pet.weight ? `${pet.weight} kg` : 'N/A'}
                  </Badge>
                  <Badge className="bg-white/20 text-white px-3 py-1">
                    🎨 {pet.color || 'N/A'}
                  </Badge>
                  {pet.createdAt && (
                    <Badge className="bg-white/20 text-white px-3 py-1">
                      📝 Đăng ký: {new Date(pet.createdAt).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold">{medicalRecords.length}</p>
                    <p className="text-xs text-white/80">Hồ sơ khám</p>
                  </div>
                  <div className="h-10 w-px bg-white/30" />
                  <div>
                    <p className="text-3xl font-bold">{vaccinations.length}</p>
                    <p className="text-xs text-white/80">Tiêm phòng</p>
                  </div>
                  <div className="h-10 w-px bg-white/30" />
                  <div>
                    <p className="text-3xl font-bold">{appointments.length}</p>
                    <p className="text-xs text-white/80">Lịch hẹn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Premium Tabs */}
          <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border">
            <TabsTrigger value="info" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-semibold transition-all">
              <PawPrint className="h-4 w-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="medical" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-semibold transition-all">
              <FileText className="h-4 w-4 mr-2" />
              Hồ sơ khám ({medicalRecords.length})
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-semibold transition-all">
              <Syringe className="h-4 w-4 mr-2" />
              Tiêm phòng ({vaccinations.length})
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6 py-2.5 font-semibold transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Lịch hẹn ({appointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Info */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pet Details Card */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <PawPrint className="h-5 w-5" />
                    Thông tin thú cưng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Hash className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500">Mã thú cưng</p>
                        <p className="font-semibold">{pet.petId || pet.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Scale className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500">Cân nặng</p>
                        <p className="font-semibold">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Palette className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500">Màu lông</p>
                        <p className="font-semibold">{pet.color || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Cake className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500">Ngày sinh</p>
                        <p className="font-semibold">
                          {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Pet Info */}
                  {pet.initialHealthStatus && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold mb-1">📋 Tình trạng sức khỏe ban đầu</p>
                      <p className="text-sm text-gray-700">{pet.initialHealthStatus}</p>
                    </div>
                  )}
                  
                  {pet.specialNotes && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">📝 Ghi chú đặc biệt</p>
                      <p className="text-sm text-gray-700">{pet.specialNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Details Card */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <User className="h-5 w-5" />
                    Thông tin chủ nuôi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(owner.fullName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{owner.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{owner.email || owner.account?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Điện thoại</p>
                        <p className="font-semibold">{owner.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Hash className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Mã chủ nuôi</p>
                        <p className="font-semibold">{owner.petOwnerId || owner.id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {owner.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Địa chỉ</p>
                        <p className="font-semibold">{owner.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Medical Records */}
          <TabsContent value="medical" className="space-y-4">
            {medicalRecords.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Chưa có hồ sơ khám bệnh</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record, idx) => (
                  <Card key={record.id || idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex items-stretch">
                      {/* Timeline indicator */}
                      <div className="w-2 bg-gradient-to-b from-teal-500 to-cyan-500" />
                      
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-teal-100 text-teal-700">
                                #{record.id}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                📅 {record.examinationDate ? new Date(record.examinationDate).toLocaleDateString('vi-VN') : 'N/A'}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">{record.diagnosis || 'Không có chẩn đoán'}</h3>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>👨‍⚕️ {vetMap[record.veterinarianId] || `BS ${record.veterinarianId}`}</p>
                            {record.createdAt && (
                              <p className="text-xs">Tạo: {new Date(record.createdAt).toLocaleDateString('vi-VN')}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {record.treatment && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-600 font-semibold mb-1">💊 Điều trị</p>
                              <p className="text-gray-700">{record.treatment}</p>
                            </div>
                          )}
                          {record.medicalSummary?.prescription && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-xs text-green-600 font-semibold mb-1">💉 Đơn thuốc</p>
                              <p className="text-gray-700">{record.medicalSummary.prescription}</p>
                            </div>
                          )}
                        </div>
                        
                        {record.followUpDate && (
                          <div className={`mt-3 px-4 py-2 rounded-lg inline-flex items-center gap-2 ${record.isFollowUpOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Tái khám: {new Date(record.followUpDate).toLocaleDateString('vi-VN')}
                              {record.isFollowUpOverdue && ' (Quá hạn!)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Vaccinations */}
          <TabsContent value="vaccinations" className="space-y-4">
            {vaccinations.length === 0 ? (
              <Card className="p-12 text-center">
                <Syringe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Chưa có lịch sử tiêm phòng</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaccinations.map((vac, idx) => (
                  <Card key={vac.id || idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex items-stretch">
                      <div className={`w-2 ${vac.isDue ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-800">{vac.vaccineName || vac.vaccineType?.name || 'Vaccine'}</h3>
                          <Badge className={vac.isDue ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                            {vac.isDue ? '⏰ Sắp đến hạn' : '✅ Đã tiêm'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📅 Ngày tiêm: {vac.administrationDate ? new Date(vac.administrationDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                          <p>🔄 Hạn tiếp: {vac.nextDueDate ? new Date(vac.nextDueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                          {vac.batchNumber && <p>🏷️ Lô: {vac.batchNumber}</p>}
                          {vac.site && <p>📍 Vị trí: {vac.site}</p>}
                          {vac.administeredBy && <p>👨‍⚕️ BS: {vetMap[vac.administeredBy] || vac.administeredBy}</p>}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Appointments */}
          <TabsContent value="appointments" className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Chưa có lịch hẹn</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt, idx) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <Card key={apt.appointmentId || apt.id || idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex items-stretch">
                        <div className={`w-2 ${statusBadge.className}`} />
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                #{apt.appointmentId || apt.id}
                              </Badge>
                              <span className="font-semibold">{apt.service?.serviceName || apt.service?.name || 'Dịch vụ'}</span>
                            </div>
                            <Badge className={`${statusBadge.className} text-white`}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                            <p>📅 {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            <p>🕐 {apt.startTime || 'N/A'} - {apt.endTime || 'N/A'}</p>
                            {apt.estimatedCost && <p>💰 Ước tính: {Number(apt.estimatedCost).toLocaleString()}đ</p>}
                            {apt.actualCost && <p>💵 Thực tế: {Number(apt.actualCost).toLocaleString()}đ</p>}
                          </div>
                          {apt.notes && (
                            <p className="mt-2 text-sm text-gray-500 italic">📝 {apt.notes}</p>
                          )}
                          {apt.cancellationReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                              ❌ Lý do hủy: {apt.cancellationReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
