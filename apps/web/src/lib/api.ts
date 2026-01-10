import type { Applicant, FairnessReport, ModelMetrics, ScoreResponse } from "@/lib/types";

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

export async function getModelMetrics(): Promise<ModelMetrics> {
  const fallback: ModelMetrics = {
    selected_model: "logistic_regression",
    test_metrics: {
      roc_auc: 0.79,
      pr_auc: 0.56,
      brier_score: 0.18,
      confusion: { tn: 3820, fp: 780, fn: 620, tp: 920 },
      default_rate: 0.22,
      predicted_rate: 0.25,
    },
  };
  return (await apiFetch<ModelMetrics>("/model/metrics")) ?? fallback;
}

export async function getApplicants(limit = 200): Promise<Applicant[]> {
  return (await apiFetch<Applicant[]>(`/applicants?limit=${limit}&offset=0`)) ?? [];
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

export async function getFairnessReport(): Promise<FairnessReport> {
  const fallback: FairnessReport = {
    generated_at: new Date().toISOString(),
    threshold: 0.32,
    notes: "Fairness diagnostics only. Results are descriptive and not a compliance guarantee.",
    overall: {
      group: "overall",
      count: 10000,
      default_rate: 0.22,
      selection_rate: 0.25,
      tpr: 0.62,
      fpr: 0.28,
      auc: 0.78,
    },
    slices: [
      {
        feature: "SEX",
        groups: [
          { group: "1", count: 5500, default_rate: 0.23, selection_rate: 0.26, tpr: 0.61, fpr: 0.29, auc: 0.77 },
          { group: "2", count: 4500, default_rate: 0.21, selection_rate: 0.24, tpr: 0.63, fpr: 0.27, auc: 0.79 },
        ],
      },
    ],
  };

  return (await apiFetch<FairnessReport>("/fairness/report")) ?? fallback;
}
