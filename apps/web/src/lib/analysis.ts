export type Economics = { expected_loss: number; expected_interest: number; funding_cost: number;
  operating_cost: number; expected_contribution: number; break_even_rate: number | null; };
export type LendingResult = Economics & { stress: Economics; debt_to_income: number | null;
  credit_utilization: number | null; monthly_cash_after_debt_and_interest: number | null; explanations: string[] };
export type ThresholdResult = { threshold: number; approved_count: number;
  expected_approved_loss: number; expected_approved_contribution: number; realized_approved_contribution: number;
  precision: number | null; recall: number | null; confusion: { tn: number; fp: number; fn: number; tp: number } };
export type CohortResult = ThresholdResult & { source: string; observation_period: string; count: number;
  brier_score: number; baseline_brier_score: number; limitations: string;
  calibration: { lower: number; upper: number; count: number; mean_pd: number | null; default_rate: number | null }[];
  threshold_sweep: ThresholdResult[] };
export async function analyze<T>(path: string, payload: unknown): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  let response: Response;
  try { response = await fetch(`${base}/analysis/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }); } catch { throw new Error('Data unavailable. Start the API and check the configured URL.'); }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = Array.isArray(body?.detail) ? body.detail.map((e: {loc: string[]; msg: string}) => `${e.loc.join('.')}: ${e.msg}`).join('; ') : body?.detail;
    throw new Error(detail || `Analysis unavailable (${response.status})`);
  }
  return response.json() as Promise<T>;
}
