"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ValetRequest, ValetStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { updateValetStatus } from "@/lib/db";
import { useToast } from "./Toast";
import { Car, User, Phone, Clock, MessageSquare, Check, X, ArrowRight, Loader2 } from "lucide-react";

interface ValetRequestCardProps {
  request: ValetRequest;
  onStatusChange?: () => void;
}

export const ValetRequestCard: React.FC<ValetRequestCardProps> = ({
  request,
  onStatusChange,
}) => {
  const { showToast } = useToast();
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: ValetStatus) => {
    try {
      setUpdating(true);
      await updateValetStatus(request.id, newStatus);
      showToast(
        "Valet Status Updated",
        `Vehicle ${request.vehicle?.vehicle_number} updated to ${newStatus}`,
        "success"
      );
      if (onStatusChange) onStatusChange();
    } catch (err: unknown) {
      showToast("Update Failed", (err as Error).message || "Could not update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const requestedTime = request.requested_at
    ? new Date(request.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  return (
    <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBC8] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative top border accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          request.status === "REQUESTED"
            ? "bg-amber-500 animate-pulse"
            : request.status === "CAR_FOUND"
            ? "bg-sky-500"
            : request.status === "BRINGING"
            ? "bg-[#D97706]"
            : request.status === "READY"
            ? "bg-emerald-500"
            : request.status === "COMPLETED"
            ? "bg-stone-400"
            : "bg-rose-500"
        }`}
      />

      {/* Top Row: Customer & Status */}
      <div className="flex items-start justify-between gap-3 mb-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#4A150B]" />
            <h4 className="font-bold text-base text-[#2C1810]">
              {request.customer?.name || "Guest Customer"}
            </h4>
          </div>
          <p className="text-xs text-[#6B5E55] flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3 h-3 text-[#D97706]" />
            {request.customer?.mobile_number || "+91 9876543210"}
          </p>
        </div>

        <StatusBadge status={request.status} size="sm" />
      </div>

      {/* Vehicle Info Box */}
      <div className="bg-[#FBF7EE] p-3 rounded-xl border border-[#EADBC8] my-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#D97706]" />
            <div>
              <span className="font-mono font-bold text-base text-[#4A150B] tracking-wider block">
                {request.vehicle?.vehicle_number || "TS09 AB 1234"}
              </span>
              <span className="text-xs text-[#6B5E55]">
                {request.vehicle?.vehicle_model || "Vehicle"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#6B5E55] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D97706]" />
              {requestedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Actions & WhatsApp link */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EADBC8]/60">
        <Link
          href={`/whatsapp?session=${request.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-[#4A150B] hover:text-[#D97706] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
          View Chat
        </Link>

        {/* Dynamic Action Buttons based on status */}
        <div className="flex items-center gap-2">
          {updating && <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />}

          {!updating && request.status === "REQUESTED" && (
            <>
              <button
                onClick={() => handleStatusUpdate("NOT_FOUND")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                NOT FOUND
              </button>
              <button
                onClick={() => handleStatusUpdate("CAR_FOUND")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#4A150B] text-[#FFFDF7] hover:bg-[#3B0F07] transition-colors flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-[#D97706]" />
                CAR FOUND
              </button>
            </>
          )}

          {!updating && request.status === "CAR_FOUND" && (
            <button
              onClick={() => handleStatusUpdate("BRINGING")}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#D97706] text-white hover:bg-[#B45309] transition-colors flex items-center gap-1 shadow-sm"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              START BRINGING
            </button>
          )}

          {!updating && request.status === "BRINGING" && (
            <button
              onClick={() => handleStatusUpdate("READY")}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              MARK AS READY
            </button>
          )}

          {!updating && request.status === "READY" && (
            <button
              onClick={() => handleStatusUpdate("COMPLETED")}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-stone-800 text-white hover:bg-stone-900 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              MARK COMPLETED
            </button>
          )}

          {!updating && request.status === "NOT_FOUND" && (
            <button
              onClick={() => handleStatusUpdate("CAR_FOUND")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#4A150B] text-[#FFFDF7] hover:bg-[#3B0F07] transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-[#D97706]" />
              CAR FOUND
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
