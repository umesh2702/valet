"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
}

export const RatingSelector: React.FC<RatingSelectorProps> = ({ value, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return "Extraordinary / Exceptional 🌟";
      case 4:
        return "Very Good / Enjoyable 😊";
      case 3:
        return "Good / Satisfactory 👍";
      case 2:
        return "Fair / Needs Improvement 😐";
      case 1:
        return "Poor / Disappointed 😞";
      default:
        return "Tap to Rate Your Experience";
    }
  };

  const active = hoverRating || value;

  return (
    <div className="text-center space-y-4 py-4">
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 sm:p-2 transition-transform hover:scale-125 focus:outline-none"
          >
            <Star
              className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-200 ${
                star <= active
                  ? "fill-[#D97706] text-[#D97706] drop-shadow-md"
                  : "text-stone-300"
              }`}
            />
          </button>
        ))}
      </div>

      <p className="font-serif text-sm sm:text-base font-bold text-[#4A150B]">
        {getLabel(active)}
      </p>
    </div>
  );
};
