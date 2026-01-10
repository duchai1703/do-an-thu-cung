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
                  notes: vac.notes || ''
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
    const matchSearch = vac.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       vac.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

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

      {/* Filter */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp đến hạn</TabsTrigger>
          <TabsTrigger value="overdue">Quá hạn</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ghi nhận tiêm phòng
        </Button>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên thú cưng, vaccine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[13%]">Thú cưng</TableHead>
              <TableHead className="w-[12%]">Chủ nuôi</TableHead>
              <TableHead className="w-[12%]">Ngày tiêm</TableHead>
              <TableHead className="w-[12%]">Hạn tiếp theo</TableHead>
              <TableHead className="w-[10%]">Mã lô</TableHead>
              <TableHead className="w-[10%]">Vị trí tiêm</TableHead>
              <TableHead className="w-[14%]">Phản ứng</TableHead>
              <TableHead className="w-[17%]">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVaccinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
                  <TableRow key={vac.id}>
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
                  </TableRow>
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
