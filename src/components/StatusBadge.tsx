import React from "react";
import { ValetStatus } from "@/types";
import { Clock, CheckCircle, Car, AlertTriangle, CheckCheck, MapPin } from "lucide-react";

interface StatusBadgeProps {
  status: ValetStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs sm:text-sm gap-1.5 font-semibold",
    lg: "px-4 py-1.5 text-sm sm:text-base gap-2 font-bold",
  };

  switch (status) {
    case "REQUESTED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-sm ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5 animate-spin text-amber-700" />
          Request Received
        </span>
      );
    case "CAR_FOUND":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-100 text-sky-900 border border-sky-300 shadow-sm ${sizeClasses[size]}`}
        >
          <MapPin className="w-3.5 h-3.5 text-sky-700" />
          Car Located
        </span>
      );
    case "BRINGING":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-[#4A150B] text-[#FFFDF7] border border-[#D97706] shadow-md animate-pulse ${sizeClasses[size]}`}
        >
          <Car className="w-3.5 h-3.5 text-[#D97706]" />
          Bringing Car (~2 min)
        </span>
      );
    case "READY":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-sm ${sizeClasses[size]}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
          Car Ready at Pickup
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-stone-100 text-stone-700 border border-stone-300 ${sizeClasses[size]}`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-stone-500" />
          Completed
        </span>
      );
    case "NOT_FOUND":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-900 border border-rose-300 ${sizeClasses[size]}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
          Locating Vehicle...
        </span>
      );
    case "AVAILABLE":
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-[#F3EAD8] text-[#4A150B] border border-[#EADBC8] ${sizeClasses[size]}`}
        >
          <Car className="w-3.5 h-3.5 text-[#D97706]" />
          Parked / Available
        </span>
      );
  }
};
