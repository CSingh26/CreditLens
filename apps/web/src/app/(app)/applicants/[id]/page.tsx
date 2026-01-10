"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApplicant, getApplicantScore, scoreApplicant } from "@/lib/api";
import type { Applicant, FeatureContribution, ScoreResponse } from "@/lib/types";

const whatIfFields = [
  { key: "LIMIT_BAL", label: "Credit Limit" },
  { key: "AGE", label: "Age" },
  { key: "PAY_0", label: "Recent Payment Status (PAY_0)" },
  { key: "BILL_AMT1", label: "Recent Bill (BILL_AMT1)" },
] as const;

type WhatIfKey = (typeof whatIfFields)[number]["key"];
const FEATURE_KEYS = [
  "LIMIT_BAL",
  "SEX",
  "EDUCATION",
  "MARRIAGE",
  "AGE",
  "PAY_0",
  "PAY_2",
  "PAY_3",
  "PAY_4",
  "PAY_5",
  "PAY_6",
  "BILL_AMT1",
  "BILL_AMT2",
  "BILL_AMT3",
  "BILL_AMT4",
  "BILL_AMT5",
  "BILL_AMT6",
  "PAY_AMT1",
  "PAY_AMT2",
  "PAY_AMT3",
  "PAY_AMT4",
  "PAY_AMT5",
  "PAY_AMT6",
] as const;

export default function ApplicantDetailPage() {
  const params = useParams();
  const applicantId = params?.id as string;
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [whatIfScore, setWhatIfScore] = useState<ScoreResponse | null>(null);
  const [whatIf, setWhatIf] = useState<Record<WhatIfKey, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!applicantId) return;
      const data = await getApplicant(applicantId);
      setApplicant(data);
      if (data) {
        setWhatIf({
          LIMIT_BAL: data.LIMIT_BAL,
          AGE: data.AGE,
          PAY_0: data.PAY_0,
          BILL_AMT1: data.BILL_AMT1,
        });
      }
      const scoreData = await getApplicantScore(applicantId);
      setScore(scoreData);
    };
    load();
  }, [applicantId]);

  const basePayload = useMemo(() => {
    if (!applicant) return null;
    return FEATURE_KEYS.reduce<Record<string, number>>((acc, key) => {
      acc[key] = applicant[key as keyof Applicant] as number;
      return acc;
    }, {});
  }, [applicant]);

  const mergedPayload = useMemo(() => {
    if (!basePayload || !whatIf) return null;
    return {
      ...basePayload,
      ...whatIf,
    } as Record<string, number>;
  }, [basePayload, whatIf]);

  const runWhatIf = async () => {
    if (!mergedPayload) return;
    setIsLoading(true);
    const response = await scoreApplicant(mergedPayload);
    setWhatIfScore(response);
    setIsLoading(false);
  };

  const topContributions = (items?: FeatureContribution[] | null) =>
    items?.slice(0, 6) ?? [];

  if (!applicant) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Applicant</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Loading applicant profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Applicant CL-{applicant.id}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Review score, explanations, and simulate changes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score Summary</CardTitle>
            <CardDescription>Current model decision context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs uppercase text-[var(--muted-foreground)]">PD</p>
                <p className="text-3xl font-semibold">
                  {score ? score.pd.toFixed(2) : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--muted-foreground)]">Bucket</p>
                <Badge variant={score?.risk_bucket === "high" ? "danger" : score?.risk_bucket === "medium" ? "warning" : "success"}>
                  {score?.risk_bucket ?? "Unknown"}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--muted-foreground)]">Model</p>
                <p className="text-sm font-medium">
                  {score?.model_name ?? "Not available"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {topContributions(score?.explanations).map((item) => (
                <div
                  key={item.feature}
                  className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2"
                >
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.feature}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.contribution >= 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {item.contribution >= 0 ? "+" : ""}
                    {item.contribution.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What-if Simulation</CardTitle>
            <CardDescription>Adjust key inputs and re-score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {whatIfFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label>{field.label}</Label>
                  <Input
                    type="number"
                    value={whatIf?.[field.key] ?? 0}
                    onChange={(event) =>
                      setWhatIf((prev) =>
                        prev
                          ? {
                              ...prev,
                              [field.key]: Number(event.target.value),
                            }
                          : prev
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <Button onClick={runWhatIf} disabled={!mergedPayload || isLoading}>
              {isLoading ? "Scoring..." : "Run What-if"}
            </Button>
            {whatIfScore && (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-4">
                <p className="text-xs text-[var(--muted-foreground)]">What-if PD</p>
                <p className="text-2xl font-semibold">
                  {whatIfScore.pd.toFixed(2)}
                </p>
                <Badge
                  className="mt-2"
                  variant={
                    whatIfScore.risk_bucket === "high"
                      ? "danger"
                      : whatIfScore.risk_bucket === "medium"
                        ? "warning"
                        : "success"
                  }
                >
                  {whatIfScore.risk_bucket}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
