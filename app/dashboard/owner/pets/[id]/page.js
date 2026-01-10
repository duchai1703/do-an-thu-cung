/**
 * Pet Details Page - Premium UI v2
 * 
 * Features:
 * - Stunning gradient header với pet avatar
 * - Stats badges với health indicators
 * - Premium tabs navigation với gradients
 * - Glassmorphism cards
 * - Timeline style medical records
 * - PetIdBadge integration
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  PawPrint, Edit, FileText, Syringe, Calendar, 
  ArrowLeft, Download, CheckCircle, XCircle, Clock, Heart, Sparkles, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditPetModal from "@/components/modals/EditPetModal";
import PetIdBadge from "@/components/ui/PetIdBadge";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function PetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const petId = params.id;

  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vetMap, setVetMap] = useState({}); // Map veterinarianId -> vetName
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        const vaccinationsRes = await apiClient.get(`/medical-records/pet/${petId}/vaccinations`);
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

  const handleEditPet = async (updatedPet) => {
    try {
      await apiClient.put(`/pets/${petId}`, {
        name: updatedPet.name,
        species: updatedPet.type,
        breed: updatedPet.breed,
        birthDate: updatedPet.dateOfBirth,
        gender: updatedPet.gender,
        weight: parseFloat(String(updatedPet.weight).replace(' kg', '')) || 0,
        color: updatedPet.color,
        initialHealthStatus: updatedPet.medicalHistory,
        specialNotes: updatedPet.notes
      });

      showToast("Đã cập nhật thông tin thú cưng! ✅", "success");
      setIsEditModalOpen(false);
      loadPetData();
    } catch (error) {
      console.error("Error updating pet:", error);
      showToast("Không thể cập nhật thú cưng", "error");
    }
  };

  const handleDownloadMedicalRecord = async (recordId) => {
    try {
      const response = await apiClient.get(`/medical-records/${recordId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-record-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast("Đã tải xuống hồ sơ y tế!", "success");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast("Không thể tải xuống hồ sơ", "error");
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">🐾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">💖</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải thông tin...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">😿</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy thú cưng</h2>
          <p className="text-gray-500 mb-6">Có thể bé đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => router.push('/dashboard/owner/pets')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const editingPet = {
    id: pet.petId,
    name: pet.name,
    icon: getPetIcon(pet.species),
    type: pet.species,
    breed: pet.breed,
    age: calculateAge(pet.birthDate),
    gender: pet.gender,
    weight: pet.weight ? `${pet.weight} kg` : '',
    color: pet.color,
    dateOfBirth: pet.birthDate,
    medicalHistory: pet.initialHealthStatus || '',
    notes: pet.specialNotes || ''
  };

  const tabItems = [
    { value: "info", label: "Thông tin", icon: "📋", gradient: "from-purple-500 to-pink-500" },
    { value: "medical", label: "Hồ sơ y tế", icon: "🏥", gradient: "from-blue-500 to-cyan-500", count: medicalRecords.length },
    { value: "vaccinations", label: "Tiêm chủng", icon: "💉", gradient: "from-green-500 to-emerald-500", count: vaccinations.length },
    { value: "appointments", label: "Lịch hẹn", icon: "📅", gradient: "from-amber-500 to-orange-500", count: appointments.length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      {/* 🌈 Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-4xl animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${15 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              🐾
            </span>
          ))}
        </div>

        <div className="relative text-white p-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Button
              onClick={() => router.push('/dashboard/owner/pets')}
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
            
            {/* Pet Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-7xl shadow-2xl border-4 border-white/30 group-hover:scale-110 transition-transform">
                  {getPetIcon(pet.species)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold">{pet.name}</h1>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <PetIdBadge petId={pet.petId} size="md" className="bg-white/20 border-white/50 mb-3" />
                <p className="text-xl text-white/90 mb-4">
                  {pet.species} • {pet.breed}
                </p>
                
                {/* Stats Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-white/70">Giới tính</p>
                    <p className="font-bold">{pet.gender === 'MALE' || pet.gender === 'Đực' ? '♂️ Đực' : '♀️ Cái'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-white/70">Tuổi</p>
                    <p className="font-bold">🎂 {calculateAge(pet.birthDate)}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-white/70">Cân nặng</p>
                    <p className="font-bold">⚖️ {pet.weight ? `${pet.weight}kg` : 'N/A'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-white/70">Màu lông</p>
                    <p className="font-bold">🎨 {pet.color || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-xl hover:scale-105 transition-transform"
                size="lg"
              >
                <Edit className="h-5 w-5 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Premium Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabItems.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === tab.value 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105` 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.value ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-fade-in">
            {/* Basic Info Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  📋 Thông Tin Chi Tiết
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Mã thú cưng", value: `#${pet.petId || pet.id}`, icon: "🏷️", highlight: true },
                    { label: "Tên", value: pet.name, icon: "💜" },
                    { label: "Loài", value: pet.species, icon: "🐾" },
                    { label: "Giống", value: pet.breed || 'N/A', icon: "📖" },
                    { label: "Giới tính", value: pet.gender === 'MALE' || pet.gender === 'Đực' ? '♂️ Đực' : '♀️ Cái', icon: "" },
                    { label: "Ngày sinh", value: pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : 'N/A', icon: "🎂" },
                    { label: "Tuổi", value: calculateAge(pet.birthDate), icon: "📅" },
                    { label: "Cân nặng", value: pet.weight ? `${pet.weight} kg` : 'N/A', icon: "⚖️" },
                    { label: "Màu lông", value: pet.color || 'N/A', icon: "🎨" },
                    { label: "Mã chủ sở hữu", value: `PO-${String(pet.ownerId).padStart(4, '0')}`, icon: "👤" }
                  ].map((item, idx) => (
                    <div key={idx} className={`rounded-xl p-4 text-center hover:shadow-md transition-all ${
                      item.highlight ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <p className="text-xs text-gray-500 mb-1">{item.icon} {item.label}</p>
                      <p className={`font-bold ${item.highlight ? 'text-purple-600 font-mono' : 'text-gray-800'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Pet Created At */}
                {pet.createdAt && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                    <p className="text-sm font-semibold text-blue-700 mb-1">📅 Ngày thêm vào hệ thống</p>
                    <p className="text-gray-700">
                      {new Date(pet.createdAt).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {/* Health Status */}
                {(pet.initialHealthStatus || pet.specialNotes) && (
                  <div className="space-y-4">
                    {pet.initialHealthStatus && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-sm font-semibold text-green-700 mb-2">💚 Tình trạng sức khỏe ban đầu</p>
                        <p className="text-gray-700">{pet.initialHealthStatus}</p>
                      </div>
                    )}
                    {pet.specialNotes && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <p className="text-sm font-semibold text-amber-700 mb-2">📝 Ghi chú đặc biệt</p>
                        <p className="text-gray-700">{pet.specialNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="animate-fade-in">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🏥 Hồ Sơ Y Tế - Lịch Sử Điều Trị
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{medicalRecords.length} bản ghi</span>
                </h2>
                <p className="text-white/80 text-sm mt-1">Mỗi lần khám/điều trị tạo một hồ sơ mới</p>
              </div>
              <CardContent className="p-6">
                {medicalRecords.length > 0 ? (
                  <div className="space-y-6">
                    {medicalRecords.map((record, idx) => (
                      <div key={record.id || record.recordId || idx} 
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all"
                      >
                        {/* Header with ID and Date */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-mono">
                                #Record-{record.id || record.recordId}
                              </span>
                              {record.appointmentId && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                                  📅 Cuộc hẹn #{record.appointmentId} {record.appointment?.service?.serviceName ? `(${record.appointment.service.serviceName})` : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-blue-600 font-medium">
                              🗓️ Ngày khám: {new Date(record.examinationDate || record.visitDate || record.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDownloadMedicalRecord(record.id || record.recordId)}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải PDF
                          </Button>
                        </div>

                        {/* Follow-up Alert */}
                        {record.needsFollowUp && (
                          <div className={`rounded-xl p-3 mb-4 flex items-center gap-2 ${record.isFollowUpOverdue ? 'bg-red-100 border border-red-300' : 'bg-amber-100 border border-amber-300'}`}>
                            <AlertCircle className={`w-5 h-5 ${record.isFollowUpOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                            <div>
                              <span className={`font-semibold ${record.isFollowUpOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                                {record.isFollowUpOverdue ? '⚠️ TÁI KHÁM QUÁ HẠN!' : '📋 Cần tái khám'}
                              </span>
                              {record.followUpDate && (
                                <span className="ml-2 text-sm">
                                  - Ngày: {new Date(record.followUpDate).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Veterinarian */}
                        <div className="flex items-center gap-2 mb-4 bg-white/70 rounded-lg p-3">
                          <span className="text-2xl">👨‍⚕️</span>
                          <div>
                            <p className="text-xs text-gray-500">Bác sĩ phụ trách (ID: {record.veterinarianId})</p>
                            <p className="font-semibold text-gray-800">
                              {vetMap[record.veterinarianId] || record.veterinarian?.fullName || `Bác sĩ #${record.veterinarianId}`}
                            </p>
                          </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-red-50 rounded-xl p-4 mb-3 border border-red-200">
                          <p className="text-xs text-red-600 font-semibold mb-1">🩺 CHẨN ĐOÁN</p>
                          <p className="text-gray-800 font-medium text-lg">{record.diagnosis || 'Không có'}</p>
                        </div>

                        {/* Treatment */}
                        <div className="bg-green-50 rounded-xl p-4 mb-3 border border-green-200">
                          <p className="text-xs text-green-600 font-semibold mb-1">💊 ĐIỀU TRỊ / ĐƠN THUỐC</p>
                          <p className="text-gray-800 whitespace-pre-wrap">{record.treatment || 'Không có'}</p>
                        </div>

                        {/* Medical Summary (JSONB) */}
                        {record.medicalSummary && Object.keys(record.medicalSummary).length > 0 && (
                          <div className="bg-purple-50 rounded-xl p-4 mb-3 border border-purple-200">
                            <p className="text-xs text-purple-600 font-semibold mb-2">📊 TÓM TẮT Y TẾ (Chi tiết)</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(record.medicalSummary).map(([key, value]) => (
                                <div key={key} className="bg-white/70 rounded-lg p-2">
                                  <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium text-gray-800">{String(value)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Date */}
                        {record.followUpDate && (
                          <div className="bg-amber-50 rounded-xl p-4 mb-3 border border-amber-200">
                            <p className="text-xs text-amber-600 font-semibold mb-1">📅 NGÀY TÁI KHÁM</p>
                            <p className="text-gray-800 font-medium">
                              {new Date(record.followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        )}

                        {/* Created At */}
                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                          📝 Hồ sơ được tạo: {new Date(record.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có hồ sơ y tế</h3>
                    <p className="text-gray-500">Mỗi lần khám/điều trị sẽ tạo một hồ sơ mới gắn liền với bé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "vaccinations" && (
          <div className="animate-fade-in">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  💉 Lịch Sử Tiêm Chủng
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{vaccinations.length} mũi tiêm</span>
                </h2>
                <p className="text-white/80 text-sm mt-1">Mỗi lần tiêm phòng tạo một bản ghi mới</p>
              </div>
              <CardContent className="p-6">
                {vaccinations.length > 0 ? (
                  <div className="space-y-6">
                    {vaccinations.map((vac, idx) => (
                      <div key={vac.id || idx} 
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500 hover:shadow-xl transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Syringe className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {vac.vaccineType?.vaccineName || vac.vaccineType?.name || 'Vaccine'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                📅 Ngày tiêm: {new Date(vac.administrationDate || vac.vaccinationDate).toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono mt-1 inline-block">
                                #Vaccination-{vac.id}
                              </span>
                            </div>
                          </div>

                          {/* Due Status Badge */}
                          {vac.isDue !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${vac.isDue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {vac.isDue ? '⚠️ CẦN TIÊM LẠI' : '✅ Đã tiêm'}
                            </div>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {/* Administered By */}
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-gray-500">👨‍⚕️ Bác sĩ tiêm</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {vetMap[vac.administeredBy] || vac.administeredByName || vac.veterinarian?.fullName || `ID: ${vac.administeredBy}`}
                            </p>
                          </div>

                          {/* Batch Number */}
                          {vac.batchNumber && (
                            <div className="bg-white/70 rounded-lg p-3">
                              <p className="text-xs text-gray-500">🏭 Số lô vaccine</p>
                              <p className="font-semibold text-gray-800 text-sm font-mono">{vac.batchNumber}</p>
                            </div>
                          )}

                          {/* Injection Site */}
                          {vac.site && (
                            <div className="bg-white/70 rounded-lg p-3">
                              <p className="text-xs text-gray-500">📍 Vị trí tiêm</p>
                              <p className="font-semibold text-gray-800 text-sm">{vac.site}</p>
                            </div>
                          )}

                          {/* Days Until Due */}
                          {vac.daysUntilDue !== null && vac.daysUntilDue !== undefined && (
                            <div className={`rounded-lg p-3 ${vac.daysUntilDue < 0 ? 'bg-red-100' : vac.daysUntilDue <= 30 ? 'bg-amber-100' : 'bg-green-100'}`}>
                              <p className="text-xs text-gray-500">⏳ Còn lại</p>
                              <p className={`font-bold text-sm ${vac.daysUntilDue < 0 ? 'text-red-700' : vac.daysUntilDue <= 30 ? 'text-amber-700' : 'text-green-700'}`}>
                                {vac.daysUntilDue < 0 ? `Quá hạn ${Math.abs(vac.daysUntilDue)} ngày` : `${vac.daysUntilDue} ngày`}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Reactions */}
                        {vac.reactions && (
                          <div className="bg-amber-50 rounded-xl p-4 mb-3 border border-amber-200">
                            <p className="text-xs text-amber-600 font-semibold mb-1">⚠️ PHẢN ỨNG SAU TIÊM</p>
                            <p className="text-gray-800">{vac.reactions}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {vac.notes && (
                          <div className="bg-blue-50 rounded-xl p-4 mb-3 border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold mb-1">📝 GHI CHÚ</p>
                            <p className="text-gray-800">{vac.notes}</p>
                          </div>
                        )}

                        {/* Next Due Date Alert */}
                        {vac.nextDueDate && (
                          <div className={`rounded-xl p-4 flex items-center gap-3 ${vac.isDue ? 'bg-red-100 border border-red-300' : 'bg-amber-100 border border-amber-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vac.isDue ? 'bg-red-500' : 'bg-amber-500'}`}>
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className={`font-bold ${vac.isDue ? 'text-red-700' : 'text-amber-700'}`}>
                                {vac.isDue ? '⚠️ ĐÃ ĐẾN HẠN TIÊM LẠI!' : '📋 Nhắc nhở tiêm mũi tiếp theo'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Ngày: {new Date(vac.nextDueDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Created At */}
                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                          📝 Bản ghi được tạo: {new Date(vac.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💉</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có lịch sử tiêm chủng</h3>
                    <p className="text-gray-500">Mỗi lần tiêm phòng sẽ tạo một bản ghi mới gắn liền với bé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="animate-fade-in">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  📅 Lịch Hẹn
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{appointments.length} cuộc hẹn</span>
                </h2>
                <Button
                  onClick={() => router.push('/dashboard/owner/appointments')}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  size="sm"
                >
                  Đặt lịch mới
                </Button>
              </div>
              <CardContent className="p-6">
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt) => {
                      const status = getStatusBadge(apt.status);
                      return (
                        <div key={apt.appointmentId} 
                          onClick={() => router.push('/dashboard/owner/appointments')}
                          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-l-4 border-amber-500 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                <span className="text-2xl font-bold">{new Date(apt.appointmentDate).getDate()}</span>
                                <span className="text-xs uppercase">{new Date(apt.appointmentDate).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={status.className}>{status.label}</Badge>
                                  <span className="text-sm text-gray-500">🕐 {apt.startTime}</span>
                                </div>
                                <h3 className="font-bold text-gray-800">{apt.service?.serviceName || 'Dịch vụ'}</h3>
                                {apt.employee && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    👨‍⚕️ {apt.employee.fullName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-800">
                                {apt.estimatedCost?.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có lịch hẹn</h3>
                    <p className="text-gray-500 mb-4">Đặt lịch chăm sóc cho bé ngay!</p>
                    <Button
                      onClick={() => router.push('/dashboard/owner/appointments')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500"
                    >
                      Đặt lịch ngay
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditPetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditPet}
        pet={editingPet}
      />

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}