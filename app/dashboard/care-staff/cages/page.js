"use client";
import "../../vet/vet-dashboard.css";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/contexts/ToastContext";
import apiClient from "@/lib/api/client";

export default function CareStaffCagesPage() {
  const { showToast } = useToast();
  const [cages, setCages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0
  });
  
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);
  const [checkInForm, setCheckInForm] = useState({
    petId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    notes: ''
  });
  const [pets, setPets] = useState([]);
  
  // Note: Check-in functionality is disabled for Care Staff
  // Only receptionists should be able to check-in pets
  const CHECKIN_DISABLED = true;

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cageDetails, setCageDetails] = useState(null);

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cageHistory, setCageHistory] = useState([]);

  useEffect(() => {
    loadData();
  }, [filter]);

  // Auto-refresh history when modal is opened
  useEffect(() => {
    const refreshHistory = async () => {
      console.log('🔄 useEffect triggered:', { showHistoryModal, cageId: selectedCage?.cageId });
      
      if (showHistoryModal && selectedCage?.cageId) {
        try {
          console.log('📡 Fetching history for cage:', selectedCage.cageId);
          const response = await apiClient.get(`/cages/${selectedCage.cageId}/assignments`);
          const data = response.data || response;
          console.log('✅ History data received:', data);
          setCageHistory(data);
        } catch (error) {
          console.error('❌ Error refreshing history:', error);
        }
      }
    };
    
    refreshHistory();
  }, [showHistoryModal, selectedCage?.cageId]); // ← Trigger khi modal mở HOẶC đổi cage


  const loadData = async () => {
    setLoading(true);
    try {
      let cageData;
      
      // Optimize: Chỉ load available cages khi filter = AVAILABLE
      if (filter === 'AVAILABLE') {
        const cagesResponse = await apiClient.get('/cages/available');
        cageData = cagesResponse.data || cagesResponse;
      } else {
        const cagesResponse = await apiClient.get('/cages');
        cageData = cagesResponse.data || cagesResponse;
      }
      
      // Load active assignments for each cage
      const cagesWithAssignments = await Promise.all(
        cageData.map(async (cage) => {
          try {
            const assignment = await apiClient.get(`/cages/${cage.cageId}/current-assignment`);
            return {
              ...cage,
              currentAssignment: assignment.data || assignment
            };
          } catch (error) {
            return cage;
          }
        })
      );
      
      setCages(cagesWithAssignments);
      
      // Calculate stats
      const available = cagesWithAssignments.filter(c => c.status === 'AVAILABLE').length;
      const occupied = cagesWithAssignments.filter(c => c.status === 'OCCUPIED').length;
      const maintenance = cagesWithAssignments.filter(c => c.status === 'MAINTENANCE').length;
      
      setStats({
        total: cagesWithAssignments.length,
        available,
        occupied,
        maintenance
      });
    } catch (error) {
      console.error('Error loading cages:', error);
      showToast("Không thể tải danh sách chuồng", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async () => {
    try {
      const petsResponse = await apiClient.get('/pets');
      const allPets = petsResponse.data || petsResponse;
      
      const assignmentsResponse = await apiClient.get('/cages/assignments/active');
      const activeAssignments = assignmentsResponse.data || assignmentsResponse;
      
      const assignedPetIds = activeAssignments.map(assignment => assignment.petId);
      const availablePets = allPets.filter(pet => !assignedPetIds.includes(pet.petId));
      
      setPets(availablePets);
      
      if (availablePets.length === 0) {
        showToast("Tất cả pet hiện đang được chăm sóc trong chuồng", "warning");
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      showToast("Không thể tải danh sách pet", "error");
    }
  };

  const handleViewDetails = async (cage) => {
    try {
      const response = await apiClient.get(`/cages/${cage.cageId}`);
      setCageDetails(response.data || response);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading cage details:', error);
      showToast("Không thể tải chi tiết chuồng", "error");
    }
  };

  const handleViewHistory = async (cage) => {
    try {
      const response = await apiClient.get(`/cages/${cage.cageId}/assignments`);
      setCageHistory(response.data || response);
      setSelectedCage(cage);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading cage history:', error);
      showToast("Không thể tải lịch sử chuồng", "error");
    }
  };

  const handleStartMaintenance = async (cageId) => {
    try {
      await apiClient.put(`/cages/${cageId}/maintenance`);
      showToast("Đã đưa chuồng vào bảo trì");
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể bắt đầu bảo trì", "error");
    }
  };

  const handleCompleteMaintenance = async (cageId) => {
    try {
      await apiClient.put(`/cages/${cageId}/complete-maintenance`);
      showToast("Đã hoàn thành bảo trì");
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể hoàn thành bảo trì", "error");
    }
  };

  const handleOpenCheckIn = async (cage) => {
    setSelectedCage(cage);
    setCheckInForm({
      petId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      notes: ''
    });
    await loadPets();
    setShowCheckInModal(true);
  };

  const handleCheckIn = async () => {
    if (!checkInForm.petId) {
      showToast("Vui lòng chọn pet", "error");
      return;
    }

    try {
      await apiClient.post(`/cages/${selectedCage.cageId}/assign`, {
        petId: parseInt(checkInForm.petId),
        checkInDate: checkInForm.checkInDate,
        expectedCheckOutDate: checkInForm.checkOutDate || undefined,
        notes: checkInForm.notes || undefined
      });
      
      showToast("Đã check-in pet vào chuồng thành công!");
      setShowCheckInModal(false);
      loadData();
    } catch (error) {
      console.error('Check-in error:', error);
      showToast(error.response?.data?.message || "Không thể check-in pet", "error");
    }
  };

  const handleCheckOut = async (cage) => {
    if (!cage.currentAssignment?.assignmentId) {
      showToast("Không tìm thấy thông tin assignment", "error");
      return;
    }

    if (!confirm("Bạn có chắc muốn check-out pet ra khỏi chuồng?")) {
      return;
    }

    try {
      await apiClient.put(`/cages/assignments/${cage.currentAssignment.assignmentId}/checkout`);
      showToast("Đã check-out pet thành công!");
      await loadData(); // Reload cages - useEffect sẽ tự động refresh history nếu modal đang mở
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể check-out pet", "error");
    }
  };

  const filteredCages = filter === 'all' 
    ? cages 
    : cages.filter(c => c.status === filter);

  const getCageStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return 'from-green-500 to-emerald-400';
      case 'OCCUPIED': return 'from-purple-500 to-pink-400';
      case 'MAINTENANCE': return 'from-amber-500 to-orange-400';
      case 'RESERVED': return 'from-blue-500 to-cyan-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCageStatusEmoji = (status) => {
    switch(status) {
      case 'AVAILABLE': return '✅';
      case 'OCCUPIED': return '🐾';
      case 'MAINTENANCE': return '🔧';
      case 'RESERVED': return '📅';
      default: return '❓';
    }
  };

  const getCageStatusLabel = (status) => {
    switch(status) {
      case 'AVAILABLE': return 'Trống';
      case 'OCCUPIED': return 'Đang sử dụng';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'RESERVED': return 'Đã đặt';
      default: return status;
    }
  };

  const getCageSizeIcon = (size) => {
    switch(size?.toUpperCase()) {
      case 'SMALL': return '🐱';
      case 'MEDIUM': return '🐶';
      case 'LARGE': return '🐕';
      default: return '🏠';
    }
  };

  const getCageSizeLabel = (size) => {
    switch(size?.toUpperCase()) {
      case 'SMALL': return 'Nhỏ';
      case 'MEDIUM': return 'Vừa';
      case 'LARGE': return 'Lớn';
      default: return size;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏠</span>
              <h1 className="text-3xl font-bold">Quản lý Chuồng nuôi</h1>
            </div>
            <p className="text-lg opacity-90">
              Theo dõi và quản lý tình trạng chuồng thú cưng
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-3xl">🕐</span>
              <div>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm opacity-75">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            <div>
              <p className="text-sm opacity-90">Tổng chuồng</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-green-500 to-emerald-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm opacity-90">Trống</p>
              <p className="text-2xl font-bold">{stats.available}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-pink-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <p className="text-sm opacity-90">Đang dùng</p>
              <p className="text-2xl font-bold">{stats.occupied}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔧</span>
            <div>
              <p className="text-sm opacity-90">Bảo trì</p>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="vet-glass-card rounded-xl p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'all'
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Tất cả ({cages.length})
          </button>
          <button
            onClick={() => setFilter('AVAILABLE')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'AVAILABLE'
                ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Trống ({stats.available})
          </button>
          <button
            onClick={() => setFilter('OCCUPIED')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'OCCUPIED'
                ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Đang dùng ({stats.occupied})
          </button>
          <button
            onClick={() => setFilter('MAINTENANCE')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
              filter === 'MAINTENANCE'
                ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow"
                : "hover:bg-gray-100"
            )}
          >
            Bảo trì ({stats.maintenance})
          </button>
        </div>
      </div>

      {/* Cages Grid */}
      <div className="vet-glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white text-2xl shadow-lg">
            🏠
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Danh sách chuồng</h2>
            <p className="text-sm text-gray-500">{filteredCages.length} chuồng</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="text-5xl">⏳</span>
            <p className="text-gray-500 mt-4">Đang tải danh sách chuồng...</p>
          </div>
        ) : filteredCages.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">🏚️</span>
            <p className="text-gray-500 mt-4">Không có chuồng nào</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCages.map((cage) => {
              const assignment = cage.currentAssignment;
              
              return (
                <div
                  key={cage.cageId}
                  className={cn(
                    "relative overflow-hidden rounded-xl p-6 bg-white border-2 transition-all hover:shadow-lg",
                    cage.status === 'AVAILABLE' && "border-green-200 hover:border-green-400",
                    cage.status === 'OCCUPIED' && "border-purple-200 hover:border-purple-400",
                    cage.status === 'MAINTENANCE' && "border-amber-200 hover:border-amber-400"
                  )}
                >
                  {/* Status Badge */}
                  <div className={cn(
                    "absolute top-3 right-3 px-3 py-1 rounded-full text-white font-bold text-sm bg-gradient-to-r shadow-md",
                    getCageStatusColor(cage.status)
                  )}>
                    {getCageStatusEmoji(cage.status)} {getCageStatusLabel(cage.status)}
                  </div>

                  {/* Cage Info */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-3xl">{getCageSizeIcon(cage.cageSize)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{cage.cageName}</h3>
                        <p className="text-sm text-gray-500">
                          Kích thước: {getCageSizeLabel(cage.cageSize)}
                        </p>
                      </div>
                    </div>

                    {cage.location && (
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {cage.location}
                      </p>
                    )}

                    {/* Pet Info (if OCCUPIED) */}
                    {cage.status === 'OCCUPIED' && assignment && assignment.pet && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                        <p className="font-semibold text-purple-900 mb-1">
                          🐾 {assignment.pet.name}
                        </p>
                        <p className="text-xs text-purple-700">
                          Loại: {assignment.pet.species}
                        </p>
                        {assignment.checkInDate && (
                          <p className="text-xs text-purple-600 mt-1">
                            Check-in: {new Date(assignment.checkInDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                        {assignment.notes && (
                          <p className="text-xs text-purple-600 italic mt-1">
                            💭 {assignment.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {cage.notes && (
                      <p className="text-sm text-gray-500 italic mb-3">
                        💭 {cage.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-4">
                      {/* Row 1: Main actions */}
                      <div className="flex gap-2">
                        {cage.status === 'AVAILABLE' && (
                          <>
                            {/* Check-in button removed - Only receptionists can check-in */}
                            <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                              <p className="text-xs text-blue-600 font-medium">
                                🛡️ Lễ tân sẽ check-in pet
                              </p>
                            </div>
                            <Button
                              onClick={() => handleStartMaintenance(cage.cageId)}
                              variant="outline"
                              size="sm"
                            >
                              <span className="mr-1">🔧</span>
                            </Button>
                          </>
                        )}

                        {cage.status === 'MAINTENANCE' && (
                          <Button
                            onClick={() => handleCompleteMaintenance(cage.cageId)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500"
                            size="sm"
                          >
                            <span className="mr-1">✅</span> Hoàn thành
                          </Button>
                        )}

                        {cage.status === 'OCCUPIED' && (
                          <Button
                            onClick={() => handleCheckOut(cage)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                            size="sm"
                          >
                            <span className="mr-1">🚪</span> Check-out
                          </Button>
                        )}
                      </div>

                      {/* Row 2: Info actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(cage)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <span className="mr-1">🔍</span> Chi tiết
                        </Button>
                        <Button
                          onClick={() => handleViewHistory(cage)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <span className="mr-1">📜</span> Lịch sử
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                🐾 Check-in Pet vào {selectedCage?.cageName}
              </h3>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Pet *
                </label>
                <select
                  value={checkInForm.petId}
                  onChange={(e) => setCheckInForm({ ...checkInForm, petId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Chọn pet --</option>
                  {pets.map((pet) => (
                    <option key={pet.petId} value={pet.petId}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Check-in *
                </label>
                <input
                  type="date"
                  value={checkInForm.checkInDate}
                  onChange={(e) => setCheckInForm({ ...checkInForm, checkInDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Check-out dự kiến
                </label>
                <input
                  type="date"
                  value={checkInForm.checkOutDate}
                  onChange={(e) => setCheckInForm({ ...checkInForm, checkOutDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ghi chú đặc biệt về pet..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCheckInModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500"
                >
                  <span className="mr-1">✅</span> Check-in
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && cageDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                🔍 Chi tiết {cageDetails.cageName}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Tên chuồng:</span>
                <span className="text-gray-900">{cageDetails.cageName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Kích thước:</span>
                <span className="text-gray-900">{getCageSizeLabel(cageDetails.cageSize)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Vị trí:</span>
                <span className="text-gray-900">{cageDetails.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Trạng thái:</span>
                <Badge className={cn(
                  "bg-gradient-to-r text-white",
                  getCageStatusColor(cageDetails.status)
                )}>
                  {getCageStatusEmoji(cageDetails.status)} {getCageStatusLabel(cageDetails.status)}
                </Badge>
              </div>
              {cageDetails.dailyRate && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Giá/ngày:</span>
                  <span className="text-gray-900">{cageDetails.dailyRate.toLocaleString()} VNĐ</span>
                </div>
              )}
              {cageDetails.notes && (
                <div className="border-b pb-2">
                  <span className="font-medium text-gray-700">Ghi chú:</span>
                  <p className="text-gray-900 italic mt-1">{cageDetails.notes}</p>
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6"
              variant="outline"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                📜 Lịch sử {selectedCage?.cageName}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {cageHistory.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl">📭</span>
                <p className="text-gray-500 mt-4">Chưa có lịch sử sử dụng</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cageHistory.map((assignment, index) => (
                  <div
                    key={assignment.assignmentId}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🐾</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.pet?.name || `Pet ID: ${assignment.petId}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {assignment.pet?.species}
                          </p>
                        </div>
                      </div>
                      <Badge className={assignment.actualCheckOutDate ? "bg-gray-500" : "bg-green-500"}>
                        {assignment.actualCheckOutDate ? 'Đã check-out' : 'Đang ở'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-gray-600">Check-in:</span>
                        <p className="font-medium">
                          {new Date(assignment.checkInDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Check-out:</span>
                        <p className="font-medium">
                          {assignment.actualCheckOutDate 
                            ? new Date(assignment.actualCheckOutDate).toLocaleDateString('vi-VN')
                            : 'Chưa check-out'}
                        </p>
                      </div>
                    </div>

                    {assignment.notes && (
                      <p className="text-sm text-gray-600 italic mt-2 border-t pt-2">
                        💭 {assignment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-6"
              variant="outline"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
