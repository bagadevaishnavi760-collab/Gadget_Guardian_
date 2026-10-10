import type { GadgetInput, PredictionResult } from "./predictionApi";

export interface AnalysisRecord {
  id: string;
  date: string;
  input: GadgetInput;
  result: PredictionResult;
}

const KEY = "ecolife:history";
const LAST = "ecolife:last";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getHistory(): AnalysisRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<AnalysisRecord[]>(localStorage.getItem(KEY), []);
}

export function saveAnalysis(input: GadgetInput, result: PredictionResult): AnalysisRecord {
  const record: AnalysisRecord = {
    id: result.record_id ?? `${Date.now()}`,
    date: result.created_at ?? new Date().toISOString(),
    input,
    result,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify([record, ...getHistory()].slice(0, 25)));
    localStorage.setItem(LAST, JSON.stringify(record));
  }
  return record;
}

export function getLastAnalysis(): AnalysisRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse<AnalysisRecord | null>(localStorage.getItem(LAST), null);
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(LAST);
}
