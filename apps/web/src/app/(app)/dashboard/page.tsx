import { ArrowUpRight } from "lucide-react";

import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getModelMetrics } from "@/lib/api";

export default async function DashboardPage() {
  const metrics = await getModelMetrics();
  const riskData = [
    { name: "Low", value: 54 },
    { name: "Medium", value: 31 },
    { name: "High", value: 15 },
  ];

  const recentScores = [
    { id: "CL-2041", name: "Applicant 2041", score: 0.18, bucket: "Low" },
    { id: "CL-1993", name: "Applicant 1993", score: 0.42, bucket: "Medium" },
    { id: "CL-1762", name: "Applicant 1762", score: 0.71, bucket: "High" },
    { id: "CL-2207", name: "Applicant 2207", score: 0.27, bucket: "Medium" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Portfolio Overview</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Snapshot of model performance and risk distribution.
          </p>
        </div>
        <Button variant="outline">
          Export metrics <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>ROC-AUC</CardDescription>
            <CardTitle>{metrics.test_metrics.roc_auc.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)]">
            Model: {metrics.selected_model}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>PR-AUC</CardDescription>
            <CardTitle>{metrics.test_metrics.pr_auc.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)]">
            Default rate: {(metrics.test_metrics.default_rate * 100).toFixed(1)}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Brier Score</CardDescription>
            <CardTitle>{metrics.test_metrics.brier_score.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)]">
            Selection rate: {(metrics.test_metrics.predicted_rate * 100).toFixed(1)}%
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current portfolio scoring buckets.</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={riskData} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              {riskData.map((bucket) => (
                <div key={bucket.name} className="rounded-lg bg-[var(--muted)] p-3">
                  <p className="text-[var(--muted-foreground)]">{bucket.name}</p>
                  <p className="text-lg font-semibold">{bucket.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
            <CardDescription>Latest decisions for manual review.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>PD</TableHead>
                  <TableHead>Bucket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScores.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {row.id}
                      </div>
                    </TableCell>
                    <TableCell>{row.score.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.bucket === "Low"
                            ? "success"
                            : row.bucket === "Medium"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {row.bucket}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
