"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createValetSession } from "@/lib/db";
import { useToast } from "./Toast";
import { Send, User, Phone, Car, Sparkles, Loader2 } from "lucide-react";

export const CustomerForm: React.FC<{ onSuccess?: (sessionId: string) => void }> = ({
  onSuccess,
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [loading, setLoading] = useState(false);

  const fillDemoCustomer = () => {
    setCustomerName("Umesh");
    setMobileNumber("+91 9876543210");
    setVehicleNumber("TS09 AB 1234");
    setVehicleModel("Toyota Fortuner");
    showToast("Demo Customer Auto-Filled", "Umesh - Toyota Fortuner (TS09 AB 1234)", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("Validation Error", "Please enter customer name", "error");
      return;
    }
    if (!mobileNumber.trim()) {
      showToast("Validation Error", "Please enter mobile number", "error");
      return;
    }
    if (!vehicleNumber.trim()) {
      showToast("Validation Error", "Please enter vehicle registration number", "error");
      return;
    }

    try {
      setLoading(true);
      const { sessionId, vehicle } = await createValetSession({
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim() || "Sedan/SUV",
      });

      showToast(
        "WhatsApp Message Dispatched",
        `Sent welcome link to ${customerName} (${vehicle.vehicle_number})`,
        "success"
      );

      if (onSuccess) {
        onSuccess(sessionId);
      } else {
        router.push(`/whatsapp?session=${sessionId}`);
      }
    } catch (err: unknown) {
      showToast("Error", (err as Error).message || "Failed to dispatch valet session", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FBF7EE] rounded-2xl border border-[#EADBC8] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EADBC8]">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#4A150B]">New Valet Entry</h3>
          <p className="text-xs text-[#6B5E55]">
            Register incoming vehicle & send customer WhatsApp welcome link
          </p>
        </div>

        <button
          type="button"
          onClick={fillDemoCustomer}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3EAD8] text-[#4A150B] border border-[#D97706]/40 hover:bg-[#D97706] hover:text-white transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D97706] group-hover:text-white" />
          Use Demo Customer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Umesh"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Car Number */}
          <div>
            <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-1.5">
              Car Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. TS09 AB 1234"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-sm uppercase text-[#2C1810] font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Car Model */}
          <div>
            <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-1.5">
              Car Model
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Toyota Fortuner"
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#4A150B] text-[#FFFDF7] font-bold text-sm hover:bg-[#3B0F07] active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
          ) : (
            <Send className="w-4 h-4 text-[#D97706]" />
          )}
          SEND WHATSAPP
        </button>
      </form>
    </div>
  );
};
