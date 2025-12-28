// app/(dashboard)/veterinarian/patients/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetPatientDetailModal from "@/components/modals/VetPatientDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appointmentApi, medicalRecordApi, petApi, getToken } from "@/lib/api";
import { formatPetId } from "@/lib/utils/id-formatter";

export default function VeterinarianPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Lấy employeeId của bác sĩ đang đăng nhập
      const { authApi } = await import("@/lib/api");
      const userRes = await authApi.getCurrentUser();
      const employeeId = userRes.data?.employee?.employeeId;

      if (!employeeId) {
        console.log('[Patients] No employeeId found');
        setPatients([]);
        setLoading(false);
        return;
      }

      // Chỉ lấy appointments của bác sĩ này
      const appointmentsRes = await appointmentApi.getByEmployee(employeeId);
      
      if (appointmentsRes.success && appointmentsRes.data) {
        // Get unique pets from appointments của bác sĩ này
        const petMap = new Map();
        
        appointmentsRes.data.forEach(apt => {
          if (apt.pet) {
            const petId = apt.pet.petId || apt.pet.id;
            if (!petMap.has(petId)) {
              petMap.set(petId, {
                pet: apt.pet,
                owner: apt.pet.owner,
                appointments: []
              });
            }
            petMap.get(petId).appointments.push(apt);
          }
        });

        // Load vaccine types first for mapping
        const vaccineTypesRes = await medicalRecordApi.getVaccineTypes();
        const vaccineTypesMap = {};
        if (vaccineTypesRes.success && vaccineTypesRes.data) {
          vaccineTypesRes.data.forEach(vt => {
            vaccineTypesMap[vt.vaccineTypeId] = vt;
          });
        }

        // Fetch medical records for each pet
        const patientsData = [];
        for (const [petId, data] of petMap.entries()) {
          const recordsRes = await medicalRecordApi.getByPet(petId);
          const medicalHistory = recordsRes.success && recordsRes.data ? 
            recordsRes.data.map(record => ({
              date: record.recordDate || record.createdAt,
              diagnosis: record.diagnosis || 'N/A',
              treatment: record.treatment || 'N/A'
            })) : [];

          // Fetch vaccination history
          const vacRes = await petApi.getVaccinations(petId);
          const vaccinationHistory = vacRes.success && vacRes.data ?
            vacRes.data.map(vac => {
              const vaccineType = vaccineTypesMap[vac.vaccineTypeId];
              return {
                date: vac.administrationDate,
                nextDue: vac.nextDueDate,
                batchNumber: vac.batchNumber,
                site: vac.site,
                reactions: vac.reactions,
                isDue: vac.isDue,
                daysUntilDue: vac.daysUntilDue,
                vaccineTypeId: vac.vaccineTypeId,
                vaccineName: vaccineType?.vaccineName || `Vaccine #${vac.vaccineTypeId}`,
                manufacturer: vaccineType?.manufacturer || '',
                administeredByName: vac.administeredByName || null
              };
            }) : [];

          const sortedAppointments = data.appointments.sort((a, b) => 
            new Date(b.appointmentDate) - new Date(a.appointmentDate)
          );

          patientsData.push({
            id: petId,
            code: formatPetId(petId),
            name: data.pet.name || 'Unknown',
            icon: data.pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            type: data.pet.species?.toLowerCase() || 'unknown',
            breed: data.pet.breed || 'Mixed',
            age: data.pet.birthDate ? calculateAge(data.pet.birthDate) : 'N/A',
            gender: data.pet.gender || 'N/A',
            weight: data.pet.weight ? `${data.pet.weight} kg` : 'N/A',
            color: data.pet.color || 'N/A',
            dateOfBirth: data.pet.birthDate || 'N/A',
            ownerId: data.owner?.petOwnerId,
            ownerName: data.owner?.fullName || data.owner?.account?.email?.split('@')[0] || 'Unknown',
            ownerPhone: data.owner?.phoneNumber || 'N/A',
            lastVisit: sortedAppointments[0]?.appointmentDate || 'N/A',
            totalVisits: data.appointments.length,
            medicalHistory,
            vaccinationHistory,
            vaccinationCount: vaccinationHistory.length
          });
        }

        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} tuổi`;
    }
    return `${age} tuổi`;
  };

  const handleViewDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchFilter = filter === "all" || patient.type === filter;
    const matchSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.breed.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: patients.length,
    dogs: patients.filter(p => p.type === 'dog').length,
    cats: patients.filter(p => p.type === 'cat').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Bệnh nhân của tôi"
        subtitle="Danh sách thú cưng đã và đang điều trị"
      />

      {/* Stats - Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🐾</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng số</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng bệnh nhân</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🐕</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chó</span>
          </div>
          <div className="value">{stats.dogs}</div>
          <div className="label mt-1">Bệnh nhân chó</div>
        </div>

        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🐈</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Mèo</span>
          </div>
          <div className="value">{stats.cats}</div>
          <div className="label mt-1">Bệnh nhân mèo</div>
        </div>
      </div>

      {/* Filter Tabs - Premium Style */}
      <div className="vet-glass-card-dark rounded-xl p-2">
        <div className="flex gap-2">
          {[
            { value: 'all', label: '🐾 Tất cả', gradient: 'from-pink-500 to-rose-400' },
            { value: 'dog', label: '🐕 Chó', gradient: 'from-amber-500 to-orange-400' },
            { value: 'cat', label: '🐈 Mèo', gradient: 'from-blue-500 to-cyan-400' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200",
                filter === tab.value
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : "bg-white/50 text-gray-700 hover:bg-white/80"
              )}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar - Premium Style */}
      <div className="vet-glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => document.getElementById('patient-search')?.focus()}>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-3xl shadow-lg hover:scale-110 transition-transform">
            🔍
          </div>
          <div className="flex-1">
            <label htmlFor="patient-search" className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">
              Tìm kiếm bệnh nhân
            </label>
            <Input
              id="patient-search"
              type="text"
              placeholder="Nhập tên thú cưng, chủ nuôi, giống..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent p-0 h-auto text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Patients Table - Premium Style */}
      <div className="space-y-6">
        <div className="vet-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
                📋
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Danh sách bệnh nhân</h2>
                <p className="text-sm text-gray-500">Quản lý thú cưng điều trị</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
              <span className="text-2xl">{filteredPatients.length}</span>
              <span className="text-sm opacity-90">bệnh nhân</span>
            </div>
          </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">Mã</TableHead>
                <TableHead className="w-[18%]">Thú cưng</TableHead>
                <TableHead className="w-[12%]">Giống</TableHead>
                <TableHead className="w-[10%]">Tuổi</TableHead>
                <TableHead className="w-[15%]">Chủ nuôi</TableHead>
                <TableHead className="w-[12%]">Lần khám gần nhất</TableHead>
                <TableHead className="w-[10%]">Tổng lần khám</TableHead>
                <TableHead className="w-[10%]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <div className="text-5xl mb-2">🐾</div>
                    Không có bệnh nhân nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => {
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{patient.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-xl">
                            {patient.icon || '🐾'}
                          </div>
                          <div>
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.gender} - {patient.color}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">{patient.breed}</span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-base">🎂</span>
                          <span className="text-sm">{patient.age}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold">{patient.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{patient.ownerPhone}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-base">📅</span>
                          <span className="text-sm">{patient.lastVisit}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary">{patient.totalVisits} lần</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => handleViewDetail(patient)} title="Xem chi tiết">
                          <span className="text-lg">👁️</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      </div>

      {/* Modal */}
      <VetPatientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
}
