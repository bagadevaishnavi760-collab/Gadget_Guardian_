import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, History, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clearHistory, getHistory, type AnalysisRecord } from "@/services/historyStore";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Gadget Dashboard — EcoLife" },
      {
        name: "description",
        content: "Review previously analyzed gadgets with their health scores, predicted lifespan and e-waste recommendation.",
      },
      { property: "og:title", content: "Your Gadget Dashboard — EcoLife" },
      { property: "og:description", content: "A history of every device you have analyzed with EcoLife." },
    ],
  }),
  component: DashboardPage,
});

const tone: Record<string, string> = {
  Excellent: "bg-primary/10 text-primary",
  Good: "bg-accent text-accent-foreground",
  Moderate: "bg-warning/15 text-warning",
  Poor: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive/15 text-destructive",
};

function DashboardPage() {
  const [rows, setRows] = useState<AnalysisRecord[]>([]);

  useEffect(() => setRows(getHistory()), []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">Your dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Every gadget you have analyzed, newest first.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {rows.length > 0 && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  clearHistory();
                  setRows([]);
                }}
              >
                <Trash2 className="size-4" /> Clear
              </Button>
            )}
            <Button asChild className="rounded-xl">
              <Link to="/analyze">New analysis</Link>
            </Button>
          </div>
        </div>

        {rows.length === 0 ? (
          <Card className="mt-10 rounded-2xl shadow-card">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <History className="size-6" />
              </span>
              <div>
                <h2 className="font-semibold">Nothing analyzed yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your analyses are stored on this device so you can compare gadgets over time.
                </p>
              </div>
              <Button asChild className="rounded-xl">
                <Link to="/analyze">
                  Analyze My Gadget <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-8 overflow-hidden rounded-2xl shadow-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gadget</TableHead>
                    <TableHead>Date analyzed</TableHead>
                    <TableHead>Health score</TableHead>
                    <TableHead>Predicted lifespan</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.result.gadget_type}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[row.result.health_category]}`}>
                          {row.result.health_score}/100 · {row.result.health_category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.result.remaining_months} mo
                        <span className="text-muted-foreground"> ({row.result.remaining_years} yr)</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.result.ewaste_recommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </SiteLayout>
  );
}
