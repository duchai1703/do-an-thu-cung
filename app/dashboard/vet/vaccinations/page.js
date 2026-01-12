// app/dashboard/vet/vaccinations/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Syringe, Clock, CheckCircle2, AlertTriangle, Search, Plus, PawPrint, Cat, User, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { petApi, medicalRecordApi, authApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";
import apiClient from "@/lib/api/client";
import VetFilterBar from "@/components/ui/VetFilterBar";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

export default function VeterinarianVaccinationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [vaccineTypes, setVaccineTypes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccineTypeFilter, setVaccineTypeFilter] = useState("all");
  const [hasReactionsFilter, setHasReactionsFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [expandedRows, setExpandedRows] = useState({});
  const [vetMap, setVetMap] = useState({});
  
  // Date range filter state
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Form state for new vaccination
  const [formData, setFormData] = useState({
    petId: "",
    vaccineTypeId: "",
    vaccineName: "",
    vaccinationType: "",
    batchNumber: "",
    manufacturer: "",
    nextDueDate: "",
    notes: "",
    site: "",
    reactions: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Load veterinarians for name lookup
      try {
        const vetsRes = await apiClient.get('/employees/veterinarians');
        const vets = vetsRes.data || vetsRes || [];
        const map = {};
        vets.forEach(vet => {
          map[vet.employeeId] = vet.fullName;
        });
        setVetMap(map);
      } catch (err) {
        console.log('Could not load veterinarians for name lookup');
      }

      // Load all pets
      const petsRes = await petApi.getAll();
      if (petsRes.success && petsRes.data) {
        const mappedPets = [];
        
        for (const pet of petsRes.data) {
          let ownerData = pet.owner;
          
          // If owner not included, fetch separately
          if (!ownerData && pet.ownerId) {
            try {
              const ownerRes = await apiClient.get(`/pet-owners/${pet.ownerId}`);
              ownerData = ownerRes.data || ownerRes;
            } catch (err) {
              console.log(`Could not load owner for pet ${pet.petId}`);
            }
          }
          
          mappedPets.push({
            id: pet.petId,
            name: pet.name,
            species: pet.species,
            icon: pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            ownerName: ownerData?.fullName || ownerData?.account?.email?.split('@')[0] || 'Unknown',
            ownerPhone: ownerData?.phoneNumber || 'N/A',
            ownerEmail: ownerData?.email || ownerData?.account?.email || 'N/A'
          });
        }
        
        setPets(mappedPets);

        // Load vaccine types from API
        try {
          const vaccineTypesRes = await medicalRecordApi.getVaccineTypes();
          if (vaccineTypesRes.success && vaccineTypesRes.data) {
            setVaccineTypes(vaccineTypesRes.data);
          }
        } catch (e) {
          console.log('Error loading vaccine types:', e);
        }
        
        // Load vaccination history for each pet using petApi
        const allVaccinations = [];
        for (const pet of mappedPets) {
          try {
            const vacResponse = await petApi.getVaccinations(pet.id);
            if (vacResponse.success && vacResponse.data && Array.isArray(vacResponse.data)) {
              vacResponse.data.forEach(vac => {
                  // Calculate status
                  let status = 'completed';
                  const daysByBackend = vac.daysUntilDue;
                  
                  if (daysByBackend !== undefined && daysByBackend !== null) {
                    if (daysByBackend < 0) status = 'overdue';
                    else if (daysByBackend <= 14) status = 'upcoming';
                  } else if (vac.nextDueDate) {
                     const today = new Date();
                     const dueDate = new Date(vac.nextDueDate);
                     const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                     if (diffDays < 0) status = 'overdue';
                     else if (diffDays <= 14) status = 'upcoming';
                  }

                  allVaccinations.push({
                    id: vac.vaccinationId || vac.id,
                    petId: pet.id,
                    petName: pet.name,
                    petIcon: pet.icon,
                    ownerName: pet.ownerName,
                    ownerPhone: pet.ownerPhone,
                    ownerEmail: pet.ownerEmail,
                    vaccineTypeId: vac.vaccineTypeId,
                    vaccineName: vac.vaccineType?.name || 'Vaccine', // Add vaccineName if available or default
                    dateAdministered: vac.administrationDate || vac.createdAt,
                    nextDueDate: vac.nextDueDate,
                    batchNumber: vac.batchNumber || 'N/A',
                    site: vac.site || '',
                    reactions: vac.reactions || '',
                    isDue: vac.isDue,
                    daysUntilDue: vac.daysUntilDue,
                    notes: vac.notes || '',
                    administeredBy: vac.administeredBy || null,
                    createdAt: vac.createdAt || null,
                    status: status // Add calculated status
                  });
              });
            }
          } catch (e) {
            console.log(`Error loading vaccinations for pet ${pet.id}:`, e);
          }
        }
        
        // Sort by date descending
        allVaccinations.sort((a, b) => new Date(b.dateAdministered) - new Date(a.dateAdministered));
        setVaccinations(allVaccinations);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVaccinationStatus = (nextDueDate) => {
    if (!nextDueDate) return 'unknown';
    
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 14) return 'upcoming';
    return 'completed';
  };

  // Toggle expanded row to show full vaccination details
  const toggleRow = (vacId) => {
    setExpandedRows(prev => ({
      ...prev,
      [vacId]: !prev[vacId]
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      petId: "",
      vaccineTypeId: "",
      batchNumber: "",
      site: "",
      notes: "",
      reactions: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.petId || !formData.vaccineTypeId) {
      showToast("Vui lòng chọn thú cưng và loại vaccine", "error");
      return;
    }

    setFormLoading(true);
    try {
      // Get current vet info
      const userRes = await authApi.getCurrentUser();
      if (!userRes.success || !userRes.data?.employee?.employeeId) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      
      const veterinarianId = Number(userRes.data.employee.employeeId);
      
      // Create vaccination record using petApi
      const response = await petApi.addVaccination(Number(formData.petId), {
        vaccineTypeId: Number(formData.vaccineTypeId),
        administeredBy: veterinarianId,
        administrationDate: new Date().toISOString(),
        batchNumber: formData.batchNumber || `BATCH-${Date.now()}`,
        site: formData.site || undefined,
        reactions: formData.reactions || undefined,
        notes: formData.notes || undefined
      });
      
      if (response.success) {
        showToast("Đã ghi nhận tiêm phòng thành công!");
        setIsModalOpen(false);
        await loadData();
      } else {
        throw new Error(response.error || 'Lỗi khi ghi nhận tiêm phòng');
      }
    } catch (error) {
      console.error('Error creating vaccination:', error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredVaccinations = vaccinations.filter(vac => {
    const matchFilter = filter === "all" || vac.status === filter;
    const matchSearch = vac.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       vac.vaccineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       vac.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       vac.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVaccineType = vaccineTypeFilter === "all" || vac.vaccineTypeId === parseInt(vaccineTypeFilter);
    const matchReactions = !hasReactionsFilter || (vac.reactions && vac.reactions.trim() !== "");
    
    // Date range filter
    let matchDateRange = true;
    if (dateRange.start || dateRange.end) {
      const vacDate = new Date(vac.dateAdministered || vac.administrationDate || vac.createdAt);
      if (dateRange.start && vacDate < dateRange.start) matchDateRange = false;
      if (dateRange.end && vacDate > dateRange.end) matchDateRange = false;
    }
    
    return matchFilter && matchSearch && matchVaccineType && matchReactions && matchDateRange;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.dateAdministered) - new Date(b.dateAdministered);
      case "petName": return (a.petName || "").localeCompare(b.petName || "");
      case "dueDate": return new Date(a.nextDueDate || "9999-12-31") - new Date(b.nextDueDate || "9999-12-31");
      default: return new Date(b.dateAdministered) - new Date(a.dateAdministered);
    }
  });
  
  // Calculate active filter count
  const activeFilterCount = [
    filter !== "all",
    vaccineTypeFilter !== "all",
    hasReactionsFilter,
    sortBy !== "newest"
  ].filter(Boolean).length;

  const stats = {
    total: vaccinations.length,
    upcoming: vaccinations.filter(v => v.status === 'upcoming').length,
    overdue: vaccinations.filter(v => v.status === 'overdue').length,
    completed: vaccinations.filter(v => v.status === 'completed').length
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 },
      upcoming: { label: "Sắp đến hạn", variant: "warning", icon: Clock },
      overdue: { label: "Quá hạn", variant: "destructive", icon: AlertTriangle },
      unknown: { label: "Không xác định", variant: "secondary", icon: FileText }
    };
    return badges[status] || badges.unknown;
  };

  return (
    <div className="flex-1 space-y-6">
      {/* 🎨 Stunning Gradient Header Banner - Vaccination Theme */}
      <div className="relative overflow-hidden rounded-b-3xl">
        {/* Animated Background - Purple/Pink (Medical theme) */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['💉', '💊', '🏥', '❤️', '✨', '🌟'].map((icon, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-4xl"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${3 + i % 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Title & Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl animate-pulse">
                  💉
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Quản lý tiêm phòng
                    <span className="text-yellow-200">✨</span>
                  </h1>
                  <p className="text-white/80 mt-1">
                    Theo dõi và ghi nhận tiêm phòng cho thú cưng
                  </p>
                </div>
              </div>

              {/* Right side - Stats summary */}
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-xs text-white/80">tổng số</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-yellow-200">{stats.upcoming}</p>
                      <p className="text-xs text-white/80">sắp hạn</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-red-200">{stats.overdue}</p>
                      <p className="text-xs text-white/80">quá hạn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Stats - Cute Premium Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Tổng số lần tiêm</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl">
                💉
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Sắp đến hạn</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xl animate-pulse">
                ⏰
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.upcoming}</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Quá hạn</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center text-white text-xl">
                ⚠️
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Đã hoàn thành</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xl">
                ✅
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filter Bar */}
        <VetFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm theo tên pet, vaccine, batch number..."
          toggleFilters={[
            {
              key: "status",
              label: "Trạng thái",
              value: filter,
              defaultValue: "all",
              onChange: setFilter,
              options: [
                { value: "all", label: "Tất cả", icon: "💉" },
                { value: "upcoming", label: "Sắp hạn", icon: "⏰" },
                { value: "overdue", label: "Quá hạn", icon: "⚠️" },
                { value: "completed", label: "Đã tiêm", icon: "✅" }
              ]
            }
          ]}
          filters={[
            {
              key: "vaccineType",
              label: "Loại vaccine",
              value: vaccineTypeFilter,
              defaultValue: "all",
              onChange: setVaccineTypeFilter,
              options: [
                { value: "all", label: "Tất cả loại" },
                ...vaccineTypes.map(vt => ({ value: String(vt.id), label: vt.name }))
              ]
            },
            {
              key: "sortBy",
              label: "Sắp xếp",
              value: sortBy,
              defaultValue: "newest",
              onChange: setSortBy,
              options: [
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
                { value: "petName", label: "Tên A-Z" },
                { value: "dueDate", label: "Theo hạn" }
              ]
            }
          ]}
          onReset={() => {
            setFilter("all");
            setSearchTerm("");
            setVaccineTypeFilter("all");
            setHasReactionsFilter(false);
            setSortBy("newest");
            setDateRange({ start: null, end: null });
          }}
          activeFilterCount={activeFilterCount + (dateRange.start || dateRange.end ? 1 : 0)}
        />
        
        {/* Date Range Filter */}
        <DateRangeFilter
          onChange={(start, end, preset) => setDateRange({ start, end })}
          defaultPreset="all"
          theme="purple"
          size="md"
          showLabel={true}
          showCustomRange={true}
        />

        {/* Quick Filter Badges + Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleOpenModal} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" /> Ghi nhận tiêm phòng
          </Button>
          
          <button
            onClick={() => setHasReactionsFilter(!hasReactionsFilter)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
              hasReactionsFilter 
                ? "bg-orange-500 text-white border-orange-500 shadow-lg" 
                : "bg-white text-orange-600 border-orange-200 hover:border-orange-400"
            )}
          >
            <span>🔬</span>
            <span className="text-sm font-medium">Có phản ứng</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              hasReactionsFilter ? "bg-white/20" : "bg-orange-100"
            )}>
              {vaccinations.filter(v => v.reactions && v.reactions.trim() !== "").length}
            </span>
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <TableRow>
                <TableHead className="w-[11%] font-bold text-purple-700">Thú cưng</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Chủ nuôi</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Ngày tiêm</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Hạn tiếp</TableHead>
                <TableHead className="w-[8%] font-bold text-purple-700">Mã lô</TableHead>
                <TableHead className="w-[8%] font-bold text-purple-700">Vị trí</TableHead>
                <TableHead className="w-[9%] font-bold text-purple-700">BS tiêm</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Phản ứng</TableHead>
                <TableHead className="w-[14%] font-bold text-purple-700">Trạng thái</TableHead>
                <TableHead className="w-[10%] font-bold text-purple-700">Tạo lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaccinations.length === 0 ? (
                <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl">
                        💉
                      </div>
                      <p className="text-lg font-medium">{loading ? "Đang tải..." : "Không có dữ liệu tiêm phòng"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVaccinations.map((vac) => {
                  // Use pre-calculated status
                  const status = vac.status || 'completed';
                  const statusBadge = getStatusBadge(status);
                  const PetIcon = vac.petIcon === '🐕' ? PawPrint : Cat;
                  return (
                    <>
                    <TableRow 
                      key={vac.id} 
                      className={cn(
                        "cursor-pointer hover:bg-purple-50 transition-colors",
                        expandedRows[vac.id] && "bg-purple-50/50 border-l-4 border-purple-400"
                      )} 
                      onClick={() => toggleRow(vac.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                            <PetIcon className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-semibold">{vac.petName}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{vac.ownerName}</span>
                          <span className="text-xs text-gray-500">{vac.ownerPhone}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {vac.dateAdministered ? new Date(vac.dateAdministered).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">
                          {vac.nextDueDate ? new Date(vac.nextDueDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{vac.batchNumber}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{vac.site || '-'}</span>
                      </TableCell>
                      
                      {/* administeredBy - Bác sĩ tiêm */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {vac.administeredByName || vac.vetName || vetMap[vac.administeredBy] || '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        {vac.reactions ? (
                          <Badge 
                            variant="warning" 
                            className="text-xs bg-orange-100 text-orange-700 flex items-center justify-center max-w-[140px] px-2 py-0.5 mx-auto cursor-help"
                            title={vac.reactions}
                          >
                             <div className="truncate w-full text-center">⚠️ {vac.reactions}</div>
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground block text-center">--</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                            <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                          </Badge>
                          {/* daysUntilDue countdown */}
                          {vac.daysUntilDue !== null && vac.daysUntilDue !== undefined && (
                            <span className={cn(
                              "text-xs font-medium",
                              vac.daysUntilDue < 0 ? "text-red-600" :
                              vac.daysUntilDue <= 7 ? "text-orange-600" :
                              vac.daysUntilDue <= 14 ? "text-yellow-600" : "text-green-600"
                            )}>
                              {vac.daysUntilDue < 0 
                                ? `⚠️ Quá hạn ${Math.abs(vac.daysUntilDue)} ngày` 
                                : vac.daysUntilDue === 0 
                                  ? "📅 Hôm nay"
                                  : `⏰ Còn ${vac.daysUntilDue} ngày`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* createdAt */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {vac.createdAt ? new Date(vac.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expandable Detail Row */}
                    {expandedRows[vac.id] && (
                      <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <TableCell colSpan={10} className="p-0">
                          <div className="p-4 space-y-3 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                              <Syringe className="h-4 w-4 text-purple-600" />
                              <span className="font-bold text-purple-800">Chi tiết tiêm phòng #{vac.id}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">👨‍⚕️ Bác sĩ tiêm</p>
                                <p className="font-semibold">{vac.administeredBy ? (vetMap[vac.administeredBy] || `BS #${vac.administeredBy}`) : 'Chưa ghi nhận'}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">📅 Ngày tiêm</p>
                                <p className="font-semibold">{vac.dateAdministered ? new Date(vac.dateAdministered).toLocaleDateString('vi-VN') : 'N/A'}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">🔄 Hạn tiếp theo</p>
                                <p className={cn("font-semibold", vac.daysUntilDue < 0 && "text-red-600")}>{vac.nextDueDate ? new Date(vac.nextDueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">🏷️ Mã lô</p>
                                <p className="font-semibold font-mono">{vac.batchNumber}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">📍 Vị trí tiêm</p>
                                <p className="font-semibold">{vac.site || 'Không ghi nhận'}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm">
                                <p className="text-xs text-gray-500">🕐 Ngày tạo</p>
                                <p className="font-semibold">{vac.createdAt ? new Date(vac.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                              </div>
                              <div className="bg-white p-2 rounded border text-sm col-span-2">
                                <p className="text-xs text-gray-500">⚠️ Phản ứng</p>
                                <p className={cn("font-semibold break-words", vac.reactions ? "text-red-600" : "text-green-600")}>{vac.reactions || '✅ Không có'}</p>
                              </div>
                            </div>
                            {vac.notes && (
                              <div className="bg-amber-50 p-2 rounded border border-amber-200 text-sm">
                                <p className="text-xs text-amber-600 font-semibold">📝 Ghi chú</p>
                                <p className="text-gray-700">{vac.notes}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal - Add Vaccination */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-primary" />
                Ghi nhận tiêm phòng
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn thú cưng *</Label>
                <Select
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.icon} {pet.name} - {pet.ownerName}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Thông tin vaccine sẽ được lấy từ danh mục vaccine đã đăng ký trong hệ thống.
                </p>
              </div>

              <div className="space-y-2">
                <Label>💉 Loại Vaccine *</Label>
                <Select
                  value={formData.vaccineTypeId}
                  onChange={(e) => setFormData({ ...formData, vaccineTypeId: e.target.value })}
                >
                  <option value="">-- Chọn loại vaccine --</option>
                  {vaccineTypes.map(vt => (
                    <option key={vt.vaccineTypeId || vt.id} value={vt.vaccineTypeId || vt.id}>
                      {vt.name || vt.vaccineName} {vt.category ? `(${vt.category})` : ''}
                    </option>
                  ))}
                </Select>
                {formData.vaccineTypeId && (
                  <p className="text-xs text-muted-foreground">
                    ℹ️ {vaccineTypes.find(vt => (vt.vaccineTypeId || vt.id) == formData.vaccineTypeId)?.description || ''}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mã lô vaccine (batch)</Label>
                <Input
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="VD: LOT-2024-001"
                />
              </div>

              <div className="space-y-2">
                <Label>Vị trí tiêm</Label>
                <Input
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="VD: Vai trái, Đùi phải..."
                />
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú thêm về tiêm phòng..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Phản ứng sau tiêm (nếu có)
                </Label>
                <Textarea
                  value={formData.reactions}
                  onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
                  placeholder="Mô tả các phản ứng bất thường như: sốt, sưng, dị ứng..."
                  rows={2}
                  className="border-yellow-200 focus:border-yellow-400"
                />
              </div>


              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Đang lưu..." : "Ghi nhận"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>  {/* Close max-w-7xl container */}
    </div>
  );
}
