"use client";
import { useState, useEffect } from "react";
import {
  Search, Edit, Eye, Trash2, RefreshCw, PawPrint,
  Dog, Cat, Bird, Filter, X
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsCard from "@/components/dashboard/StatsCard";
import { petApi, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ManagerPetsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form data
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    weight: "",
    notes: ""
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const response = await petApi.getAll();

      if (response.success && response.data) {
        setPets(response.data);
      } else {
        showToast("Không thể tải danh sách thú cưng", "error");
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPetIcon = (species) => {
    const s = species?.toUpperCase();
    if (s === 'DOG') return "🐕";
    if (s === 'CAT') return "🐈";
    if (s === 'BIRD') return "🐦";
    if (s === 'RABBIT') return "🐇";
    if (s === 'HAMSTER') return "🐹";
    return "🐾";
  };

  const getSpeciesLabel = (species) => {
    const labels = {
      'DOG': 'Chó',
      'CAT': 'Mèo',
      'BIRD': 'Chim',
      'RABBIT': 'Thỏ',
      'HAMSTER': 'Hamster',
      'OTHER': 'Khác'
    };
    return labels[species?.toUpperCase()] || species || 'N/A';
  };

  const getGenderLabel = (gender) => {
    if (gender?.toUpperCase() === 'MALE') return 'Đực';
    if (gender?.toUpperCase() === 'FEMALE') return 'Cái';
    return gender || 'N/A';
  };

  const handleViewDetail = (pet) => {
    setSelectedPet(pet);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || "",
      species: pet.species || "",
      breed: pet.breed || "",
      gender: pet.gender || "",
      weight: pet.weight || "",
      notes: pet.notes || ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await petApi.update(selectedPet.petId || selectedPet.id, {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        notes: formData.notes || undefined
      });

      if (response.success) {
        showToast("Cập nhật thú cưng thành công!", "success");
        setIsEditModalOpen(false);
        loadPets();
      } else {
        showToast(response.error || "Không thể cập nhật", "error");
      }
    } catch (error) {
      showToast("Lỗi khi cập nhật", "error");
    }
  };

  const handleDelete = async (petId) => {
    if (confirm("Xác nhận xóa thú cưng này? Hành động này không thể hoàn tác.")) {
      try {
        const response = await petApi.delete(petId);
        if (response.success) {
          showToast("Đã xóa thú cưng", "success");
          loadPets();
        } else {
          showToast(response.error || "Không thể xóa", "error");
        }
      } catch (error) {
        showToast("Lỗi khi xóa", "error");
      }
    }
  };

  // Filter pets
  const filteredPets = pets.filter(pet => {
    const matchSearch = !searchTerm ||
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.petOwner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSpecies = !speciesFilter || pet.species?.toUpperCase() === speciesFilter;

    return matchSearch && matchSpecies;
  });

  // Stats
  const stats = {
    total: pets.length,
    dogs: pets.filter(p => p.species?.toUpperCase() === 'DOG').length,
    cats: pets.filter(p => p.species?.toUpperCase() === 'CAT').length,
    others: pets.filter(p => !['DOG', 'CAT'].includes(p.species?.toUpperCase())).length
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Quản lý thú cưng"
        subtitle="Xem và quản lý thông tin tất cả thú cưng"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={PawPrint} title="Tổng thú cưng" value={stats.total} color="primary" />
        <StatsCard icon={Dog} title="Chó" value={stats.dogs} color="warning" />
        <StatsCard icon={Cat} title="Mèo" value={stats.cats} color="info" />
        <StatsCard icon={Bird} title="Khác" value={stats.others} color="success" />
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, giống, chủ nuôi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-40"
            >
              <option value="">Tất cả loài</option>
              <option value="DOG">Chó</option>
              <option value="CAT">Mèo</option>
              <option value="BIRD">Chim</option>
              <option value="RABBIT">Thỏ</option>
              <option value="OTHER">Khác</option>
            </Select>
            <Button variant="outline" onClick={loadPets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pets Table */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thú cưng</TableHead>
                  <TableHead>Loài</TableHead>
                  <TableHead>Giống</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Cân nặng</TableHead>
                  <TableHead>Chủ nuôi</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? filteredPets.map(pet => (
                  <TableRow key={pet.petId || pet.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPetIcon(pet.species)}</span>
                        <span className="font-medium">{pet.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSpeciesLabel(pet.species)}</Badge>
                    </TableCell>
                    <TableCell>{pet.breed || 'N/A'}</TableCell>
                    <TableCell>{getGenderLabel(pet.gender)}</TableCell>
                    <TableCell>{pet.weight ? `${pet.weight} kg` : 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pet.petOwner?.fullName || pet.petOwner?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{pet.petOwner?.phoneNumber || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(pet)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(pet)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pet.petId || pet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {searchTerm || speciesFilter ? "Không tìm thấy thú cưng phù hợp" : "Chưa có thú cưng nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{getPetIcon(selectedPet?.species)}</span>
              Chi tiết thú cưng
            </DialogTitle>
          </DialogHeader>
          {selectedPet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tên</Label>
                  <p className="font-medium">{selectedPet.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loài</Label>
                  <p className="font-medium">{getSpeciesLabel(selectedPet.species)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giống</Label>
                  <p className="font-medium">{selectedPet.breed || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giới tính</Label>
                  <p className="font-medium">{getGenderLabel(selectedPet.gender)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cân nặng</Label>
                  <p className="font-medium">{selectedPet.weight ? `${selectedPet.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tuổi</Label>
                  <p className="font-medium">{selectedPet.age || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Chủ nuôi</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedPet.petOwner?.fullName || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedPet.petOwner?.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground">{selectedPet.petOwner?.email}</p>
                </div>
              </div>

              {selectedPet.notes && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="mt-1">{selectedPet.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin thú cưng</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Tên *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loài</Label>
                <Select
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  <option value="DOG">Chó</option>
                  <option value="CAT">Mèo</option>
                  <option value="BIRD">Chim</option>
                  <option value="RABBIT">Thỏ</option>
                  <option value="HAMSTER">Hamster</option>
                  <option value="OTHER">Khác</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  <option value="MALE">Đực</option>
                  <option value="FEMALE">Cái</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giống</Label>
              <Input
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="VD: Golden Retriever"
              />
            </div>

            <div className="space-y-2">
              <Label>Cân nặng (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú đặc biệt..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
