// app/(dashboard)/care-staff/schedule/page.js
"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Calendar, Clock, RefreshCw, CheckCircle2, Search, ClipboardList, PawPrint, Cat, Bath, Scissors, Home, Sparkles, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { careStaffApi } from "@/lib/api/care-staff";

export default function CareStaffSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Get current employee ID from localStorage or session
  const getEmployeeId = () => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.employeeId || user.id || 1; // Default to 1 for testing
    }
    return 1;
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);

  const loadSchedule = async () => {
    setLoading(true);
    const employeeId = getEmployeeId();

    try {
      const result = await careStaffApi.getSchedule(employeeId, {
        date: selectedDate,
      });

      if (result.success) {
        setSchedule(result.data);
      } else {
        console.error('Error loading schedule:', result.error);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedule = schedule.filter(item => {
    const matchFilter = filter === "all" || item.status === filter;
    const matchSearch = item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chưa làm", variant: "warning", icon: Clock },
      in_progress: { label: "Đang làm", variant: "info", icon: RefreshCw },
      completed: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 }
    };
    return badges[status] || badges.pending;
  };

  const getServiceIcon = (icon) => {
    switch (icon) {
      case '🛁': return Bath;
      case '✂️': return Scissors;
      case '🧼': return Sparkles;
      case '🪮': return Sparkles;
      case '🏠': return Home;
      default: return Sparkles;
    }
  };

  const stats = {
    total: schedule.length,
    pending: schedule.filter(s => s.status === 'pending').length,
    inProgress: schedule.filter(s => s.status === 'in_progress').length,
    completed: schedule.filter(s => s.status === 'completed').length
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <DashboardHeader
        title="Lịch làm việc"
        subtitle="Quản lý lịch chăm sóc thú cưng"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa làm</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang làm</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chưa làm</TabsTrigger>
          <TabsTrigger value="in_progress">Đang làm</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Picker & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Chọn ngày:</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên thú cưng hoặc chủ nuôi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Lịch ngày {selectedDate}
          </h2>
          <Badge variant="secondary">{filteredSchedule.length} lịch</Badge>
        </div>

        <div className="space-y-3">
          {filteredSchedule.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có lịch nào</p>
            </Card>
          ) : (
            filteredSchedule.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const ServiceIcon = getServiceIcon(item.serviceIcon);
              const PetIcon = item.petIcon === '🐕' ? PawPrint : item.petIcon === '🐈' ? Cat : PawPrint;
              return (
                <Card key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="ml-1 font-semibold">{item.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground">
                      <PetIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.petName}</p>
                      <p className="text-sm text-muted-foreground">{item.petType}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.ownerName}</p>
                    <p className="text-sm text-muted-foreground">{item.ownerPhone}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.service}</span>
                  </div>

                  <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                    <statusBadge.icon className="h-3 w-3" /> {statusBadge.label}
                  </Badge>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
