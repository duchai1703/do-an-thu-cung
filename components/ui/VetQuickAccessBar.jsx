// components/ui/VetQuickAccessBar.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Calendar,
  AlertTriangle,
  Syringe,
  Clock,
  Bell,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/**
 * Quick Access Bar - Sticky top bar for veterinarian quick navigation
 * 
 * @param {Object} props
 * @param {number} props.todayCount - Number of today's appointments
 * @param {number} props.overdueFollowUps - Number of overdue follow-ups
 * @param {number} props.vaccineDue - Number of vaccines due soon
 * @param {function} props.onSearch - Callback when global search is performed
 * @param {Array} props.recentPets - Array of recently viewed pets [{id, name, icon}]
 */
export default function VetQuickAccessBar({
  todayCount = 0,
  overdueFollowUps = 0,
  vaccineDue = 0,
  onSearch,
  recentPets = [],
  className
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && !isSearchFocused && 
          !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        document.getElementById("vet-quick-search")?.focus();
      }
      if (e.key === "Escape") {
        setSearchValue("");
        document.getElementById("vet-quick-search")?.blur();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused]);

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleQuickNav = (path, filter) => {
    router.push(`/dashboard/vet/${path}${filter ? `?filter=${filter}` : ""}`);
  };

  const totalAlerts = overdueFollowUps + vaccineDue;

  return (
    <div className={cn(
      "sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="vet-quick-search"
              type="text"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Tìm nhanh pet, chủ nuôi... (nhấn /)"
              className="pl-10 pr-10 h-10 bg-gray-50 border-gray-200 focus:bg-white rounded-full"
            />
            {searchValue && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Quick Navigation Badges */}
          <div className="flex items-center gap-2">
            {/* Today's Appointments */}
            <button
              onClick={() => handleQuickNav("today")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200",
                "hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300"
              )}
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Hôm nay</span>
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white h-5 min-w-[20px] flex items-center justify-center">
                {todayCount}
              </Badge>
            </button>

            {/* Overdue Follow-ups */}
            {overdueFollowUps > 0 && (
              <button
                onClick={() => handleQuickNav("records", "overdue")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all animate-pulse-slow",
                  "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200",
                  "hover:from-red-100 hover:to-orange-100 hover:border-red-300"
                )}
              >
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Tái khám</span>
                <Badge className="bg-red-500 hover:bg-red-500 text-white h-5 min-w-[20px] flex items-center justify-center">
                  {overdueFollowUps}
                </Badge>
              </button>
            )}

            {/* Vaccines Due */}
            {vaccineDue > 0 && (
              <button
                onClick={() => handleQuickNav("vaccinations", "due")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200",
                  "hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300"
                )}
              >
                <Syringe className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Vaccine</span>
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white h-5 min-w-[20px] flex items-center justify-center">
                  {vaccineDue}
                </Badge>
              </button>
            )}

            {/* Alert Bell (if any alerts) */}
            {totalAlerts > 0 && (
              <div className="relative ml-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              </div>
            )}
          </div>

          {/* Recent Pets (if any) */}
          {recentPets.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 pl-4 border-l border-gray-200">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              {recentPets.slice(0, 3).map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handleQuickNav(`patients?petId=${pet.id}`)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 transition-colors"
                  title={pet.name}
                >
                  {pet.icon || "🐾"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
