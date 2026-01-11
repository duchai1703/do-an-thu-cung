'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings Page - Redirected
 * 
 * Trang cài đặt không còn cần thiết theo yêu cầu HOANTHIEN.
 * Redirect về trang chủ manager dashboard.
 */
export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to manager dashboard
    router.push('/dashboard/manager');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">⚙️</div>
        <p className="text-gray-500 text-lg">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
