import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/Toast";
import { restaurantConfig } from "@/config/restaurantConfig";

export const metadata: Metadata = {
  title: `${restaurantConfig.name} | ULink Valet`,
  description:
    "ULink Valet - Customer engagement and valet experience system for Itihaas Restaurant & Banquets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FFFDF7] text-[#2C1810] min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="bg-[#4A150B] text-[#FFFDF7] border-t border-[#D97706]/30 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#F3EAD8]/70">
              <p>
                © {new Date().getFullYear()} {restaurantConfig.name}. All rights reserved.
              </p>
              <p className="mt-1 text-[11px] text-[#D97706]">
                ULink Valet Prototype created by UCreates
              </p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
