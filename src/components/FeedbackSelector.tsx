"use client";

import React from "react";
import { Check } from "lucide-react";

const FEEDBACK_OPTIONS = [
  { id: "Food", label: "🍲 Food Quality" },
  { id: "Taste", label: "😋 Delicious Taste" },
  { id: "Ambience", label: "🏛️ Royal Ambience" },
  { id: "Service", label: "⚡ Prompt Service" },
  { id: "Staff", label: "👨‍🍳 Courteous Staff" },
  { id: "Valet Parking", label: "🚘 Valet Parking" },
  { id: "Cleanliness", label: "✨ Cleanliness" },
  { id: "Hospitality", label: "🤝 Warm Hospitality" },
  { id: "Overall Experience", label: "🌟 Overall Experience" },
];

interface FeedbackSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export const FeedbackSelector: React.FC<FeedbackSelectorProps> = ({ selected, onChange }) => {
  const toggleTag = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((t) => t !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <p className="text-center text-xs text-[#6B5E55] uppercase tracking-wider font-bold">
        Select all options that apply
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {FEEDBACK_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleTag(opt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border shadow-xs ${
                isSelected
                  ? "bg-[#4A150B] text-[#FFFDF7] border-[#D97706] ring-2 ring-[#D97706]/30 shadow-sm scale-[1.02]"
                  : "bg-[#FFFDF7] text-[#2C1810] border-[#EADBC8] hover:bg-[#F3EAD8]/60"
              }`}
            >
              {opt.label}
              {isSelected && <Check className="w-3.5 h-3.5 text-[#D97706]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
