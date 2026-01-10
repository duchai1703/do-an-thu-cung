/**
 * Pet Management Page - Premium UI v2
 * 
 * Features:
 * - Animated gradient header với floating decorations
 * - Stats cards với species breakdown
 * - Search với animations
 * - Species filter tabs với gradients
 * - Pet gallery với glassmorphism cards
 * - Premium modals integration
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PawPrint, Search, Plus, Edit, Trash2, Eye, Filter, X, Heart, Sparkles, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddPetModal from "@/components/modals/AddPetModal";
import EditPetModal from "@/components/modals/EditPetModal";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import { petApi } from "@/lib/api";
import PetIdBadge from "@/components/ui/PetIdBadge";

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
    { value: "all", label: "Tất cả", icon: "🐾", gradient: "from-purple-500 to-pink-500" },
    { value: "dog", label: "Chó", icon: "🐕", gradient: "from-amber-500 to-orange-500" },
    { value: "cat", label: "Mèo", icon: "🐈", gradient: "from-blue-500 to-cyan-500" },
    { value: "rabbit", label: "Thỏ", icon: "🐰", gradient: "from-pink-500 to-rose-500" },
    { value: "bird", label: "Chim", icon: "🐦", gradient: "from-green-500 to-emerald-500" },
    { value: "hamster", label: "Hamster", icon: "🐹", gradient: "from-yellow-500 to-amber-500" }
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
      const response = await petApi.getOwnedPet();
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

    if (searchTerm) {
      filtered = filtered.filter(pet => 
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
      const response = await petApi.createByOwner({
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
        showToast("Đã thêm thú cưng thành công! 🎉", "success");
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
      const petId = updatedPet.id || updatedPet.petId;
      
      if (!petId) {
        showToast("Không tìm thấy ID thú cưng", "error");
        return;
      }
      
      const response = await petApi.update(petId, {
        name: updatedPet.name,
        species: updatedPet.type,
        breed: updatedPet.breed,
        birthDate: updatedPet.dateOfBirth,
        gender: updatedPet.gender,
        weight: updatedPet.weight,
        color: updatedPet.color,
        initialHealthStatus: updatedPet.medicalHistory,
        specialNotes: updatedPet.notes
      });

      if (response.success) {
        showToast("Đã cập nhật thông tin thú cưng! ✅", "success");
        setIsEditModalOpen(false);
        setEditingPet(null);
        loadPets();
      } else {
        throw new Error(response.error || "Cập nhật thất bại");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleOpenEdit = (pet) => {
    setEditingPet({
      id: pet.petId || pet.id,
      name: pet.name,
      icon: getPetIcon(pet.species),
      type: pet.species,
      breed: pet.breed,
      age: calculateAge(pet.birthDate),
      gender: pet.gender,
      weight: pet.weight,
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

  // Calculate species stats
  const speciesStats = {
    dogs: pets.filter(p => {
      const s = p.species?.toLowerCase() || '';
      return s.includes('dog') || s.includes('chó');
    }).length,
    cats: pets.filter(p => {
      const s = p.species?.toLowerCase() || '';
      return s.includes('cat') || s.includes('mèo');
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">🐾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">💖</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải thú cưng...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      {/* 🌈 Premium Gradient Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-3xl animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              {['🐕', '🐈', '🐰', '🐹', '🐦', '💖'][i]}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                  🐾
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Gia Đình Thú Cưng
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </h1>
                  <p className="text-white/80 mt-1">
                    Quản lý và chăm sóc các bé yêu của bạn
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-xl hover:scale-105 transition-transform"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Thêm Bé Mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 📊 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedSpecies('all')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Tổng số</p>
                  <p className="text-4xl font-bold">{pets.length}</p>
                  <p className="text-white/70 text-xs mt-1">bé yêu</p>
                </div>
                <div className="text-5xl opacity-80">🐾</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedSpecies('dog')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Chó cưng</p>
                  <p className="text-4xl font-bold">{speciesStats.dogs}</p>
                  <p className="text-white/70 text-xs mt-1">bé</p>
                </div>
                <div className="text-5xl opacity-80">🐕</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedSpecies('cat')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Mèo cưng</p>
                  <p className="text-4xl font-bold">{speciesStats.cats}</p>
                  <p className="text-white/70 text-xs mt-1">bé</p>
                </div>
                <div className="text-5xl opacity-80">🐈</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedSpecies('all')}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Khác</p>
                  <p className="text-4xl font-bold">{pets.length - speciesStats.dogs - speciesStats.cats}</p>
                  <p className="text-white/70 text-xs mt-1">bé</p>
                </div>
                <div className="text-5xl opacity-80">🐹</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔍 Search & Filter */}
        <Card className="shadow-xl mb-6 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</div>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc giống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Species Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {speciesOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSpecies(option.value)}
                  className={`
                    px-4 py-2 rounded-xl font-semibold transition-all duration-300
                    flex items-center gap-2
                    ${selectedSpecies === option.value 
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg scale-105` 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                  `}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                  {selectedSpecies === option.value && (
                    <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                      {option.value === 'all' 
                        ? pets.length 
                        : pets.filter(p => {
                            const s = p.species?.toLowerCase() || '';
                            return s.includes(option.value);
                          }).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pet Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Hiển thị <span className="font-bold text-purple-600">{filteredPets.length}</span> / {pets.length} thú cưng
          </p>
        </div>

        {/* 🐕 Pet Gallery */}
        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet, idx) => (
              <Card
                key={pet.petId || pet.id}
                className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Pet Header Gradient */}
                <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 p-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-white/90 flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 transition-transform">
                      {getPetIcon(pet.species)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-2xl text-white drop-shadow-md truncate">{pet.name}</h3>
                      <PetIdBadge petId={pet.petId || pet.id} size="sm" className="bg-white/20 border-white/50" />
                    </div>
                    {/* Health Badge */}
                    <div className="absolute top-2 right-2 bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Heart className="w-3 h-3 fill-white" />
                      Khỏe
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Loài / Giống</p>
                      <p className="font-semibold text-gray-800 text-sm truncate">{pet.species}</p>
                      <p className="text-xs text-gray-500 truncate">{pet.breed || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Tuổi</p>
                      <p className="font-semibold text-gray-800">{calculateAge(pet.birthDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                      <p className="font-semibold text-gray-800">
                        {pet.gender?.toLowerCase() === 'male' || pet.gender === 'Đực' || pet.gender === 'đực' ? '♂️ Đực' : pet.gender?.toLowerCase() === 'female' || pet.gender === 'Cái' || pet.gender === 'cái' ? '♀️ Cái' : pet.gender || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Cân nặng</p>
                      <p className="font-semibold text-gray-800">{pet.weight ? `${pet.weight}kg` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Color & Notes */}
                  {(pet.color || pet.specialNotes) && (
                    <div className="space-y-2 mb-4">
                      {pet.color && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">🎨</span>
                          <span className="text-gray-700">{pet.color}</span>
                        </div>
                      )}
                      {pet.specialNotes && (
                        <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 border border-amber-200">
                          📝 {pet.specialNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner ID & Created At - Additional DTO Fields */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-400">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      👤 Chủ: PO-{String(pet.ownerId).padStart(4, '0')}
                    </span>
                    {pet.createdAt && (
                      <span className="bg-blue-50 px-2 py-1 rounded text-blue-500">
                        📅 Thêm: {new Date(pet.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push(`/dashboard/owner/pets/${pet.petId || pet.id}`)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Button>
                    <Button
                      onClick={() => handleOpenEdit(pet)}
                      variant="outline"
                      className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4 animate-bounce">🐾</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchTerm || selectedSpecies !== "all" 
                  ? "Không tìm thấy bé nào"
                  : "Chưa có thú cưng"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedSpecies !== "all"
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Hãy thêm bé yêu đầu tiên của bạn!"}
              </p>
              {!searchTerm && selectedSpecies === "all" && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
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

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
