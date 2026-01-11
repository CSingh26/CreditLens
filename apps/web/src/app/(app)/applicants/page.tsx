import { ApplicantsTable } from "@/components/applicants/ApplicantsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicants } from "@/lib/api";

export default async function ApplicantsPage() {
  const applicants = await getApplicants();

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
        <CardContent className="space-y-6">
          <ApplicantsTable
            initialApplicants={applicants ?? []}
            initialError={!applicants}
          />
        </CardContent>
      </Card>
    </div>
  );
}
