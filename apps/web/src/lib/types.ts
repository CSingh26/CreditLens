export interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

export interface TestMetrics {
  roc_auc: number;
  pr_auc: number;
  brier_score: number;
  confusion: ConfusionMatrix;
  default_rate: number;
  predicted_rate: number;
}

export interface ModelMetrics {
  selected_model: string;
  test_metrics: TestMetrics;
}

export interface Applicant {
  id: number;
  LIMIT_BAL: number;
  SEX: number;
  EDUCATION: number;
  MARRIAGE: number;
  AGE: number;
  PAY_0: number;
  PAY_2: number;
  PAY_3: number;
  PAY_4: number;
  PAY_5: number;
  PAY_6: number;
  BILL_AMT1: number;
  BILL_AMT2: number;
  BILL_AMT3: number;
  BILL_AMT4: number;
  BILL_AMT5: number;
  BILL_AMT6: number;
  PAY_AMT1: number;
  PAY_AMT2: number;
  PAY_AMT3: number;
  PAY_AMT4: number;
  PAY_AMT5: number;
  PAY_AMT6: number;
  created_at: string;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number;
}

export interface ScoreResponse {
  pd: number;
  risk_bucket: string;
  threshold: number;
  model_name: string;
  explanations?: FeatureContribution[] | null;
}

export interface FairnessGroupMetrics {
  group: string;
  count: number;
  default_rate: number;
  selection_rate: number;
  tpr: number;
  fpr: number;
  auc: number | null;
}

export interface FairnessSlice {
  feature: string;
  groups: FairnessGroupMetrics[];
}

export interface FairnessReport {
  generated_at: string;
  threshold: number;
  notes: string;
  overall: FairnessGroupMetrics;
  slices: FairnessSlice[];
}

export interface MonitoringFeatureSummary {
  feature: string;
  baseline_mean: number;
  current_mean: number;
  mean_shift: number;
  psi: number;
  drift_level: "low" | "moderate" | "high";
}

export interface MonitoringSummary {
  generated_at: string;
  count: number;
  features: MonitoringFeatureSummary[];
}
