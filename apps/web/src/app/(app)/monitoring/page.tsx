import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Monitoring</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Drift summaries will appear here once baseline stats are generated.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Run the training pipeline to capture baseline feature statistics.
        </CardContent>
      </Card>
    </div>
  );
}
