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
import {
    getHolidaySettings,
    saveHolidaySettings,
    addHoliday,
    removeHoliday,
    getHolidaysInMonth,
    formatDateVN
} from "@/lib/utils/holidayUtils";

export default function HolidaysPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    // Form states
    const [newHolidayDate, setNewHolidayDate] = useState("");
    const [newHolidayReason, setNewHolidayReason] = useState("");

    // Calendar preview
    const [previewMonth, setPreviewMonth] = useState(new Date().getMonth());
    const [previewYear, setPreviewYear] = useState(new Date().getFullYear());
    const [monthHolidays, setMonthHolidays] = useState([]);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            updateMonthPreview();
        }
    }, [settings, previewMonth, previewYear]);

    const loadSettings = () => {
        try {
            const savedSettings = getHolidaySettings();
            setSettings(savedSettings);
        } catch (error) {
            console.error("Error loading settings:", error);
            showToast("Không thể tải cấu hình ngày nghỉ", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateMonthPreview = () => {
        const holidays = getHolidaysInMonth(previewYear, previewMonth);
        setMonthHolidays(holidays);
    };

    const handleToggleRecurringDay = (day) => {
        const newSettings = { ...settings };
        newSettings.recurringDaysOff[day].enabled = !newSettings.recurringDaysOff[day].enabled;
        setSettings(newSettings);
        saveHolidaySettings(newSettings);
        showToast(
            newSettings.recurringDaysOff[day].enabled
                ? `Đã bật nghỉ ${day === 'saturday' ? 'Thứ Bảy' : 'Chủ Nhật'}`
                : `Đã tắt nghỉ ${day === 'saturday' ? 'Thứ Bảy' : 'Chủ Nhật'}`,
            "success"
        );
    };

    const handleUpdateRecurringReason = (day, reason) => {
        const newSettings = { ...settings };
        newSettings.recurringDaysOff[day].reason = reason;
        setSettings(newSettings);
        saveHolidaySettings(newSettings);
    };

    const handleAddHoliday = () => {
        if (!newHolidayDate) {
            showToast("Vui lòng chọn ngày", "error");
            return;
        }
        if (!newHolidayReason.trim()) {
            showToast("Vui lòng nhập lý do nghỉ", "error");
            return;
        }

        const updatedSettings = addHoliday(newHolidayDate, newHolidayReason.trim());
        setSettings(updatedSettings);
        setNewHolidayDate("");
        setNewHolidayReason("");
        showToast("Đã thêm ngày nghỉ lễ! 🎉", "success");
    };

    const handleRemoveHoliday = (date) => {
        const updatedSettings = removeHoliday(date);
        setSettings(updatedSettings);
        showToast("Đã xóa ngày nghỉ lễ", "success");
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
                        {/* 📆 Recurring Days Off */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="text-2xl">🔄</span>
                                    Nghỉ Định Kỳ (Cuối Tuần)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Saturday */}
                                <div className={`p-4 rounded-xl border-2 transition-all ${settings?.recurringDaysOff?.saturday?.enabled
                                        ? 'border-purple-400 bg-purple-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">📅</span>
                                            <div>
                                                <p className="font-bold text-gray-800">Thứ Bảy</p>
                                                <p className="text-sm text-gray-500">Nghỉ hàng tuần</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleRecurringDay('saturday')}
                                            className={`relative w-14 h-7 rounded-full transition-colors ${settings?.recurringDaysOff?.saturday?.enabled
                                                    ? 'bg-purple-500'
                                                    : 'bg-gray-300'
                                                }`}
                                        >
                                            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${settings?.recurringDaysOff?.saturday?.enabled ? 'left-7' : 'left-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    {settings?.recurringDaysOff?.saturday?.enabled && (
                                        <Input
                                            placeholder="Lý do nghỉ (VD: Nghỉ cuối tuần)"
                                            value={settings?.recurringDaysOff?.saturday?.reason || ''}
                                            onChange={(e) => handleUpdateRecurringReason('saturday', e.target.value)}
                                            className="border-purple-200 focus:border-purple-400"
                                        />
                                    )}
                                </div>

                                {/* Sunday */}
                                <div className={`p-4 rounded-xl border-2 transition-all ${settings?.recurringDaysOff?.sunday?.enabled
                                        ? 'border-rose-400 bg-rose-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">🌟</span>
                                            <div>
                                                <p className="font-bold text-gray-800">Chủ Nhật</p>
                                                <p className="text-sm text-gray-500">Nghỉ hàng tuần</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleRecurringDay('sunday')}
                                            className={`relative w-14 h-7 rounded-full transition-colors ${settings?.recurringDaysOff?.sunday?.enabled
                                                    ? 'bg-rose-500'
                                                    : 'bg-gray-300'
                                                }`}
                                        >
                                            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${settings?.recurringDaysOff?.sunday?.enabled ? 'left-7' : 'left-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    {settings?.recurringDaysOff?.sunday?.enabled && (
                                        <Input
                                            placeholder="Lý do nghỉ (VD: Nghỉ cuối tuần)"
                                            value={settings?.recurringDaysOff?.sunday?.reason || ''}
                                            onChange={(e) => handleUpdateRecurringReason('sunday', e.target.value)}
                                            className="border-rose-200 focus:border-rose-400"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 🎄 Specific Holidays */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="text-2xl">🎄</span>
                                    Ngày Lễ Cụ Thể
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add new holiday form */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <p className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        ➕ Thêm ngày nghỉ lễ mới
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
                                            ➕ Thêm Ngày Lễ
                                        </Button>
                                    </div>
                                </div>

                                {/* List of holidays */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {settings?.holidays?.length > 0 ? (
                                        settings.holidays.map((holiday, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">🎊</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{holiday.reason}</p>
                                                        <p className="text-sm text-gray-500">{formatDateVN(holiday.date)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveHoliday(holiday.date)}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Xóa ngày lễ"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="text-4xl block mb-2">📭</span>
                                            <p>Chưa có ngày lễ nào được thiết lập</p>
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

                                        // Empty cells before first day
                                        for (let i = 0; i < firstDay; i++) {
                                            days.push(<div key={`empty-${i}`} className="p-2" />);
                                        }

                                        // Days of month
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const dateStr = `${previewYear}-${String(previewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const holiday = monthHolidays.find(h => h.day === day);

                                            days.push(
                                                <div
                                                    key={day}
                                                    className={`p-2 text-center rounded-lg text-sm transition-all ${holiday
                                                            ? holiday.type === 'specific'
                                                                ? 'bg-amber-100 text-amber-800 font-bold ring-2 ring-amber-300'
                                                                : 'bg-purple-100 text-purple-800 font-bold ring-2 ring-purple-300'
                                                            : 'hover:bg-gray-100'
                                                        }`}
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
                                        <span className="text-sm text-gray-600">Nghỉ cuối tuần</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-amber-200 ring-2 ring-amber-300"></div>
                                        <span className="text-sm text-gray-600">Ngày lễ cụ thể</span>
                                    </div>
                                </div>

                                {/* Holidays this month */}
                                {monthHolidays.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="font-semibold text-gray-700 mb-2">
                                            📋 Ngày nghỉ tháng này ({monthHolidays.length})
                                        </p>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                            {monthHolidays.map((h, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50">
                                                    <span>{h.type === 'specific' ? '🎊' : '📅'}</span>
                                                    <span className="font-medium">Ngày {h.day}:</span>
                                                    <span className="text-gray-600">{h.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
