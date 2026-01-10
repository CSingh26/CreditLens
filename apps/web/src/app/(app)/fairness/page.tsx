import { FairnessBarChart } from "@/components/charts/FairnessBarChart";
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
import { getFairnessReport } from "@/lib/api";

export default async function FairnessPage() {
  const report = await getFairnessReport();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Fairness Diagnostics</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {report.notes}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Metrics</CardTitle>
          <CardDescription>Aggregate performance at the selected threshold.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-[var(--muted)] p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Selection Rate</p>
            <p className="text-xl font-semibold">
              {(report.overall.selection_rate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-[var(--muted)] p-4">
            <p className="text-xs text-[var(--muted-foreground)]">TPR</p>
            <p className="text-xl font-semibold">
              {(report.overall.tpr * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-[var(--muted)] p-4">
            <p className="text-xs text-[var(--muted-foreground)]">FPR</p>
            <p className="text-xl font-semibold">
              {(report.overall.fpr * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-[var(--muted)] p-4">
            <p className="text-xs text-[var(--muted-foreground)]">AUC</p>
            <p className="text-xl font-semibold">
              {report.overall.auc ? report.overall.auc.toFixed(2) : "--"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {report.slices.map((slice) => (
          <Card key={slice.feature}>
            <CardHeader>
              <CardTitle>{slice.feature}</CardTitle>
              <CardDescription>Group-level selection and error rates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Selection Rate</TableHead>
                    <TableHead>TPR</TableHead>
                    <TableHead>FPR</TableHead>
                    <TableHead>AUC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slice.groups.map((group) => (
                    <TableRow key={group.group}>
                      <TableCell className="font-medium">{group.group}</TableCell>
                      <TableCell>{group.count}</TableCell>
                      <TableCell>
                        {(group.selection_rate * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{(group.tpr * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(group.fpr * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        {group.auc ? group.auc.toFixed(2) : "--"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <FairnessBarChart
                data={slice.groups.map((group) => ({
                  group: group.group,
                  tpr: Number((group.tpr * 100).toFixed(1)),
                  fpr: Number((group.fpr * 100).toFixed(1)),
                }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
