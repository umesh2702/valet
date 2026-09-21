import React from "react";
import { WhatsAppMessageOption } from "@/types";

interface WhatsAppOptionProps {
  options: WhatsAppMessageOption[];
  onSelect: (option: WhatsAppMessageOption) => void;
  disabled?: boolean;
}

export const WhatsAppOption: React.FC<WhatsAppOptionProps> = ({
  options,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2 my-3 pl-9 animate-fade-in max-w-[85%] sm:max-w-[75%]">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FFFDF7] text-[#4A150B] font-semibold text-xs sm:text-sm border border-[#D97706]/40 hover:bg-[#4A150B] hover:text-[#FFFDF7] hover:border-[#4A150B] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center text-center gap-2 group disabled:opacity-50"
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
