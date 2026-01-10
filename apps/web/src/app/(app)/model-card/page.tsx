import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function loadModelCard(): string {
  const filePath = path.resolve(
    process.cwd(),
    "..",
    "..",
    "docs",
    "model-card.md"
  );
  if (!fs.existsSync(filePath)) {
    return "# Model Card\n\nModel card is missing. Add docs/model-card.md.";
  }
  return fs.readFileSync(filePath, "utf-8");
}

export default function ModelCardPage() {
  const markdown = loadModelCard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Model Card</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Documentation on data, training, performance, and limitations.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>CreditLens Model Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-[var(--foreground)] [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_code]:rounded [&_code]:bg-[var(--muted)] [&_code]:px-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
