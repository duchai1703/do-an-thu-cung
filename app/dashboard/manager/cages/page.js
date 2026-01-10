/**
 * Cage Management - Premium UI với Emoji Icons
 * 
 * Route: /dashboard/manager/cages
 * 
 * Features:
 * - Gradient header (Teal → Cyan)
 * - Visual cage grid với status colors
 * - Size/Status filters
 * - Active assignments view
 * - Cage assignment modal
 * - CRUD operations
 * 
 * APIs:
 * - GET /cages
 * - POST /cages
 * - PUT /cages/:id
 * - DELETE /cages/:id
 * - GET /cages/assignments/active
 * - POST /cages/:id/assign
 * - POST /cages/:id/release
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
import PetIdBadge from "@/components/ui/PetIdBadge";

export default function CagesPage() {
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
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Modal states
  const [isCageModalOpen, setIsCageModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cage form
  const [cageForm, setCageForm] = useState({
    cageNumber: "",
    size: "MEDIUM",
    dailyRate: 0,
    notes: ""
  });

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

    // Filter by size
    if (sizeFilter !== "all") {
      filtered = filtered.filter(c => c.size === sizeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => {
        const isOccupied = c.isOccupied || getCageAssignment(c);
        if (statusFilter === "occupied") return isOccupied;
        if (statusFilter === "available") return !isOccupied && c.isAvailable !== false;
        if (statusFilter === "maintenance") return c.isAvailable === false;
        return true;
      });
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.cageNumber?.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredCages(filtered);
  };

  // Get assignment for a cage
  const getCageAssignment = (cage) => {
    const cageId = cage.cageId || cage.id;
    return assignments.find(a => (a.cageId || a.cage?.cageId || a.cage?.id) == cageId);
  };

  // Cage Modal Handlers
  const handleOpenCageModal = (cage = null) => {
    if (cage) {
      setIsEditing(true);
      setSelectedCage(cage);
      setCageForm({
        cageNumber: cage.cageNumber || "",
        size: cage.size || "MEDIUM",
        dailyRate: cage.dailyRate || 0,
        notes: cage.notes || ""
      });
    } else {
      setIsEditing(false);
      setSelectedCage(null);
      setCageForm({
        cageNumber: "",
        size: "MEDIUM",
        dailyRate: 0,
        notes: ""
      });
    }
    setIsCageModalOpen(true);
  };

  const handleCloseCageModal = () => {
    setIsCageModalOpen(false);
    setSelectedCage(null);
  };

  const handleSubmitCage = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const payload = {
        cageNumber: cageForm.cageNumber,
        size: cageForm.size,
        dailyRate: Number(cageForm.dailyRate),
        notes: cageForm.notes || null
      };

      if (isEditing && selectedCage) {
        const id = selectedCage.cageId || selectedCage.id;
        await apiClient.put(`/cages/${id}`, payload);
        showToast("Cập nhật chuồng thành công! ✅", "success");
      } else {
        await apiClient.post('/cages', payload);
        showToast("Thêm chuồng mới thành công! ✅", "success");
      }

      handleCloseCageModal();
      loadData();
    } catch (error) {
      console.error("Error saving cage:", error);
      showToast(error.response?.data?.message || "Không thể lưu chuồng", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCage = async (cage) => {
    const id = cage.cageId || cage.id;
    if (!confirm(`Bạn có chắc muốn xóa chuồng "${cage.cageNumber}"?`)) return;
    
    try {
      await apiClient.delete(`/cages/${id}`);
      showToast("Đã xóa chuồng! 🗑️", "success");
      loadData();
    } catch (error) {
      showToast("Không thể xóa chuồng (có thể đang được sử dụng)", "error");
    }
  };

  // Assignment Modal Handlers
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
      showToast("Đã gán thú cưng vào chuồng! 🏨", "success");
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
    const id = cage.cageId || cage.id;
    if (!confirm("Bạn có chắc muốn trả chuồng này?")) return;
    
    try {
      await apiClient.post(`/cages/${id}/release`);
      showToast("Đã trả chuồng! ✅", "success");
      loadData();
    } catch (error) {
      showToast("Không thể trả chuồng", "error");
    }
  };

  // UI Helpers
  const getSizeConfig = (size) => {
    const sizes = {
      'SMALL': { label: 'Nhỏ', emoji: '🏠', bg: 'bg-blue-100 text-blue-700' },
      'MEDIUM': { label: 'Vừa', emoji: '🏡', bg: 'bg-green-100 text-green-700' },
      'LARGE': { label: 'Lớn', emoji: '🏢', bg: 'bg-purple-100 text-purple-700' },
      'EXTRA_LARGE': { label: 'Rất lớn', emoji: '🏰', bg: 'bg-amber-100 text-amber-700' }
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
      'Dog': '🐕', 'Chó': '🐕',
      'Cat': '🐈', 'Mèo': '🐈',
      'Bird': '🐦', 'Chim': '🐦',
      'Rabbit': '🐇', 'Thỏ': '🐇',
      'Hamster': '🐹'
    };
    return emojiMap[species] || '🐾';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Stats
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
      {/* 🌈 Gradient Header */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">🏠</span>
                Quản Lý Chuồng Nuôi
              </h1>
              <p className="text-white/90">
                Quản lý chuồng và theo dõi thú cưng lưu trú
              </p>
            </div>
            <Button 
              onClick={() => handleOpenCageModal()}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
            >
              ➕ Thêm chuồng
            </Button>
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
              {/* Search */}
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

              {/* Size Filter */}
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="all">📏 Tất cả kích thước</option>
                <option value="SMALL">🏠 Nhỏ</option>
                <option value="MEDIUM">🏡 Vừa</option>
                <option value="LARGE">🏢 Lớn</option>
                <option value="EXTRA_LARGE">🏰 Rất lớn</option>
              </select>

              {/* Status Filter */}
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

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-teal-600' : 'text-gray-600'
                  }`}
                >
                  📦 Lưới
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-600'
                  }`}
                >
                  📋 Danh sách
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cage Count */}
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
                  className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer`}
                  onClick={() => assignment ? null : handleOpenCageModal(cage)}
                >
                  {/* Status Bar */}
                  <div className={`h-2 ${status.bg}`}></div>
                  
                  <CardContent className="p-4">
                    {/* Cage Number */}
                    <div className="text-center mb-3">
                      <span className="text-4xl">{size.emoji}</span>
                      <h3 className="font-bold text-gray-900 text-lg mt-1">
                        {cage.cageNumber}
                      </h3>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kích thước:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${size.bg}`}>
                          {size.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giá/ngày:</span>
                        <span className="font-semibold text-teal-600">
                          {formatCurrency(cage.dailyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trạng thái:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${status.textBg}`}>
                          {status.emoji} {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Pet Info if occupied */}
                    {assignment && (
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

                    {/* Actions */}
                    <div className="flex justify-center gap-2 mt-3 pt-3 border-t">
                      {status.status === 'available' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(cage); }}
                          className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-sm hover:bg-teal-100"
                        >
                          🐾 Gán
                        </button>
                      )}
                      {status.status === 'occupied' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReleaseCage(cage); }}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100"
                        >
                          ✅ Trả
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCageModal(cage); }}
                        className="p-1 text-gray-500 hover:text-amber-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCage(cage); }}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        🗑️
                      </button>
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
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${status.bg}`}>
                        {status.status === 'occupied' ? getPetEmoji(assignment?.pet?.species) : size.emoji}
                      </div>

                      {/* Info */}
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
                          {assignment && (
                            <> • 🐾 {assignment.pet?.name} (từ {new Date(assignment.checkInDate).toLocaleDateString('vi-VN')})</>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {status.status === 'available' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenAssignModal(cage)}
                            className="bg-teal-500 hover:bg-teal-600 text-white"
                          >
                            🐾 Gán thú cưng
                          </Button>
                        )}
                        {status.status === 'occupied' && (
                          <Button
                            size="sm"
                            onClick={() => handleReleaseCage(cage)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            ✅ Trả chuồng
                          </Button>
                        )}
                        <button
                          onClick={() => handleOpenCageModal(cage)}
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCage(cage)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          🗑️
                        </button>
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
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc thêm chuồng mới</p>
              <Button onClick={() => handleOpenCageModal()}>
                ➕ Thêm chuồng mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cage Modal */}
      {isCageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isEditing ? '✏️ Chỉnh sửa chuồng' : '➕ Thêm chuồng mới'}
              </h2>
              <button onClick={handleCloseCageModal} className="text-gray-400 hover:text-gray-600">
                ❌
              </button>
            </div>

            <form onSubmit={handleSubmitCage} className="p-6 space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  🏷️ Số chuồng <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={cageForm.cageNumber}
                  onChange={(e) => setCageForm({...cageForm, cageNumber: e.target.value})}
                  placeholder="VD: A01, B02..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    📏 Kích thước <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={cageForm.size}
                    onChange={(e) => setCageForm({...cageForm, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="SMALL">🏠 Nhỏ</option>
                    <option value="MEDIUM">🏡 Vừa</option>
                    <option value="LARGE">🏢 Lớn</option>
                    <option value="EXTRA_LARGE">🏰 Rất lớn</option>
                  </select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    💰 Giá/ngày (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={cageForm.dailyRate}
                    onChange={(e) => setCageForm({...cageForm, dailyRate: e.target.value})}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  📝 Ghi chú
                </Label>
                <textarea
                  value={cageForm.notes}
                  onChange={(e) => setCageForm({...cageForm, notes: e.target.value})}
                  placeholder="Ghi chú về chuồng..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseCageModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu chuồng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🐾 Gán thú cưng vào chuồng {selectedCage?.cageNumber}
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
                <select
                  value={assignForm.petId}
                  onChange={(e) => setAssignForm({...assignForm, petId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map(pet => (
                    <option key={pet.petId || pet.id} value={pet.petId || pet.id}>
                      {getPetEmoji(pet.species)} {pet.name} - {pet.species} ({pet.owner?.fullName || 'N/A'})
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseAssignModal}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                >
                  {saving ? '⏳ Đang gán...' : '🐾 Gán chuồng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
