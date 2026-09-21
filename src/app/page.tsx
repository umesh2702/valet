"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { restaurantConfig } from "@/config/restaurantConfig";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  Utensils,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Presentation Hero Banner */}
      <div className="bg-[#4A150B] rounded-3xl p-8 sm:p-12 text-[#FFFDF7] border-2 border-[#D97706]/40 shadow-xl relative overflow-hidden text-center">
        {/* Decorative ambient lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D97706]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D97706]/20 border border-[#D97706]/40 text-[#D97706] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            ULink Valet by UCreates
          </div>

          <div className="relative w-24 h-24 rounded-full bg-[#FFFDF7] p-1.5 border-2 border-[#D97706] mx-auto shadow-md">
            <Image
              src={restaurantConfig.logo}
              alt={restaurantConfig.name}
              width={96}
              height={96}
              className="object-contain"
            />
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#FFFDF7] leading-tight">
            Customer Experience & Valet Management
          </h1>

          <p className="text-sm sm:text-base text-[#F3EAD8]/90 font-light italic">
            &quot;{restaurantConfig.tagline}&quot;
          </p>

          <p className="text-xs sm:text-sm text-[#F3EAD8]/80 max-w-lg mx-auto leading-relaxed">
            Elevating guest hospitality from valet check-in to post-dining Google reviews. Experience seamless WhatsApp customer updates, real-time car retrieval, and dining touchpoints.
          </p>
        </div>
      </div>

      {/* Demonstration Modules Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="font-serif font-bold text-2xl text-[#4A150B]">
            Interactive Concept Presentation
          </h2>
          <p className="text-xs text-[#6B5E55] mt-1">
            Click any module below to demonstrate the end-to-end Itihaas guest journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Valet Staff Dashboard */}
          <Link
            href="/dashboard"
            className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-6 shadow-sm hover:shadow-xl hover:border-[#D97706] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A150B] text-[#FFFDF7] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#D97706] transition-colors">
                <LayoutDashboard className="w-6 h-6 text-[#D97706] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                    Valet Staff Dashboard
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#6B5E55] mt-1 leading-relaxed">
                  Register arriving guests, send instant WhatsApp links, manage live car retrieval requests, and update vehicle pickup status.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: Customer WhatsApp Simulator */}
          <Link
            href="/whatsapp"
            className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-6 shadow-sm hover:shadow-xl hover:border-[#D97706] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A150B] text-[#FFFDF7] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#25D366] transition-colors">
                <MessageSquare className="w-6 h-6 text-[#25D366] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                    Customer WhatsApp Simulator
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#6B5E55] mt-1 leading-relaxed">
                  Experience the guest view: welcome confirmation, 1-click car retrieval, live progress updates, menu access, and feedback.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: Review Flow Generator */}
          <Link
            href="/review/demo-req-001"
            className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-6 shadow-sm hover:shadow-xl hover:border-[#D97706] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A150B] text-[#FFFDF7] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#D97706] transition-colors">
                <Star className="w-6 h-6 text-[#D97706] group-hover:text-white fill-[#D97706] group-hover:fill-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                    Review Flow Generator
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#6B5E55] mt-1 leading-relaxed">
                  Guided 4-step guest experience transforming star ratings and dining feedback into authentic reviews with 1-click Google handoff.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: Itihaas Digital Menu */}
          <Link
            href="/menu"
            className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-6 shadow-sm hover:shadow-xl hover:border-[#D97706] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A150B] text-[#FFFDF7] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#D97706] transition-colors">
                <Utensils className="w-6 h-6 text-[#D97706] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                    Itihaas Digital Menu
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#6B5E55] mt-1 leading-relaxed">
                  Browse royal starters, main course delicacies, biryani, and desserts presented in Itihaas&apos;s signature traditional brand aesthetic.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
