"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function RevenueChart({ data = [], period = "month" }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Guard against empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  // Safely calculate maxValue, default to 1 to avoid division by zero
  const revenues = data.map(d => parseFloat(d.revenue || d.totalRevenue || 0));
  const maxValue = Math.max(...revenues) || 1;

  const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount) || !isFinite(amount)) return '0';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="space-y-4">
      {/* Chart Grid */}
      <div className="relative flex items-end gap-2 h-64 p-4 border-b border-l border-border">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-xs text-muted-foreground pr-2">
          {[4, 3, 2, 1, 0].map(i => (
            <div key={i} className="text-right">
              {formatCurrency((maxValue * i) / 4)}
            </div>
          ))}
        </div>

        {/* Chart bars */}
        <div className="flex-1 flex items-end justify-around gap-1 ml-8">
          {data.map((item, index) => {
            const revenue = parseFloat(item.revenue || item.totalRevenue || 0);
            const heightPercent = maxValue > 0 ? (revenue / maxValue) * 100 : 0;
            const isHovered = hoveredBar === index;

            // Parse month from different formats
            let monthIndex = index;
            let yearValue = new Date().getFullYear();

            if (item.month) {
              monthIndex = item.month - 1;
              yearValue = item.year || yearValue;
            } else if (item.period) {
              // Handle period format like "2025-01" or "2025-Q1"
              const parts = item.period.split('-');
              if (parts.length >= 2) {
                yearValue = parseInt(parts[0]) || yearValue;
                if (parts[1].startsWith('Q')) {
                  // Quarter format
                  const quarter = parseInt(parts[1].substring(1));
                  monthIndex = (quarter - 1) * 3; // First month of quarter
                } else {
                  // Month format
                  monthIndex = parseInt(parts[1]) - 1;
                }
              }
            }

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 relative group"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 px-3 py-2 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                    <p className="text-xs font-semibold text-foreground mb-1">
                      {months[monthIndex]}/{yearValue}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(revenue)}
                    </p>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all duration-300 cursor-pointer",
                      "bg-gradient-to-t from-primary to-primary/60",
                      isHovered && "opacity-90 shadow-lg"
                    )}
                    style={{ height: `${Math.max(heightPercent, 1)}%` }}
                  />
                </div>

                {/* X-axis label */}
                <div className="text-xs text-muted-foreground font-medium">
                  {months[monthIndex]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Doanh thu</span>
        </div>
      </div>
    </div>
  );
}
