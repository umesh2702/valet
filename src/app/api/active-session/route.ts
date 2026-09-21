import { NextResponse } from "next/server";

// In-Memory store on Next.js server for LAN cross-device synchronization (laptop + phone)
let activeSessionId: string | null = null;
const requestsMap: Record<string, unknown> = {};
const messagesMap: Record<string, unknown[]> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("id");
  const targetId = requestedId || activeSessionId;

  if (!targetId) {
    return NextResponse.json({
      sessionId: null,
      request: null,
      messages: [],
      allRequests: Object.values(requestsMap),
    });
  }

  const reqObj = requestsMap[targetId] || null;
  const msgList = messagesMap[targetId] || [];

  return NextResponse.json({
    sessionId: targetId,
    activeSessionId,
    request: reqObj,
    messages: msgList,
    allRequests: Object.values(requestsMap),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.sessionId) {
      activeSessionId = body.sessionId;
    }
    if (body.request && body.request.id) {
      requestsMap[body.request.id] = body.request;
    }
    if (body.messages && Array.isArray(body.messages) && body.sessionId) {
      messagesMap[body.sessionId] = body.messages;
    }
    if (body.allRequests && Array.isArray(body.allRequests)) {
      body.allRequests.forEach((req: { id?: string }) => {
        if (req && req.id) requestsMap[req.id] = req;
      });
    }

    const currentReq = activeSessionId ? requestsMap[activeSessionId] : null;
    const currentMsgs = activeSessionId ? messagesMap[activeSessionId] || [] : [];

    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
      request: currentReq,
      messages: currentMsgs,
      allRequests: Object.values(requestsMap),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: errMsg }, { status: 400 });
  }
}
