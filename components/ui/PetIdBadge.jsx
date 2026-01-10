// components/ui/PetIdBadge.jsx
"use client";

import { cn } from "@/lib/utils.js";

/**
 * PetIdBadge - Hiển thị mã định danh thú cưng (petId)
 * Dùng cho tất cả các trang có hiển thị thông tin pet
 * 
 * @param {string} petId - Mã thú cưng
 * @param {string} size - Kích thước: 'xs', 'sm', 'md', 'lg'
 * @param {string} variant - Kiểu hiển thị: 'default', 'outline', 'minimal'
 * @param {boolean} copyable - Cho phép copy petId
 * @param {string} className - Custom class
 */
export default function PetIdBadge({ 
  petId, 
  size = "sm", 
  variant = "default",
  copyable = false,
  className 
}) {
  if (!petId) return null;

  // Format petId để hiển thị ngắn gọn hơn
  const displayId = typeof petId === 'string' && petId.length > 8 
    ? `${petId.substring(0, 8)}...` 
    : petId;

  const handleCopy = () => {
    if (copyable && navigator.clipboard) {
      navigator.clipboard.writeText(petId);
    }
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-sm gap-1",
    sm: "px-2.5 py-1.5 text-base gap-1.5",
    md: "px-3 py-2 text-lg gap-2",
    lg: "px-4 py-2.5 text-xl gap-2.5"
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200 shadow-sm",
    outline: "bg-transparent border-2 border-amber-400 text-amber-600",
    minimal: "bg-amber-50 text-amber-600"
  };

  const iconSize = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-lg font-mono font-bold",
        "transition-all duration-200",
        sizeClasses[size],
        variantClasses[variant],
        copyable && "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95",
        className
      )}
      onClick={handleCopy}
      title={copyable ? `Click để copy: ${petId}` : `Mã thú cưng: ${petId}`}
    >
      <span className={iconSize[size]}>🏷️</span>
      <span>#{displayId}</span>
    </span>
  );
}

/**
 * PetIdBadgeWithName - Hiển thị cả tên và mã pet
 */
export function PetIdBadgeWithName({ 
  petId, 
  petName, 
  petEmoji = "🐾",
  size = "sm",
  className 
}) {
  if (!petId) return null;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("font-semibold flex items-center gap-1", sizeClasses[size])}>
        <span>{petEmoji}</span>
        <span>{petName || "Chưa đặt tên"}</span>
      </span>
      <PetIdBadge petId={petId} size={size === "lg" ? "md" : "sm"} />
    </div>
  );
}
