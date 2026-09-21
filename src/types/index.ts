export type ValetStatus =
  | "AVAILABLE"
  | "REQUESTED"
  | "CAR_FOUND"
  | "BRINGING"
  | "READY"
  | "COMPLETED"
  | "NOT_FOUND";

export interface Customer {
  id: string;
  name: string;
  mobile_number: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  vehicle_number: string;
  vehicle_model: string;
  created_at: string;
}

export interface ValetRequest {
  id: string;
  customer_id: string;
  vehicle_id: string;
  status: ValetStatus;
  requested_at: string;
  updated_at: string;
  // Joined relation fields for convenience
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface ReviewSession {
  id: string;
  customer_id: string;
  rating: number;
  selected_feedback: string[];
  generated_review: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageOption {
  id: string;
  label: string;
  action: "bring_car" | "rate_experience" | "view_menu" | "visit_website" | "instagram" | "give_feedback";
  icon?: string;
}

export interface WhatsAppMessage {
  id: string;
  sessionId: string;
  sender: "system" | "valet" | "customer";
  content: string;
  timestamp: string;
  options?: WhatsAppMessageOption[];
}

export interface CreateValetSessionInput {
  customerName: string;
  mobileNumber: string;
  vehicleNumber: string;
  vehicleModel: string;
}

export interface FeedbackSubmission {
  id: string;
  customer_name?: string;
  rating: number;
  feedback_text: string;
  created_at: string;
}
