"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApplicants } from "@/lib/api";
import type { Applicant } from "@/lib/types";

interface ApplicantsTableProps {
  initialApplicants?: Applicant[];
  initialError?: boolean;
}

export function ApplicantsTable({
  initialApplicants = [],
  initialError = false,
}: ApplicantsTableProps) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(initialError);

  const loadApplicants = async () => {
    setIsLoading(true);
    setHasError(false);
    const data = await getApplicants();
    if (!data) {
      setApplicants([]);
      setHasError(true);
      setIsLoading(false);
      return;
    }
    setApplicants(data);
    setIsLoading(false);
  };

  const filtered = useMemo(() => {
    if (!query) return applicants;
    return applicants.filter((row) =>
      [row.id, row.AGE, row.LIMIT_BAL]
        .map(String)
        .some((value) => value.toLowerCase().includes(query.toLowerCase()))
    );
  }, [applicants, query]);

  const total = applicants.length;
  const avgLimit = total
    ? applicants.reduce((sum, row) => sum + row.LIMIT_BAL, 0) / total
    : 0;
  const avgAge = total
    ? applicants.reduce((sum, row) => sum + row.AGE, 0) / total
    : 0;
  const avgLimitDisplay = total
    ? Math.round(avgLimit).toLocaleString()
    : "--";
  const avgAgeDisplay = total ? avgAge.toFixed(1) : "--";
  const totalDisplay = total ? String(total) : "--";
  const shownLabel = total
    ? `${filtered.length} shown / ${total} total`
    : "No applicants loaded";
  const showEmpty = !isLoading && filtered.length === 0;

  return (
    <div className="space-y-4">
      {hasError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">API offline</p>
          <p className="text-xs text-amber-700">
            Start the API or allow CORS for this origin. Expected base URL:
            {` ${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}`}
          </p>
          <code className="mt-2 block rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">
            cd services/api && python3 -m uvicorn app.main:app --reload
          </code>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted-foreground)]">Total Applicants</p>
          <p className="text-lg font-semibold">{totalDisplay}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted-foreground)]">Avg Credit Limit</p>
          <p className="text-lg font-semibold">
            {avgLimitDisplay === "--" ? "--" : `$${avgLimitDisplay}`}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted-foreground)]">Avg Applicant Age</p>
          <p className="text-lg font-semibold">{avgAgeDisplay}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search by id, age, limit"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={isLoading}
        />
        <div className="flex items-center gap-3">
          {hasError && <Badge variant="warning">API offline</Badge>}
          <Button variant="outline" size="sm" onClick={loadApplicants}>
            Refresh
          </Button>
          <p className="text-xs text-[var(--muted-foreground)]">
            {shownLabel}
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Limit</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>PAY_0</TableHead>
            <TableHead>BILL_AMT1</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <div className="h-4 w-16 rounded bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-10 rounded bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 rounded bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-10 rounded-full bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-10 rounded bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 rounded bg-[var(--muted)]" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 rounded bg-[var(--muted)]" />
                </TableCell>
              </TableRow>
            ))}
          {!isLoading &&
            filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">CL-{row.id}</TableCell>
                <TableCell>{row.AGE}</TableCell>
                <TableCell>${row.LIMIT_BAL.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.SEX === 1 ? "M" : "F"}</Badge>
                </TableCell>
                <TableCell>{row.PAY_0}</TableCell>
                <TableCell>${row.BILL_AMT1.toLocaleString()}</TableCell>
                <TableCell>
                  <Link
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                    href={`/applicants/${row.id}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          {showEmpty && (
            <TableRow>
              <TableCell colSpan={7} className="py-10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium">
                    {hasError
                      ? "Cannot reach the API."
                      : query
                        ? "No applicants match your search."
                        : "No applicants loaded yet."}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {hasError
                      ? "Start the API and try again."
                      : query
                        ? "Adjust your filters or clear the search."
                        : "Run training once and restart the API to seed applicants."}
                  </p>
                  <Button variant="outline" size="sm" onClick={loadApplicants}>
                    Reload
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
