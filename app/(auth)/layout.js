// app/(auth)/layout.js
import "@/styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "PAW LOVERS - Pet Care Management",
  description: "Hệ thống quản lý dịch vụ chăm sóc thú cưng",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Clean Gradient Background */}
      <div className="fixed inset-0">
        {/* Main gradient - soft pastel tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100"></div>
        
        {/* Subtle mesh gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.15),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(244,114,182,0.1),transparent)]"></div>
        
        {/* Subtle paw pattern - very light */}
        <div className="absolute inset-0 opacity-[0.025] bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%239333ea'%3E%3Cpath d='M4.5 12c1.5 0 2.5-1.5 2.5-3S6 6 4.5 6 2 7.5 2 9s1 3 2.5 3z'/%3E%3Cpath d='M19.5 12c-1.5 0-2.5-1.5-2.5-3s1-3 2.5-3S22 7.5 22 9s-1 3-2.5 3z'/%3E%3Cpath d='M9 7.5c1.5 0 2.5-1.5 2.5-3S10.5 1.5 9 1.5 6.5 3 6.5 4.5 7.5 7.5 9 7.5z'/%3E%3Cpath d='M15 7.5c-1.5 0-2.5-1.5-2.5-3s1-3 2.5-3 2.5 1.5 2.5 3-1 3-2.5 3z'/%3E%3Cpath d='M12 18c2.5 0 4.5-2 4.5-4.5 0-2-1.5-4.5-4.5-4.5s-4.5 2.5-4.5 4.5c0 2.5 2 4.5 4.5 4.5z'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}></div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-32 text-purple-100/50" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Header - Larger Brand Logo */}
      <header className="relative z-10 flex-shrink-0 py-6">
        <div className="container mx-auto px-6">
          <Link href="/" className="flex items-center gap-4 group w-fit">
            <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🐾</div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent tracking-tight">
                PAW LOVERS
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">Pet Care Management System</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center relative z-10 py-8">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            © 2025 PAW LOVERS. Hệ thống quản lý dịch vụ chăm sóc thú cưng.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Đồ án OOAD - Nhóm 9 - UIT
          </p>
        </div>
      </footer>
    </div>
  );
}

