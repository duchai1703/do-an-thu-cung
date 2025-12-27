// app/(dashboard)/veterinarian/records/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetRecordDetailModal from "@/components/modals/VetRecordDetailModal";
import VetRecordFormModal from "@/components/modals/VetRecordFormModal";
import { FileText, DollarSign, Clock, Plus, Search, Eye, Edit, Receipt, Calendar, RefreshCw, ClipboardList, PawPrint, Cat, User, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { medicalRecordApi, getToken } from "@/lib/api";
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

      // Fetch all medical records
      const response = await medicalRecordApi.getAll();
      
      if (response.success && response.data) {
        const mappedRecords = response.data.map(record => ({
          id: record.recordID || record.id,
          code: `REC${String(record.recordID || record.id).padStart(3, '0')}`,
          petId: record.pet?.petID || record.pet?.id,
          petName: record.pet?.name || 'Unknown',
          petIcon: record.pet?.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
          petType: `${record.pet?.species || ''} ${record.pet?.breed || ''}`.trim(),
          ownerId: record.pet?.owner?.petOwnerID || record.pet?.owner?.id,
          ownerName: record.pet?.owner?.account?.email?.split('@')[0] || 'Unknown',
          ownerPhone: record.pet?.owner?.phoneNumber || 'N/A',
          date: record.recordDate || record.createdAt,
          symptoms: record.symptoms || 'N/A',
          diagnosis: record.diagnosis || 'N/A',
          prescription: record.prescription || 'N/A',
          treatment: record.treatment || 'N/A',
          notes: record.notes || '',
          followUpDate: record.followUpDate || 'N/A',
          veterinarianId: record.employee?.employeeID || record.employee?.id,
          veterinarianName: record.employee?.account?.email?.split('@')[0] || 'Veterinarian',
          invoiceCreated: !!record.invoice,
          invoiceId: record.invoice?.invoiceID || null
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

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

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

  const handleCreateInvoice = (recordId) => {
    const record = records.find(r => r.id === recordId);
    if (record && !record.invoiceCreated) {
      const newInvoiceId = formatInvoiceId(records.length + 1);
      setRecords(records.map(rec =>
        rec.id === recordId
          ? { ...rec, invoiceCreated: true, invoiceId: newInvoiceId }
          : rec
      ));
      showToast(`Đã tạo hóa đơn ${newInvoiceId}`);
    }
  };

  const filteredRecords = records.filter(rec => {
    const matchFilter = filter === "all" || 
                       (filter === "with_invoice" && rec.invoiceCreated) ||
                       (filter === "no_invoice" && !rec.invoiceCreated);
    const matchSearch = rec.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       rec.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       rec.code.toLowerCase().includes(searchTerm.toLowerCase());
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hồ sơ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã có hóa đơn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withInvoice}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa có hóa đơn</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noInvoice}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="with_invoice">Đã có hóa đơn</TabsTrigger>
          <TabsTrigger value="no_invoice">Chưa có hóa đơn</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Add Button and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button onClick={handleCreateRecord} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Tạo hồ sơ mới
        </Button>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên thú cưng, chủ nuôi, mã hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Danh sách hồ sơ bệnh án
          </h2>
          <Badge variant="secondary">{filteredRecords.length} hồ sơ</Badge>
        </div>

        <div className="rounded-md border">
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
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    Không có hồ sơ nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const PetIcon = record.petIcon === '🐕' ? PawPrint : record.petIcon === '🐈' ? Cat : PawPrint;
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{record.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{record.date}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
                            <PetIcon className="h-4 w-4" />
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
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{record.followUpDate}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {record.invoiceCreated ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> {record.invoiceId}
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" /> Chưa có
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!record.invoiceCreated && (
                            <Button variant="outline" size="icon" onClick={() => handleCreateInvoice(record.id)}>
                              <Receipt className="h-4 w-4" />
                            </Button>
                          )}
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
