// app/(dashboard)/veterinarian/records/page.js
"use client";
import "../vet-dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetRecordDetailModal from "@/components/modals/VetRecordDetailModal";
import VetRecordFormModal from "@/components/modals/VetRecordFormModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { medicalRecordApi, getToken, authApi, invoiceApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";
import VetFilterBar from "@/components/ui/VetFilterBar";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

export default function VeterinarianRecordsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Enhanced filter states
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [followUpFilter, setFollowUpFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  
  // Date range filter state
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Helper function
  const formatMedicalRecordId = (id) => {
    return `MR${String(id).padStart(4, '0')}`;
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Lấy tất cả medical records
      const response = await medicalRecordApi.getMyRecords();
      
      if (response.success && response.data) {

        const mappedRecords = response.data.map(record => ({
          id: record.recordId || record.id,
          code: `REC${String(record.recordId || record.id).padStart(3, '0')}`,
          petId: record.pet?.petId || record.petId,
          petName: record.pet?.name || 'Unknown',
          petIcon: record.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petType: `${record.pet?.species || ''} ${record.pet?.breed || ''}`.trim(),
          ownerId: record.pet?.owner?.petOwnerId,
          ownerName: record.pet?.owner?.fullName || record.pet?.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: record.pet?.owner?.phoneNumber || 'N/A',
          date: record.examinationDate || record.createdAt,
          symptoms: record.medicalSummary?.symptoms || 'N/A',
          diagnosis: record.diagnosis || 'N/A',
          prescription: record.medicalSummary?.prescription || 'N/A',
          treatment: record.treatment || 'N/A',
          notes: record.medicalSummary?.notes || '',
          followUpDate: record.followUpDate || null,
          // --- New fields from API ---
          isFollowUpOverdue: record.isFollowUpOverdue || false,
          needsFollowUp: record.needsFollowUp || !!record.followUpDate,
          medicalSummary: record.medicalSummary || null,
          // ---
          veterinarianId: record.veterinarian?.employeeId || record.veterinarianId,
          veterinarianName: record.veterinarian?.fullName || record.veterinarian?.account?.email?.split('@')[0] || 'Veterinarian',
          appointmentId: record.appointmentId || null,
          invoiceCreated: !!record.invoice,
          invoiceId: record.invoice?.invoiceId || null
        }));
        
        // Sort by date descending
        mappedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setRecords(mappedRecords);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };  

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  // handleCreateRecord removed - records are now created from appointments only

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleSaveRecord = (recordData) => {
    if (editingRecord) {
      // Update existing record
      setRecords(records.map(rec =>
        rec.id === editingRecord.id
          ? { ...rec, ...recordData, date: new Date().toISOString().split('T')[0] }
          : rec
      ));
      showToast("Đã cập nhật hồ sơ bệnh án!");
    } else {
      // Create new record
      const newRecord = {
        id: formatMedicalRecordId(records.length + 1),
        code: formatMedicalRecordId(records.length + 1),
        ...recordData,
        date: new Date().toISOString().split('T')[0],
        veterinarianId: "VET001",
        veterinarianName: "BS. Đức Hải",
        invoiceCreated: false,
        invoiceId: null
      };
      setRecords([newRecord, ...records]);
      showToast("Đã tạo hồ sơ bệnh án mới!");
    }
  };

  const handleCreateInvoice = async (recordId) => {
    const record = records.find(r => r.id === recordId);
    if (!record || record.invoiceCreated) {
      return;
    }
    
    // Check if record has appointmentId (required for invoice creation)
    if (!record.appointmentId) {
      showToast("Hồ sơ này không có lịch hẹn liên kết. Không thể tạo hóa đơn.", "error");
      return;
    }
    
    try {
      const response = await invoiceApi.create({
        appointmentId: Number(record.appointmentId),
        notes: `Hóa đơn từ hồ sơ bệnh án ${record.code}`
      });
      
      if (response.success) {
        // Reload records to get updated invoice status
        await loadRecords();
        showToast(`Đã tạo hóa đơn thành công!`);
      } else {
        showToast(response.error || "Không thể tạo hóa đơn", "error");
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast("Có lỗi xảy ra khi tạo hóa đơn", "error");
    }
  };

  const filteredRecords = records.filter(rec => {
    const matchFilter = filter === "all" || 
                       (filter === "with_invoice" && rec.invoiceCreated) ||
                       (filter === "no_invoice" && !rec.invoiceCreated);
    const matchSearch = rec.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       rec.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       rec.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       rec.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchOverdue = !overdueFilter || rec.isFollowUpOverdue;
    const matchFollowUp = !followUpFilter || rec.needsFollowUp;
    
    // Date range filter
    let matchDateRange = true;
    if (dateRange.start || dateRange.end) {
      const recordDate = new Date(rec.date || rec.examinationDate || rec.createdAt);
      if (dateRange.start && recordDate < dateRange.start) matchDateRange = false;
      if (dateRange.end && recordDate > dateRange.end) matchDateRange = false;
    }
    
    return matchFilter && matchSearch && matchOverdue && matchFollowUp && matchDateRange;
  }).sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.date) - new Date(b.date);
      case "petName": return (a.petName || "").localeCompare(b.petName || "");
      default: return new Date(b.date) - new Date(a.date);
    }
  });

  const stats = {
    total: records.length,
    withInvoice: records.filter(r => r.invoiceCreated).length,
    noInvoice: records.filter(r => !r.invoiceCreated).length,
    overdue: records.filter(r => r.isFollowUpOverdue).length,
    needsFollowUp: records.filter(r => r.needsFollowUp).length
  };
  
  // Calculate active filter count
  const activeFilterCount = [
    filter !== "all",
    overdueFilter,
    followUpFilter,
    sortBy !== "newest"
  ].filter(Boolean).length;

  return (
    <div className="flex-1 space-y-6">
      {/* 🎨 Stunning Gradient Header Banner - Records Theme */}
      <div className="relative overflow-hidden rounded-b-3xl">
        {/* Animated Background - Emerald/Green */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['📋', '💊', '💉', '🏥', '📝', '✅'].map((icon, i) => (
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
                  📋
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Hồ sơ bệnh án
                    <span className="text-yellow-300">✨</span>
                  </h1>
                  <p className="text-white/80 mt-1">
                    Quản lý và tra cứu hồ sơ khám bệnh
                  </p>
                </div>
              </div>

              {/* Right side - Stats summary */}
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-xs text-white/80">tổng hồ sơ</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-emerald-200">{stats.withInvoice}</p>
                      <p className="text-xs text-white/80">có hóa đơn</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div>
                      <p className="text-3xl font-bold text-yellow-300">{stats.noInvoice}</p>
                      <p className="text-xs text-white/80">chờ thanh toán</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="vet-stat-card vet-gradient-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">📋</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Tổng số</span>
          </div>
          <div className="value">{stats.total}</div>
          <div className="label mt-1">Tổng hồ sơ</div>
        </div>

        <div className="vet-stat-card vet-gradient-success">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">💰</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Đã thanh toán</span>
          </div>
          <div className="value">{stats.withInvoice}</div>
          <div className="label mt-1">Đã có hóa đơn</div>
        </div>

        <div className="vet-stat-card vet-gradient-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-wrapper text-3xl">⏰</div>
            <span className="text-xs uppercase tracking-wider opacity-80">Chờ thanh toán</span>
          </div>
          <div className="value">{stats.noInvoice}</div>
          <div className="label mt-1">Chưa có hóa đơn</div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <VetFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm theo tên pet, chủ nuôi, chẩn đoán, mã hồ sơ..."
        toggleFilters={[
          {
            key: "invoice",
            label: "Hóa đơn",
            value: filter,
            defaultValue: "all",
            onChange: setFilter,
            options: [
              { value: "all", label: "Tất cả", icon: "📋" },
              { value: "with_invoice", label: "Đã có", icon: "💰" },
              { value: "no_invoice", label: "Chưa có", icon: "⏰" }
            ]
          }
        ]}
        filters={[
          {
            key: "sortBy",
            label: "Sắp xếp",
            value: sortBy,
            defaultValue: "newest",
            onChange: setSortBy,
            options: [
              { value: "newest", label: "Mới nhất" },
              { value: "oldest", label: "Cũ nhất" },
              { value: "petName", label: "Tên A-Z" }
            ]
          }
        ]}
        onReset={() => {
          setFilter("all");
          setSearchTerm("");
          setOverdueFilter(false);
          setFollowUpFilter(false);
          setSortBy("newest");
          setDateRange({ start: null, end: null });
        }}
        activeFilterCount={activeFilterCount + (dateRange.start || dateRange.end ? 1 : 0)}
      />
      
      {/* Date Range Filter */}
      <DateRangeFilter
        onChange={(start, end, preset) => setDateRange({ start, end })}
        defaultPreset="all"
        theme="green"
        size="md"
        showLabel={true}
        showCustomRange={true}
      />
      
      {/* Quick Filter Badges */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setOverdueFilter(!overdueFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
            overdueFilter 
              ? "bg-red-500 text-white border-red-500" 
              : "bg-white text-red-600 border-red-200 hover:border-red-400"
          )}
        >
          <span>⚠️</span>
          <span className="text-sm font-medium">Quá hạn tái khám</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            overdueFilter ? "bg-white/20" : "bg-red-100"
          )}>
            {stats.overdue}
          </span>
        </button>
        
        <button
          onClick={() => setFollowUpFilter(!followUpFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
            followUpFilter 
              ? "bg-amber-500 text-white border-amber-500" 
              : "bg-white text-amber-600 border-amber-200 hover:border-amber-400"
          )}
        >
          <span>📅</span>
          <span className="text-sm font-medium">Cần tái khám</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            followUpFilter ? "bg-white/20" : "bg-amber-100"
          )}>
            {stats.needsFollowUp}
          </span>
        </button>
      </div>

      {/* Records Table */}
      {/* Records Table - Premium Style */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white text-2xl shadow-lg">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Danh sách hồ sơ bệnh án</h2>
              <p className="text-sm text-gray-500">Quản lý và tra cứu hồ sơ khám bệnh</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg">
            <span className="text-2xl">{filteredRecords.length}</span>
            <span className="text-sm opacity-90">hồ sơ</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-pink-100 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">Mã</TableHead>
                <TableHead className="w-[10%]">Ngày khám</TableHead>
                <TableHead className="w-[15%]">Thú cưng</TableHead>
                <TableHead className="w-[13%]">Chủ nuôi</TableHead>
                <TableHead className="w-[20%]">Chẩn đoán</TableHead>
                <TableHead className="w-[12%]">Tái khám</TableHead>
                <TableHead className="w-[10%]">Hóa đơn</TableHead>
                <TableHead className="w-[12%]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📋</span>
                      Không có hồ sơ nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{record.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-base">📅</span>
                            <span className="text-sm font-medium">
                              {record.date ? new Date(record.date).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-5">
                            {record.date ? new Date(record.date).toLocaleTimeString('vi-VN') : ''}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-xl">
                            {record.petIcon || '🐾'}
                          </div>
                          <div>
                            <p className="font-semibold">{record.petName}</p>
                            <p className="text-xs text-muted-foreground">{record.petType}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold">{record.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{record.ownerPhone}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm">{record.diagnosis}</p>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {record.followUpDate ? (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-base">🔄</span>
                                <span className="text-sm">
                                  {new Date(record.followUpDate).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              {/* Follow-up status badges */}
                              {record.isFollowUpOverdue ? (
                                <Badge variant="destructive" className="text-xs w-fit animate-pulse">
                                  ⚠️ Quá hạn
                                </Badge>
                              ) : record.needsFollowUp ? (
                                <Badge variant="warning" className="text-xs w-fit">
                                  📅 Cần tái khám
                                </Badge>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Không có</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {record.invoiceCreated ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <span className="text-sm">✅</span> {record.invoiceId}
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <span className="text-sm">⏰</span> Chưa có
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(record)} title="Xem chi tiết">
                            <span className="text-lg">👁️</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEditRecord(record)} title="Chỉnh sửa">
                            <span className="text-lg">✏️</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <VetRecordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />

      <VetRecordFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={handleSaveRecord}
        record={editingRecord}
      />
      </div>  {/* Close max-w-7xl container */}
    </div>
  );
}
