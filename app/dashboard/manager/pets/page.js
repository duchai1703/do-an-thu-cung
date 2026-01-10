/**
 * Pet Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/pets
 * 
 * Features:
 * - Gradient header (Amber → Orange)
 * - Stats cards: Total, Dogs, Cats, Others
 * - Species filter tabs
 * - Search & filters
 * - Pet cards với owner info
 * - Pet detail modal với medical history
 * 
 * APIs:
 * - GET /pets
 * - GET /pets/:id
 * - GET /pets/:id/medical-history
 * - PUT /pets/:id
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function PetsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    dogs: 0,
    cats: 0,
    others: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPets();
    calculateStats();
  }, [pets, searchTerm, speciesFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/pets');
      const data = Array.isArray(response.data) ? response.data : 
                  (response.data?.data || []);
      
      setPets(data);
    } catch (error) {
      console.error("Error loading pets:", error);
      showToast("Không thể tải danh sách thú cưng", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = [...pets];

    // Filter by species
    if (speciesFilter !== "all") {
      if (speciesFilter === "other") {
        // "Other" means not dog and not cat
        filtered = filtered.filter(pet => {
          const species = pet.species?.toLowerCase() || '';
          return species !== 'dog' && species !== 'cat';
        });
      } else {
        filtered = filtered.filter(pet => 
          pet.species?.toLowerCase() === speciesFilter.toLowerCase()
        );
      }
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pet => 
        pet.name?.toLowerCase().includes(term) ||
        pet.breed?.toLowerCase().includes(term) ||
        pet.owner?.fullName?.toLowerCase().includes(term) ||
        pet.species?.toLowerCase().includes(term)
      );
    }

    setFilteredPets(filtered);
  };

  const calculateStats = () => {
    const total = pets.length;
    const dogs = pets.filter(p => p.species?.toLowerCase() === 'dog').length;
    const cats = pets.filter(p => p.species?.toLowerCase() === 'cat').length;
    const others = total - dogs - cats;

    setStats({ total, dogs, cats, others });
  };

  const handleViewPet = async (pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
    
    // Load medical history
    try {
      setLoadingHistory(true);
      const petId = pet.petId || pet.id;
      const response = await apiClient.get(`/pets/${petId}/medical-history`);
      const history = Array.isArray(response.data) ? response.data : 
                     (response.data?.data || []);
      setMedicalHistory(history);
    } catch (error) {
      console.log("Could not load medical history:", error);
      setMedicalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPet(null);
    setMedicalHistory([]);
  };

  // UI Helpers
  const getSpeciesEmoji = (species) => {
    const s = species?.toLowerCase() || '';
    const emojis = {
      'dog': '🐕',
      'cat': '🐱',
      'bird': '🐦',
      'fish': '🐟',
      'rabbit': '🐰',
      'hamster': '🐹',
      'turtle': '🐢',
      'snake': '🐍'
    };
    return emojis[s] || '🐾';
  };

  const getSpeciesLabel = (species) => {
    const s = species?.toLowerCase() || '';
    const labels = {
      'dog': 'Chó',
      'cat': 'Mèo',
      'bird': 'Chim',
      'fish': 'Cá',
      'rabbit': 'Thỏ',
      'hamster': 'Hamster',
      'turtle': 'Rùa',
      'snake': 'Rắn'
    };
    return labels[s] || species || 'Khác';
  };

  const getGenderEmoji = (gender) => {
    const g = gender?.toLowerCase() || '';
    if (g === 'male' || g === 'đực') return '♂️';
    if (g === 'female' || g === 'cái') return '♀️';
    return '⚪';
  };

  const getGenderLabel = (gender) => {
    const g = gender?.toLowerCase() || '';
    if (g === 'male' || g === 'đực') return 'Đực';
    if (g === 'female' || g === 'cái') return 'Cái';
    return 'Chưa rõ';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Chưa rõ';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years < 1) {
      return `${months + 12} tháng`;
    }
    return `${years} tuổi`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const tabs = [
    { id: 'all', label: '🐾 Tất cả', count: stats.total },
    { id: 'dog', label: '🐕 Chó', count: stats.dogs },
    { id: 'cat', label: '🐱 Mèo', count: stats.cats },
    { id: 'other', label: '🦜 Khác', count: stats.others }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🐾</div>
          <p className="text-gray-500 text-lg">Đang tải danh sách thú cưng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">🐾</span>
                Quản Lý Thú Cưng
              </h1>
              <p className="text-white/90">
                Xem thông tin và lịch sử y tế của thú cưng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">🐾 Tổng thú cưng</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.dogs}</p>
              <p className="text-sm text-gray-500">🐕 Số chó</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.cats}</p>
              <p className="text-sm text-gray-500">🐱 Số mèo</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.others}</p>
              <p className="text-sm text-gray-500">🦜 Loài khác</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên, giống, chủ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    viewMode === "grid" 
                      ? "bg-white text-amber-600 shadow" 
                      : "text-gray-600"
                  }`}
                >
                  📦 Lưới
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-amber-600 shadow" 
                      : "text-gray-600"
                  }`}
                >
                  📋 Danh sách
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Species Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSpeciesFilter(tab.id === 'other' ? 'other' : tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === tab.id || (tab.id === 'other' && speciesFilter === 'other')
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Pet Count */}
        <p className="text-sm text-gray-500 mb-4">
          Hiển thị {filteredPets.length} / {pets.length} thú cưng
        </p>

        {/* Pet List */}
        {filteredPets.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPets.map((pet, idx) => {
                const petId = pet.petId || pet.id;
                
                return (
                  <Card 
                    key={petId || idx} 
                    className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => handleViewPet(pet)}
                  >
                    {/* Pet Header */}
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 text-center">
                      <span className="text-6xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="text-center mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getSpeciesLabel(pet.species)} • {pet.breed || 'Chưa rõ giống'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{getGenderEmoji(pet.gender)} {getGenderLabel(pet.gender)}</span>
                        <span>🎂 {calculateAge(pet.birthDate)}</span>
                      </div>

                      {pet.owner && (
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">👤 Chủ sở hữu</p>
                          <p className="text-sm font-medium text-gray-700">{pet.owner.fullName}</p>
                        </div>
                      )}

                      <button
                        className="w-full mt-3 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                      >
                        👁️ Xem chi tiết
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPets.map((pet, idx) => {
                const petId = pet.petId || pet.id;
                
                return (
                  <Card 
                    key={petId || idx} 
                    className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleViewPet(pet)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Pet Icon */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-3xl">
                          {getSpeciesEmoji(pet.species)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{pet.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              {getSpeciesLabel(pet.species)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            🐾 {pet.breed || 'Chưa rõ giống'} • {getGenderEmoji(pet.gender)} {getGenderLabel(pet.gender)} • 🎂 {calculateAge(pet.birthDate)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {pet.weight && <span>⚖️ {pet.weight}kg • </span>}
                            {pet.color && <span>🎨 {pet.color}</span>}
                          </p>
                        </div>

                        {/* Owner */}
                        {pet.owner && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400">👤 Chủ sở hữu</p>
                            <p className="font-medium text-gray-700">{pet.owner.fullName}</p>
                            <p className="text-xs text-gray-500">📞 {pet.owner.phoneNumber}</p>
                          </div>
                        )}

                        {/* Action */}
                        <button
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          onClick={(e) => { e.stopPropagation(); handleViewPet(pet); }}
                        >
                          👁️
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <Card className="bg-white shadow-xl">
            <CardContent className="py-16 text-center">
              <span className="text-8xl block mb-4">🐾</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thú cưng</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pet Detail Modal */}
      {isModalOpen && selectedPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
                    {getSpeciesEmoji(selectedPet.species)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
                    <p className="text-white/90">
                      {getSpeciesLabel(selectedPet.species)} • {selectedPet.breed || 'Chưa rõ giống'}
                    </p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white text-2xl">
                  ❌
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">{getGenderEmoji(selectedPet.gender)}</p>
                  <p className="text-xs text-gray-500">Giới tính</p>
                  <p className="font-medium">{getGenderLabel(selectedPet.gender)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">🎂</p>
                  <p className="text-xs text-gray-500">Tuổi</p>
                  <p className="font-medium">{calculateAge(selectedPet.birthDate)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">⚖️</p>
                  <p className="text-xs text-gray-500">Cân nặng</p>
                  <p className="font-medium">{selectedPet.weight ? `${selectedPet.weight}kg` : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">🎨</p>
                  <p className="text-xs text-gray-500">Màu lông</p>
                  <p className="font-medium">{selectedPet.color || 'N/A'}</p>
                </div>
              </div>

              {/* Owner Info */}
              {selectedPet.owner && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">👤 Thông tin chủ sở hữu</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Họ tên: <span className="font-medium">{selectedPet.owner.fullName}</span></p>
                    <p>SĐT: <span className="font-medium">{selectedPet.owner.phoneNumber}</span></p>
                    <p>Địa chỉ: <span className="font-medium">{selectedPet.owner.address || 'N/A'}</span></p>
                    <p>Email: <span className="font-medium">{selectedPet.owner.account?.email || 'N/A'}</span></p>
                  </div>
                </div>
              )}

              {/* Medical History */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">🏥 Lịch sử y tế</h3>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin text-4xl mb-2">⏳</div>
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                ) : medicalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {medicalHistory.map((record, idx) => (
                      <div key={idx} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            📅 {formatDate(record.date || record.createdAt)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {record.type || 'Khám bệnh'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          🩺 {record.diagnosis || record.notes || 'Không có ghi chú'}
                        </p>
                        {record.treatment && (
                          <p className="text-sm text-gray-600 mt-1">
                            💊 Điều trị: {record.treatment}
                          </p>
                        )}
                        {record.veterinarian && (
                          <p className="text-xs text-gray-400 mt-2">
                            👨‍⚕️ Bác sĩ: {record.veterinarian.fullName || record.veterinarian}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <span className="text-4xl block mb-2">📋</span>
                    <p className="text-gray-500">Chưa có lịch sử y tế</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedPet.notes && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📝 Ghi chú</h3>
                  <p className="text-sm">{selectedPet.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseModal}>
                  Đóng
                </Button>
                <Button 
                  onClick={() => router.push(`/dashboard/manager/appointments?petId=${selectedPet.petId || selectedPet.id}`)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                >
                  📅 Xem lịch hẹn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
