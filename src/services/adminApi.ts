const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:5000";

export interface AdminStats {
  total_analyses: number;
  average_health_score: number | null;
  gadget_type_counts: Record<string, number>;
  health_category_counts: Record<string, number>;
  ewaste_recommendation_counts: Record<string, number>;
}

export interface AnalysisRecord {
  id: number;
  created_at: string;
  input: {
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
  };
  remaining_months: number;
  remaining_years: number;
  health_score: number;
  health_category: string;
  ewaste_recommendation: string;
  model: string;
  result: {
    gadget_type: string;
    remaining_months: number;
    remaining_years: number;
    health_score: number;
    health_category: string;
    ewaste_recommendation: string;
    model: string;
  };
}

export interface AdminAnalytics {
  gadget_type_counts: Record<string, number>;
  health_category_counts: Record<string, number>;
  ewaste_recommendation_counts: Record<string, number>;
  remaining_lifespan: {
    count: number;
    average_months: number | null;
    median_months: number | null;
    min_months: number | null;
    max_months: number | null;
  };
}

export interface AnalysesResponse {
  analyses: AnalysisRecord[];
  limit: number;
  offset: number;
  total: number;
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

export async function getAllAdminAnalyses(): Promise<AnalysisRecord[]> {
  const pageSize = 200;
  const firstPage = await getAdminAnalyses(pageSize, 0);
  const analyses = [...firstPage.analyses];

  for (let offset = pageSize; offset < firstPage.total; offset += pageSize) {
    const page = await getAdminAnalyses(pageSize, offset);
    analyses.push(...page.analyses);
  }

  return analyses;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch(`${API_BASE_URL}/admin/analytics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analytics (${res.status})`);
  }
  return (await res.json()) as AdminAnalytics;
}
