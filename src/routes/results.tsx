import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartPulse,
  Lightbulb,
  Leaf,
  Recycle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
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
      { title: "Gadget Health Report — Gadget Guardian" },
      {
        name: "description",
        content: "Predicted remaining lifespan, health score, risk factors and e-waste recommendation for your device.",
      },
      { property: "og:title", content: "Gadget Health Report — Gadget Guardian" },
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

const getContextualCallout = (recommendation: string): { icon: any; message: string; variant: string } => {
  if (recommendation.includes("Continue Using")) {
    return { icon: Sparkles, message: "Don't replace it yet!", variant: "success" };
  }
  if (recommendation.includes("Repair")) {
    return { icon: Wrench, message: "Repair before replacing.", variant: "warning" };
  }
  if (recommendation.includes("Refurbish") || recommendation.includes("Reuse")) {
    return { icon: RefreshCw, message: "Give your gadget a second life.", variant: "info" };
  }
  if (recommendation.includes("Recycle")) {
    return { icon: Recycle, message: "Recycle responsibly.", variant: "eco" };
  }
  if (recommendation.includes("Donate") || recommendation.includes("Resell")) {
    return { icon: HeartPulse, message: "Pass it on to someone who needs it.", variant: "success" };
  }
  return { icon: Leaf, message: "Make the sustainable choice.", variant: "eco" };
};

const getPriorityLabel = (index: number): { label: string; color: string } => {
  const priorities = [
    { label: "URGENT", color: "bg-destructive/10 text-destructive" },
    { label: "HIGH", color: "bg-warning/15 text-warning" },
    { label: "DO SOON", color: "bg-primary/10 text-primary" },
  ];
  return priorities[index] || priorities[2];
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

function BatteryIcon({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 80) return "text-success";
    if (value >= 50) return "text-warning";
    return "text-destructive";
  };
  return <Zap className={`size-4 ${getColor()}`} />;
}

function ResultsPage() {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecord(getLastAnalysis());
    setReady(true);
  }, []);

  if (!ready) return <SiteLayout><div className="mx-auto max-w-7xl px-4 py-20" /></SiteLayout>;

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

  const contextualInfo = getContextualCallout(r.ewaste_recommendation);
  const ContextIcon = contextualInfo.icon;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12">
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

        <Card className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent shadow-soft">
          <CardHeader className="border-b border-border/50 bg-primary/[0.03]">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </span>
              Your Gadget's Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Health Status</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryTone[r.health_category]}`}>
                    {r.health_category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Remaining Lifespan</span>
                  <span className="text-sm font-semibold">{r.remaining_months} months ({r.remaining_years} years)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Health Score</span>
                  <span className="text-sm font-semibold">{r.health_score}/100</span>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-Waste Recommendation</p>
                  <p className="mt-1 text-xl font-bold text-primary">{r.ewaste_recommendation}</p>
                </div>
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                  contextualInfo.variant === "success" ? "bg-success/10 text-success" :
                  contextualInfo.variant === "warning" ? "bg-warning/10 text-warning" :
                  contextualInfo.variant === "eco" ? "bg-leaf/10 text-leaf" :
                  "bg-primary/10 text-primary"
                }`}>
                  <ContextIcon className="size-5" />
                  <span className="text-sm font-semibold">{contextualInfo.message}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <TrendingUp className="size-5 text-primary" /> Do These 3 Things First
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {r.maintenance_recommendations.slice(0, 3).map((rec, index) => {
              const priority = getPriorityLabel(index);
              const icons = [Zap, Wrench, ShieldCheck];
              const Icon = icons[index];
              return (
                <Card key={rec} className="group relative overflow-hidden rounded-2xl border-2 border-primary/10 shadow-card transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>
                        {priority.label}
                      </span>
                      <span className="text-2xl font-bold text-primary/20">0{index + 1}</span>
                    </div>
                    <div className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{rec}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-warning" /> Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {r.lifespan_extension_tips.map((tip, index) => (
                <div
                  key={tip}
                  className="group flex items-start gap-3 rounded-xl border border-border/50 bg-surface/50 p-4 transition-all hover:border-primary/30 hover:bg-surface"
                >
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <CheckCircle2 className="size-3" />
                  </div>
                  <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/25 bg-surface shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="size-4 text-leaf" /> Why this recommendation?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <BatteryIcon value={record.input.battery_health} />
                  <span className="text-sm font-medium">Battery Health</span>
                </div>
                <p className="text-2xl font-bold text-primary">{record.input.battery_health}%</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="size-4 text-warning" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <p className="text-2xl font-bold text-primary">{record.input.performance_score}/100</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Age</span>
                </div>
                <p className="text-2xl font-bold text-primary">{record.input.age_years} years</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Remaining Lifespan</span>
                </div>
                <p className="text-2xl font-bold text-primary">{r.remaining_months} months</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Health Score</span>
                </div>
                <p className="text-2xl font-bold text-primary">{r.health_score}/100</p>
              </div>
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="size-4 text-primary" />
                  <span className="text-sm font-medium">Final Recommendation</span>
                </div>
                <p className="text-lg font-bold text-primary leading-tight">{r.ewaste_recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
