"use client";

import React, { use, useState, useEffect } from "react";
import { ReviewFlow } from "@/components/ReviewFlow";
import { getCurrentActiveSessionId } from "@/lib/db";

export default function ReviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const [activeSessionId, setActiveSessionId] = useState<string>(resolvedParams.sessionId);

  useEffect(() => {
    if (!resolvedParams.sessionId || resolvedParams.sessionId === "demo-req-001" || resolvedParams.sessionId === "active") {
      getCurrentActiveSessionId().then((id) => {
        if (id) setActiveSessionId(id);
      });
    }
  }, [resolvedParams.sessionId]);

  return (
    <div className="py-4">
      <ReviewFlow sessionId={activeSessionId} />
    </div>
  );
}
