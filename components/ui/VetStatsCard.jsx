// components/ui/VetStatsCard.jsx
"use client";
import { cn } from "@/lib/utils";

/**
 * Stats Card Component for Veterinarian Dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Subtitle or description
 * @param {string} props.icon - Emoji or icon
 * @param {string} props.trend - Trend indicator (+5%, -2%)
 * @param {string} props.trendDirection - "up" | "down" | "neutral"
 * @param {string} props.color - Color theme: "blue" | "green" | "amber" | "red" | "purple" | "teal"
 * @param {function} props.onClick - Click handler
 */
export default function VetStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = "neutral",
  color = "blue",
  onClick,
  className
}) {
  const colorStyles = {
    blue: {
      bg: "from-blue-500 to-indigo-600",
      light: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      text: "text-blue-600",
      icon: "bg-blue-500/20"
    },
    green: {
      bg: "from-emerald-500 to-teal-600",
      light: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      icon: "bg-emerald-500/20"
    },
    amber: {
      bg: "from-amber-500 to-orange-600",
      light: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      text: "text-amber-600",
      icon: "bg-amber-500/20"
    },
    red: {
      bg: "from-red-500 to-rose-600",
      light: "from-red-50 to-rose-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "bg-red-500/20"
    },
    purple: {
      bg: "from-purple-500 to-violet-600",
      light: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      text: "text-purple-600",
      icon: "bg-purple-500/20"
    },
    teal: {
      bg: "from-teal-500 to-cyan-600",
      light: "from-teal-50 to-cyan-50",
      border: "border-teal-200",
      text: "text-teal-600",
      icon: "bg-teal-500/20"
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  const trendColors = {
    up: "text-emerald-600 bg-emerald-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50"
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
        "bg-gradient-to-br",
        style.light,
        style.border,
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl",
        "bg-gradient-to-br",
        style.bg
      )} />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-3xl font-bold", style.text)}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2",
                trendColors[trendDirection]
              )}>
                {trendDirection === "up" && "↑ "}
                {trendDirection === "down" && "↓ "}
                {trend}
              </span>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-xl text-2xl",
              style.icon
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
