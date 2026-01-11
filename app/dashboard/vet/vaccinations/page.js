// app/dashboard/vet/vaccinations/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
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
        const mappedPets = petsRes.data.map(pet => ({
          id: pet.petId,
          name: pet.name,
          species: pet.species,
          icon: pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          ownerName: pet.owner?.fullName || pet.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: pet.owner?.phoneNumber || 'N/A'
        }));
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
                allVaccinations.push({
                  id: vac.vaccinationId || vac.id,
                  petId: pet.id,
                  petName: pet.name,
                  petIcon: pet.icon,
                  ownerName: pet.ownerName,
                  vaccineTypeId: vac.vaccineTypeId,
                  dateAdministered: vac.administrationDate || vac.createdAt,
                  nextDueDate: vac.nextDueDate,
                  batchNumber: vac.batchNumber || 'N/A',
                  site: vac.site || '',
                  reactions: vac.reactions || '',
                  isDue: vac.isDue,
                  daysUntilDue: vac.daysUntilDue,
                  notes: vac.notes || '',
                  administeredBy: vac.administeredBy || null,
                  createdAt: vac.createdAt || null
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
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Quản lý tiêm phòng"
        subtitle="Theo dõi và ghi nhận tiêm phòng cho thú cưng"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lần tiêm</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp đến hạn</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.upcoming}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
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
        theme="blue"
        size="md"
        showLabel={true}
        showCustomRange={true}
      />

      {/* Quick Filter Badges + Add Button */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleOpenModal} className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          <Plus className="h-4 w-4" /> Ghi nhận tiêm phòng
        </Button>
        
        <button
          onClick={() => setHasReactionsFilter(!hasReactionsFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
            hasReactionsFilter 
              ? "bg-orange-500 text-white border-orange-500" 
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[11%]">Thú cưng</TableHead>
              <TableHead className="w-[10%]">Chủ nuôi</TableHead>
              <TableHead className="w-[10%]">Ngày tiêm</TableHead>
              <TableHead className="w-[10%]">Hạn tiếp</TableHead>
              <TableHead className="w-[8%]">Mã lô</TableHead>
              <TableHead className="w-[8%]">Vị trí</TableHead>
              <TableHead className="w-[9%]">BS tiêm</TableHead>
              <TableHead className="w-[10%]">Phản ứng</TableHead>
              <TableHead className="w-[14%]">Trạng thái</TableHead>
              <TableHead className="w-[10%]">Tạo lúc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVaccinations.length === 0 ? (
              <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  <Syringe className="mx-auto h-8 w-8 mb-2" />
                  {loading ? "Đang tải..." : "Không có dữ liệu tiêm phòng"}
                </TableCell>
              </TableRow>
            ) : (
              filteredVaccinations.map((vac) => {
                // Calculate status from isDue and daysUntilDue
                let status = 'completed';
                if (vac.daysUntilDue !== null) {
                  if (vac.daysUntilDue < 0) status = 'overdue';
                  else if (vac.daysUntilDue <= 14) status = 'upcoming';
                }
                const statusBadge = getStatusBadge(status);
                const PetIcon = vac.petIcon === '🐕' ? PawPrint : Cat;
                return (
                  <>
                  <TableRow 
                    key={vac.id} 
                    className={cn(
                      "cursor-pointer hover:bg-blue-50 transition-colors",
                      expandedRows[vac.id] && "bg-blue-50/50 border-l-4 border-blue-400"
                    )} 
                    onClick={() => toggleRow(vac.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                          <PetIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">{vac.petName}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{vac.ownerName}</span>
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
                        {vac.administeredByName || vac.vetName || '-'}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {vac.reactions ? (
                        <Badge variant="warning" className="text-xs">
                          ⚠️ {vac.reactions.length > 20 ? vac.reactions.slice(0, 20) + '...' : vac.reactions}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Không có</span>
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
                    <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <TableCell colSpan={10} className="p-0">
                        <div className="p-4 space-y-3 animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                            <Syringe className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-800">Chi tiết tiêm phòng #{vac.id}</span>
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
                              <p className={cn("font-semibold", vac.reactions ? "text-red-600" : "text-green-600")}>{vac.reactions || '✅ Không có'}</p>
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
    </div>
  );
}
