"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WhatsAppSimulator } from "@/components/WhatsAppSimulator";
import { Loader2 } from "lucide-react";

function WhatsAppContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || undefined;

  return <WhatsAppSimulator sessionId={sessionId} />;
}

export default function WhatsAppPage() {
  return (
    <div className="py-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 text-[#4A150B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
          </div>
        }
      >
        <WhatsAppContent />
      </Suspense>
    </div>
  );
}
