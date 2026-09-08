import type {
  Applicant,
  FairnessReport,
  ModelMetrics,
  MonitoringSummary,
  ScoreResponse,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...options,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getModelMetrics(): Promise<ModelMetrics | null> {
  return apiFetch<ModelMetrics>("/model/metrics");
}

export async function getApplicants(
  limit = 200
): Promise<Applicant[] | null> {
  return await apiFetch<Applicant[]>(`/applicants?limit=${limit}&offset=0`);
}

export async function getApplicant(id: string): Promise<Applicant | null> {
  return await apiFetch<Applicant>(`/applicants/${id}`);
}

export async function getApplicantScore(id: string): Promise<ScoreResponse | null> {
  return await apiFetch<ScoreResponse>(`/applicants/${id}/score`, {
    method: "POST",
  });
}

export async function scoreApplicant(payload: Record<string, number>) {
  return await apiFetch<ScoreResponse>("/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getFairnessReport(): Promise<FairnessReport | null> {
  return apiFetch<FairnessReport>("/fairness/report");
}

export async function getMonitoringSummary(): Promise<MonitoringSummary | null> {
  return apiFetch<MonitoringSummary>("/monitoring/summary");
}
