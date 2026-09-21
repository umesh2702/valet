"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { restaurantConfig } from "@/config/restaurantConfig";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  getWhatsAppMessages,
  addCustomerWhatsAppMessage,
  updateValetStatus,
  getValetRequestById,
  getCurrentActiveSessionId,
  subscribeToDBUpdates,
  syncWhatsAppMessagesForStatus,
} from "@/lib/db";
import { ValetRequest, WhatsAppMessage as WhatsAppMessageType, WhatsAppMessageOption } from "@/types";
import { WhatsAppMessage } from "./WhatsAppMessage";
import { WhatsAppOption } from "./WhatsAppOption";
import { useToast } from "./Toast";
import {
  Send,
  Car,
  Loader2,
  CheckCircle,
  MoreVertical,
  PhoneCall,
  Video,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

interface WhatsAppSimulatorProps {
  sessionId?: string;
}

export function WhatsAppSimulator({ sessionId: propSessionId }: WhatsAppSimulatorProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(propSessionId || null);
  const [messages, setMessages] = useState<WhatsAppMessageType[]>([]);
  const [valetRequest, setValetRequest] = useState<ValetRequest | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "RECONNECTING" | "OFFLINE">(
    isSupabaseConfigured ? "RECONNECTING" : "OFFLINE"
  );

  // Ref to hold current valet request to prevent stale-closure issues in polling and event callbacks
  const valetRequestRef = useRef<ValetRequest | null>(valetRequest);
  useEffect(() => {
    valetRequestRef.current = valetRequest;
  }, [valetRequest]);

  // Main data sync function
  const loadData = useCallback(async () => {
    try {
      let currentId = propSessionId || activeSessionId;

      if (!currentId) {
        currentId = await getCurrentActiveSessionId();
        if (currentId) {
          setActiveSessionId(currentId);
        }
      }

      console.log("[WhatsApp Sync] active request:", currentId);

      if (currentId) {
        const req = await getValetRequestById(currentId);
        console.log("[WhatsApp Sync] DB status:", req?.status);

        setValetRequest(req || null);
        valetRequestRef.current = req || null;

        if (req) {
          const msgs = syncWhatsAppMessagesForStatus(currentId, req);
          setMessages([...msgs]);
          console.log("[WhatsApp Sync] UI status:", req.status);
        } else {
          const msgs = getWhatsAppMessages(currentId);
          setMessages([...msgs]);
        }
      } else {
        setMessages([]);
        setValetRequest(null);
        valetRequestRef.current = null;
      }
    } catch (err: unknown) {
      console.error("[WhatsApp Sync] load error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to resolve active valet session";
      setErrorState(errMsg);
    } finally {
      setLoading(false);
    }
  }, [propSessionId, activeSessionId]);

  // Direct Supabase Realtime Subscription & 1.5s Fallback Polling
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await loadData();
    };
    void init();

    let channel: RealtimeChannel | null = null;

    if (isSupabaseConfigured && supabase && activeSessionId) {
      const channelName = `whatsapp_realtime_${activeSessionId}`;
      console.log("[WhatsApp Sync] establishing realtime channel:", channelName);

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "valet_requests",
            filter: `id=eq.${activeSessionId}`,
          },
          async (payload) => {
            if (!isMounted) return;
            console.log("[WhatsApp Sync] realtime update received:", payload);
            console.log("[WhatsApp Sync] DB status:", payload.new?.status);

            // Fetch latest full request object from Supabase (including joined customer & vehicle)
            const freshReq = await getValetRequestById(activeSessionId);
            if (freshReq && isMounted) {
              console.log("[WhatsApp Sync] UI status:", freshReq.status);
              valetRequestRef.current = freshReq;
              setValetRequest(freshReq);

              const updatedMsgs = syncWhatsAppMessagesForStatus(activeSessionId, freshReq);
              setMessages([...updatedMsgs]);
              console.log("[WhatsApp Sync] message added:", freshReq.status);
            }
          }
        )
        .subscribe((status) => {
          if (!isMounted) return;
          console.log("[WhatsApp Sync] realtime subscribed:", status);
          if (status === "SUBSCRIBED") {
            setConnectionStatus("CONNECTED");
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnectionStatus("RECONNECTING");
          }
        });
    }

    // Subscribe to DB update events as additional fallback
    const unsubscribeLocalDB = subscribeToDBUpdates(() => {
      if (isMounted) void loadData();
    });

    // 1.5-Second Resilient Fallback Polling
    const interval = setInterval(async () => {
      if (!isMounted || !activeSessionId) return;

      const latestReq = await getValetRequestById(activeSessionId);
      if (latestReq && latestReq.status !== valetRequestRef.current?.status) {
        console.log(
          "[WhatsApp Sync] polling detected change:",
          valetRequestRef.current?.status,
          "->",
          latestReq.status
        );
        valetRequestRef.current = latestReq;
        setValetRequest(latestReq);

        const updatedMsgs = syncWhatsAppMessagesForStatus(activeSessionId, latestReq);
        setMessages([...updatedMsgs]);
        console.log("[WhatsApp Sync] message added via polling:", latestReq.status);
      }
    }, 1500);

    return () => {
      isMounted = false;
      if (channel) {
        console.log("[WhatsApp Sync] cleaning up channel for:", activeSessionId);
        if (supabase) supabase.removeChannel(channel);
      }
      unsubscribeLocalDB();
      clearInterval(interval);
    };
  }, [loadData, activeSessionId]);

  useEffect(() => {
    // Smoothly scroll to bottom on new messages or status changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, valetRequest?.status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#4A150B] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
        <p className="text-xs text-[#6B5E55] font-semibold">Connecting to active valet session...</p>
      </div>
    );
  }

  // User-visible error state fallback if unexpected failure occurs
  if (errorState) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#FFFDF7] rounded-3xl border border-red-200 shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-xl text-[#4A150B]">
          Session Connection Issue
        </h3>
        <p className="text-xs text-[#6B5E55] leading-relaxed max-w-xs mx-auto">
          {errorState}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setErrorState(null);
            loadData();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A150B] text-[#FFFDF7] text-xs font-bold shadow-md hover:bg-[#3B0F07] transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Clean empty state when no active session exists
  if (!activeSessionId || !valetRequest) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#FFFDF7] rounded-3xl border border-[#EADBC8] shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#F3EAD8] text-[#D97706] flex items-center justify-center mx-auto shadow-sm">
          <Car className="w-8 h-8 text-[#D97706]" />
        </div>
        <h3 className="font-serif font-bold text-xl text-[#4A150B]">
          No Active Valet Session
        </h3>
        <p className="text-xs text-[#6B5E55] leading-relaxed max-w-xs mx-auto">
          No active vehicle check-in found. Please register a customer from the Valet Dashboard to begin the simulated WhatsApp experience.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A150B] text-[#FFFDF7] text-xs font-bold shadow-md hover:bg-[#3B0F07] transition-all"
        >
          Go to Valet Dashboard
        </Link>
      </div>
    );
  }

  const handleOptionSelect = async (opt: WhatsAppMessageOption) => {
    if (!activeSessionId) return;

    // 1. Post customer choice text into conversation
    addCustomerWhatsAppMessage(activeSessionId, opt.label);
    setMessages([...getWhatsAppMessages(activeSessionId)]);

    // 2. Handle specific action
    if (opt.action === "bring_car") {
      setTyping(true);
      setTimeout(async () => {
        await updateValetStatus(activeSessionId, "REQUESTED");
        setTyping(false);
        showToast("Car Request Dispatched", "Valet team notified on dashboard", "success");
      }, 600);
    } else if (opt.action === "rate_experience") {
      showToast("Redirecting to Review", "Opening Itihaas Review Generator", "info");
      router.push(`/review/${activeSessionId}`);
    } else if (opt.action === "view_menu") {
      router.push("/menu");
    } else if (opt.action === "visit_website") {
      window.open(restaurantConfig.websiteUrl, "_blank");
    } else if (opt.action === "instagram") {
      window.open(restaurantConfig.instagramUrl, "_blank");
    } else if (opt.action === "give_feedback") {
      setIsFeedbackOpen(true);
    }
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || !activeSessionId) return;

    addCustomerWhatsAppMessage(activeSessionId, customInput.trim());
    setCustomInput("");
    setMessages([...getWhatsAppMessages(activeSessionId)]);

    // Simulated valet auto-response for generic text
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-auto-${Date.now()}`,
          sessionId: activeSessionId,
          sender: "valet",
          content:
            "Thank you for your message! Our valet team is at your service. Click *Bring My Car* anytime you are ready.",
          timestamp: time,
        },
      ]);
    }, 1000);
  };

  // Determine active options dynamically based on current valet status
  const currentStatus = valetRequest?.status || "AVAILABLE";

  const initialOptions: WhatsAppMessageOption[] = [
    { id: "opt-1", label: "🚘 Bring My Car", action: "bring_car" },
    { id: "opt-2", label: "⭐ Rate Your Experience", action: "rate_experience" },
    { id: "opt-3", label: "🍽️ View Menu", action: "view_menu" },
    { id: "opt-4", label: "🌐 Visit Website", action: "visit_website" },
    { id: "opt-5", label: "📸 Instagram", action: "instagram" },
    { id: "opt-6", label: "💬 Give Feedback", action: "give_feedback" },
  ];

  const completedOptions: WhatsAppMessageOption[] = [
    { id: "opt-2", label: "⭐ Rate Your Experience", action: "rate_experience" },
    { id: "opt-3", label: "🍽️ View Menu", action: "view_menu" },
    { id: "opt-4", label: "🌐 Visit Website", action: "visit_website" },
    { id: "opt-5", label: "📸 Instagram", action: "instagram" },
    { id: "opt-6", label: "💬 Give Feedback", action: "give_feedback" },
  ];

  let visibleOptions: WhatsAppMessageOption[] = [];
  if (currentStatus === "AVAILABLE") {
    visibleOptions = initialOptions;
  } else if (currentStatus === "COMPLETED") {
    visibleOptions = completedOptions;
  }

  return (
    <div className="max-w-md mx-auto h-[85vh] sm:h-[780px] bg-[#E5DDD5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2C1810] flex flex-col relative font-sans">
      {/* 1. Header Bar */}
      <div className="bg-[#4A150B] text-[#FFFDF7] px-4 py-3 flex items-center justify-between border-b border-[#D97706]/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-[#FFFDF7] p-0.5 border border-[#D97706] shadow-sm">
            <Image
              src={restaurantConfig.logo}
              alt={restaurantConfig.name}
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#4A150B] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-wide text-[#FFFDF7]">Itihaas Valet</h3>
              <CheckCircle className="w-3.5 h-3.5 fill-[#25D366] text-white" />
            </div>
            <p className="text-[11px] text-[#F3EAD8]/80">
              {typing
                ? "typing..."
                : connectionStatus === "CONNECTED"
                ? "Online • Live Sync"
                : connectionStatus === "RECONNECTING"
                ? "Reconnecting..."
                : "Online • Valet Service Active"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#F3EAD8]/80">
          <Video className="w-4 h-4 hover:text-white cursor-pointer" />
          <PhoneCall className="w-4 h-4 hover:text-white cursor-pointer" />
          <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* 2. Simulation Watermark Banner */}
      <div className="bg-[#F3EAD8] text-[#4A150B] px-3 py-1 text-[11px] font-semibold flex items-center justify-between border-b border-[#EADBC8] shrink-0">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D97706]" />
          ULink WhatsApp Simulation
        </span>
        <span className="text-[10px] text-[#6B5E55] font-mono">
          {valetRequest?.vehicle?.vehicle_number}
        </span>
      </div>

      {/* 3. Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Encrypted Notice Banner */}
        <div className="bg-[#FCF4CB] text-[#54656F] text-[10px] text-center p-2 rounded-lg max-w-[90%] mx-auto shadow-xs border border-[#F5E898] mb-4">
          🔒 End-to-end simulated session for Itihaas Valet & Guest Services.
        </div>

        {/* Vehicle Details Context Card */}
        {valetRequest?.vehicle && (
          <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#EADBC8] shadow-xs mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F3EAD8] text-[#4A150B] flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#D97706]" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#6B5E55] block font-bold">
                Guest: {valetRequest.customer?.name} ({valetRequest.customer?.mobile_number})
              </span>
              <span className="font-mono font-bold text-[#4A150B] text-sm">
                {valetRequest.vehicle.vehicle_number}
              </span>{" "}
              <span className="text-[#6B5E55]">({valetRequest.vehicle.vehicle_model})</span>
            </div>
          </div>
        )}

        {/* Render Message List */}
        {messages.map((msg) => (
          <WhatsAppMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-center gap-2 text-xs text-[#6B5E55] italic bg-white p-2 rounded-xl max-w-[130px] shadow-xs border border-[#EADBC8]">
            <span className="animate-pulse">Itihaas typing...</span>
          </div>
        )}

        {/* Render State-Aware Interactive Action Options */}
        {visibleOptions.length > 0 && (
          <WhatsAppOption options={visibleOptions} onSelect={handleOptionSelect} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Input Bar */}
      <form
        onSubmit={handleCustomSend}
        className="bg-[#F0F2F5] p-3 border-t border-stone-300 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 py-2 px-4 bg-white rounded-full text-xs sm:text-sm text-[#111B21] focus:outline-none border border-stone-300 focus:border-[#4A150B]"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="w-10 h-10 rounded-full bg-[#4A150B] text-[#FFFDF7] flex items-center justify-center hover:bg-[#3B0F07] transition-all disabled:opacity-40 shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4 text-[#D97706]" />
        </button>
      </form>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        customerName={valetRequest?.customer?.name}
      />
    </div>
  );
};
