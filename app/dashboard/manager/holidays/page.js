/**
 * Holiday Management Page - Manager Dashboard
 * 
 * Route: /dashboard/manager/holidays
 * 
 * Features:
 * - Set recurring days off (Saturday/Sunday)
 * - Add specific holidays with custom reasons
 * - Calendar preview of holidays in current month
 * - Premium UI with gradients and animations
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/contexts/ToastContext";
import { dayOffApi, systemConfigApi } from "@/lib/api";

export default function HolidaysPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [dayOffs, setDayOffs] = useState([]);
    const [persistentDaysOff, setPersistentDaysOff] = useState([]);

    // Form states
    const [newHolidayDate, setNewHolidayDate] = useState("");
    const [newHolidayReason, setNewHolidayReason] = useState("");

    // Calendar preview
    const [previewMonth, setPreviewMonth] = useState(new Date().getMonth());
    const [previewYear, setPreviewYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadDayOffs();
    }, []);

    const loadDayOffs = async () => {
        try {
            setLoading(true);
            const [dayOffsResult, persistentResult] = await Promise.all([
                dayOffApi.getAll(),
                systemConfigApi.getPersistentDaysOff()
            ]);
            
            if (dayOffsResult.success) {
                setDayOffs(dayOffsResult.data || []);
            } else {
                showToast("Không thể tải danh sách ngày nghỉ", "error");
            }

            if (persistentResult.success) {
                setPersistentDaysOff(persistentResult.data || []);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            showToast("Không thể tải dữ liệu", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddHoliday = async () => {
        if (!newHolidayDate) {
            showToast("Vui lòng chọn ngày", "error");
            return;
        }
        if (!newHolidayReason.trim()) {
            showToast("Vui lòng nhập lý do nghỉ", "error");
            return;
        }

        try {
            const result = await dayOffApi.create({
                date: newHolidayDate,
                name: newHolidayReason.trim(),
                description: newHolidayReason.trim()
            });

            if (result.success) {
                await loadDayOffs();
                setNewHolidayDate("");
                setNewHolidayReason("");
                showToast("Đã thêm ngày nghỉ lễ! 🎉", "success");
            } else {
                showToast(result.error || "Không thể thêm ngày nghỉ", "error");
            }
        } catch (error) {
            console.error("Error adding holiday:", error);
            showToast("Không thể thêm ngày nghỉ", "error");
        }
    };

    const handleRemoveHoliday = async (dayOffId) => {
        try {
            const result = await dayOffApi.delete(dayOffId);

            if (result.success) {
                await loadDayOffs();
                showToast("Đã xóa ngày nghỉ lễ", "success");
            } else {
                showToast(result.error || "Không thể xóa ngày nghỉ", "error");
            }
        } catch (error) {
            console.error("Error removing holiday:", error);
            showToast("Không thể xóa ngày nghỉ", "error");
        }
    };

    const handleTogglePersistentDay = async (dayIndex) => {
        try {
            const newDaysOff = persistentDaysOff.includes(dayIndex)
                ? persistentDaysOff.filter(d => d !== dayIndex)
                : [...persistentDaysOff, dayIndex].sort((a, b) => a - b);

            const result = await systemConfigApi.setPersistentDaysOff(newDaysOff);

            if (result.success) {
                setPersistentDaysOff(newDaysOff);
                showToast("Đã cập nhật ngày nghỉ cố định! ✅", "success");
            } else {
                showToast(result.error || "Không thể cập nhật ngày nghỉ cố định", "error");
            }
        } catch (error) {
            console.error("Error toggling persistent day:", error);
            showToast("Không thể cập nhật ngày nghỉ cố định", "error");
        }
    };

    const getMonthHolidays = () => {
        const firstDay = new Date(previewYear, previewMonth, 1);
        const lastDay = new Date(previewYear, previewMonth + 1, 0);
        
        const holidays = [];

        // Add specific day-offs
        dayOffs.filter(dayOff => {
            const dayOffDate = new Date(dayOff.date);
            return dayOffDate >= firstDay && dayOffDate <= lastDay;
        }).forEach(dayOff => {
            holidays.push({
                day: new Date(dayOff.date).getDate(),
                reason: dayOff.name,
                type: 'specific'
            });
        });

        // Add persistent days off (recurring weekly)
        if (persistentDaysOff.length > 0) {
            const daysInMonth = new Date(previewYear, previewMonth + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(previewYear, previewMonth, day);
                const dayOfWeek = date.getDay();
                if (persistentDaysOff.includes(dayOfWeek)) {
                    // Check if not already added as specific holiday
                    if (!holidays.find(h => h.day === day)) {
                        const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                        holidays.push({
                            day,
                            reason: `Nghỉ ${dayNames[dayOfWeek]}`,
                            type: 'recurring'
                        });
                    }
                }
            }
        }

        return holidays.sort((a, b) => a.day - b.day);
    };

    const formatDateVN = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleMonthChange = (direction) => {
        if (direction === 'prev') {
            if (previewMonth === 0) {
                setPreviewMonth(11);
                setPreviewYear(previewYear - 1);
            } else {
                setPreviewMonth(previewMonth - 1);
            }
        } else {
            if (previewMonth === 11) {
                setPreviewMonth(0);
                setPreviewYear(previewYear + 1);
            } else {
                setPreviewMonth(previewMonth + 1);
            }
        }
    };

    const getMonthName = (month) => {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return months[month];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-8xl mb-4 animate-bounce">🗓️</div>
                    <p className="text-gray-500 text-lg">Đang tải cấu hình ngày nghỉ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
            {/* 🌈 Premium Gradient Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500"></div>

                {/* Floating decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <span
                            key={i}
                            className="absolute text-white/10 text-3xl animate-float"
                            style={{
                                left: `${10 + i * 15}%`,
                                top: `${20 + (i % 3) * 20}%`,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: `${3 + i % 2}s`
                            }}
                        >
                            {['🗓️', '🎄', '🎊', '🏖️', '🌙', '⭐'][i]}
                        </span>
                    ))}
                </div>

                <div className="relative text-white p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                                🗓️
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                                    Quản Lý Ngày Nghỉ
                                    <span className="text-yellow-300">✨</span>
                                </h1>
                                <p className="text-white/80 mt-1">
                                    Thiết lập ngày nghỉ lễ và nghỉ cuối tuần
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left Column - Settings */}
                    <div className="space-y-6">
                        {/* 🔁 Recurring Days Off (Persistent) */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="text-2xl">🔁</span>
                                    Ngày Nghỉ Cố Định
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Thiết lập các ngày trong tuần luôn nghỉ (VD: Chủ Nhật)
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { index: 0, name: 'Chủ Nhật', emoji: '🌙', color: 'red' },
                                        { index: 1, name: 'Thứ Hai', emoji: '📅', color: 'gray' },
                                        { index: 2, name: 'Thứ Ba', emoji: '📅', color: 'gray' },
                                        { index: 3, name: 'Thứ Tư', emoji: '📅', color: 'gray' },
                                        { index: 4, name: 'Thứ Năm', emoji: '📅', color: 'gray' },
                                        { index: 5, name: 'Thứ Sáu', emoji: '📅', color: 'gray' },
                                        { index: 6, name: 'Thứ Bảy', emoji: '🌙', color: 'blue' },
                                    ].map((day) => {
                                        const isSelected = persistentDaysOff.includes(day.index);
                                        return (
                                            <button
                                                key={day.index}
                                                onClick={() => handleTogglePersistentDay(day.index)}
                                                className={`p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                                                    isSelected
                                                        ? day.color === 'red'
                                                            ? 'bg-red-50 border-red-400 text-red-800'
                                                            : day.color === 'blue'
                                                            ? 'bg-blue-50 border-blue-400 text-blue-800'
                                                            : 'bg-purple-50 border-purple-400 text-purple-800'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{day.emoji}</span>
                                                    <span className="font-medium">{day.name}</span>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-lg">✅</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                                    <div className="flex items-start gap-2">
                                        <span>💡</span>
                                        <div>
                                            <p className="font-medium mb-1">Lưu ý:</p>
                                            <p className="text-blue-700">
                                                Ngày nghỉ cố định sẽ áp dụng hàng tuần. Hệ thống sẽ <strong>không cho phép</strong> tạo lịch làm việc cho nhân viên vào những ngày này.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 🎄 Specific Holidays */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="text-2xl">🎄</span>
                                    Ngày Lễ & Ngày Nghỉ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add new holiday form */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <p className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        ➕ Thêm ngày nghỉ mới
                                    </p>
                                    <div className="space-y-3">
                                        <Input
                                            type="date"
                                            value={newHolidayDate}
                                            onChange={(e) => setNewHolidayDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="border-amber-200 focus:border-amber-400"
                                        />
                                        <Input
                                            placeholder="Lý do nghỉ (VD: Tết Nguyên Đán, Lễ Quốc Khánh...)"
                                            value={newHolidayReason}
                                            onChange={(e) => setNewHolidayReason(e.target.value)}
                                            className="border-amber-200 focus:border-amber-400"
                                        />
                                        <Button
                                            onClick={handleAddHoliday}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                        >
                                            ➕ Thêm Ngày Nghỉ
                                        </Button>
                                    </div>
                                </div>

                                {/* List of holidays */}
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {dayOffs?.length > 0 ? (
                                        dayOffs
                                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                                            .map((holiday) => (
                                                <div
                                                    key={holiday.dayOffId}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">🎊</span>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{holiday.name}</p>
                                                            <p className="text-sm text-gray-500">{formatDateVN(holiday.date)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveHoliday(holiday.dayOffId)}
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Xóa ngày nghỉ"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="text-4xl block mb-2">📭</span>
                                            <p>Chưa có ngày nghỉ nào được thiết lập</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Calendar Preview */}
                    <div>
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <span className="text-2xl">📅</span>
                                        Xem Trước Ngày Nghỉ
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMonthChange('prev')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            ←
                                        </button>
                                        <span className="font-semibold min-w-[120px] text-center">
                                            {getMonthName(previewMonth)} {previewYear}
                                        </span>
                                        <button
                                            onClick={() => handleMonthChange('next')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Mini Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-4">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                                        <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Calendar days */}
                                    {(() => {
                                        const firstDay = new Date(previewYear, previewMonth, 1).getDay();
                                        const daysInMonth = new Date(previewYear, previewMonth + 1, 0).getDate();
                                        const days = [];
                                        const monthHolidays = getMonthHolidays();

                                        // Empty cells before first day
                                        for (let i = 0; i < firstDay; i++) {
                                            days.push(<div key={`empty-${i}`} className="p-2" />);
                                        }

                                        // Days of month
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const holiday = monthHolidays.find(h => h.day === day);
                                            const bgColor = holiday?.type === 'recurring' 
                                                ? 'bg-purple-100 text-purple-800 font-bold ring-2 ring-purple-300'
                                                : holiday?.type === 'specific'
                                                ? 'bg-amber-100 text-amber-800 font-bold ring-2 ring-amber-300'
                                                : 'hover:bg-gray-100';

                                            days.push(
                                                <div
                                                    key={day}
                                                    className={`p-2 text-center rounded-lg text-sm transition-all ${bgColor}`}
                                                    title={holiday?.reason || ''}
                                                >
                                                    {day}
                                                </div>
                                            );
                                        }

                                        return days;
                                    })()}
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-purple-200 ring-2 ring-purple-300"></div>
                                        <span className="text-sm text-gray-600">Nghỉ cố định</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-amber-200 ring-2 ring-amber-300"></div>
                                        <span className="text-sm text-gray-600">Ngày lễ</span>
                                    </div>
                                </div>

                                {/* Holidays this month */}
                                {(() => {
                                    const monthHolidays = getMonthHolidays();
                                    return monthHolidays.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2">
                                                📋 Ngày nghỉ tháng này ({monthHolidays.length})
                                            </p>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                {monthHolidays.map((h, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                                                            h.type === 'recurring' ? 'bg-purple-50' : 'bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>{h.type === 'recurring' ? '🔁' : '🎊'}</span>
                                                        <span className="font-medium">Ngày {h.day}:</span>
                                                        <span className="text-gray-600">{h.reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
