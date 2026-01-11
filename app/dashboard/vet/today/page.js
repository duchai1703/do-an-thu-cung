'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Today Page - Redirected
 * 
 * Trang "Công việc hôm nay" trùng với trang lịch đặt (schedule).
 * Redirect về trang schedule của bác sĩ.
 */
export default function TodayPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to vet schedule page
    router.push('/dashboard/vet/schedule');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">📆</div>
        <p className="text-gray-500 text-lg">Đang chuyển hướng đến lịch làm việc...</p>
      </div>
    </div>
  );
}
