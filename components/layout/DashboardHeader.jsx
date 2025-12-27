"use client";

import { useState, useEffect } from "react";
import { Clock, Hand } from "lucide-react";

export default function DashboardHeader({ title, subtitle }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="flex items-center justify-between p-6 bg-card border-b border-border">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Hand className="h-4 w-4" />
          <span>{getGreeting()}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Time Display */}
        <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
