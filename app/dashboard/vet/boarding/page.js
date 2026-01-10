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
import CageDetailModal from "@/components/modals/CageDetailModal";
import VetFilterBar from "@/components/ui/VetFilterBar";

export default function VeterinarianBoardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cages, setCages] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [mainTab, setMainTab] = useState("monitoring");
  const [cageFilter, setCageFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
            notes: asn.notes || '',
            // New fields
            dailyRate: asn.dailyRate || asn.cage?.dailyRate || 0,
            assignedById: asn.assignedById || null,
            assignedByName: asn.assignedBy?.fullName || asn.assignedBy?.account?.email?.split('@')[0] || null
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
      notes: "",
      dailyRate: cage?.dailyRate || ""
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
        dailyRate: formData.dailyRate ? Number(formData.dailyRate) : undefined,
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
    <div className="flex-1 space-y-6">
      {/* 🎨 Stunning Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-b-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500">
          {/* Animated overlay pattern */}
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M40 40c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🏠', '🐕', '🐈', '🛏️', '🍖', '💤'].map((icon, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-4xl"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${3 + i % 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Title & Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                  🏠
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Quản lý nội trú
                    <span className="text-yellow-300">✨</span>
                  </h1>
                  <p className="text-white/80 mt-1">
                    Theo dõi và quản lý thú cưng lưu trú tại trung tâm
                  </p>
                </div>
              </div>

              {/* Right side - Occupancy indicator */}
              <div className="flex items-center gap-4">
                {/* Occupancy Progress */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{stats.occupied}</p>
                      <p className="text-xs text-white/80">đang ở</p>
                    </div>
                    <div className="text-2xl text-white/50">/</div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-xs text-white/80">tổng chuồng</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 w-full h-2 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-1 text-center">
                    {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}% sử dụng
                  </p>
                </div>

                <Button 
                  onClick={() => handleOpenAssignModal()} 
                  className="bg-white text-teal-600 hover:bg-white/90 shadow-xl hover:scale-105 transition-transform font-bold px-6 py-6"
                  size="lg"
                >
                  <span className="text-xl mr-2">➕</span>
                  Nhập thú cưng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Stats - Premium Gradient Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Total Cages */}
          <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Tổng chuồng</p>
                <p className="text-4xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏠
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Chuồng trống</p>
                <p className="text-4xl font-bold mt-1">{stats.available}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ✅
              </div>
            </div>
          </div>

          {/* Occupied */}
          <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Đang lưu trú</p>
                <p className="text-4xl font-bold mt-1">{stats.occupied}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform animate-pulse">
                🐾
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-500 to-gray-600 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Bảo trì</p>
                <p className="text-4xl font-bold mt-1">{stats.maintenance}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🔧
              </div>
            </div>
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
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg">
                🐾
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Thú cưng đang lưu trú</h2>
                <p className="text-gray-500">Theo dõi và quản lý hàng ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl">
              <span className="text-3xl font-bold">{activeAssignments.length}</span>
              <span className="text-sm opacity-90">thú cưng</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-6xl animate-pulse">
                ⏳
              </div>
              <p className="text-gray-500 mt-4 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : activeAssignments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-7xl mb-4">
                🏠
              </div>
              <p className="text-xl font-medium text-gray-600">Chưa có thú cưng nào đang lưu trú</p>
              <p className="text-gray-400 mt-2">Nhấn "Nhập thú cưng mới" để bắt đầu</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeAssignments.map(asn => {
                // Calculate progress percentage (assume max 14 days)
                const progressPercent = Math.min((asn.daysStayed / 14) * 100, 100);
                const isLongStay = asn.daysStayed >= 7;
                
                return (
                  <div 
                    key={asn.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  >
                    {/* Gradient top bar */}
                    <div className={cn(
                      "h-2 w-full",
                      isLongStay 
                        ? "bg-gradient-to-r from-amber-400 to-orange-500" 
                        : "bg-gradient-to-r from-emerald-400 to-teal-500"
                    )} />
                    
                    <div className="p-5">
                      {/* Pet Info Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Pet Avatar */}
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
                          isLongStay
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : "bg-gradient-to-br from-emerald-400 to-teal-500"
                        )}>
                          {asn.petIcon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 truncate">{asn.petName}</h3>
                          <p className="text-sm text-gray-500 truncate">{asn.petBreed}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-semibold">
                              🏠 {asn.cageNumber}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Owner Info */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">👤</span>
                          <span className="font-medium text-gray-700">{asn.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="text-gray-400">📞</span>
                          <span className="text-gray-600">{asn.ownerPhone}</span>
                        </div>
                        {/* Daily Rate */}
                        {asn.dailyRate > 0 && (
                          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-500">💰 Giá/ngày:</span>
                            <span className="font-semibold text-emerald-600">
                              {Number(asn.dailyRate).toLocaleString()}đ
                            </span>
                          </div>
                        )}
                        {/* Assigned By Staff */}
                        {asn.assignedByName && (
                          <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-400">👨‍⚕️</span>
                            <span className="text-gray-500">Nhân viên:</span>
                            <span className="font-medium text-blue-600">{asn.assignedByName}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Stay Duration */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500 flex items-center gap-1">
                            <span>📅</span> Nhập: {new Date(asn.checkInDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={cn(
                            "font-bold px-3 py-1 rounded-full text-sm",
                            isLongStay 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-emerald-100 text-emerald-700"
                          )}>
                            {asn.daysStayed} ngày
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isLongStay 
                                ? "bg-gradient-to-r from-amber-400 to-orange-500" 
                                : "bg-gradient-to-r from-emerald-400 to-teal-500"
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        {asn.expectedCheckOutDate && (
                          <div className="text-xs text-gray-400 mt-2 text-right">
                            🗓️ Dự kiến trả: {new Date(asn.expectedCheckOutDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(asn.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold transition-all group-hover:shadow-md"
                      >
                        <span className="text-lg">🚪</span> Trả chuồng
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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

          {/* Cage Grid - Premium Visual Cards */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-5xl animate-pulse">
                  ⏳
                </div>
                <p className="text-gray-500 mt-4">Đang tải dữ liệu chuồng...</p>
              </div>
            ) : filteredCages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                  🏠
                </div>
                <p className="mt-4 text-gray-500 font-medium">Không có chuồng nào</p>
              </div>
            ) : (
              filteredCages.map(cage => {
                const statusBadge = getStatusBadge(cage.status);
                const sizeBadge = getSizeBadge(cage.size);
                
                // Dynamic gradient based on status
                const statusGradient = {
                  available: 'from-emerald-400 to-teal-500',
                  occupied: 'from-amber-400 to-orange-500',
                  maintenance: 'from-slate-400 to-gray-500',
                  reserved: 'from-blue-400 to-indigo-500'
                };

                return (
                  <div
                    key={cage.id}
                    className={cn(
                      "group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer",
                      cage.status === 'maintenance' && "opacity-70"
                    )}
                    onClick={() => {
                      setSelectedCage(cage);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {/* Gradient Header */}
                    <div className={cn(
                      "relative h-16 bg-gradient-to-r",
                      statusGradient[cage.status] || statusGradient.available
                    )}>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
                        }}
                      />
                      
                      {/* Cage Number - Center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold drop-shadow-lg">{cage.number}</span>
                      </div>
                      
                      {/* Status Icon - Top Right */}
                      <div className="absolute top-2 right-2 w-10 h-10 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                        {statusBadge.emoji}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Size + Location row */}
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className={cn(
                          "font-bold px-2 py-1 rounded-full",
                          cage.size === 'small' ? 'bg-blue-100 text-blue-700' :
                          cage.size === 'large' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          {sizeBadge.label}
                        </span>
                        <span className="text-gray-500">📍 {cage.location}</span>
                      </div>
                      {cage.currentPet ? (
                        /* Occupied - Show Pet Info */
                        <div className="space-y-3">
                          {/* Pet Avatar and Info */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-md">
                              {cage.currentPet.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{cage.currentPet.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span>👤</span> {cage.currentPet.ownerName}
                              </p>
                            </div>
                          </div>
                          
                          {/* Stay Info */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <span>📅</span>
                              <span>{new Date(cage.currentPet.checkInDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                              <span className="font-bold text-amber-700">{cage.currentPet.daysStayed}</span>
                              <span className="text-amber-600 text-xs ml-1">ngày</span>
                            </div>
                          </div>
                          
                          {/* Checkout Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
                            onClick={(e) => { e.stopPropagation(); handleCheckOut(cage.currentPet.assignmentId); }}
                          >
                            <span className="text-lg">🚪</span> Trả chuồng
                          </Button>
                        </div>
                      ) : cage.status === 'available' ? (
                        /* Available - Show Assign Button */
                        <div className="text-center space-y-3">
                          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl">
                            ✅
                          </div>
                          <p className="text-sm text-gray-500">Chuồng trống, sẵn sàng tiếp nhận</p>
                          <Button
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
                            onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(cage); }}
                          >
                            <span className="text-lg">➕</span> Phân bổ thú cưng
                          </Button>
                        </div>
                      ) : (
                        /* Maintenance or Reserved */
                        <div className="text-center py-4">
                          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-2">
                            {cage.status === 'maintenance' ? '🔧' : '📅'}
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {cage.status === 'maintenance' ? 'Đang bảo trì' : 'Đã đặt trước'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {cage.notes || 'Không khả dụng'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
                {pets
                  .filter(pet => !activeAssignments.some(asn => asn.petId === pet.id))
                  .map(pet => (
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
              <Label className="flex items-center gap-2">
                💰 Giá theo ngày (VNĐ)
              </Label>
              <Input
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                placeholder="VD: 150000"
                min="0"
                step="1000"
              />
              {selectedCage?.dailyRate && (
                <p className="text-xs text-muted-foreground">
                  💡 Giá mặc định của chuồng: {Number(selectedCage.dailyRate).toLocaleString()}đ
                </p>
              )}
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

      {/* Cage Detail Modal */}
      <CageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCage(null);
        }}
        cage={selectedCage}
      />
      </div>  {/* Close max-w-7xl container */}
    </div>
  );
}
