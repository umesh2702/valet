"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { restaurantConfig } from "@/config/restaurantConfig";
import { CustomerForm } from "@/components/CustomerForm";
import { ValetRequestCard } from "@/components/ValetRequestCard";
import {
  getAllValetRequests,
  subscribeToDBUpdates,
  subscribeToRealtimeStatus,
  updateValetStatus,
  RealtimeConnectionStatus,
} from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { ValetRequest, ValetStatus } from "@/types";
import {
  Car,
  Clock,
  CheckCircle,
  RefreshCw,
  Search,
  Radio,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<ValetRequest[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>(
    isSupabaseConfigured ? "RECONNECTING" : "OFFLINE"
  );
  const [activeModalRequest, setActiveModalRequest] = useState<ValetRequest | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Track notified request IDs to prevent duplicate popups
  const notifiedRequestIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getAllValetRequests();

      // On initial load, populate notifiedRequestIds with existing REQUESTED items to avoid initial popup spam
      if (!initialLoadDone.current) {
        data.forEach((r) => {
          if (r.status === "REQUESTED") {
            notifiedRequestIds.current.add(r.id);
          }
        });
        initialLoadDone.current = true;
      } else {
        // Detect newly arrived REQUESTED items
        const newlyRequested = data.find(
          (r) => r.status === "REQUESTED" && !notifiedRequestIds.current.has(r.id)
        );

        if (newlyRequested) {
          console.log("[Dashboard] new request detected:", newlyRequested.id);
          notifiedRequestIds.current.add(newlyRequested.id);
          setActiveModalRequest(newlyRequested);
          showToast("New Car Request Received", `${newlyRequested.customer?.name || "Customer"} requested vehicle pickup`, "info");
        }
      }

      setRequests(data);
    } catch (err) {
      console.error("[Dashboard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const init = async () => {
      await fetchRequests();
    };
    void init();

    // Subscribe to DB updates
    const unsubscribeDB = subscribeToDBUpdates(() => {
      void fetchRequests();
    });

    // Subscribe to Realtime connection status
    const unsubscribeStatus = subscribeToRealtimeStatus((status) => {
      setRealtimeStatus(status);
    });

    // Resilient fallback polling every 1.5 seconds
    const interval = setInterval(() => {
      void fetchRequests();
    }, 1500);

    return () => {
      unsubscribeDB();
      unsubscribeStatus();
      clearInterval(interval);
    };
  }, [fetchRequests]);

  const handleModalAction = async (newStatus: ValetStatus) => {
    if (!activeModalRequest) return;
    const targetId = activeModalRequest.id;

    try {
      setModalLoading(true);

      // Optimistically close modal & update state
      setActiveModalRequest(null);
      
      await updateValetStatus(targetId, newStatus);
      showToast(
        "Status Updated",
        `Vehicle marked as ${newStatus === "CAR_FOUND" ? "Car Found" : "Not Found"}`,
        "success"
      );
      await fetchRequests();
    } catch (err: unknown) {
      console.error("Modal status update error:", err);
      showToast("Unable to update vehicle status. Please try again.", (err as Error).message || "Database update failed", "error");
      await fetchRequests();
    } finally {
      setModalLoading(false);
    }
  };

  // Compute Statistics
  const activeCount = requests.filter((r) =>
    ["REQUESTED", "CAR_FOUND", "BRINGING"].includes(r.status)
  ).length;

  const readyCount = requests.filter((r) => r.status === "READY").length;

  const completedTodayCount = requests.filter((r) => r.status === "COMPLETED").length;

  // Filter requests based on search & tab selection
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.vehicle?.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customer?.mobile_number.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === "NEW") return req.status === "REQUESTED";
    if (filter === "IN_PROGRESS") return ["CAR_FOUND", "BRINGING"].includes(req.status);
    if (filter === "READY") return req.status === "READY";
    if (filter === "COMPLETED") return req.status === "COMPLETED";
    if (filter === "NOT_FOUND") return req.status === "NOT_FOUND";
    return true;
  });

  return (
    <div className="space-y-8 relative">
      {/* 1. Header Banner */}
      <div className="bg-[#4A150B] rounded-3xl p-6 sm:p-8 text-[#FFFDF7] border-2 border-[#D97706]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-16 h-16 rounded-full bg-[#FFFDF7] p-1 border-2 border-[#D97706] shrink-0 shadow-md">
            <Image
              src={restaurantConfig.logo}
              alt={restaurantConfig.name}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#FFFDF7]">
                Valet Operations
              </h1>
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full text-white flex items-center gap-1.5 shadow-sm ${
                  realtimeStatus === "CONNECTED"
                    ? "bg-emerald-600"
                    : realtimeStatus === "RECONNECTING"
                    ? "bg-amber-600"
                    : "bg-stone-600"
                }`}
              >
                <Radio className={`w-3 h-3 ${realtimeStatus === "CONNECTED" ? "text-emerald-200 animate-pulse" : "text-amber-200"}`} />
                {realtimeStatus === "CONNECTED"
                  ? "Connected"
                  : realtimeStatus === "RECONNECTING"
                  ? "Reconnecting..."
                  : "Live Sync"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#F3EAD8]/80 mt-1">
              {restaurantConfig.name} • Real-Time Queue Management
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          className="px-4 py-2 rounded-xl bg-[#F3EAD8]/10 hover:bg-[#F3EAD8]/20 border border-[#D97706]/30 text-xs font-semibold text-[#F3EAD8] flex items-center gap-2 transition-colors relative z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Requests Card */}
        <div className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider block">
              Active Car Requests
            </span>
            <span className="font-serif font-bold text-3xl text-[#4A150B] mt-1 block">
              {activeCount}
            </span>
            <span className="text-[11px] text-[#D97706] font-medium">
              Requested & In-Transit
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-700 animate-spin" />
          </div>
        </div>

        {/* Ready Vehicles Card */}
        <div className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider block">
              Ready at Pickup Area
            </span>
            <span className="font-serif font-bold text-3xl text-emerald-800 mt-1 block">
              {readyCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Awaiting Guest Departure
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        {/* Completed Today Card */}
        <div className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider block">
              Completed Today
            </span>
            <span className="font-serif font-bold text-3xl text-[#2C1810] mt-1 block">
              {completedTodayCount}
            </span>
            <span className="text-[11px] text-[#6B5E55]">Handed over to guest</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F3EAD8] text-[#4A150B] border border-[#EADBC8] flex items-center justify-center">
            <Car className="w-6 h-6 text-[#D97706]" />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Form + Live Request Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Entry Form */}
        <div className="lg:col-span-5">
          <CustomerForm onSuccess={() => fetchRequests()} />
        </div>

        {/* Right Column (7 cols): Request Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#EADBC8]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                  Live Vehicle Queue
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  {filteredRequests.length} vehicle request(s) found
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or plate..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: "ALL", label: "All Queue" },
                { id: "NEW", label: "New (REQUESTED)" },
                { id: "IN_PROGRESS", label: "In Progress" },
                { id: "READY", label: "Ready" },
                { id: "COMPLETED", label: "Completed" },
                { id: "NOT_FOUND", label: "Not Found" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                    filter === tab.id
                      ? "bg-[#4A150B] text-[#FFFDF7]"
                      : "bg-[#FFFDF7] text-[#6B5E55] border border-[#EADBC8] hover:bg-[#F3EAD8]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Request Cards Stream */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-[#FFFDF7] rounded-xl border border-dashed border-[#EADBC8]">
                  <Car className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-serif font-bold text-sm text-[#4A150B]">
                    No Requests in Queue
                  </p>
                  <p className="text-xs text-[#6B5E55] max-w-xs mx-auto mt-1">
                    Register a new customer using the form or click &quot;Use Demo Customer&quot; to test the real-time flow.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <ValetRequestCard
                    key={req.id}
                    request={req}
                    onStatusChange={() => fetchRequests()}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Modal Overlay for Newly Arrived Car Requests */}
      {activeModalRequest && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FBF7EE] border-2 border-[#D97706] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Top Ambient Accent Lighting */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#D97706]/20 blur-xl pointer-events-none" />

            {/* Modal Header */}
            <div>
              <div className="w-16 h-16 rounded-full bg-[#4A150B] text-[#D97706] border-2 border-[#D97706] flex items-center justify-center mx-auto shadow-md mb-3">
                <Car className="w-8 h-8 text-[#D97706]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block mb-1">
                Valet Pickup Request
              </span>
              <h2 className="font-serif font-bold text-2xl text-[#4A150B]">
                🚘 NEW CAR REQUEST
              </h2>
              <p className="text-xs text-[#6B5E55] mt-1">
                Customer has requested their vehicle at pickup area
              </p>
            </div>

            {/* Customer & Vehicle Details Box */}
            <div className="bg-[#FFFDF7] rounded-2xl p-4 border border-[#EADBC8] text-left space-y-3 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B5E55] tracking-wider block">
                  Customer Details
                </span>
                <h3 className="font-serif font-bold text-lg text-[#4A150B]">
                  {activeModalRequest.customer?.name || "Customer"}
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  {activeModalRequest.customer?.mobile_number || ""}
                </p>
              </div>

              <div className="bg-[#FBF7EE] p-3 rounded-xl border border-[#EADBC8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E55] block">
                    Registration
                  </span>
                  <span className="font-mono font-bold text-sm text-[#4A150B]">
                    {activeModalRequest.vehicle?.vehicle_number || ""}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E55] block">
                    Vehicle Model
                  </span>
                  <span className="text-xs font-bold text-[#D97706]">
                    {activeModalRequest.vehicle?.vehicle_model || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleModalAction("CAR_FOUND")}
                disabled={modalLoading}
                className="bg-[#4A150B] hover:bg-[#381008] text-[#FFFDF7] font-bold py-3 px-4 rounded-xl border border-[#D97706]/40 shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                CAR FOUND
              </button>

              <button
                onClick={() => handleModalAction("NOT_FOUND")}
                disabled={modalLoading}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3 px-4 rounded-xl border border-amber-300 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4 text-amber-700" />}
                NOT FOUND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
