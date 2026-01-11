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
import { appointmentApi, medicalRecordApi, petApi, petOwnerApi, getToken, authApi } from "@/lib/api";
import { formatPetId } from "@/lib/utils/id-formatter";
import VetFilterBar from "@/components/ui/VetFilterBar";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

export default function VeterinarianPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Enhanced filter states
  const [genderFilter, setGenderFilter] = useState("all");
  const [recentVisitFilter, setRecentVisitFilter] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  
  // Date range filter state
  const [dateRange, setDateRange] = useState({ start: null, end: null });

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

      // Chỉ lấy appointments của bác sĩ này
      const appointmentsRes = await appointmentApi.getMyAppointments();
      
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
          // Owner data is already included from appointment query
          const ownerData = data.owner || data.pet?.owner;
          
          console.log(`Pet ${petId} owner data:`, {
            hasOwner: !!ownerData,
            ownerId: ownerData?.petOwnerId || ownerData?.id,
            fullName: ownerData?.fullName,
            phone: ownerData?.phoneNumber,
            email: ownerData?.email || ownerData?.account?.email,
            address: ownerData?.address
          });

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

          // Normalize gender format
          const normalizeGender = (gender) => {
            if (!gender) return 'N/A';
            const g = gender.toLowerCase();
            if (g === 'male' || g === 'đực') return 'Male';
            if (g === 'female' || g === 'cái') return 'Female';
            return gender;
          };

          patientsData.push({
            id: petId,
            code: formatPetId(petId),
            name: data.pet.name || 'Unknown',
            icon: data.pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            type: data.pet.species?.toLowerCase() || 'unknown',
            breed: data.pet.breed || 'Mixed',
            age: data.pet.birthDate ? calculateAge(data.pet.birthDate) : 'N/A',
            gender: normalizeGender(data.pet.gender),
            weight: data.pet.weight ? `${data.pet.weight} kg` : 'N/A',
            color: data.pet.color || 'N/A',
            dateOfBirth: data.pet.birthDate || 'N/A',
            ownerId: ownerData?.petOwnerId || ownerData?.id,
            ownerName: ownerData?.fullName || 'Unknown',
            ownerPhone: ownerData?.phoneNumber || 'N/A',
            ownerEmail: ownerData?.email || ownerData?.account?.email || 'N/A',
            ownerAddress: ownerData?.address || 'N/A',
            ownerActive: ownerData?.account?.isActive ?? true,
            lastVisit: sortedAppointments[0]?.appointmentDate || 'N/A',
            totalVisits: data.appointments.length,
            medicalHistory,
            vaccinationHistory,
            vaccinationCount: vaccinationHistory.length,
            createdAt: data.pet.createdAt
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
    const yearDiff = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    // Calculate total months
    let totalMonths = yearDiff * 12 + monthDiff;
    if (dayDiff < 0) {
      totalMonths--;
    }
    
    // If less than 1 month, show in days
    if (totalMonths < 1) {
      const diffTime = Math.abs(today - birth);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 0 ? 'Hôm nay' : diffDays === 1 ? '1 ngày' : `${diffDays} ngày`;
    }
    
    // If less than 12 months, show in months
    if (totalMonths < 12) {
      return totalMonths === 1 ? '1 tháng' : `${totalMonths} tháng`;
    }
    
    // Otherwise show in years
    const age = Math.floor(totalMonths / 12);
    return age === 1 ? '1 tuổi' : `${age} tuổi`;
  };

  const handleViewDetail = (patient) => {
    // Navigate to comprehensive pet detail page instead of opening modal
    router.push(`/dashboard/vet/patients/${patient.id}`);
  };

  const filteredPatients = patients.filter(patient => {
    const matchFilter = filter === "all" || patient.type === filter;
    const matchSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGender = genderFilter === "all" || patient.gender === genderFilter;
    // Check if visited in last 30 days
    const isRecentVisit = patient.lastVisit && 
      (new Date() - new Date(patient.lastVisit)) <= 30 * 24 * 60 * 60 * 1000;
    const matchRecentVisit = !recentVisitFilter || isRecentVisit;
    
    // Date range filter for lastVisit
    let matchDateRange = true;
    if (dateRange.start || dateRange.end) {
      const visitDate = patient.lastVisit ? new Date(patient.lastVisit) : null;
      if (!visitDate) matchDateRange = false;
      else {
        if (dateRange.start && visitDate < dateRange.start) matchDateRange = false;
        if (dateRange.end && visitDate > dateRange.end) matchDateRange = false;
      }
    }
    
    return matchFilter && matchSearch && matchGender && matchRecentVisit && matchDateRange;
  }).sort((a, b) => {
    switch (sortBy) {
      case "recentVisit": 
        return new Date(b.lastVisit || "1970-01-01") - new Date(a.lastVisit || "1970-01-01");
      case "visits": 
        return (b.totalVisits || 0) - (a.totalVisits || 0);
      default: 
        return (a.name || "").localeCompare(b.name || "");
    }
  });

  const stats = {
    total: patients.length,
    dogs: patients.filter(p => p.type === 'dog').length,
    cats: patients.filter(p => p.type === 'cat').length,
    recentVisits: patients.filter(p => p.lastVisit && 
      (new Date() - new Date(p.lastVisit)) <= 30 * 24 * 60 * 60 * 1000).length
  };
  
  // Calculate active filter count
  const activeFilterCount = [
    filter !== "all",
    genderFilter !== "all",
    recentVisitFilter,
    sortBy !== "name"
  ].filter(Boolean).length;

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Bệnh nhân của tôi"
        subtitle="Danh sách thú cưng đã và đang điều trị"
      />

      {/* Stats - Premium Gradient Cards with Animations */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="vet-stat-card vet-gradient-primary group hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl group-hover:scale-110 transition-transform">🐾</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng số</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng bệnh nhân</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning group hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl group-hover:scale-110 transition-transform">🐕</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chó</span>
          </div>
          <div className="value">{stats.dogs}</div>
          <div className="label mt-1">Bệnh nhân chó</div>
        </div>

        <div className="vet-stat-card vet-gradient-info group hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl group-hover:scale-110 transition-transform">🐈</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Mèo</span>
          </div>
          <div className="value">{stats.cats}</div>
          <div className="label mt-1">Bệnh nhân mèo</div>
        </div>

        <div className="vet-stat-card vet-gradient-success group hover:scale-105 transition-transform">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl group-hover:scale-110 transition-transform">📅</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Gần đây</span>
          </div>
          <div className="value">{stats.recentVisits}</div>
          <div className="label mt-1">Khám trong 30 ngày</div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <VetFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm theo tên pet, chủ nuôi, giống..."
        toggleFilters={[
          {
            key: "species",
            label: "Loài",
            value: filter,
            defaultValue: "all",
            onChange: setFilter,
            options: [
              { value: "all", label: "Tất cả", icon: "🐾" },
              { value: "dog", label: "Chó", icon: "🐕" },
              { value: "cat", label: "Mèo", icon: "🐈" }
            ]
          }
        ]}
        filters={[
          {
            key: "gender",
            label: "Giới tính",
            value: genderFilter,
            defaultValue: "all",
            onChange: setGenderFilter,
            options: [
              { value: "all", label: "Tất cả" },
              { value: "male", label: "♂ Đực" },
              { value: "female", label: "♀ Cái" }
            ]
          },
          {
            key: "sortBy",
            label: "Sắp xếp",
            value: sortBy,
            defaultValue: "name",
            onChange: setSortBy,
            options: [
              { value: "name", label: "Tên A-Z" },
              { value: "recentVisit", label: "Khám gần nhất" },
              { value: "visits", label: "Số lần khám" }
            ]
          }
        ]}
        onReset={() => {
          setFilter("all");
          setSearchTerm("");
          setGenderFilter("all");
          setRecentVisitFilter(false);
          setSortBy("name");
          setDateRange({ start: null, end: null });
        }}
        activeFilterCount={activeFilterCount + (dateRange.start || dateRange.end ? 1 : 0)}
      />
      
      {/* Date Range Filter */}
      <DateRangeFilter
        onChange={(start, end, preset) => setDateRange({ start, end })}
        defaultPreset="all"
        theme="pink"
        size="md"
        showLabel={true}
        showCustomRange={true}
      />
      
      {/* Quick Filter Badge */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setRecentVisitFilter(!recentVisitFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
            recentVisitFilter 
              ? "bg-teal-500 text-white border-teal-500" 
              : "bg-white text-teal-600 border-teal-200 hover:border-teal-400"
          )}
        >
          <span>📅</span>
          <span className="text-sm font-medium">Khám gần đây (30 ngày)</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            recentVisitFilter ? "bg-white/20" : "bg-teal-100"
          )}>
            {stats.recentVisits}
          </span>
        </button>
      </div>

      {/* Patients Table - Premium Style */}
      <div className="space-y-6">
        <div className="vet-glass-card rounded-2xl p-6 shadow-xl">
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

        <div className="rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
                <TableHead className="w-[8%] font-bold text-purple-700">Mã</TableHead>
                <TableHead className="w-[18%] font-bold text-purple-700">Thú cưng</TableHead>
                <TableHead className="w-[12%] font-bold text-purple-700">Giống</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Tuổi</TableHead>
                <TableHead className="w-[15%] font-bold text-purple-700">Chủ nuôi</TableHead>
                <TableHead className="w-[12%] font-bold text-purple-700">Lần khám gần nhất</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Tổng lần khám</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-3">🐾</div>
                      <p className="text-lg font-semibold text-gray-600">Không có bệnh nhân nào</p>
                      <p className="text-sm text-gray-400 mt-1">Thử điều chỉnh bộ lọc hoặc thêm bệnh nhân mới</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient, index) => {
                  return (
                    <TableRow 
                      key={patient.id}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">{patient.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-2xl shadow-md ring-2 ring-pink-200 ring-offset-1">
                            {patient.icon || '🐾'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{patient.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                {patient.gender === 'male' ? '♂ Đực' : patient.gender === 'female' ? '♀ Cái' : patient.gender}
                              </span>
                              <span>•</span>
                              <span>{patient.color}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm font-medium text-gray-700">{patient.breed}</span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200 w-fit">
                          <span className="text-base">🎂</span>
                          <span className="text-sm font-semibold text-amber-700">{patient.age}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">👤</span>
                            <p className="font-bold text-gray-800 text-sm">{patient.ownerName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📞</span>
                            <p className="text-xs text-gray-600 font-medium">{patient.ownerPhone}</p>
                          </div>
                          {patient.ownerEmail && patient.ownerEmail !== 'N/A' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs">📧</span>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]" title={patient.ownerEmail}>{patient.ownerEmail}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 w-fit">
                          <span className="text-base">📅</span>
                          <span className="text-sm font-semibold text-green-700">{patient.lastVisit}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 font-bold">
                          {patient.totalVisits} lần
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(patient)} 
                          className="hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Xem chi tiết"
                        >
                          <span className="text-base mr-1">👁️</span>
                          <span className="text-xs font-semibold">Chi tiết</span>
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
