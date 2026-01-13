/**
 * Cage Management - Receptionist Version
 * 
 * Route: /dashboard/receptionist/cages
 * 
 * Features:
 * - View all cages with status
 * - Check-in/Check-out pets
 * - Search and filter cages
 * - NO create/edit/delete cage permissions
 * 
 * Permissions: Receptionist can only assign/release cages, not manage cage data
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

export default function ReceptionistCagesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cages, setCages] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pets, setPets] = useState([]);
  const [filteredCages, setFilteredCages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Assignment modal only (NO cage create/edit modal for receptionist)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petSearchTerm, setPetSearchTerm] = useState("");
  const [showPetDropdown, setShowPetDropdown] = useState(false);

  // Assignment form
  const [assignForm, setAssignForm] = useState({
    petId: "",
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCages();
  }, [cages, searchTerm, sizeFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [cagesRes, assignmentsRes, petsRes] = await Promise.all([
        apiClient.get('/cages'),
        apiClient.get('/cages/assignments/active').catch(() => ({ data: [] })),
        apiClient.get('/pets').catch(() => ({ data: [] }))
      ]);

      const cagesData = Array.isArray(cagesRes.data) ? cagesRes.data : 
                       (cagesRes.data?.data || []);
      const assignmentsData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : 
                             (assignmentsRes.data?.data || []);
      const petsData = Array.isArray(petsRes.data) ? petsRes.data : 
                      (petsRes.data?.data || []);

      setCages(cagesData);
      setAssignments(assignmentsData);
      setPets(petsData);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterCages = () => {
    let filtered = [...cages];

    if (sizeFilter !== "all") {
      filtered = filtered.filter(c => c.size === sizeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => {
        const isOccupied = c.isOccupied || getCageAssignment(c);
        if (statusFilter === "occupied") return isOccupied;
        if (statusFilter === "available") return !isOccupied && c.isAvailable !== false;
        if (statusFilter === "maintenance") return c.isAvailable === false;
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.cageNumber?.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredCages(filtered);
  };

  const getCageAssignment = (cage) => {
    const cageId = cage.cageId || cage.id;
    return assignments.find(a => (a.cageId || a.cage?.cageId || a.cage?.id) == cageId);
  };

  const handleOpenAssignModal = (cage) => {
    setSelectedCage(cage);
    setAssignForm({
      petId: "",
      checkInDate: new Date().toISOString().split('T')[0],
      expectedCheckOutDate: "",
      notes: ""
    });
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedCage(null);
    setPetSearchTerm("");
    setShowPetDropdown(false);
  };

  // Filter pets by name, owner name, phone number
  const filteredPets = pets.filter(pet => {
    if (!petSearchTerm) return true;
    const term = petSearchTerm.toLowerCase();
    const petName = (pet.name || '').toLowerCase();
    const ownerName = (pet.owner?.fullName || pet.petOwner?.fullName || '').toLowerCase();
    const ownerPhone = (pet.owner?.phoneNumber || pet.petOwner?.phoneNumber || '');
    return petName.includes(term) || ownerName.includes(term) || ownerPhone.includes(term);
  });

  const getSelectedPetDisplay = () => {
    if (!assignForm.petId) return null;
    const pet = pets.find(p => (p.petId || p.id)?.toString() === assignForm.petId);
    if (!pet) return null;
    return {
      ...pet,
      displayName: `${getPetEmoji(pet.species)} ${pet.name} - ${pet.species}`,
      ownerDisplay: pet.owner?.fullName || pet.petOwner?.fullName || 'N/A',
      phoneDisplay: pet.owner?.phoneNumber || pet.petOwner?.phoneNumber || ''
    };
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const cageId = selectedCage.cageId || selectedCage.id;
      const payload = {
        petId: Number(assignForm.petId),
        checkInDate: assignForm.checkInDate,
        expectedCheckOutDate: assignForm.expectedCheckOutDate || null,
        notes: assignForm.notes || null
      };

      await apiClient.post(`/cages/${cageId}/assign`, payload);
      showToast("Đã check-in pet vào chuồng! 🏨", "success");
      handleCloseAssignModal();
      loadData();
    } catch (error) {
      console.error("Error assigning cage:", error);
      showToast(error.response?.data?.message || "Không thể gán chuồng", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReleaseCage = async (cage) => {
    if (!confirm("Bạn có chắc muốn check-out pet ra khỏi chuồng?")) return;
    
    try {
      const assignment = getCageAssignment(cage);
      if (!assignment) {
        showToast("Không tìm thấy thông tin gán chuồng", "error");
        return;
      }

      const assignmentId = assignment.assignmentId || assignment.id;
      await apiClient.put(`/cages/assignments/${assignmentId}/checkout`);
      showToast("Đã check-out pet thành công! ✅", "success");
      loadData();
    } catch (error) {
      showToast("Không thể check-out pet", "error");
    }
  };

  // UI Helpers
  const getSizeConfig = (size) => {
    const sizes = {
      'SMALL': { label: 'Nhỏ', emoji: '🏠', bg: 'bg-blue-100 text-blue-700' },
      'MEDIUM': { label: 'Vừa', emoji: '🏡', bg: 'bg-green-100 text-green-700' },
      'LARGE': { label: 'Lớn', emoji: '🏢', bg: 'bg-purple-100 text-purple-700' }
    };
    return sizes[size] || sizes.MEDIUM;
  };

  const getCageStatus = (cage) => {
    const assignment = getCageAssignment(cage);
    if (assignment) {
      return { 
        status: 'occupied', 
        label: 'Đang sử dụng', 
        emoji: '🐾', 
        bg: 'bg-red-500',
        textBg: 'bg-red-100 text-red-700'
      };
    }
    if (cage.isAvailable === false) {
      return { 
        status: 'maintenance', 
        label: 'Bảo trì', 
        emoji: '🔧', 
        bg: 'bg-gray-400',
        textBg: 'bg-gray-100 text-gray-700'
      };
    }
    return { 
      status: 'available', 
      label: 'Còn trống', 
      emoji: '✅', 
      bg: 'bg-green-500',
      textBg: 'bg-green-100 text-green-700'
    };
  };

  const getPetEmoji = (species) => {
    const emojiMap = {
      'Dog': '🐕', 'Chó': '🐕', 'DOG': '🐕',
      'Cat': '🐈', 'Mèo': '🐈', 'CAT': '🐈',
      'Bird': '🐦', 'Chim': '🐦', 'BIRD': '🐦',
      'Rabbit': '🐇', 'Thỏ': '🐇', 'RABBIT': '🐇',
      'Hamster': '🐹', 'HAMSTER': '🐹'
    };
    return emojiMap[species] || '🐾';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const stats = {
    total: cages.length,
    available: cages.filter(c => !getCageAssignment(c) && c.isAvailable !== false).length,
    occupied: cages.filter(c => getCageAssignment(c)).length,
    maintenance: cages.filter(c => c.isAvailable === false).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🏠</div>
          <p className="text-gray-500 text-lg">Đang tải danh sách chuồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header - Violet theme for receptionist */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">🏠</span>
                Quản Lý Chuồng Nuôi
              </h1>
              <p className="text-white/90">
                Check-in/Check-out thú cưng vào chuồng
              </p>
            </div>
            {/* No add cage button for receptionist */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">🏠 Tổng chuồng</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-gray-500">✅ Còn trống</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
              <p className="text-sm text-gray-500">🐾 Đang sử dụng</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{stats.maintenance}</p>
              <p className="text-sm text-gray-500">🔧 Bảo trì</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo số chuồng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="all">📏 Tất cả kích thước</option>
                <option value="SMALL">🏠 Nhỏ</option>
                <option value="MEDIUM">🏡 Vừa</option>
                <option value="LARGE">🏢 Lớn</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="all">📊 Tất cả trạng thái</option>
                <option value="available">✅ Còn trống</option>
                <option value="occupied">🐾 Đang sử dụng</option>
                <option value="maintenance">🔧 Bảo trì</option>
              </select>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-violet-600' : 'text-gray-600'
                  }`}
                >
                  📦 Lưới
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-violet-600' : 'text-gray-600'
                  }`}
                >
                  📋 Danh sách
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500 mb-4">
          Hiển thị {filteredCages.length} / {cages.length} chuồng
        </p>

        {/* Cage Grid View */}
        {viewMode === 'grid' && filteredCages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCages.map((cage) => {
              const cageId = cage.cageId || cage.id;
              const status = getCageStatus(cage);
              const size = getSizeConfig(cage.size);
              const assignment = getCageAssignment(cage);
              
              return (
                <Card 
                  key={cageId} 
                  className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`h-2 ${status.bg}`}></div>
                  
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <span className="text-4xl">{size.emoji}</span>
                      <h3 className="font-bold text-gray-900 text-lg mt-1">
                        {cage.cageNumber}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kích thước:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${size.bg}`}>
                          {size.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giá/ngày:</span>
                        <span className="font-semibold text-violet-600">
                          {formatCurrency(cage.dailyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trạng thái:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center justify-center gap-1 ${status.textBg}`}>
                          {status.emoji} {status.label}
                        </span>
                      </div>
                    </div>

                    {assignment && assignment.pet && (
                      <div className="mt-3 pt-3 border-t bg-gray-50 -mx-4 -mb-4 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getPetEmoji(assignment.pet?.species)}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{assignment.pet?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              Từ {new Date(assignment.checkInDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions - Only check-in/check-out, NO edit/delete */}
                    <div className="flex justify-center gap-2 mt-3 pt-3 border-t">
                      {status.status === 'available' && (
                        <button
                          onClick={() => handleOpenAssignModal(cage)}
                          className="flex-1 px-3 py-2 bg-violet-50 text-violet-600 rounded-lg text-sm hover:bg-violet-100 font-medium"
                        >
                          🐾 Check-in
                        </button>
                      )}
                      {status.status === 'occupied' && (
                        <button
                          onClick={() => handleReleaseCage(cage)}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 font-medium"
                        >
                          ✅ Check-out
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && filteredCages.length > 0 && (
          <div className="space-y-3">
            {filteredCages.map((cage) => {
              const cageId = cage.cageId || cage.id;
              const status = getCageStatus(cage);
              const size = getSizeConfig(cage.size);
              const assignment = getCageAssignment(cage);
              
              return (
                <Card key={cageId} className="bg-white shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${status.bg}`}>
                        {status.status === 'occupied' ? getPetEmoji(assignment?.pet?.species) : size.emoji}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-lg">{cage.cageNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${size.bg}`}>
                            {size.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${status.textBg}`}>
                            {status.emoji} {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          💰 {formatCurrency(cage.dailyRate)}/ngày
                          {assignment && assignment.pet && (
                            <> • 🐾 {assignment.pet?.name} (từ {new Date(assignment.checkInDate).toLocaleDateString('vi-VN')})</>
                          )}
                        </p>
                      </div>

                      {/* Actions - Only check-in/check-out */}
                      <div className="flex gap-2">
                        {status.status === 'available' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenAssignModal(cage)}
                            className="bg-violet-500 hover:bg-violet-600 text-white"
                          >
                            🐾 Check-in
                          </Button>
                        )}
                        {status.status === 'occupied' && (
                          <Button
                            size="sm"
                            onClick={() => handleReleaseCage(cage)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            ✅ Check-out
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredCages.length === 0 && (
          <Card className="bg-white shadow-xl">
            <CardContent className="py-16 text-center">
              <span className="text-8xl block mb-4">🏠</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy chuồng</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc</p>
            </CardContent>
          </Card>
        )}
      </div>


      {/* Check-in Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🐾 Check-in Pet vào chuồng {selectedCage?.cageNumber}
              </h2>
              <button onClick={handleCloseAssignModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="p-6 space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  🐾 Chọn thú cưng <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  {/* Selected pet display or search input */}
                  {assignForm.petId && !showPetDropdown ? (
                    <div 
                      onClick={() => setShowPetDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-violet-400 transition-colors bg-violet-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{getSelectedPetDisplay()?.displayName}</span>
                          <span className="text-sm text-gray-500 ml-2">({getSelectedPetDisplay()?.ownerDisplay})</span>
                        </div>
                        <span className="text-gray-400">✏️</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                      <input
                        type="text"
                        value={petSearchTerm}
                        onChange={(e) => {
                          setPetSearchTerm(e.target.value);
                          setShowPetDropdown(true);
                        }}
                        onFocus={() => setShowPetDropdown(true)}
                        placeholder="Tìm theo tên pet, chủ nuôi, SĐT..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                  )}
                  
                  {/* Dropdown list */}
                  {showPetDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {filteredPets.length > 0 ? (
                        filteredPets.map(pet => {
                          const petId = pet.petId || pet.id;
                          const isSelected = assignForm.petId === petId?.toString();
                          return (
                            <div
                              key={petId}
                              onClick={() => {
                                setAssignForm({...assignForm, petId: petId?.toString()});
                                setShowPetDropdown(false);
                                setPetSearchTerm("");
                              }}
                              className={`px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                                isSelected ? 'bg-violet-100' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getPetEmoji(pet.species)}</span>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {pet.name} - {pet.species}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    👤 {pet.owner?.fullName || pet.petOwner?.fullName || 'N/A'}
                                    {(pet.owner?.phoneNumber || pet.petOwner?.phoneNumber) && (
                                      <span className="ml-2">📞 {pet.owner?.phoneNumber || pet.petOwner?.phoneNumber}</span>
                                    )}
                                  </p>
                                </div>
                                {isSelected && <span className="text-violet-600">✓</span>}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500">
                          <span className="text-2xl block mb-1">🔍</span>
                          Không tìm thấy thú cưng nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Click outside to close */}
                {showPetDropdown && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowPetDropdown(false)}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📅 Ngày nhận <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={assignForm.checkInDate}
                    onChange={(e) => setAssignForm({...assignForm, checkInDate: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📅 Ngày trả (dự kiến)
                  </Label>
                  <Input
                    type="date"
                    value={assignForm.expectedCheckOutDate}
                    onChange={(e) => setAssignForm({...assignForm, expectedCheckOutDate: e.target.value})}
                    min={assignForm.checkInDate}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  📝 Ghi chú
                </Label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                  placeholder="Ghi chú về việc lưu trú..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseAssignModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                >
                  {saving ? '⏳ Đang check-in...' : '🐾 Xác nhận Check-in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
