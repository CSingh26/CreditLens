"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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

export function ApplicantsTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getApplicants();
      setApplicants(data);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return applicants;
    return applicants.filter((row) =>
      [row.id, row.AGE, row.LIMIT_BAL]
        .map(String)
        .some((value) => value.toLowerCase().includes(query.toLowerCase()))
    );
  }, [applicants, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search by id, age, limit"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          {filtered.length} applicants loaded
        </p>
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
          {filtered.map((row) => (
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
        </TableBody>
      </Table>
    </div>
  );
}
