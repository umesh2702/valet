import React from "react";
import Image from "next/image";
import { WhatsAppMessage as WhatsAppMessageType } from "@/types";
import { restaurantConfig } from "@/config/restaurantConfig";
import { CheckCheck } from "lucide-react";

interface WhatsAppMessageProps {
  message: WhatsAppMessageType;
}

export const WhatsAppMessage: React.FC<WhatsAppMessageProps> = ({ message }) => {
  const isCustomer = message.sender === "customer";

  // Formatter for *bold* text in messages
  const formatText = (content: string) => {
    const parts = content.split(/(\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <strong key={idx} className="font-bold">
            {part.slice(1, -1)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${
        isCustomer ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      {/* Valet Avatar */}
      {!isCustomer && (
        <div className="relative w-7 h-7 rounded-full bg-[#FFFDF7] border border-[#D97706]/40 p-0.5 shrink-0 shadow-sm">
          <Image
            src={restaurantConfig.logo}
            alt={restaurantConfig.name}
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm relative leading-relaxed ${
          isCustomer
            ? "bg-[#E2F4C7] text-[#111B21] rounded-br-none border border-[#C5E89B]"
            : "bg-white text-[#111B21] rounded-bl-none border border-[#EADBC8]"
        }`}
      >
        <div className="whitespace-pre-line text-[#111B21]">
          {formatText(message.content)}
        </div>

        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
          <span>{message.timestamp}</span>
          {isCustomer && <CheckCheck className="w-3.5 h-3.5 text-[#53Bdeb]" />}
        </div>
      </div>
    </div>
  );
};
