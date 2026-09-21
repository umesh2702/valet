"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { restaurantConfig } from "@/config/restaurantConfig";
import { LayoutDashboard, MessageSquare, Utensils, Globe, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Valet Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "WhatsApp View", href: "/whatsapp", icon: MessageSquare },
    { label: "Menu", href: "/menu", icon: Utensils },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#EADBC8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logos & Branding */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#FBF7EE] p-1 border border-[#D97706]/30 group-hover:border-[#D97706] transition-colors">
              <Image
                src={restaurantConfig.logo}
                alt={restaurantConfig.name}
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#4A150B] leading-tight">
                  Itihaas
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-[#4A150B] text-[#FFFDF7] border border-[#D97706]/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#D97706]" />
                  ULink Valet
                </span>
              </div>
              <p className="text-xs text-[#6B5E55] hidden sm:block">
                Restaurant & Banquets • Valet Management
              </p>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3EAD8]/50 p-1.5 rounded-full border border-[#EADBC8]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#4A150B] text-[#FFFDF7] shadow-sm"
                      : "text-[#4A150B] hover:bg-[#EADBC8]/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D97706]" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: UCreates Tech Badge & External Links */}
          <div className="flex items-center gap-3">
            <a
              href={restaurantConfig.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#4A150B] font-medium hover:text-[#D97706] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>

            <div className="flex items-center gap-2 pl-3 border-l border-[#EADBC8]">
              <span className="text-[11px] text-[#6B5E55] hidden sm:inline">Powered by</span>
              <div className="relative w-7 h-7 rounded-md bg-[#FBF7EE] p-0.5 border border-[#EADBC8]">
                <Image
                  src={restaurantConfig.ucreatesLogo}
                  alt="UCreates"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
