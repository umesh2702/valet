"use client";

import React, { useState } from "react";
import { saveFeedback } from "@/lib/db";
import { useToast } from "./Toast";
import { Star, X, Send, Heart, Loader2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  customerName = "Valued Guest",
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await saveFeedback(customerName, rating, feedbackText);
      setSubmitted(true);
      showToast("Thank You!", "Thank you for your feedback.", "success");
      setTimeout(() => {
        setSubmitted(false);
        setFeedbackText("");
        onClose();
      }, 1800);
    } catch {
      showToast("Submission Failed", "Could not save feedback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBC8] max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B5E55] hover:text-[#4A150B] p-1 rounded-full hover:bg-[#F3EAD8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 bg-[#F3EAD8] text-[#D97706] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Heart className="w-8 h-8 fill-[#D97706]" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#4A150B]">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-[#6B5E55]">
              We deeply appreciate your thoughts and look forward to serving you again at Itihaas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center pb-2 border-b border-[#EADBC8]">
              <h3 className="font-serif font-bold text-xl text-[#4A150B]">Direct Feedback</h3>
              <p className="text-xs text-[#6B5E55] mt-1">
                Share your thoughts directly with Itihaas management
              </p>
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-2 text-center">
                Your Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-[#D97706] text-[#D97706]"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text Area */}
            <div>
              <label className="block text-xs font-bold text-[#4A150B] uppercase tracking-wider mb-1.5">
                Comments & Suggestions
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you loved or how we can improve..."
                rows={4}
                required
                className="w-full p-3 bg-[#FBF7EE] border border-[#EADBC8] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 focus:border-[#D97706] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 rounded-xl bg-[#4A150B] text-[#FFFDF7] font-bold text-sm hover:bg-[#3B0F07] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
              ) : (
                <Send className="w-4 h-4 text-[#D97706]" />
              )}
              SUBMIT FEEDBACK
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
