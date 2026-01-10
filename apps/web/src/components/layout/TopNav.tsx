import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function TopNav() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">
          CreditLens Underwriter Console
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Score decisions with explainability and fairness diagnostics.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="w-64 pl-9"
            placeholder="Search applicants"
            type="search"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
