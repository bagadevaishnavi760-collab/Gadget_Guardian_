/**
 * API service layer.
 *
 * The Flask service is required by default. Set VITE_USE_MOCK=true only for
 * an intentional offline UI demo.
 *
 * IMPORTANT: no real ML logic lives in the frontend on purpose.
 */

export type GadgetType = "Laptop" | "Smartphone" | "Tablet" | "Smartwatch";

export interface GadgetInput {
  gadget_type: GadgetType;
  age_years: number;
  daily_usage_hours: number;
  battery_health: number;
  charge_cycles: number;
  overheating_level: number;
  physical_condition: number;
  maintenance_frequency: number;
  repair_count: number;
  performance_score: number;
  storage_used: number;
  software_updated: boolean;
  environmental_stress: number;
  expected_life_months: number;
}

export type HealthCategory = "Excellent" | "Good" | "Moderate" | "Poor" | "Critical";

export type EWasteAction =
  | "Continue Using"
  | "Repair / Maintain"
  | "Refurbish / Reuse"
  | "Donate / Resell"
  | "Reuse for Parts"
  | "Authorized E-Waste Recycling";

export interface RiskFactor {
  label: string;
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface PredictionResult {
  gadget_type: GadgetType;
  remaining_months: number;
  remaining_years: number;
  health_score: number;
  health_category: HealthCategory;
  risk_factors: RiskFactor[];
  maintenance_recommendations: string[];
  lifespan_extension_tips: string[];
  ewaste_recommendation: EWasteAction;
  reasoning: string[];
  factor_breakdown: { factor: string; impact: number }[];
  model: string;
  record_id?: string;
  created_at?: string;
}

const configuredApiBaseUrl = (import.meta.env["VITE_API_BASE_URL"] ?? "").trim();
const API_BASE_URL = (configuredApiBaseUrl || (import.meta.env.DEV ? "http://127.0.0.1:5000" : "")).replace(/\/$/, "");
const USE_MOCK = import.meta.env["VITE_USE_MOCK"] === "true";

export async function predictGadget(input: GadgetInput): Promise<PredictionResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900));
    return mockPredict(input);
  }

  if (!API_BASE_URL) {
    throw new Error("Prediction service is not configured. Set VITE_API_BASE_URL to the deployed Flask backend URL.");
  }

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error ?? `Prediction failed (${res.status})`);
  return payload as PredictionResult;
}

export interface AnalysisRecordLike {
  id: string;
  date: string;
  input: GadgetInput;
  result: PredictionResult;
}

export interface AdminSummary {
  total_analyses: number;
  total_predictions: number;
  average_health_score: number | null;
  gadget_types: { label: string; count: number }[];
  health_categories: { label: string; count: number }[];
  recommendations: { label: string; count: number }[];
  recent: AnalysisRecordLike[];
}

export interface AdminRecordsResponse {
  records: AnalysisRecordLike[];
  total: number;
  page: number;
  per_page: number;
}

export interface ModelMetricsResponse {
  configured: boolean;
  message?: string;
  metrics?: { mae?: number; mse?: number; rmse?: number; r2?: number };
}

async function adminFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { "X-Admin-Token": token } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? `Admin request failed (${response.status})`);
  return payload as T;
}

export const getAdminSummary = (token: string) => adminFetch<AdminSummary>("/admin/summary", token);
export const getAdminAnalytics = (token: string) =>
  adminFetch<AdminSummary & { lifespan: { value: number; count: number }[] }>("/admin/analytics", token);
export const getAdminRecords = (token: string, query = "") =>
  adminFetch<AdminRecordsResponse>(`/admin/records${query}`, token);
export const getModelMetrics = (token: string) => adminFetch<ModelMetricsResponse>("/admin/model-metrics", token);

/* ---------------------------------------------------------------------------
 * Mock backend stand-in. Replace by pointing VITE_API_BASE_URL at the Python
 * service; nothing else in the UI needs to change.
 * ------------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function mockPredict(i: GadgetInput): PredictionResult {
  const score = clamp(
    Math.round(
      0.3 * i.battery_health +
        0.28 * i.performance_score +
        6 * i.physical_condition +
        4 * i.maintenance_frequency -
        4 * i.overheating_level -
        3 * i.environmental_stress -
        2.5 * i.repair_count -
        2.2 * i.age_years -
        0.9 * i.daily_usage_hours -
        i.charge_cycles / 120 -
        0.08 * i.storage_used +
        (i.software_updated ? 5 : -4) +
        14,
    ),
    3,
    99,
  );

  const remaining = clamp(
    Math.round((i.expected_life_months - i.age_years * 12) * (score / 100) * 1.05),
    0,
    i.expected_life_months,
  );

  const category: HealthCategory =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Moderate" : score >= 30 ? "Poor" : "Critical";

  const risks: RiskFactor[] = [];
  const push = (cond: boolean, label: string, severity: RiskFactor["severity"], detail: string) => {
    if (cond) risks.push({ label, severity, detail });
  };
  push(i.battery_health < 70, "Battery degradation", i.battery_health < 50 ? "high" : "medium", `Battery health at ${i.battery_health}% reduces runtime and stresses other components.`);
  push(i.overheating_level >= 3, "Thermal stress", i.overheating_level >= 4 ? "high" : "medium", `Overheating level ${i.overheating_level}/5 accelerates ageing of the board and battery.`);
  push(i.charge_cycles > 600, "High charge cycles", i.charge_cycles > 1000 ? "high" : "medium", `${i.charge_cycles} cycles logged — most cells fade noticeably beyond 600.`);
  push(i.physical_condition <= 3, "Physical wear", i.physical_condition <= 2 ? "high" : "medium", `Condition rated ${i.physical_condition}/5 — casing or screen damage risks further failure.`);
  push(i.performance_score < 60, "Performance drop", i.performance_score < 40 ? "high" : "medium", `Benchmark/perceived score of ${i.performance_score}/100 suggests throttling or ageing storage.`);
  push(i.storage_used > 85, "Storage saturation", "low", `${i.storage_used}% storage used slows writes and updates.`);
  push(!i.software_updated, "Outdated software", "medium", "Missing updates leave security holes and unoptimised power management.");
  push(i.environmental_stress >= 4, "Harsh environment", "high", "Dust, humidity or heat exposure shortens component life.");
  push(i.maintenance_frequency <= 2, "Low maintenance", "medium", "Infrequent cleaning and servicing compounds every other risk.");
  push(i.daily_usage_hours > 10, "Heavy daily usage", "medium", `${i.daily_usage_hours} h/day of use adds significant wear.`);
  if (risks.length === 0) {
    risks.push({ label: "No major risks", severity: "low", detail: "All monitored parameters are within healthy ranges." });
  }

  const maintenance: string[] = [
    i.battery_health < 75 ? "Plan a battery replacement with an authorised service centre." : "Keep charge between 20% and 80% to preserve the battery.",
    i.overheating_level >= 3 ? "Clean vents/fans and avoid soft surfaces that block airflow." : "Continue using the device on hard, ventilated surfaces.",
    i.storage_used > 80 ? "Free up storage and clear caches to restore write speed." : "Keep at least 20% of storage free.",
    !i.software_updated ? "Install pending OS and security updates." : "Keep automatic updates enabled.",
    i.maintenance_frequency <= 3 ? "Schedule a service/cleaning every 6 months." : "Maintain your current servicing routine.",
  ];

  const tips = [
    "Use the original or certified charger and avoid overnight fast charging.",
    "Enable battery optimisation / adaptive charging modes.",
    "Use a protective case and screen guard to prevent physical damage.",
    "Reduce background apps and startup programs to lower thermal load.",
    "Store the device away from humidity, dust and direct sunlight.",
    "Repair small faults early — they rarely stay small.",
  ];

  let action: EWasteAction;
  if (score >= 80) action = "Continue Using";
  else if (score >= 65) action = "Repair / Maintain";
  else if (score >= 50) action = "Refurbish / Reuse";
  else if (score >= 38) action = "Donate / Resell";
  else if (score >= 22) action = "Reuse for Parts";
  else action = "Authorized E-Waste Recycling";

  const breakdown = [
    { factor: "Battery", impact: Math.round(i.battery_health) },
    { factor: "Performance", impact: Math.round(i.performance_score) },
    { factor: "Condition", impact: i.physical_condition * 20 },
    { factor: "Thermals", impact: (6 - i.overheating_level) * 20 },
    { factor: "Care", impact: i.maintenance_frequency * 20 },
    { factor: "Environment", impact: (6 - i.environmental_stress) * 20 },
  ];

  const reasoning = [
    `The model weighs battery health (${i.battery_health}%) and performance score (${i.performance_score}/100) most heavily; together they set the baseline health of ${score}/100.`,
    `Age of ${i.age_years} year(s) against an expected life of ${i.expected_life_months} months leaves roughly ${remaining} usable month(s).`,
    ...risks.slice(0, 3).map((r) => `${r.label}: ${r.detail}`),
    `Because the health score falls in the "${category}" band, the advised action is "${action}".`,
  ];

  return {
    gadget_type: i.gadget_type,
    remaining_months: remaining,
    remaining_years: Math.round((remaining / 12) * 10) / 10,
    health_score: score,
    health_category: category,
    risk_factors: risks,
    maintenance_recommendations: maintenance,
    lifespan_extension_tips: tips,
    ewaste_recommendation: action,
    reasoning,
    factor_breakdown: breakdown,
    model: "Multiple Linear Regression (mock response)",
  };
}
