// app/layout.js
import "@/styles/globals.css";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";

export const metadata = {
  title: "PAW LOVERS - Pet Care Management System",
  description: "Hệ thống quản lý dịch vụ chăm sóc thú cưng chuyên nghiệp",
  keywords: "pet care, quản lý thú cưng, veterinarian, spa thú cưng",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}