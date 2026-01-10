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
                       rec.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: records.length,
    withInvoice: records.filter(r => r.invoiceCreated).length,
    noInvoice: records.filter(r => !r.invoiceCreated).length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Hồ sơ bệnh án"
        subtitle="Quản lý và tra cứu hồ sơ khám bệnh"
      />

      {/* Stats - Premium Gradient Cards */}
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

      {/* Filter Tabs - Premium Style */}
      <div className="vet-glass-card-dark rounded-2xl p-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'all', label: 'Tất cả', emoji: '📋', gradient: 'from-pink-500 to-rose-400' },
            { value: 'with_invoice', label: 'Đã có hóa đơn', emoji: '💰', gradient: 'from-green-500 to-emerald-400' },
            { value: 'no_invoice', label: 'Chưa có hóa đơn', emoji: '⏰', gradient: 'from-amber-500 to-orange-400' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                filter === tab.value
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : "bg-white/50 text-gray-600 hover:bg-white/80"
              )}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search - Premium Card */}
      <div className="vet-glass-card rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-2xl shadow-lg">
            🔍
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Tìm kiếm
            </label>
            <Input
              type="text"
              placeholder="Tên thú cưng, chủ nuôi, mã hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent p-0 h-auto font-medium text-gray-800 placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>
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
                        <div className="flex items-center gap-1">
                          <span className="text-base">🔄</span>
                          <span className="text-sm">{record.followUpDate}</span>
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
    </div>
  );
}
