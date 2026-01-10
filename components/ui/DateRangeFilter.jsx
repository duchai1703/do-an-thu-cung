/**
 * DateRangeFilter Component - Premium UI
 * 
 * Reusable date range filter with:
 * - Quick preset buttons (Today, 7 days, 30 days, This month, All)
 * - Custom date range picker
 * - Gradient pills with glow effects
 * - Smooth transitions and animations
 * - Responsive design
 * 
 * Usage:
 * <DateRangeFilter
 *   onChange={(startDate, endDate, preset) => handleFilter(startDate, endDate)}
 *   defaultPreset="7days"
 *   showCustomRange={true}
 *   theme="purple"
 *   size="md"
 * />
 */

"use client";
import { useState, useEffect } from "react";
import { Calendar, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Preset configurations
const PRESETS = {
  today: {
    label: "Hôm nay",
    icon: "📆",
    gradient: "from-blue-500 to-cyan-500",
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start: today, end };
    }
  },
  "7days": {
    label: "7 ngày",
    icon: "📅",
    gradient: "from-green-500 to-emerald-500",
    getRange: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
  },
  "30days": {
    label: "30 ngày",
    icon: "📆",
    gradient: "from-amber-500 to-orange-500",
    getRange: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
  },
  thisMonth: {
    label: "Tháng này",
    icon: "🗓️",
    gradient: "from-purple-500 to-pink-500",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
  },
  all: {
    label: "Tất cả",
    icon: "🔄",
    gradient: "from-gray-500 to-slate-500",
    getRange: () => ({ start: null, end: null })
  }
};

// Theme configurations
const THEMES = {
  purple: {
    primary: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    ring: "ring-purple-400"
  },
  blue: {
    primary: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    ring: "ring-blue-400"
  },
  green: {
    primary: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    ring: "ring-green-400"
  },
  pink: {
    primary: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    ring: "ring-pink-400"
  }
};

export default function DateRangeFilter({
  onChange,
  defaultPreset = "all",
  showCustomRange = true,
  theme = "purple",
  size = "md",
  className = "",
  showLabel = true,
  compact = false
}) {
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const themeConfig = THEMES[theme] || THEMES.purple;

  // Size configurations
  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-2 gap-2",
    lg: "text-base px-4 py-3 gap-2"
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Handle preset selection
  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setShowCustomPicker(preset === "custom");
    
    if (preset !== "custom" && PRESETS[preset]) {
      const { start, end } = PRESETS[preset].getRange();
      onChange?.(start, end, preset);
    }
  };

  // Handle custom range change
  const handleCustomRangeApply = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      onChange?.(start, end, "custom");
    }
  };

  // Clear custom range
  const handleClearCustom = () => {
    setCustomStart("");
    setCustomEnd("");
    handlePresetChange("all");
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Get current range display text
  const getCurrentRangeText = () => {
    if (selectedPreset === "custom" && customStart && customEnd) {
      return `${formatDate(customStart)} → ${formatDate(customEnd)}`;
    }
    if (selectedPreset && PRESETS[selectedPreset]) {
      const { start, end } = PRESETS[selectedPreset].getRange();
      if (start && end) {
        return `${formatDate(start)} → ${formatDate(end)}`;
      }
    }
    return "Tất cả thời gian";
  };

  // Initialize with default preset
  useEffect(() => {
    if (defaultPreset && PRESETS[defaultPreset]) {
      const { start, end } = PRESETS[defaultPreset].getRange();
      onChange?.(start, end, defaultPreset);
    }
  }, []);

  return (
    <div className={`date-range-filter ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${themeConfig.primary} flex items-center justify-center shadow-lg`}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Bộ lọc thời gian</p>
            <p className="text-xs text-gray-500">{getCurrentRangeText()}</p>
          </div>
        </div>
      )}

      {/* Preset Pills */}
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mb-3'}`}>
        {Object.entries(PRESETS).map(([key, preset]) => {
          const isSelected = selectedPreset === key;
          return (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`
                flex items-center ${sizeClass} rounded-xl font-semibold transition-all duration-300
                ${isSelected 
                  ? `bg-gradient-to-r ${preset.gradient} text-white shadow-lg scale-105 ring-2 ring-offset-2 ${themeConfig.ring}` 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <span className={`${size === 'sm' ? 'text-sm' : 'text-lg'}`}>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          );
        })}

        {/* Custom Range Button */}
        {showCustomRange && (
          <button
            onClick={() => {
              setSelectedPreset("custom");
              setShowCustomPicker(!showCustomPicker);
            }}
            className={`
              flex items-center ${sizeClass} rounded-xl font-semibold transition-all duration-300
              ${selectedPreset === "custom" 
                ? `bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-indigo-400` 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <span className={`${size === 'sm' ? 'text-sm' : 'text-lg'}`}>📅</span>
            <span>Tùy chọn</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCustomPicker ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Custom Date Picker Panel */}
      {showCustomPicker && (
        <div className={`
          mt-3 p-4 rounded-xl bg-white border ${themeConfig.border} shadow-lg
          animate-in slide-in-from-top-2 duration-200
        `}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border ${themeConfig.border} 
                  focus:outline-none focus:ring-2 ${themeConfig.ring} focus:border-transparent
                  text-sm text-gray-700
                `}
              />
            </div>

            {/* Arrow */}
            <div className="text-gray-400 text-xl mt-5">→</div>

            {/* End Date */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                className={`
                  w-full px-3 py-2 rounded-lg border ${themeConfig.border} 
                  focus:outline-none focus:ring-2 ${themeConfig.ring} focus:border-transparent
                  text-sm text-gray-700
                `}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-5">
              <Button
                onClick={handleCustomRangeApply}
                disabled={!customStart || !customEnd}
                size="sm"
                className={`bg-gradient-to-r ${themeConfig.primary} text-white hover:opacity-90`}
              >
                Áp dụng
              </Button>
              <Button
                onClick={handleClearCustom}
                variant="outline"
                size="sm"
                className="text-gray-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Nhanh:</span>
            {[
              { label: "Hôm qua", days: -1 },
              { label: "Tuần trước", days: -7, isWeek: true },
              { label: "Tháng trước", isLastMonth: true }
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  
                  if (shortcut.isLastMonth) {
                    start.setMonth(start.getMonth() - 1);
                    start.setDate(1);
                    end.setDate(0); // Last day of previous month
                  } else if (shortcut.isWeek) {
                    const dayOfWeek = start.getDay();
                    start.setDate(start.getDate() - dayOfWeek - 7);
                    end.setDate(end.getDate() - dayOfWeek - 1);
                  } else {
                    start.setDate(start.getDate() + shortcut.days);
                    end.setDate(end.getDate() + shortcut.days);
                  }
                  
                  setCustomStart(start.toISOString().split('T')[0]);
                  setCustomEnd(end.toISOString().split('T')[0]);
                }}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current selection badge (when compact) */}
      {compact && selectedPreset !== "all" && (
        <Badge className={`mt-2 ${themeConfig.bg} ${themeConfig.text} border ${themeConfig.border}`}>
          {getCurrentRangeText()}
          <button 
            onClick={() => handlePresetChange("all")} 
            className="ml-2 hover:opacity-70"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper hook for using the filter
export function useDateRangeFilter(defaultPreset = "all") {
  const [dateRange, setDateRange] = useState({ start: null, end: null, preset: defaultPreset });

  const handleFilterChange = (start, end, preset) => {
    setDateRange({ start, end, preset });
  };

  const filterByDate = (items, dateField = "createdAt") => {
    if (!dateRange.start && !dateRange.end) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (dateRange.start && itemDate < dateRange.start) return false;
      if (dateRange.end && itemDate > dateRange.end) return false;
      return true;
    });
  };

  return {
    dateRange,
    handleFilterChange,
    filterByDate,
    isFiltering: dateRange.preset !== "all"
  };
}
