// app/dashboard/vet/boarding/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { 
  Home, 
  PawPrint, 
  Cat, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  User, 
  Calendar, 
  LogOut,
  Loader2,
  Settings,
  Eye,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { cageApi, petApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function VeterinarianBoardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cages, setCages] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [mainTab, setMainTab] = useState("monitoring");
  const [cageFilter, setCageFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);
  
  // Form state
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    petId: "",
    cageId: "",
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: "",
    notes: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [availableCagesForPet, setAvailableCagesForPet] = useState([]);

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

      // Load cages
      const cagesRes = await cageApi.getAll();
      let mappedCages = [];
      if (cagesRes.success && cagesRes.data) {
        mappedCages = cagesRes.data.map(cage => ({
          id: cage.cageId || cage.id,
          number: cage.cageNumber || `C${cage.cageId || cage.id}`,
          size: cage.size || 'medium',
          status: mapCageStatus(cage.status),
          location: cage.location || 'Khu A',
          notes: cage.notes || '',
          currentPet: null
        }));
        setCages(mappedCages);
      }

      // Load active assignments
      const assignmentsRes = await cageApi.getActiveAssignments();
      if (assignmentsRes.success && assignmentsRes.data) {
        const mappedAssignments = assignmentsRes.data.map(asn => {
          const checkIn = new Date(asn.checkInDate || asn.createdAt);
          const today = new Date();
          const daysStayed = Math.floor((today - checkIn) / (1000 * 60 * 60 * 24));
          
          return {
            id: asn.assignmentId || asn.id,
            cageId: asn.cage?.cageId || asn.cageId,
            cageNumber: asn.cage?.cageNumber || `C${asn.cageId}`,
            petId: asn.pet?.petId || asn.petId,
            petName: asn.pet?.name || 'Unknown',
            petIcon: asn.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            petBreed: asn.pet?.breed || '',
            ownerName: asn.pet?.owner?.fullName || 'Unknown',
            ownerPhone: asn.pet?.owner?.phoneNumber || 'N/A',
            checkInDate: asn.checkInDate || asn.createdAt,
            expectedCheckOutDate: asn.expectedCheckOutDate,
            daysStayed,
            notes: asn.notes || ''
          };
        });
        setActiveAssignments(mappedAssignments);
        
        // Update cages with current pet info
        setCages(mappedCages.map(cage => {
          const assignment = mappedAssignments.find(a => a.cageId === cage.id);
          return {
            ...cage,
            currentPet: assignment ? {
              name: assignment.petName,
              icon: assignment.petIcon,
              ownerName: assignment.ownerName,
              checkInDate: assignment.checkInDate,
              assignmentId: assignment.id,
              daysStayed: assignment.daysStayed
            } : null,
            status: assignment ? 'occupied' : cage.status
          };
        }));
      }

      // Load pets
      const petsRes = await petApi.getAll();
      if (petsRes.success && petsRes.data) {
        setPets(petsRes.data.map(pet => ({
          id: pet.petId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          icon: pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          ownerName: pet.owner?.fullName || 'Unknown'
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const mapCageStatus = (status) => {
    const statusMap = {
      'AVAILABLE': 'available',
      'OCCUPIED': 'occupied',
      'MAINTENANCE': 'maintenance',
      'RESERVED': 'reserved'
    };
    return statusMap[status] || 'available';
  };

  const handlePetSelect = (petId) => {
    setFormData(prev => ({ ...prev, petId, cageId: "" }));
    const allAvailableCages = cages.filter(cage => cage.status === 'available');
    setAvailableCagesForPet(allAvailableCages);
  };

  const handleOpenAssignModal = (cage = null) => {
    setSelectedCage(cage);
    setFormData({
      petId: "",
      cageId: cage ? cage.id : "",
      checkInDate: new Date().toISOString().split('T')[0],
      expectedCheckOutDate: "",
      notes: ""
    });
    setAvailableCagesForPet(cage ? [cage] : cages.filter(c => c.status === 'available'));
    setIsAssignModalOpen(true);
  };

  const handleAssignPet = async (e) => {
    e.preventDefault();
    
    if (!formData.petId || !formData.cageId) {
      showToast("Vui lòng chọn thú cưng và chuồng", "error");
      return;
    }

    setFormLoading(true);
    try {
      const response = await cageApi.assignPet(Number(formData.cageId), {
        petId: Number(formData.petId),
        checkInDate: formData.checkInDate,
        expectedCheckOutDate: formData.expectedCheckOutDate || null,
        notes: formData.notes || null
      });
      
      if (response.success) {
        showToast("Đã phân bổ chuồng thành công!");
        setIsAssignModalOpen(false);
        await loadData();
      } else {
        throw new Error(response.error || 'Lỗi khi phân bổ chuồng');
      }
    } catch (error) {
      console.error('Error assigning pet:', error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCheckOut = async (assignmentId) => {
    if (!confirm("Xác nhận trả chuồng cho thú cưng này?")) return;
    
    try {
      const response = await cageApi.checkOutPet(assignmentId);
      if (response.success) {
        showToast("Đã trả chuồng thành công!");
        await loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error checking out:', error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    }
  };

  const filteredCages = cages.filter(cage => {
    const matchFilter = cageFilter === "all" || cage.status === cageFilter;
    const matchSearch = cage.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (cage.currentPet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: cages.length,
    available: cages.filter(c => c.status === 'available').length,
    occupied: cages.filter(c => c.status === 'occupied').length,
    maintenance: cages.filter(c => c.status === 'maintenance').length
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { label: "Trống", variant: "success", icon: CheckCircle2 },
      occupied: { label: "Đang sử dụng", variant: "warning", icon: PawPrint },
      maintenance: { label: "Bảo trì", variant: "secondary", icon: Settings },
      reserved: { label: "Đã đặt", variant: "info", icon: Clock }
    };
    return badges[status] || badges.available;
  };

  const getSizeBadge = (size) => {
    const sizes = {
      small: { label: "Nhỏ", color: "bg-blue-100 text-blue-800" },
      medium: { label: "Vừa", color: "bg-green-100 text-green-800" },
      large: { label: "Lớn", color: "bg-purple-100 text-purple-800" }
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <DashboardHeader
        title="Quản lý nội trú"
        subtitle="Theo dõi và quản lý thú cưng lưu trú tại trung tâm"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chuồng</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuồng trống</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang lưu trú</CardTitle>
            <PawPrint className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.occupied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Actions */}
      <div className="flex items-center justify-between">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <button
            type="button"
            onClick={() => setMainTab("monitoring")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all gap-2",
              mainTab === "monitoring"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Eye className="h-4 w-4" /> Theo dõi hàng ngày
          </button>
          <button
            type="button"
            onClick={() => setMainTab("cages")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all gap-2",
              mainTab === "cages"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Home className="h-4 w-4" /> Sơ đồ chuồng
          </button>
        </div>
        
        <Button onClick={() => handleOpenAssignModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nhập thú cưng mới
        </Button>
      </div>

      {/* Tab Content */}
      {mainTab === "monitoring" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Danh sách thú cưng đang lưu trú ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Chưa có thú cưng nào đang lưu trú</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thú cưng</TableHead>
                    <TableHead>Chủ nuôi</TableHead>
                    <TableHead>Chuồng</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Số ngày</TableHead>
                    <TableHead>Ngày trả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAssignments.map(asn => (
                    <TableRow key={asn.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{asn.petIcon}</span>
                          <div>
                            <p className="font-semibold">{asn.petName}</p>
                            <p className="text-xs text-muted-foreground">{asn.petBreed}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{asn.ownerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {asn.ownerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asn.cageNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(asn.checkInDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{asn.daysStayed}</span> ngày
                      </TableCell>
                      <TableCell>
                        {asn.expectedCheckOutDate 
                          ? new Date(asn.expectedCheckOutDate).toLocaleDateString('vi-VN')
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCheckOut(asn.id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Trả
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {mainTab === "cages" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              {[
                { value: "all", label: "Tất cả" },
                { value: "available", label: "Trống" },
                { value: "occupied", label: "Đang dùng" },
                { value: "maintenance", label: "Bảo trì" }
              ].map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCageFilter(item.value)}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                    cageFilter === item.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/50"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm theo số chuồng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Cage Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : filteredCages.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Home className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Không có chuồng nào</p>
              </div>
            ) : (
              filteredCages.map(cage => {
                const statusBadge = getStatusBadge(cage.status);
                const sizeBadge = getSizeBadge(cage.size);
                
                return (
                  <Card 
                    key={cage.id} 
                    className={cn(
                      "relative overflow-hidden",
                      cage.status === 'occupied' && "border-warning",
                      cage.status === 'maintenance' && "border-muted opacity-60"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cage.number}</CardTitle>
                        <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                          <statusBadge.icon className="h-3 w-3" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className={cn("text-xs px-2 py-0.5 rounded", sizeBadge.color)}>
                          {sizeBadge.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{cage.location}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      {cage.currentPet ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{cage.currentPet.icon}</span>
                            <div>
                              <p className="font-semibold text-sm">{cage.currentPet.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" /> {cage.currentPet.ownerName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(cage.currentPet.checkInDate).toLocaleDateString('vi-VN')} 
                            ({cage.currentPet.daysStayed} ngày)
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCheckOut(cage.currentPet.assignmentId)}
                          >
                            <LogOut className="h-4 w-4 mr-1" /> Trả chuồng
                          </Button>
                        </div>
                      ) : cage.status === 'available' ? (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleOpenAssignModal(cage)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Phân bổ
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          {cage.status === 'maintenance' ? '🔧 Bảo trì' : '📅 Đã đặt'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nhập thú cưng lưu trú
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAssignPet} className="space-y-4">
            <div className="space-y-2">
              <Label>Chọn thú cưng *</Label>
              <Select
                value={formData.petId}
                onChange={(e) => handlePetSelect(e.target.value)}
              >
                <option value="">-- Chọn thú cưng --</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.icon} {pet.name} ({pet.breed || pet.species}) - {pet.ownerName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chọn chuồng *</Label>
              {formData.petId ? (
                availableCagesForPet.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableCagesForPet.map(cage => {
                      const sizeBadge = getSizeBadge(cage.size);
                      return (
                        <button
                          type="button"
                          key={cage.id}
                          onClick={() => setFormData(prev => ({ ...prev, cageId: cage.id }))}
                          className={cn(
                            "p-3 border rounded-lg text-left transition-all",
                            formData.cageId === cage.id 
                              ? "border-primary bg-primary/5 ring-2 ring-primary" 
                              : "hover:border-primary/50"
                          )}
                        >
                          <p className="font-semibold text-sm">{cage.number}</p>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded", sizeBadge.color)}>
                            {sizeBadge.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    Không có chuồng trống
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  Vui lòng chọn thú cưng trước
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày nhập</Label>
                <Input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày trả dự kiến</Label>
                <Input
                  type="date"
                  value={formData.expectedCheckOutDate}
                  onChange={(e) => setFormData({ ...formData, expectedCheckOutDate: e.target.value })}
                  min={formData.checkInDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú về chế độ chăm sóc..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading || !formData.petId || !formData.cageId}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
