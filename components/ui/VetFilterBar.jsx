// components/ui/VetFilterBar.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Reusable Filter Bar Component for Veterinarian Dashboard
 * 
 * @param {Object} props
 * @param {string} props.searchValue - Current search input value
 * @param {function} props.onSearchChange - Callback when search changes
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {Array} props.filters - Array of filter configs: { key, label, options: [{value, label, icon?}], value, onChange }
 * @param {Array} props.toggleFilters - Array of toggle configs: { key, label, value, onChange, icon?, activeColor? }
 * @param {function} props.onReset - Callback to reset all filters
 * @param {number} props.activeFilterCount - Number of active filters (for badge)
 */
export default function VetFilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  toggleFilters = [],
  onReset,
  activeFilterCount = 0,
  className
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if there are active filters
  useEffect(() => {
    if (activeFilterCount > 0) {
      setIsExpanded(true);
    }
  }, [activeFilterCount]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 pr-10 h-11 bg-white border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant={isExpanded ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-11 px-4 rounded-xl gap-2 transition-all",
            isExpanded && "bg-primary text-white"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs",
                isExpanded ? "bg-white text-primary" : "bg-primary text-white"
              )}
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive"
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-4">
            {/* Toggle Filters */}
            {toggleFilters.map((toggle) => (
              <div key={toggle.key} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{toggle.label}:</span>
                <div className="flex rounded-lg overflow-hidden border-2 border-gray-200">
                  {toggle.options?.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggle.onChange(opt.value)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium transition-all",
                        toggle.value === opt.value
                          ? "bg-primary text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {opt.icon && <span className="mr-1">{opt.icon}</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Select Filters */}
            {filters.map((filter) => (
              <div key={filter.key} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{filter.label}:</span>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="px-3 py-1.5 text-sm font-medium bg-white border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Đang lọc:</span>
              {toggleFilters.filter(t => t.value !== t.defaultValue).map((toggle) => {
                const activeOpt = toggle.options?.find(o => o.value === toggle.value);
                return activeOpt ? (
                  <Badge
                    key={toggle.key}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => toggle.onChange(toggle.defaultValue)}
                  >
                    {activeOpt.icon} {activeOpt.label}
                    <X className="h-3 w-3" />
                  </Badge>
                ) : null;
              })}
              {filters.filter(f => f.value !== f.defaultValue).map((filter) => {
                const activeOpt = filter.options?.find(o => o.value === filter.value);
                return activeOpt ? (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => filter.onChange(filter.defaultValue)}
                  >
                    {activeOpt.label}
                    <X className="h-3 w-3" />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
