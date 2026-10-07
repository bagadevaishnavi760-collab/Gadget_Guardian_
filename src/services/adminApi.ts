const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:5000";

export interface AdminStats {
  total_analyses: number;
  average_health_score: number;
  average_remaining_months: number;
  gadget_type_counts: Record<string, number>;
  health_category_counts: Record<string, number>;
  ewaste_recommendation_counts: Record<string, number>;
}

export interface AnalysisRecord {
  id: number;
  gadget_type: string;
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
  remaining_months: number;
  remaining_years: number;
  health_score: number;
  health_category: string;
  ewaste_recommendation: string;
  model: string;
  risk_factors: Array<{ label: string; severity: string; detail: string }>;
  maintenance_recommendations: string[];
  lifespan_extension_tips: string[];
  reasoning: string[];
  factor_breakdown: Array<{ factor: string; impact: number }>;
  created_at: string;
}

export interface AdminAnalytics {
  total_analyses: number;
  health_score_distribution: Record<string, number>;
  remaining_lifespan_stats: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  health_category_distribution: Record<string, number>;
  ewaste_recommendation_distribution: Record<string, number>;
  gadget_type_distribution: Record<string, number>;
  recent_analyses: Array<{
    id: number;
    gadget_type: string;
    health_score: number;
    health_category: string;
    remaining_months: number;
    ewaste_recommendation: string;
    created_at: string;
  }>;
}

export interface AnalysesResponse {
  analyses: AnalysisRecord[];
  limit: number;
  offset: number;
  count: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/admin/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stats (${res.status})`);
  }
  return (await res.json()) as AdminStats;
}

export async function getAdminAnalyses(limit: number = 100, offset: number = 0): Promise<AnalysesResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/analyses?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analyses (${res.status})`);
  }
  return (await res.json()) as AnalysesResponse;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch(`${API_BASE_URL}/admin/analytics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analytics (${res.status})`);
  }
  return (await res.json()) as AdminAnalytics;
}
