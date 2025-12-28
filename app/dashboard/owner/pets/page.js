/**
 * Pet Management Page - Premium UI
 * 
 * Features:
 * - Gradient header
 * - Stats card (Total pets)
 * - Search by name/breed
 * - Filter by species
 * - Pet gallery grid (responsive)
 * - Add/Edit/Delete pet
 * 
 * APIs:
 * - GET /pets
 * - POST /pets
 * - PUT /pets/:id
 * - DELETE /pets/:id
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Search, Plus, Edit, Trash2, Eye, Filter, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddPetModal from "@/components/modals/AddPetModal";
import EditPetModal from "@/components/modals/EditPetModal";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function PetsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const speciesOptions = [
    { value: "all", label: "Tất cả", icon: "🐾" },
    { value: "dog", label: "Chó", icon: "🐕" },
    { value: "cat", label: "Mèo", icon: "🐈" },
    { value: "rabbit", label: "Thỏ", icon: "🐰" },
    { value: "bird", label: "Chim", icon: "🐦" },
    { value: "hamster", label: "Hamster", icon: "🐹" }
  ];

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchTerm, selectedSpecies]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/pets/me'); // Owner-specific pets only
      const petsData = response.data || response || [];
      setPets(petsData);
    } catch (error) {
      console.error("Error loading pets:", error);
      showToast("Không thể tải danh sách thú cưng", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = pets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pet => 
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by species
    if (selectedSpecies !== "all") {
      filtered = filtered.filter(pet => {
        const species = pet.species?.toLowerCase() || '';
        return species.includes(selectedSpecies) || 
               (selectedSpecies === 'dog' && species.includes('chó')) ||
               (selectedSpecies === 'cat' && species.includes('mèo'));
      });
    }

    setFilteredPets(filtered);
  };

  const handleAddPet = async (petData) => {
    try {
      // petData is already mapped correctly from AddPetModal
      const response = await apiClient.post('/pets/me', {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        birthDate: petData.birthDate,
        gender: petData.gender,
        weight: petData.weight || 0,
        color: petData.color,
        initialHealthStatus: petData.initialHealthStatus,
        specialNotes: petData.specialNotes
      });

      if (response.data || response) {
        showToast("Đã thêm thú cưng thành công!", "success");
        setIsAddModalOpen(false);
        loadPets();
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      showToast(error.response?.data?.message || "Không thể thêm thú cưng", "error");
    }
  };

  const handleEditPet = async (updatedPet) => {
    try {
      console.log('📝 updatedPet from modal:', updatedPet);
      
      const petId = updatedPet.id || updatedPet.petId;
      console.log('🔍 Using petId:', petId);
      
      if (!petId) {
        showToast("Không tìm thấy ID thú cưng", "error");
        return;
      }
      
      const response = await apiClient.put(`/pets/${petId}`, {
        name: updatedPet.name,
        species: updatedPet.type, // Modal uses 'type' for species
        breed: updatedPet.breed,
        birthDate: updatedPet.dateOfBirth, // Modal uses 'dateOfBirth' for birthDate
        gender: updatedPet.gender,
        weight: parseFloat(String(updatedPet.weight).replace(' kg', '')) || 0,
        color: updatedPet.color,
        initialHealthStatus: updatedPet.medicalHistory,
        specialNotes: updatedPet.notes
      });

      if (response.data || response) {
        showToast("Đã cập nhật thông tin thú cưng!", "success");
        setIsEditModalOpen(false);
        setEditingPet(null);
        loadPets();
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      showToast(error.response?.data?.message || "Không thể cập nhật thú cưng", "error");
    }
  };

  const handleDeletePet = async (petId) => {
    if (!confirm("Bạn có chắc muốn xóa thú cưng này?")) return;

    try {
      await apiClient.delete(`/pets/${petId}`);
      showToast("Đã xóa thú cưng thành công!", "success");
      loadPets();
    } catch (error) {
      console.error("Error deleting pet:", error);
      showToast(error.response?.data?.message || "Không thể xóa thú cưng", "error");
    }
  };

  const handleOpenEdit = (pet) => {
    console.log('🐾 Opening edit for pet:', pet);
    setEditingPet({
      id: pet.petId || pet.id, // Handle both petId and id
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
    });
    setIsEditModalOpen(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <PawPrint className="h-8 w-8" />
            Quản Lý Thú Cưng
          </h1>
          <p className="text-white/90">
            Quản lý thông tin và sức khỏe của các bé yêu
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Tổng số thú cưng</p>
                <p className="text-5xl font-bold mt-2">
                  {loading ? "..." : pets.length}
                </p>
              </div>
              <PawPrint className="h-20 w-20 text-white/30" />
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter Controls */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc giống..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add Button */}
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm thú cưng
              </Button>
            </div>

            {/* Species Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {speciesOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setSelectedSpecies(option.value)}
                  variant={selectedSpecies === option.value ? "default" : "outline"}
                  size="sm"
                  className={selectedSpecies === option.value ? "bg-purple-500 hover:bg-purple-600" : ""}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <Card
                key={pet.petId}
                className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-6xl">{getPetIcon(pet.species)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-1">{pet.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{pet.species} - {pet.breed}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {pet.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {calculateAge(pet.birthDate)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {pet.weight ? `${pet.weight} kg` : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Pet Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Màu sắc:</span>
                      <span>{pet.color || 'N/A'}</span>
                    </div>
                    {pet.specialNotes && (
                      <div className="p-2 bg-gray-50 rounded text-gray-700 text-xs">
                        📝 {pet.specialNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/dashboard/owner/pets/${pet.petId || pet.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Button>
                    <Button
                      onClick={() => handleOpenEdit(pet)}
                      variant="default"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Sửa
                    </Button>
                    {/* Delete button removed - PET_OWNER doesn't have DELETE permission */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-8xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedSpecies !== "all" 
                  ? "Không tìm thấy thú cưng nào"
                  : "Chưa có thú cưng"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedSpecies !== "all"
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Thêm thú cưng đầu tiên của bạn"}
              </p>
              {!searchTerm && selectedSpecies === "all" && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thú cưng ngay
                </Button>
              )}
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
