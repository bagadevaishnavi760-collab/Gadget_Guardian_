import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  HeartPulse,
  Lightbulb,
  Recycle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLastAnalysis, type AnalysisRecord } from "@/services/historyStore";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Gadget Health Report — EcoLife" },
      {
        name: "description",
        content: "Predicted remaining lifespan, health score, risk factors and e-waste recommendation for your device.",
      },
      { property: "og:title", content: "Gadget Health Report — EcoLife" },
      { property: "og:description", content: "See your device's health score, risks and the most sustainable next step." },
    ],
  }),
  component: ResultsPage,
});

const categoryTone: Record<string, string> = {
  Excellent: "bg-primary/10 text-primary",
  Good: "bg-accent text-accent-foreground",
  Moderate: "bg-warning/15 text-warning",
  Poor: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive/15 text-destructive",
};

const severityTone: Record<string, string> = {
  low: "bg-primary/10 text-primary",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/10 text-destructive",
};

function Gauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[260px]">
      <path
        d="M 20 95 A 70 70 0 0 1 160 95"
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M 20 95 A 70 70 0 0 1 160 95"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="90" y="82" textAnchor="middle" className="fill-foreground" fontSize="30" fontWeight="700">
        {score}
      </text>
      <text x="90" y="97" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        health score / 100
      </text>
    </svg>
  );
}

function ResultsPage() {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecord(getLastAnalysis());
    setReady(true);
  }, []);

  if (!ready) return <SiteLayout><div className="mx-auto max-w-6xl px-4 py-20" /></SiteLayout>;

  if (!record) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">No analysis yet</h1>
          <p className="mt-3 text-muted-foreground">Run an analysis first and your health report will appear here.</p>
          <Button asChild size="lg" className="mt-8 rounded-xl">
            <Link to="/analyze">
              Analyze My Gadget <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const r = record.result;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{r.gadget_type} health report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Analyzed on {new Date(record.date).toLocaleString()} · {r.model}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-xl">
            <Link to="/analyze">New analysis</Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="rounded-2xl shadow-card">
            <CardContent className="flex flex-col items-center p-6">
              <Gauge score={r.health_score} />
              <span className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryTone[r.health_category]}`}>
                {r.health_category}
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <CalendarClock className="size-5" />
              </span>
              <p className="mt-4 text-sm text-muted-foreground">Predicted remaining lifespan</p>
              <p className="mt-1 text-4xl font-bold tracking-tight">{r.remaining_months} mo</p>
              <p className="text-sm text-muted-foreground">≈ {r.remaining_years} years of useful life</p>
              <Progress value={Math.min(100, (r.remaining_months / record.input.expected_life_months) * 100)} className="mt-5" />
              <p className="mt-2 text-xs text-muted-foreground">
                Against an expected life of {record.input.expected_life_months} months.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl eco-gradient text-primary-foreground shadow-soft">
            <CardContent className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15">
                <Recycle className="size-5" />
              </span>
              <p className="mt-4 text-sm opacity-90">Final e-waste recommendation</p>
              <p className="mt-1 text-2xl font-bold leading-snug">{r.ewaste_recommendation}</p>
              <Button asChild variant="secondary" size="sm" className="mt-5 rounded-xl">
                <Link to="/e-waste-guide">See the e-waste guide</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="size-4 text-primary" /> Health factor breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.factor_breakdown} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="factor" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Bar dataKey="impact" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={54} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <AlertTriangle className="size-5 text-warning" /> Risk factors
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {r.risk_factors.map((f) => (
              <Card key={f.label} className="rounded-2xl shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="min-w-0 truncate font-semibold">{f.label}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${severityTone[f.severity]}`}>
                      {f.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="size-4 text-primary" /> Maintenance recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {r.maintenance_recommendations.map((m) => (
                  <li key={m} className="flex gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="size-4 text-primary" /> Ways to extend device lifespan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {r.lifespan_extension_tips.map((t) => (
                  <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-primary/25 bg-surface shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Why this recommendation?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {r.reasoning.map((line, i) => (
                <li key={line} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
