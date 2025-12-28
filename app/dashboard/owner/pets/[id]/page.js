/**
 * Pet Details Page - Premium UI with Tabs
 * 
 * Features:
 * - Gradient header with pet info
 * - 4 Tabs navigation:
 *   1. Thông tin cơ bản (Edit)
 *   2. Hồ sơ y tế (READ-ONLY)
 *   3. Lịch sử tiêm chủng  
 *   4. Lịch hẹn
 * 
 * APIs:
 * - GET /pets/:id
 * - PUT /pets/:id
 * - GET /medical-records/pet/:id
 * - GET /medical-records/:id/pdf
 * - GET /medical-records/pet/:id/vaccinations
 * - GET /appointments (filter by petId)
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  PawPrint, Edit, FileText, Syringe, Calendar, 
  ArrowLeft, Download, CheckCircle, XCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditPetModal from "@/components/modals/EditPetModal";
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
      
      // Load pet basic info
      const petRes = await apiClient.get(`/pets/${petId}`);
      const petData = petRes.data || petRes;
      setPet(petData);

      // Load medical records
      try {
        const medicalRes = await apiClient.get(`/medical-records/pet/${petId}`);
        setMedicalRecords(medicalRes.data || medicalRes || []);
      } catch (err) {
        console.log("No medical records yet");
        setMedicalRecords([]);
      }

      // Load vaccinations
      try {
        const vaccinationsRes = await apiClient.get(`/medical-records/pet/${petId}/vaccinations`);
        setVaccinations(vaccinationsRes.data || vaccinationsRes || []);
      } catch (err) {
        console.log("No vaccinations yet");
        setVaccinations([]);
      }

      // Load appointments
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

      showToast("Đã cập nhật thông tin thú cưng!", "success");
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
      
      // Create download link
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
      PENDING: { className: "bg-amber-500", label: "Chờ xác nhận" },
      CONFIRMED: { className: "bg-blue-500", label: "Đã xác nhận" },
      COMPLETED: { className: "bg-green-500", label: "Hoàn thành" },
      CANCELLED: { className: "bg-red-500", label: "Đã hủy" }
    };
    return variants[status] || variants.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-500 mb-4">Không tìm thấy thú cưng</p>
          <Button onClick={() => router.push('/dashboard/owner/pets')}>
            Quay lại
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard/owner/pets')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="text-8xl">{getPetIcon(pet.species)}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{pet.name}</h1>
              <p className="text-white/90 text-lg mb-3">
                {pet.species} - {pet.breed}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white border-white/40">
                  {pet.gender}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/40">
                  {calculateAge(pet.birthDate)}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/40">
                  {pet.weight ? `${pet.weight} kg` : 'N/A'}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/40">
                  {pet.color || 'N/A'}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="info">
              <PawPrint className="h-4 w-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="medical">
              <FileText className="h-4 w-4 mr-2" />
              Hồ sơ y tế
            </TabsTrigger>
            <TabsTrigger value="vaccinations">
              <Syringe className="h-4 w-4 mr-2" />
              Tiêm chủng
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Lịch hẹn
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tên</label>
                    <p className="text-lg font-semibold">{pet.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loài</label>
                    <p className="text-lg font-semibold">{pet.species}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giống</label>
                    <p className="text-lg font-semibold">{pet.breed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giới tính</label>
                    <p className="text-lg font-semibold">{pet.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                    <p className="text-lg font-semibold">
                      {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tuổi</label>
                    <p className="text-lg font-semibold">{calculateAge(pet.birthDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cân nặng</label>
                    <p className="text-lg font-semibold">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Màu sắc</label>
                    <p className="text-lg font-semibold">{pet.color || 'N/A'}</p>
                  </div>
                </div>

                {pet.initialHealthStatus && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tình trạng sức khỏe ban đầu</label>
                    <p className="text-gray-700 mt-1">{pet.initialHealthStatus}</p>
                  </div>
                )}

                {pet.specialNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ghi chú</label>
                    <p className="text-gray-700 mt-1">{pet.specialNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Medical Records (READ-ONLY) */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hồ Sơ Y Tế (Chỉ xem)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <Card key={record.recordId} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                {new Date(record.visitDate).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="font-semibold text-lg">
                                {record.diagnosis || 'Khám tổng quát'}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleDownloadMedicalRecord(record.recordId)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                          
                          {record.veterinarian && (
                            <p className="text-sm text-gray-600 mb-2">
                              👨‍⚕️ {record.veterinarian.fullName || 'Bác sĩ'}
                            </p>
                          )}
                          
                          {record.treatment && (
                            <div className="bg-gray-50 p-3 rounded mb-2">
                              <p className="text-sm font-medium text-gray-700">Điều trị:</p>
                              <p className="text-sm text-gray-600">{record.treatment}</p>
                            </div>
                          )}
                          
                          {record.notes && (
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm font-medium text-gray-700">Ghi chú:</p>
                              <p className="text-sm text-gray-600">{record.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có hồ sơ y tế</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Vaccinations */}
          <TabsContent value="vaccinations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Lịch Sử Tiêm Chủng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vaccinations.length > 0 ? (
                  <div className="space-y-3">
                    {vaccinations.map((vac, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <p className="font-semibold text-lg">
                                  {vac.vaccineType?.name || 'Vacxin'}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                📅 Ngày tiêm: {new Date(vac.vaccinationDate).toLocaleDateString('vi-VN')}
                              </p>
                              {vac.veterinarian && (
                                <p className="text-sm text-gray-600">
                                  👨‍⚕️ {vac.veterinarian.fullName}
                                </p>
                              )}
                              {vac.nextDueDate && (
                                <p className="text-sm text-amber-600 mt-2">
                                  🔔 Nhắc nhở: {new Date(vac.nextDueDate).toLocaleDateString('vi-VN')}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Syringe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có lịch sử tiêm chủng</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Appointments */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lịch Hẹn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <Card 
                        key={apt.appointmentId}
                        className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push('/dashboard/owner/appointments')}
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
                              <p className="font-semibold">
                                {apt.service?.serviceName || 'Dịch vụ'}
                              </p>
                              {apt.employee && (
                                <p className="text-sm text-gray-600 mt-1">
                                  👨‍⚕️ {apt.employee.fullName}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
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
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Chưa có lịch hẹn</p>
                    <Button
                      onClick={() => router.push('/dashboard/owner/appointments')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500"
                    >
                      Đặt lịch ngay
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <EditPetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditPet}
        pet={editingPet}
      />
    </div>
  );
}