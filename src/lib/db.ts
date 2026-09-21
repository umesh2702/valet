import { supabase, isSupabaseConfigured } from "./supabaseClient";
import {
  Customer,
  Vehicle,
  ValetRequest,
  ValetStatus,
  ReviewSession,
  WhatsAppMessage,
  CreateValetSessionInput,
  FeedbackSubmission,
} from "@/types";

// In-Memory & LocalStorage fallback store
const localCustomers: Customer[] = [];
const localVehicles: Vehicle[] = [];
const localRequests: ValetRequest[] = [];
const localReviewSessions: Record<string, ReviewSession> = {};
const localMessages: Record<string, WhatsAppMessage[]> = {};
const localFeedbacks: FeedbackSubmission[] = [];
let currentActiveSessionId: string | null = null;

// Event emitter for reactive local sync
type Listener = () => void;
const listeners = new Set<Listener>();

export type RealtimeConnectionStatus = "CONNECTED" | "RECONNECTING" | "OFFLINE";
let currentRealtimeStatus: RealtimeConnectionStatus = isSupabaseConfigured ? "RECONNECTING" : "OFFLINE";

const statusListeners = new Set<(status: RealtimeConnectionStatus) => void>();

export function subscribeToRealtimeStatus(callback: (status: RealtimeConnectionStatus) => void) {
  statusListeners.add(callback);
  callback(currentRealtimeStatus);
  return () => {
    statusListeners.delete(callback);
  };
}

function updateRealtimeStatus(status: RealtimeConnectionStatus) {
  currentRealtimeStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ulink_valet_update"));
  }
}

// Global Supabase Realtime Channel Subscription
if (typeof window !== "undefined" && isSupabaseConfigured && supabase) {
  supabase
    .channel("valet_requests_realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "valet_requests",
      },
      (payload) => {
        console.log("[Realtime] valet request event:", payload.eventType, payload.new);
        notifyListeners();
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] subscription status:", status);
      if (status === "SUBSCRIBED") {
        updateRealtimeStatus("CONNECTED");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        updateRealtimeStatus("RECONNECTING");
      }
    });
}

export function subscribeToDBUpdates(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("ulink_valet_update", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("ulink_valet_update", callback);
    }
  };
}

/**
 * Active Session Management (Laptop & Phone Sync)
 */
export function setCurrentActiveSessionId(
  sessionId: string,
  request?: ValetRequest,
  messages?: WhatsAppMessage[]
) {
  currentActiveSessionId = sessionId;
  if (typeof window !== "undefined") {
    localStorage.setItem("ulink_active_session_id", sessionId);
    fetch("/api/active-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        request,
        messages,
        allRequests: localRequests,
      }),
    }).catch(() => {});
  }
  notifyListeners();
}

export async function getCurrentActiveSessionId(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/active-session");
      if (res.ok) {
        const data = await res.json();
        console.log("ACTIVE SESSION RESPONSE:", data);
        if (data.sessionId) {
          currentActiveSessionId = data.sessionId;
          if (data.request) {
            const exists = localRequests.some((r) => r.id === data.request.id);
            if (!exists) localRequests.unshift(data.request);
          }
          if (data.messages && data.messages.length > 0) {
            localMessages[data.sessionId] = data.messages;
          }
          if (data.allRequests && Array.isArray(data.allRequests)) {
            data.allRequests.forEach((req: ValetRequest) => {
              if (req && !localRequests.some((r) => r.id === req.id)) {
                localRequests.push(req);
              }
            });
          }
          return data.sessionId;
        }
      }
    } catch (err) {
      console.error("Error fetching active session:", err);
    }

    const stored = localStorage.getItem("ulink_active_session_id");
    if (stored) {
      currentActiveSessionId = stored;
      return stored;
    }
  }

  if (currentActiveSessionId) return currentActiveSessionId;

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("valet_requests")
      .select("id")
      .order("requested_at", { ascending: false })
      .limit(1)
      .single();
    if (data?.id) {
      currentActiveSessionId = data.id;
      return data.id;
    }
  }

  if (localRequests.length > 0) {
    currentActiveSessionId = localRequests[0].id;
    return currentActiveSessionId;
  }

  return null;
}

/**
 * 1. Create or Find Customer
 */
export async function getOrCreateCustomer(name: string, mobile: string): Promise<Customer> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("mobile_number", mobile)
      .single();

    if (existing) return existing as Customer;

    const { data: created, error } = await supabase
      .from("customers")
      .insert([{ name, mobile_number: mobile }])
      .select()
      .single();

    if (error) throw error;
    return created as Customer;
  }

  // Local Store Fallback
  let found = localCustomers.find((c) => c.mobile_number === mobile);
  if (!found) {
    found = {
      id: `cust-${Date.now()}`,
      name,
      mobile_number: mobile,
      created_at: new Date().toISOString(),
    };
    localCustomers.push(found);
  }
  notifyListeners();
  return found;
}

/**
 * 2. Create or Find Vehicle
 */
export async function getOrCreateVehicle(
  customerId: string,
  vehicleNumber: string,
  vehicleModel: string
): Promise<Vehicle> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", customerId)
      .eq("vehicle_number", vehicleNumber)
      .single();

    if (existing) return existing as Vehicle;

    const { data: created, error } = await supabase
      .from("vehicles")
      .insert([
        {
          customer_id: customerId,
          vehicle_number: vehicleNumber,
          vehicle_model: vehicleModel,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return created as Vehicle;
  }

  // Local Store Fallback
  let found = localVehicles.find(
    (v) => v.customer_id === customerId && v.vehicle_number === vehicleNumber
  );
  if (!found) {
    found = {
      id: `veh-${Date.now()}`,
      customer_id: customerId,
      vehicle_number: vehicleNumber,
      vehicle_model: vehicleModel,
      created_at: new Date().toISOString(),
    };
    localVehicles.push(found);
  }
  notifyListeners();
  return found;
}

/**
 * 3. Create Valet Request & Session
 */
export async function createValetSession(input: CreateValetSessionInput): Promise<{
  customer: Customer;
  vehicle: Vehicle;
  request: ValetRequest;
  sessionId: string;
}> {
  const customer = await getOrCreateCustomer(input.customerName, input.mobileNumber);
  const vehicle = await getOrCreateVehicle(customer.id, input.vehicleNumber, input.vehicleModel);

  if (isSupabaseConfigured && supabase) {
    const { data: createdReq, error } = await supabase
      .from("valet_requests")
      .insert([
        {
          customer_id: customer.id,
          vehicle_id: vehicle.id,
          status: "AVAILABLE",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const reqObj: ValetRequest = {
      ...(createdReq as ValetRequest),
      customer,
      vehicle,
    };

    const initialMsgs = initializeWhatsAppMessages(reqObj.id, customer, vehicle);
    setCurrentActiveSessionId(reqObj.id, reqObj, initialMsgs);
    return { customer, vehicle, request: reqObj, sessionId: reqObj.id };
  }

  // Local Store Fallback
  const request: ValetRequest = {
    id: `req-${Date.now()}`,
    customer_id: customer.id,
    vehicle_id: vehicle.id,
    status: "AVAILABLE",
    requested_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer,
    vehicle,
  };
  localRequests.unshift(request);
  const initialMsgs = initializeWhatsAppMessages(request.id, customer, vehicle);
  setCurrentActiveSessionId(request.id, request, initialMsgs);
  notifyListeners();
  return { customer, vehicle, request, sessionId: request.id };
}

/**
 * 4. Get Valet Request by ID
 */
export async function getValetRequestById(id: string): Promise<ValetRequest | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("valet_requests")
      .select("*, customer:customers(*), vehicle:vehicles(*)")
      .eq("id", id)
      .single();

    if (!error && data) {
      const freshReq = data as ValetRequest;
      const idx = localRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        localRequests[idx] = freshReq;
      } else {
        localRequests.unshift(freshReq);
      }
      return freshReq;
    }
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/active-session?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.request) {
          const reqObj = data.request as ValetRequest;
          const idx = localRequests.findIndex((r) => r.id === reqObj.id);
          if (idx !== -1) {
            localRequests[idx] = reqObj;
          } else {
            localRequests.unshift(reqObj);
          }
          return reqObj;
        }
      }
    } catch (err) {
      console.error("Error fetching request by ID:", err);
    }
  }

  return localRequests.find((r) => r.id === id) || null;
}

/**
 * 5. Get All Valet Requests
 */
export async function getAllValetRequests(): Promise<ValetRequest[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/active-session");
      if (res.ok) {
        const data = await res.json();
        if (data.allRequests && Array.isArray(data.allRequests)) {
          data.allRequests.forEach((req: ValetRequest) => {
            if (req && !localRequests.some((r) => r.id === req.id)) {
              localRequests.push(req);
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("valet_requests")
      .select("*, customer:customers(*), vehicle:vehicles(*)")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return localRequests;
    }
    return (data as ValetRequest[]) || [];
  }

  return [...localRequests];
}

/**
 * 6. Update Valet Request Status
 */
export async function updateValetStatus(
  requestId: string,
  newStatus: ValetStatus
): Promise<ValetRequest | null> {
  const timestamp = new Date().toISOString();

  let updatedRequest: ValetRequest | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("valet_requests")
      .update({ status: newStatus, updated_at: timestamp })
      .eq("id", requestId)
      .select("*, customer:customers(*), vehicle:vehicles(*)")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
    } else if (data) {
      updatedRequest = data as ValetRequest;
      const idx = localRequests.findIndex((r) => r.id === requestId);
      if (idx !== -1) {
        localRequests[idx] = updatedRequest;
      } else {
        localRequests.unshift(updatedRequest);
      }
    }
  }

  if (!updatedRequest) {
    let req = localRequests.find((r) => r.id === requestId);
    if (!req) {
      req = (await getValetRequestById(requestId)) || undefined;
    }
    if (req) {
      req.status = newStatus;
      req.updated_at = timestamp;
      updatedRequest = req;
    }
  }

  if (updatedRequest) {
    syncWhatsAppMessagesForStatus(requestId, updatedRequest);
    const msgs = getWhatsAppMessages(requestId);
    setCurrentActiveSessionId(requestId, updatedRequest, msgs);
    notifyListeners();
  }

  return updatedRequest;
}

/**
 * 7. Simulated WhatsApp Messages Storage & Logic
 */
export function initializeWhatsAppMessages(
  sessionId: string,
  customer: Customer,
  vehicle: Vehicle
): WhatsAppMessage[] {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const welcomeText = `🚗 *Welcome to Itihaas!*

Your vehicle has been received by our valet team.

*Vehicle:* ${vehicle.vehicle_number}
*Model:* ${vehicle.vehicle_model}

Whenever you're ready to leave, please let us know before coming to the valet pickup area.

What would you like to do?`;

  const initialMsgs: WhatsAppMessage[] = [
    {
      id: `msg-1-${Date.now()}`,
      sessionId,
      sender: "valet",
      content: welcomeText,
      timestamp: time,
    },
  ];

  localMessages[sessionId] = initialMsgs;
  return initialMsgs;
}

export function getWhatsAppMessages(sessionId: string): WhatsAppMessage[] {
  if (!localMessages[sessionId]) {
    const req = localRequests.find((r) => r.id === sessionId);
    if (req && req.customer && req.vehicle) {
      initializeWhatsAppMessages(sessionId, req.customer, req.vehicle);
    } else {
      localMessages[sessionId] = [];
    }
  }
  return localMessages[sessionId];
}

export function addCustomerWhatsAppMessage(sessionId: string, text: string) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msgs = getWhatsAppMessages(sessionId);
  
  // Prevent duplicate consecutive identical customer messages
  const lastMsg = msgs[msgs.length - 1];
  if (lastMsg && lastMsg.sender === "customer" && lastMsg.content === text) {
    return;
  }

  msgs.push({
    id: `msg-cust-${Date.now()}`,
    sessionId,
    sender: "customer",
    content: text,
    timestamp: time,
  });

  const req = localRequests.find((r) => r.id === sessionId);
  if (req) {
    setCurrentActiveSessionId(sessionId, req, msgs);
  } else {
    notifyListeners();
  }
}

export function syncWhatsAppMessagesForStatus(sessionId: string, req: ValetRequest): WhatsAppMessage[] {
  if (!req || !req.vehicle) return getWhatsAppMessages(sessionId);
  const vehicle = req.vehicle;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const msgs = getWhatsAppMessages(sessionId);
  const statusOrder: ValetStatus[] = ["REQUESTED", "CAR_FOUND", "BRINGING", "READY", "COMPLETED"];
  const currentIdx = statusOrder.indexOf(req.status);

  if (currentIdx >= 0) {
    for (let i = 0; i <= currentIdx; i++) {
      const st = statusOrder[i];
      let text = "";
      if (st === "REQUESTED") {
        text = `🚘 *Vehicle Request Received*\n\nWe're checking for your vehicle now.\n\nPlease wait a moment.`;
      } else if (st === "CAR_FOUND") {
        text = `✅ *We've located your vehicle.*\n\nYour car is now being prepared for pickup.`;
      } else if (st === "BRINGING") {
        text = `🚗 *Your vehicle is on its way.*\n\nWe're bringing your car to the pickup area.\n\n⏱️ *Estimated arrival:* approximately 2 minutes.`;
      } else if (st === "READY") {
        text = `✅ *Your car is ready.*\n\n*Vehicle:* ${vehicle.vehicle_number}\n*Model:* ${vehicle.vehicle_model}\n\nPlease proceed to the valet pickup area.`;
      } else if (st === "COMPLETED") {
        text = `✨ *Thank you for visiting Itihaas!*\n\nWe hope you enjoyed your time with us.\n\nHave a safe drive! 🚗`;
      }

      if (text) {
        const exists = msgs.some((m) => m.sender === "valet" && m.content === text);
        if (!exists) {
          msgs.push({
            id: `msg-valet-${st.toLowerCase()}-${Date.now()}`,
            sessionId,
            sender: "valet",
            content: text,
            timestamp: time,
          });

          if (st === "COMPLETED") {
            const followUpText = "Is there anything else we can help you with?";
            const followUpExists = msgs.some((m) => m.sender === "valet" && m.content === followUpText);
            if (!followUpExists) {
              msgs.push({
                id: `msg-followup-${Date.now()}`,
                sessionId,
                sender: "valet",
                content: followUpText,
                timestamp: time,
              });
            }
          }
        }
      }
    }
  }

  return msgs;
}

export function appendStatusWhatsAppMessage(sessionId: string, status: ValetStatus) {
  const req = localRequests.find((r) => r.id === sessionId);
  if (!req || !req.vehicle) return;

  const vehicle = req.vehicle;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msgs = getWhatsAppMessages(sessionId);

  let text = "";
  if (status === "REQUESTED") {
    text = `🚘 *Vehicle Request Received*\n\nWe're checking for your vehicle now.\n\nPlease wait a moment.`;
  } else if (status === "CAR_FOUND") {
    text = `✅ *We've located your vehicle.*\n\nYour car is now being prepared for pickup.`;
  } else if (status === "BRINGING") {
    text = `🚗 *Your vehicle is on its way.*\n\nWe're bringing your car to the pickup area.\n\n⏱️ *Estimated arrival:* approximately 2 minutes.`;
  } else if (status === "READY") {
    text = `✅ *Your car is ready.*\n\n*Vehicle:* ${vehicle.vehicle_number}\n*Model:* ${vehicle.vehicle_model}\n\nPlease proceed to the valet pickup area.`;
  } else if (status === "NOT_FOUND") {
    text = `⚠️ *We're still locating your vehicle.*\n\nOur valet team is checking and will update you shortly.`;
  } else if (status === "COMPLETED") {
    text = `✨ *Thank you for visiting Itihaas!*\n\nWe hope you enjoyed your time with us.\n\nHave a safe drive! 🚗`;
  }

  if (text) {
    const exists = msgs.some((m) => m.sender === "valet" && m.content === text);
    if (!exists) {
      msgs.push({
        id: `msg-valet-${Date.now()}`,
        sessionId,
        sender: "valet",
        content: text,
        timestamp: time,
      });

      if (status === "COMPLETED") {
        const followUpText = "Is there anything else we can help you with?";
        const followUpExists = msgs.some((m) => m.sender === "valet" && m.content === followUpText);
        if (!followUpExists) {
          msgs.push({
            id: `msg-followup-${Date.now()}`,
            sessionId,
            sender: "valet",
            content: followUpText,
            timestamp: time,
          });
        }
      }

      setCurrentActiveSessionId(sessionId, req, msgs);
    }
  }
}

/**
 * 8. Review Session & Feedback DB APIs
 */
export async function createOrUpdateReviewSession(
  sessionId: string,
  rating: number,
  selected_feedback: string[],
  generated_review: string
): Promise<ReviewSession> {
  const req = (await getValetRequestById(sessionId)) || localRequests.find((r) => r.id === sessionId);

  const isValidUuid = (str?: string) =>
    !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const dbCustomerId = isValidUuid(req?.customer_id) ? req?.customer_id : null;
  const dbValetRequestId = isValidUuid(sessionId) ? sessionId : null;

  const sessionData: ReviewSession = {
    id: sessionId,
    customer_id: req?.customer_id || "guest-cust",
    rating,
    selected_feedback,
    generated_review,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from("review_sessions").upsert([
      {
        valet_request_id: dbValetRequestId,
        customer_id: dbCustomerId,
        rating,
        selected_feedback,
        generated_review,
      },
    ]);
  }

  localReviewSessions[sessionId] = sessionData;
  notifyListeners();
  return sessionData;
}

export async function getReviewSessionById(sessionId: string): Promise<ReviewSession | null> {
  if (localReviewSessions[sessionId]) return localReviewSessions[sessionId];

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("review_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (data) return data as ReviewSession;
  }

  const req = localRequests.find((r) => r.id === sessionId);

  return {
    id: sessionId,
    customer_id: req?.customer_id || "guest-cust",
    rating: 5,
    selected_feedback: ["Food", "Taste", "Ambience", "Service"],
    generated_review:
      "Had an extraordinary dining experience at Itihaas! The food was delicious and the taste was authentic. Wonderful ambience and exceptional service.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function saveFeedback(customerName: string, rating: number, feedbackText: string) {
  const entry: FeedbackSubmission = {
    id: `fb-${Date.now()}`,
    customer_name: customerName || "Guest",
    rating,
    feedback_text: feedbackText,
    created_at: new Date().toISOString(),
  };
  localFeedbacks.push(entry);
  notifyListeners();
  return entry;
}
