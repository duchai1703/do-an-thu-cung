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
  
  // Expand/Collapse state
  const [expandedRecords, setExpandedRecords] = useState(new Set());

  // Helper function
  const formatMedicalRecordId = (id) => {
    return `MR${String(id).padStart(4, '0')}`;
  };

  const toggleRecord = (id) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecords(newExpanded);
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
      {/* Records Listing - Responsive */}
      
      {/* 📱 Mobile View - Cards */}
      {/* 📱 Mobile View - Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white/50 rounded-2xl border-2 border-dashed border-pink-200">
             <span className="text-4xl block mb-2">📋</span>
             <p>Không tìm thấy hồ sơ nào</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="border-pink-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CardHeader className="p-4 bg-gradient-to-r from-pink-50 to-white border-b border-pink-50 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl border border-pink-100">
                      {record.petIcon || '🐾'}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                        {record.petName}
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-pink-100 text-pink-700 hover:bg-pink-200">
                          {record.code}
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-gray-500">{record.petType}</p>
                    </div>
                  </div>
                  {/* Status Indicator */}
                  {record.isFollowUpOverdue ? (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Quá hạn" />
                  ) : record.needsFollowUp ? (
                    <div className="w-2 h-2 rounded-full bg-amber-500" title="Cần tái khám" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-green-400" title="Bình thường" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3 pt-3">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400 block mb-0.5">Chủ nuôi</span>
                    <span className="font-medium text-gray-700 block truncate">{record.ownerName}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400 block mb-0.5">Ngày khám</span>
                    <span className="font-medium text-gray-700">
                       {record.date ? new Date(record.date).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="bg-pink-50/50 p-2.5 rounded-lg border border-pink-100/50">
                  <span className="text-pink-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Chẩn đoán</span>
                  <p className="text-sm font-medium text-gray-700 line-clamp-2">
                    {record.diagnosis || "Chưa có chẩn đoán"}
                  </p>
                </div>
                
                {/* Collapsible Content */}
                {expandedRecords.has(record.id) && (
                  <div className="space-y-3 pt-2 border-t border-pink-50 animate-in slide-in-from-top-2 duration-200">
                    {/* Symptoms */}
                    <div>
                         <span className="text-xs text-gray-400 block mb-1">Triệu chứng</span>
                         <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{record.symptoms}</p>
                    </div>
                    {/* Treatment */}
                     <div>
                         <span className="text-xs text-gray-400 block mb-1">Điều trị</span>
                         <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{record.treatment}</p>
                    </div>
                    {/* Notes */}
                    {record.notes && (
                      <div>
                          <span className="text-xs text-gray-400 block mb-1">Ghi chú</span>
                          <p className="text-sm text-gray-500 italic p-2">{record.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                  <div className="flex gap-2">
                     {record.invoiceCreated ? (
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100">
                          <span className="text-xs mr-1">💰</span> Đã TT
                        </Badge>
                     ) : (
                        <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-100">
                           <span className="text-xs mr-1">⏰</span> Chờ TT
                        </Badge>
                     )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("h-8 w-8 p-0 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-transform duration-200", expandedRecords.has(record.id) && "rotate-180 bg-pink-50 text-pink-600")}
                      onClick={() => toggleRecord(record.id)}
                      title="Mở rộng"
                    >
                      <span className="text-lg">⌄</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full hover:bg-pink-50 hover:text-pink-600"
                      onClick={() => handleViewDetail(record)}
                    >
                      <span className="text-lg">👁️</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full hover:bg-pink-50 hover:text-pink-600"
                      onClick={() => handleEditRecord(record)}
                    >
                      <span className="text-lg">✏️</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 🖥️ Desktop View - Styled Table */}
      <div className="hidden md:block rounded-2xl border border-pink-100 overflow-hidden bg-white shadow-sm ring-1 ring-pink-50">
          <Table>
            <TableHeader className="bg-pink-50/50">
              <TableRow className="hover:bg-pink-50/80 border-b-pink-100">
                <TableHead className="w-[8%] font-bold text-pink-700/80">Mã</TableHead>
                <TableHead className="w-[10%] font-bold text-pink-700/80">Ngày khám</TableHead>
                <TableHead className="w-[15%] font-bold text-pink-700/80">Thú cưng</TableHead>
                <TableHead className="w-[13%] font-bold text-pink-700/80">Chủ nuôi</TableHead>
                <TableHead className="w-[20%] font-bold text-pink-700/80">Chẩn đoán</TableHead>
                <TableHead className="w-[12%] font-bold text-pink-700/80">Tái khám</TableHead>
                <TableHead className="w-[10%] font-bold text-pink-700/80">Hóa đơn</TableHead>
                <TableHead className="w-[12%] text-right font-bold text-pink-700/80 pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                        📋
                      </div>
                      <p className="text-lg font-medium text-gray-600">Không có hồ sơ nào</p>
                      <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc tìm kiếm nhé!</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const isExpanded = expandedRecords.has(record.id);
                  return (
                    <>
                    <TableRow key={record.id} className={cn("group hover:bg-pink-50/30 transition-colors border-b-pink-50", isExpanded && "bg-pink-50/20")}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs bg-white border-pink-200 text-pink-600 shadow-sm cursor-pointer hover:bg-pink-100 transition-colors" onClick={() => toggleRecord(record.id)}>
                          {record.code}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">
                            {record.date ? new Date(record.date).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {record.date ? new Date(record.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-white border border-pink-100 text-lg shadow-sm group-hover:scale-110 transition-transform">
                            {record.petIcon || '🐾'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{record.petName}</p>
                            <p className="text-[11px] text-gray-500 uppercase tracking-wide">{record.petType}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 text-sm">{record.ownerName}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                             📞 {record.ownerPhone}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-pink-100/50 shadow-sm group-hover:border-pink-200 transition-colors cursor-pointer" onClick={() => toggleRecord(record.id)}>
                           <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                             {record.diagnosis || "Chưa có chẩn đoán"}
                           </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {record.followUpDate ? (
                            <>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="text-xs">📅</span>
                                <span className="text-sm font-medium">
                                  {new Date(record.followUpDate).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              {/* Follow-up status badges */}
                              {record.isFollowUpOverdue ? (
                                <Badge variant="destructive" className="text-[10px] w-fit px-1.5 py-0 h-5 bg-red-100 text-red-600 hover:bg-red-200 border-0">
                                  ⚠️ Quá hạn
                                </Badge>
                              ) : record.needsFollowUp ? (
                                <Badge variant="warning" className="text-[10px] w-fit px-1.5 py-0 h-5 bg-amber-100 text-amber-600 hover:bg-amber-200 border-0">
                                  🕒 Sắp tới
                                </Badge>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-xs text-gray-300 italic pl-1">--</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {record.invoiceCreated ? (
                          <div className="flex flex-col items-start gap-0.5">
                             <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">
                               Đã TT
                             </Badge>
                             <span className="text-[10px] text-emerald-400 font-mono">#{record.invoiceId}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 shadow-sm">
                            Chờ TT
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex justify-end gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className={cn("h-8 w-8 rounded-full hover:bg-pink-50 hover:text-pink-600 text-gray-400 transition-transform duration-200", isExpanded && "rotate-180 bg-pink-50 text-pink-600")}
                             onClick={() => toggleRecord(record.id)}
                           >
                             <span className="text-lg">⌄</span>
                           </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-sky-50 hover:text-sky-600 text-gray-400"
                            onClick={() => handleViewDetail(record)} 
                            title="Xem chi tiết"
                          >
                            <span className="text-base">👁️</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-pink-50 hover:text-pink-600 text-gray-400"
                            onClick={() => handleEditRecord(record)} 
                            title="Chỉnh sửa"
                          >
                            <span className="text-base">✏️</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expandable Content Row */}
                    {isExpanded && (
                      <TableRow className="bg-pink-50/10 hover:bg-pink-50/10 border-b border-pink-100 animate-in slide-in-from-top-2">
                        <TableCell colSpan={8} className="p-0">
                          <div className="p-4 pl-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-pink-50/30 to-white shadow-inner">
                            {/* Left Column: Symptoms & Diagnosis */}
                            <div className="space-y-4">
                               <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
                                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span>🌡️</span> Triệu chứng & Chẩn đoán
                                  </h4>
                                  <div className="space-y-3">
                                      <div>
                                        <span className="text-xs text-gray-400 block mb-0.5">Triệu chứng của {record.petName}:</span>
                                        <p className="text-sm font-medium text-gray-700">{record.symptoms || "Không ghi nhận"}</p>
                                      </div>
                                      <div className="pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-400 block mb-0.5">Kết luận bác sĩ:</span>
                                        <p className="text-sm text-gray-600 italic">{record.diagnosis}</p>
                                      </div>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Right Column: Treatment & Prescription */}
                            <div className="space-y-4">
                               <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
                                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span>💊</span> Điều trị & Đơn thuốc
                                  </h4>
                                  <div className="space-y-3">
                                      <div>
                                        <span className="text-xs text-gray-400 block mb-0.5">Phác đồ điều trị:</span>
                                        <p className="text-sm font-medium text-gray-700">{record.treatment || "Theo dõi thêm"}</p>
                                      </div>
                                      {record.prescription && record.prescription !== 'N/A' && (
                                        <div className="pt-2 border-t border-gray-100">
                                          <span className="text-xs text-gray-400 block mb-0.5">Đơn thuốc:</span>
                                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.prescription}</p>
                                        </div>
                                      )}
                                      {record.notes && (
                                         <div className="pt-2 border-t border-gray-100">
                                            <span className="text-xs text-amber-500 block mb-0.5 font-bold">⚠️ Lưu ý:</span>
                                            <p className="text-sm text-gray-600">{record.notes}</p>
                                         </div>
                                      )}
                                  </div>
                               </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
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
