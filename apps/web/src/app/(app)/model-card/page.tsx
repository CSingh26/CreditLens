import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModelCardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Model Card</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Model documentation will render here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentation Pending</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Add docs/model-card.md to populate this section.
        </CardContent>
      </Card>
    </div>
  );
}
