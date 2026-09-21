"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { restaurantConfig } from "@/config/restaurantConfig";
import { generateReviewText } from "@/lib/reviewGenerator";
import { createOrUpdateReviewSession, getReviewSessionById } from "@/lib/db";
import { RatingSelector } from "./RatingSelector";
import { FeedbackSelector } from "./FeedbackSelector";
import { useToast } from "./Toast";
import {
  Sparkles,
  Copy,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Edit3,
  HeartHandshake,
} from "lucide-react";

interface ReviewFlowProps {
  sessionId: string;
}

export const ReviewFlow: React.FC<ReviewFlowProps> = ({ sessionId }) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Food",
    "Taste",
    "Ambience",
    "Service",
  ]);
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReviewSessionById(sessionId).then((existing) => {
      if (existing) {
        if (existing.rating) setRating(existing.rating);
        if (existing.selected_feedback?.length) setSelectedTags(existing.selected_feedback);
        if (existing.generated_review) setReviewText(existing.generated_review);
      }
    });
  }, [sessionId]);

  const handleGenerateReview = async () => {
    const generated = generateReviewText({ rating, tags: selectedTags });
    setReviewText(generated);
    await createOrUpdateReviewSession(sessionId, rating, selectedTags, generated);
    setStep(3);
  };

  const handleCopyReview = async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      showToast("Review copied!", "Review text copied to clipboard", "success");

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast("Copy Failed", "Please manually copy the text", "error");
    }
  };

  const handleContinueToGoogle = async () => {
    await handleCopyReview();
    setStep(4);

    setTimeout(() => {
      window.open(restaurantConfig.googleReviewUrl, "_blank");
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto bg-[#FFFDF7] rounded-3xl border border-[#EADBC8] shadow-xl overflow-hidden my-6">
      {/* Header Banner */}
      <div className="bg-[#4A150B] p-6 text-center text-[#FFFDF7] border-b border-[#D97706]/40 relative">
        <div className="relative w-16 h-16 rounded-full bg-[#FFFDF7] p-1 border-2 border-[#D97706] mx-auto mb-3 shadow-md">
          <Image
            src={restaurantConfig.logo}
            alt={restaurantConfig.name}
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#FFFDF7]">
          {restaurantConfig.name}
        </h2>
        <p className="text-xs text-[#F3EAD8]/80 mt-1 uppercase tracking-widest font-semibold">
          Customer Review Generator
        </p>

        {/* Progress Tracker Bar */}
        <div className="flex items-center justify-between max-w-xs mx-auto mt-6 pt-4 border-t border-[#F3EAD8]/20 text-xs">
          {[
            { num: 1, label: "Rating" },
            { num: 2, label: "Experience" },
            { num: 3, label: "Review" },
            { num: 4, label: "Google" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s.num
                    ? "bg-[#D97706] text-white ring-4 ring-[#D97706]/30 shadow-md"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-[#3B0F07] text-[#F3EAD8]/60"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-[10px] ${
                  step === s.num ? "text-[#D97706] font-bold" : "text-[#F3EAD8]/70"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: RATING */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-fade-in">
            <h3 className="font-serif font-bold text-xl text-[#4A150B]">
              How was your experience at Itihaas?
            </h3>
            <p className="text-xs text-[#6B5E55]">
              Select a star rating to help us understand your visit.
            </p>

            <RatingSelector value={rating} onChange={(r) => setRating(r)} />

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#4A150B] text-[#FFFDF7] font-bold text-sm hover:bg-[#3B0F07] transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>CONTINUE TO FEEDBACK</span>
              <ArrowRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP 2: FEEDBACK TAGS */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-fade-in">
            <h3 className="font-serif font-bold text-xl text-[#4A150B]">
              What did you enjoy?
            </h3>
            <p className="text-xs text-[#6B5E55]">
              Tap all the highlights of your dining & valet experience.
            </p>

            <FeedbackSelector selected={selectedTags} onChange={setSelectedTags} />

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-[#EADBC8] text-[#4A150B] font-semibold text-xs hover:bg-[#F3EAD8] transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleGenerateReview}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#4A150B] text-[#FFFDF7] font-bold text-sm hover:bg-[#3B0F07] transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                GENERATE REVIEW
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW GENERATED & EDITING */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h3 className="font-serif font-bold text-xl text-[#4A150B]">Your Review</h3>
              <p className="text-xs text-[#6B5E55] mt-1">
                We synthesized a personalized review based on your feedback. You can edit it if desired.
              </p>
            </div>

            {/* Editable Review Text Box */}
            <div className="relative">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                readOnly={!isEditing}
                rows={5}
                className={`w-full p-4 rounded-2xl text-sm leading-relaxed transition-all ${
                  isEditing
                    ? "bg-[#FFFDF7] border-2 border-[#D97706] text-[#2C1810] shadow-md focus:outline-none"
                    : "bg-[#FBF7EE] border border-[#EADBC8] text-[#2C1810]"
                }`}
              />

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F3EAD8] text-[#4A150B] border border-[#EADBC8] hover:bg-[#D97706] hover:text-white transition-colors flex items-center gap-1 shadow-xs"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? "DONE EDITING" : "EDIT"}
              </button>
            </div>

            {/* Buttons: COPY REVIEW & CONTINUE TO GOOGLE */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCopyReview}
                className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#4A150B] text-[#4A150B] font-bold text-sm hover:bg-[#F3EAD8] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>REVIEW COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#D97706]" />
                    <span>COPY REVIEW</span>
                  </>
                )}
              </button>

              <button
                onClick={handleContinueToGoogle}
                className="w-full py-4 px-6 rounded-2xl bg-[#4A150B] text-[#FFFDF7] font-bold text-sm hover:bg-[#3B0F07] transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>CONTINUE TO GOOGLE REVIEW</span>
                <ExternalLink className="w-4 h-4 text-[#D97706] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: GOOGLE HANDOFF CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-fade-in py-4">
            <div className="w-16 h-16 rounded-full bg-[#F3EAD8] text-[#D97706] flex items-center justify-center mx-auto shadow-sm">
              <HeartHandshake className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-2xl text-[#4A150B]">
                Review Copied!
              </h3>
              <p className="text-sm text-[#6B5E55] max-w-sm mx-auto mt-2 leading-relaxed">
                Your review has been copied to your clipboard. Paste it directly into Google to submit!
              </p>
            </div>

            <div className="bg-[#FBF7EE] p-4 rounded-2xl border border-[#EADBC8] text-xs text-[#4A150B] font-medium max-w-md mx-auto">
              💡 <strong>Next Step:</strong> Simply long-press or right-click in Google&apos;s review text field and select <strong>Paste</strong>.
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.open(restaurantConfig.googleReviewUrl, "_blank")}
                className="py-3 px-6 rounded-xl bg-[#4A150B] text-[#FFFDF7] font-bold text-xs hover:bg-[#3B0F07] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
                RE-OPEN GOOGLE REVIEWS
              </button>

              <button
                onClick={() => setStep(1)}
                className="py-3 px-6 rounded-xl border border-[#EADBC8] text-[#4A150B] font-semibold text-xs hover:bg-[#F3EAD8] transition-colors"
              >
                Start New Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
