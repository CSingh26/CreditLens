import { ApplicantsTable } from "@/components/applicants/ApplicantsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Applicants</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Explore applicants stored in the underwriting workspace.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Applicant Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicantsTable />
        </CardContent>
      </Card>
    </div>
  );
}
