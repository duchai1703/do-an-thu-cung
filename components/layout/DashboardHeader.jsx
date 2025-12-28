"use client";

import { useState, useEffect } from "react";

export default function DashboardHeader({ title, subtitle }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Chào buổi sáng", emoji: "🌅" };
    if (hour < 18) return { text: "Chào buổi chiều", emoji: "☀️" };
    return { text: "Chào buổi tối", emoji: "🌙" };
  };

  const greeting = getGreeting();

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 opacity-90"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between p-8">
        <div className="flex-1">
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{greeting.emoji}</span>
            <span className="text-white/90 text-sm font-medium tracking-wide">
              {greeting.text}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {title}
          </h1>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/80 text-sm font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Time Display - Glassmorphism */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
          <span className="text-3xl">🕐</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-white drop-shadow-md">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
