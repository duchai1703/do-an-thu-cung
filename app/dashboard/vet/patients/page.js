// app/(dashboard)/veterinarian/patients/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import VetPatientDetailModal from "@/components/modals/VetPatientDetailModal";
import { PawPrint, Cat, Search, Eye, Calendar, Cake, ClipboardList, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appointmentApi, medicalRecordApi, getToken } from "@/lib/api";
import { formatPetId } from "@/lib/utils/id-formatter";

export default function VeterinarianPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all appointments to get unique pets
      const appointmentsRes = await appointmentApi.getAll();
      
      if (appointmentsRes.success && appointmentsRes.data) {
        // Get unique pets from appointments
        const petMap = new Map();
        
        appointmentsRes.data.forEach(apt => {
          if (apt.pet) {
            const petId = apt.pet.petId || apt.pet.id;
            if (!petMap.has(petId)) {
              petMap.set(petId, {
                pet: apt.pet,
                owner: apt.petOwner,
                appointments: []
              });
            }
            petMap.get(petId).appointments.push(apt);
          }
        });

        // Fetch medical records for each pet
        const patientsData = [];
        for (const [petId, data] of petMap.entries()) {
          const recordsRes = await medicalRecordApi.getByPet(petId);
          const medicalHistory = recordsRes.success && recordsRes.data ? 
            recordsRes.data.map(record => ({
              date: record.recordDate || record.createdAt,
              diagnosis: record.diagnosis || 'N/A',
              treatment: record.treatment || 'N/A'
            })) : [];

          const sortedAppointments = data.appointments.sort((a, b) => 
            new Date(b.appointmentDate) - new Date(a.appointmentDate)
          );

          patientsData.push({
            id: petId,
            code: formatPetId(petId),
            name: data.pet.name || 'Unknown',
            icon: data.pet.species?.toLowerCase() === 'dog' ? '🐕' : '🐈',
            type: data.pet.species?.toLowerCase() || 'unknown',
            breed: data.pet.breed || 'Mixed',
            age: data.pet.birthDate ? calculateAge(data.pet.birthDate) : 'N/A',
            gender: data.pet.gender || 'N/A',
            weight: data.pet.weight ? `${data.pet.weight} kg` : 'N/A',
            color: data.pet.color || 'N/A',
            dateOfBirth: data.pet.birthDate || 'N/A',
            ownerId: data.owner?.petOwnerID || data.owner?.id,
            ownerName: data.owner?.account?.email?.split('@')[0] || 'Unknown',
            ownerPhone: data.owner?.phoneNumber || 'N/A',
            lastVisit: sortedAppointments[0]?.appointmentDate || 'N/A',
            totalVisits: data.appointments.length,
            medicalHistory
          });
        }

        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} tuổi`;
    }
    return `${age} tuổi`;
  };

  const handleViewDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchFilter = filter === "all" || patient.type === filter;
    const matchSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       patient.breed.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: patients.length,
    dogs: patients.filter(p => p.type === 'dog').length,
    cats: patients.filter(p => p.type === 'cat').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Bệnh nhân của tôi"
        subtitle="Danh sách thú cưng đã và đang điều trị"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bệnh nhân</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chó</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mèo</CardTitle>
            <Cat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cats}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="dog">Chó</TabsTrigger>
          <TabsTrigger value="cat">Mèo</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên thú cưng, chủ nuôi, giống..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patients Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Danh sách bệnh nhân
          </h2>
          <Badge variant="secondary">{filteredPatients.length} bệnh nhân</Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">Mã</TableHead>
                <TableHead className="w-[18%]">Thú cưng</TableHead>
                <TableHead className="w-[12%]">Giống</TableHead>
                <TableHead className="w-[10%]">Tuổi</TableHead>
                <TableHead className="w-[15%]">Chủ nuôi</TableHead>
                <TableHead className="w-[12%]">Lần khám gần nhất</TableHead>
                <TableHead className="w-[10%]">Tổng lần khám</TableHead>
                <TableHead className="w-[10%]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <PawPrint className="mx-auto h-8 w-8 mb-2" />
                    Không có bệnh nhân nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => {
                  const PetIcon = patient.icon === '🐕' ? PawPrint : patient.icon === '🐈' ? Cat : PawPrint;
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{patient.code}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
                            <PetIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.gender} - {patient.color}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">{patient.breed}</span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Cake className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{patient.age}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold">{patient.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{patient.ownerPhone}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{patient.lastVisit}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary">{patient.totalVisits} lần</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => handleViewDetail(patient)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <VetPatientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
}
