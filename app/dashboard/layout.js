// app/(dashboard)/layout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/api/client";
import { authApi } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import "@/styles/dashboard.css";
import { RoleDashboards } from "@/lib/utils/constants";
import { ToastProvider } from "@/lib/contexts/ToastContext";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // 1. Check if user has valid token
        const token = getToken();
        if (!token) {
          console.log("❌ No token found, redirecting to login");
          router.push("/login");
          return;
        }

        // 2. Fetch current user from API
        const response = await authApi.getCurrentUser();
        
        if (!response.success || !response.data) {
          console.log("❌ Failed to get current user, redirecting to login");
          removeToken();
          router.push("/login");
          return;
        }

        const currentUser = response.data;
        const userType = currentUser.userType;

        const userTypeToRole = {
          'MANAGER': 'manager',
          'VETERINARIAN': 'veterinarian',
          'CARE_STAFF': 'care_staff',
          'RECEPTIONIST': 'receptionist',
          'PET_OWNER': 'pet_owner'
        };

        const userRole = userTypeToRole[userType];
        const correctPath = RoleDashboards[userRole];

        console.log('🔍 Debug - User type:', userType, '| Correct path:', correctPath, '| Current path:', pathname);

        // 4. Get role from URL
        const pathSegments = pathname.split('/');
        const urlRole = pathSegments[2]; // /dashboard/[role]/...

        // 5. If accessing /dashboard without role, redirect to user's correct dashboard
        if (!urlRole || pathname === '/dashboard') {
          console.log('⚠️ No role in URL, redirecting to:', correctPath);
          router.push(correctPath);
          return;
        }

        // 6. If accessing wrong dashboard, redirect to correct one
        if (!pathname.startsWith(correctPath)) {
          console.log('⚠️ Wrong dashboard access, redirecting to:', correctPath);
          router.push(correctPath);
          return;
        }

        // 7. User is authorized and on correct dashboard
        console.log('✅ Correct dashboard, loading user');
        setUser({
          account: {
            ...currentUser,
            role: userRole
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        removeToken();
        router.push("/login");
      }
    };

    initializeDashboard();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="paw-loader">🐾</div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="dashboard-layout">
        <Sidebar 
          role={user.account.role} 
          userInfo={{
            name: user.account.email.split('@')[0],
            email: user.account.email
          }}
        />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}