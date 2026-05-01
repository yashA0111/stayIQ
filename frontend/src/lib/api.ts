const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const JAVA_API_BASE = process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8080";

// ── Types ────────────────────────────────────────────────────────────

// All features the model expects (after dropping leakage/noise columns)
export interface PredictionInput {
  hotel: string;
  lead_time: number;
  stays_in_weekend_nights: number;
  stays_in_week_nights: number;
  adults: number;
  children: number;
  babies: number;
  meal: string;
  country: string;
  market_segment: string;
  distribution_channel: string;
  is_repeated_guest: number;
  previous_cancellations: number;
  previous_bookings_not_canceled: number;
  reserved_room_type: string;
  assigned_room_type: string;
  booking_changes: number;
  deposit_type: string;
  agent: number;
  days_in_waiting_list: number;
  customer_type: string;
  adr: number;
  required_car_parking_spaces: number;
  total_of_special_requests: number;
}

// Default values for single prediction form
export const DEFAULT_PREDICTION_INPUT: PredictionInput = {
  hotel: "City Hotel",
  lead_time: 45,
  stays_in_weekend_nights: 1,
  stays_in_week_nights: 2,
  adults: 2,
  children: 0,
  babies: 0,
  meal: "BB",
  country: "PRT",
  market_segment: "Online TA",
  distribution_channel: "TA/TO",
  is_repeated_guest: 0,
  previous_cancellations: 0,
  previous_bookings_not_canceled: 0,
  reserved_room_type: "A",
  assigned_room_type: "A",
  booking_changes: 0,
  deposit_type: "No Deposit",
  agent: 9,
  days_in_waiting_list: 0,
  customer_type: "Transient",
  adr: 120,
  required_car_parking_spaces: 0,
  total_of_special_requests: 1,
};

export interface SHAPFeature {
  feature: string;
  impact: number;
  abs_impact: number;
  direction: "up" | "down";
}

export interface PredictionResult {
  probability: number;
  risk: string;
  risk_color: string;
  confidence: number;
  top_features: SHAPFeature[];
  shap_base_value: number;
  input_features: Record<string, number>;
}

export interface BulkPredictionRow {
  row_index: number;
  probability: number;
  risk: string;
  risk_color: string;
}

export interface BulkPredictionResult {
  summary: {
    total_rows: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    high_risk_percentage: number;
    average_probability: number;
  };
  predictions: BulkPredictionRow[];
  feature_importance: { feature: string; importance: number }[];
  risk_distribution: { name: string; value: number; color: string }[];
}

export interface AuditRecord {
  id: number;
  booking_id: number;
  action: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

export interface Booking {
  id: number;
  hotel: string;
  lead_time: number;
  arrival_date: string;
  adults: number;
  children: number;
  adr: number;
  market_segment: string;
  deposit_type: string;
  is_repeated_guest: number;
  previous_cancellations: number;
  special_requests: number;
  days_in_waiting_list: number;
  status: string;
  is_canceled: number;
}

// ── Select options for form dropdowns ────────────────────────────────
export const FORM_OPTIONS = {
  hotel: ["City Hotel", "Resort Hotel"],
  meal: ["BB", "HB", "FB", "SC", "Undefined"],
  market_segment: ["Direct", "Corporate", "Online TA", "Offline TA/TO", "Groups", "Complementary", "Aviation"],
  distribution_channel: ["Direct", "Corporate", "TA/TO", "GDS", "Undefined"],
  deposit_type: ["No Deposit", "Non Refund", "Refundable"],
  customer_type: ["Transient", "Contract", "Group", "Transient-Party"],
  reserved_room_type: ["A", "B", "C", "D", "E", "F", "G", "H", "L"],
  assigned_room_type: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L"],
  country: ["PRT", "GBR", "FRA", "ESP", "DEU", "ITA", "IRL", "BEL", "BRA", "NLD", "USA", "CHE", "CN", "AUT", "SWE", "CHN", "POL", "ISR", "RUS", "NOR", "ROU", "Other"],
};

// ── ML API (Flask) ───────────────────────────────────────────────────
export async function predict(data: PredictionInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

export async function predictBatch(rows: Record<string, unknown>[]): Promise<BulkPredictionResult> {
  const res = await fetch(`${API_BASE}/api/predict_batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error("Batch prediction failed");
  return res.json();
}

export async function getModelHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

// ── Java Backend API (Spring Boot) ───────────────────────────────────
export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${JAVA_API_BASE}/api/bookings`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function cancelBooking(id: number): Promise<void> {
  const res = await fetch(`${JAVA_API_BASE}/api/bookings/${id}/cancel`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to cancel booking");
}

export async function getAuditTrail(): Promise<AuditRecord[]> {
  const res = await fetch(`${JAVA_API_BASE}/api/audit`);
  if (!res.ok) throw new Error("Failed to fetch audit trail");
  return res.json();
}

// ── Mock Data ────────────────────────────────────────────────────────
export const MOCK_BOOKINGS: Booking[] = [
  { id: 1, hotel: "City Hotel", lead_time: 45, arrival_date: "2025-08-15", adults: 2, children: 0, adr: 120.50, market_segment: "Online TA", deposit_type: "No Deposit", is_repeated_guest: 0, previous_cancellations: 0, special_requests: 1, days_in_waiting_list: 0, status: "Confirmed", is_canceled: 0 },
  { id: 2, hotel: "Resort Hotel", lead_time: 120, arrival_date: "2025-09-01", adults: 2, children: 1, adr: 210.00, market_segment: "Direct", deposit_type: "No Deposit", is_repeated_guest: 1, previous_cancellations: 2, special_requests: 3, days_in_waiting_list: 0, status: "Confirmed", is_canceled: 0 },
  { id: 3, hotel: "City Hotel", lead_time: 200, arrival_date: "2025-10-20", adults: 1, children: 0, adr: 85.00, market_segment: "Corporate", deposit_type: "Non Refund", is_repeated_guest: 0, previous_cancellations: 1, special_requests: 0, days_in_waiting_list: 5, status: "Confirmed", is_canceled: 0 },
  { id: 4, hotel: "Resort Hotel", lead_time: 10, arrival_date: "2025-07-28", adults: 2, children: 2, adr: 175.00, market_segment: "Online TA", deposit_type: "No Deposit", is_repeated_guest: 0, previous_cancellations: 0, special_requests: 2, days_in_waiting_list: 0, status: "Canceled", is_canceled: 1 },
  { id: 5, hotel: "City Hotel", lead_time: 300, arrival_date: "2025-12-01", adults: 1, children: 0, adr: 95.00, market_segment: "Groups", deposit_type: "No Deposit", is_repeated_guest: 0, previous_cancellations: 3, special_requests: 0, days_in_waiting_list: 12, status: "Confirmed", is_canceled: 0 },
];

export const MOCK_AUDIT: AuditRecord[] = [
  { id: 1, booking_id: 4, action: "STATUS_CHANGE", old_status: "Confirmed", new_status: "Canceled", changed_at: "2025-07-25T14:30:00Z" },
];

export const MOCK_PREDICTION: PredictionResult = {
  probability: 0.84,
  risk: "HIGH",
  risk_color: "#ef4444",
  confidence: 0.84,
  top_features: [
    { feature: "deposit_type", impact: 0.31, abs_impact: 0.31, direction: "up" },
    { feature: "lead_time", impact: 0.22, abs_impact: 0.22, direction: "up" },
    { feature: "previous_cancellations", impact: 0.15, abs_impact: 0.15, direction: "up" },
    { feature: "total_of_special_requests", impact: -0.12, abs_impact: 0.12, direction: "down" },
    { feature: "is_repeated_guest", impact: -0.08, abs_impact: 0.08, direction: "down" },
    { feature: "adr", impact: 0.06, abs_impact: 0.06, direction: "up" },
    { feature: "market_segment", impact: 0.05, abs_impact: 0.05, direction: "up" },
    { feature: "days_in_waiting_list", impact: 0.03, abs_impact: 0.03, direction: "up" },
  ],
  shap_base_value: 0.37,
  input_features: {},
};

// ── Feature display helpers ──────────────────────────────────────────
export const FEATURE_LABELS: Record<string, string> = {
  hotel: "Hotel Type",
  lead_time: "Lead Time (days)",
  stays_in_weekend_nights: "Weekend Nights",
  stays_in_week_nights: "Weekday Nights",
  adults: "Adults",
  children: "Children",
  babies: "Babies",
  meal: "Meal Plan",
  country: "Country",
  market_segment: "Market Segment",
  distribution_channel: "Distribution Channel",
  is_repeated_guest: "Repeated Guest",
  previous_cancellations: "Previous Cancellations",
  previous_bookings_not_canceled: "Previous Non-Canceled",
  reserved_room_type: "Reserved Room Type",
  assigned_room_type: "Assigned Room Type",
  booking_changes: "Booking Changes",
  deposit_type: "Deposit Type",
  agent: "Agent ID",
  days_in_waiting_list: "Waiting List (days)",
  customer_type: "Customer Type",
  adr: "Avg Daily Rate ($)",
  required_car_parking_spaces: "Parking Spaces",
  total_of_special_requests: "Special Requests",
  total_stay: "Total Stay",
  total_guests: "Total Guests",
  company: "Company",
};

export function humanizeFeature(name: string): string {
  return FEATURE_LABELS[name] || name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
