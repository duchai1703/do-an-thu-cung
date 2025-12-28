// app/dashboard/vet/boarding/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
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
      available: { label: "Trống", variant: "success", emoji: "✅" },
      occupied: { label: "Đang sử dụng", variant: "warning", emoji: "🐾" },
      maintenance: { label: "Bảo trì", variant: "secondary", emoji: "🔧" },
      reserved: { label: "Đã đặt", variant: "info", emoji: "⏰" }
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

      {/* Stats - Premium Gradient Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🏠</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng số</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng chuồng</div>
        </div>

        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">✅</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Trống</span>
          </div>
          <div className="value">{stats.available}</div>
          <div className="label mt-1">Chuồng trống</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🐾</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đang ở</span>
          </div>
          <div className="value">{stats.occupied}</div>
          <div className="label mt-1">Đang lưu trú</div>
        </div>

        <div className="vet-stat-card vet-gradient-info">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">🔧</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Bảo trì</span>
          </div>
          <div className="value">{stats.maintenance}</div>
          <div className="label mt-1">Đang bảo trì</div>
        </div>
      </div>

      {/* Tabs and Actions - Premium Style */}
      <div className="flex items-center justify-between">
        <div className="vet-glass-card-dark rounded-xl p-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMainTab("monitoring")}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2",
                mainTab === "monitoring"
                  ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg scale-105"
                  : "bg-white/50 text-gray-700 hover:bg-white/80"
              )}
            >
              <span className="text-lg">👁️</span> Theo dõi hàng ngày
            </button>
            <button
              type="button"
              onClick={() => setMainTab("cages")}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2",
                mainTab === "cages"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg scale-105"
                  : "bg-white/50 text-gray-700 hover:bg-white/80"
              )}
            >
              <span className="text-lg">🏠</span> Sơ đồ chuồng
            </button>
          </div>
        </div>
        
        <Button onClick={() => handleOpenAssignModal()} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <span className="text-xl">➕</span> Nhập thú cưng mới
        </Button>
      </div>

      {/* Tab Content */}
      {mainTab === "monitoring" && (
        <div className="vet-glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
                🐾
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Danh sách thú cưng đang lưu trú</h2>
                <p className="text-sm text-gray-500">Theo dõi và quản lý</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
              <span className="text-2xl">{activeAssignments.length}</span>
              <span className="text-sm opacity-90">thú cưng</span>
            </div>
          </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">⏳</div>
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">🏠</div>
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
                            <span>📞</span> {asn.ownerPhone}
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
                          className="flex items-center gap-1"
                        >
                          <span className="text-base">🚪</span> Trả
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </div>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
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
                <div className="text-5xl mb-2">⏳</div>
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredCages.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-5xl mb-2">🏠</div>
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
                          <span className="text-sm">{statusBadge.emoji}</span>
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
                                <span>👤</span> {cage.currentPet.ownerName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>📅</span>
                            {new Date(cage.currentPet.checkInDate).toLocaleDateString('vi-VN')} 
                            ({cage.currentPet.daysStayed} ngày)
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full flex items-center gap-1"
                            onClick={() => handleCheckOut(cage.currentPet.assignmentId)}
                          >
                            <span className="text-base">🚪</span> Trả chuồng
                          </Button>
                        </div>
                      ) : cage.status === 'available' ? (
                        <Button 
                          size="sm" 
                          className="w-full flex items-center gap-1"
                          onClick={() => handleOpenAssignModal(cage)}
                        >
                          <span className="text-base">➕</span> Phân bổ
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
              <span className="text-xl">➕</span>
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
                {formLoading ? <span className="text-base mr-1">⏳</span> : <span className="text-base mr-1">✅</span>}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
