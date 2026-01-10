import { MonitoringDriftChart } from "@/components/charts/MonitoringDriftChart";
import { Badge } from "@/components/ui/badge";
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
import { getMonitoringSummary } from "@/lib/api";

export default async function MonitoringPage() {
  const summary = await getMonitoringSummary();
  const chartData = summary.features.slice(0, 6).map((feature) => ({
    feature: feature.feature,
    psi: Number(feature.psi.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Monitoring</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Baseline vs current feature summaries with drift indicators.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drift Snapshot</CardTitle>
          <CardDescription>
            {summary.count} applicants compared against baseline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonitoringDriftChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Drift Details</CardTitle>
          <CardDescription>
            PSI values above 0.2 indicate material drift.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Baseline Mean</TableHead>
                <TableHead>Current Mean</TableHead>
                <TableHead>Mean Shift</TableHead>
                <TableHead>PSI</TableHead>
                <TableHead>Drift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.features.map((feature) => (
                <TableRow key={feature.feature}>
                  <TableCell className="font-medium">
                    {feature.feature}
                  </TableCell>
                  <TableCell>{feature.baseline_mean.toFixed(2)}</TableCell>
                  <TableCell>{feature.current_mean.toFixed(2)}</TableCell>
                  <TableCell>{feature.mean_shift.toFixed(2)}</TableCell>
                  <TableCell>{feature.psi.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        feature.drift_level === "high"
                          ? "danger"
                          : feature.drift_level === "moderate"
                            ? "warning"
                            : "success"
                      }
                    >
                      {feature.drift_level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
