"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Search, Plus, Edit, FileText, Scale, Palette, Cake, 
  CheckCircle2, XCircle, ClipboardList 
} from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import AddPetModal from "@/components/modals/AddPetModal";
import EditPetModal from "@/components/modals/EditPetModal";
import { cn } from "@/lib/utils";
import { petApi, getToken } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";

export default function OwnerPetsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [petOwnerId, setPetOwnerId] = useState(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await petApi.getOwnedPet();
      
      if (response.success && response.data) {
        // Map backend data to frontend format
        const mappedPets = response.data.map(pet => ({
          id: pet.petId || pet.id,
          name: pet.name,
          icon: pet.species?.toLowerCase() === 'dog' || pet.species?.toLowerCase() === 'chó' ? '🐕' : '🐈',
          type: pet.species || 'Unknown',
          breed: pet.breed || 'Unknown',
          age: calculateAge(pet.birthDate) || 'N/A',
          gender: pet.gender || 'Unknown',
          weight: pet.weight ? `${pet.weight} kg` : 'N/A',
          color: pet.color || 'Unknown',
          dateOfBirth: pet.birthDate || '',
          medicalHistory: pet.medicalHistory || 'Chưa có thông tin',
          notes: pet.notes || ''
        }));
        
        setPets(mappedPets);
      } else {
        // If no pets, set empty array (don't show error for new users)
        setPets([]);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      showToast("Lỗi khi tải danh sách thú cưng", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
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

  const handleAddPet = async (newPet) => {
    try {
      const response = await petApi.createByOwner({
        name: newPet.name,
        species: newPet.type,
        breed: newPet.breed,
        birthDate: newPet.dateOfBirth,
        gender: newPet.gender,
        weight: parseFloat(newPet.weight.replace(' kg', '')) || 0,
        color: newPet.color,
        initialHealthStatus: newPet.medicalHistory, 
        specialNotes: newPet.notes
      });
      
      if (response.success) {
        showToast("Đã thêm thú cưng thành công!", "success");
        loadPets(); // Reload the list
      } else {
        showToast(response.error || "Không thể thêm thú cưng", "error");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      showToast("Lỗi khi thêm thú cưng", "error");
    }
  };

  const handleEditPet = async (updatedPet) => {
    try {
      console.log("Updating pet:", updatedPet);
      const response = await petApi.update(updatedPet.id, {
        name: updatedPet.name,
        species: updatedPet.type,
        breed: updatedPet.breed,
        birthDate: updatedPet.dateOfBirth,
        gender: updatedPet.gender,
        weight: parseFloat(updatedPet.weight.replace(' kg', '')) || 0,
        color: updatedPet.color,
        initialHealthStatus: updatedPet.medicalHistory, 
        specialNotes: updatedPet.notes
      });
      
      if (response.success) {
        showToast("Đã cập nhật thông tin thú cưng!", "success");
        // TODO: change this to manual edit instead of reloading all
        // Ask the AI where that is better or not?
        loadPets(); // Reload the list
      } else {
        showToast(response.error || "Không thể cập nhật thú cưng", "error");
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      showToast("Lỗi khi cập nhật thú cưng", "error");
    }
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setIsEditModalOpen(true);
  };

  const handleViewDetail = (petId) => {
    router.push(`/dashboard/owner/pets/${petId}`);
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Thú cưng của tôi"
        subtitle="Quản lý thông tin thú cưng của bạn"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          icon={PawPrint}
          title="Tổng số thú cưng"
          value={pets.length}
          color="primary"
        />
      </div>

      {/* Add Button & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm thú cưng mới
        </Button>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm thú cưng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Pets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Danh sách thú cưng của tôi
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredPets.length} thú cưng
          </Badge>
        </div>

        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <Card key={pet.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{pet.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{pet.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{pet.breed}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {pet.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {pet.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {pet.age}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cân nặng</p>
                        <p className="text-sm font-semibold text-foreground">{pet.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Màu lông</p>
                        <p className="text-sm font-semibold text-foreground">{pet.color}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Cake className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày sinh</p>
                        <p className="text-sm font-semibold text-foreground">{pet.dateOfBirth}</p>
                      </div>
                    </div>
                  </div>

                  {pet.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Ghi chú:
                      </p>
                      <p className="text-sm text-foreground">{pet.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleViewDetail(pet.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Button>
                    <Button
                      onClick={() => handleOpenEdit(pet)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Không tìm thấy thú cưng nào
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddPet}
      />

      <EditPetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPet(null);
        }}
        onSuccess={handleEditPet}
        pet={editingPet}
      />
    </div>
  );
}
