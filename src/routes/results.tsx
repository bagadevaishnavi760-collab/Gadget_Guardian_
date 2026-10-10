import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  CircleGauge,
  HeartPulse,
  Lightbulb,
  Recycle,
  Sparkles,
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

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">Your Gadget’s Action Plan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Analyzed on {new Date(record.date).toLocaleString()} · {r.model}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-xl">
            <Link to="/analyze">New analysis</Link>
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-r from-primary/10 via-accent/40 to-transparent shadow-card">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" /> Recommended next step for your {r.gadget_type}</p>
              <h2 className="mt-1 text-2xl font-bold">{r.ewaste_recommendation === "Continue Using" ? "Don’t replace it yet — get more life from your gadget." : r.ewaste_recommendation.includes("Repair") ? "Repair before replacing." : r.ewaste_recommendation.includes("Refurbish") ? "Give your gadget a second life." : r.ewaste_recommendation.includes("Recycle") ? "Recycle responsibly." : "Pass it on to someone who needs it."}</h2>
            </div>
            <Button asChild className="rounded-xl"><Link to="/e-waste-guide">Explore the guide <ArrowRight className="size-4" /></Link></Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="rounded-3xl border-purple-200/70 bg-gradient-to-br from-white via-[#faf8ff] to-[#eee8ff] shadow-[0_18px_45px_-24px_rgba(109,76,170,0.55)]">
            <CardContent className="flex flex-col items-center p-6 sm:p-7">
              <Gauge score={r.health_score} />
              <div className="mt-2 flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-sm">
                <CircleGauge className="size-3.5" />
                {r.health_category}
                <span className="text-purple-300">•</span>
                <span>{r.health_score}/100</span>
              </div>
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

          <Card className="rounded-3xl bg-gradient-to-br from-[#6f3cc3] via-[#8d4dc8] to-[#ee765f] text-white shadow-[0_18px_45px_-20px_rgba(141,77,200,0.75)]">
            <CardContent className="relative overflow-hidden p-6 sm:p-7">
              <span className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/10" />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/20 shadow-inner">
                <Recycle className="size-5" />
              </span>
              <p className="relative mt-5 text-sm font-medium text-white/80">Final e-waste recommendation</p>
              <div className="relative mt-2 flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-white/20"><Check className="size-3.5" /></span>
                <p className="text-2xl font-bold leading-snug">{r.ewaste_recommendation}</p>
              </div>
              <Button asChild variant="secondary" size="sm" className="mt-5 rounded-xl">
                <Link to="/e-waste-guide">See the e-waste guide</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Do These 3 Things First</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {r.maintenance_recommendations.slice(0, 3).map((item, index) => (
              <Card key={item} className="rounded-2xl shadow-card">
                <CardContent className="p-5"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span><p className="mt-4 text-sm font-medium leading-relaxed">{item}</p></CardContent>
              </Card>
            ))}
          </div>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-purple-100 bg-gradient-to-br from-white to-[#f7f2ff] shadow-[0_16px_40px_-24px_rgba(109,76,170,0.55)]">
            <CardHeader className="border-b border-purple-100/80 pb-5">
              <CardTitle className="flex items-center gap-3 text-lg">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-lg shadow-purple-200">
                  <Wrench className="size-5" />
                </span>
                <span><span className="block">Maintenance recommendations</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Small actions that protect your health score.</span></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {r.maintenance_recommendations.map((m) => (
                  <li key={m} className="group flex items-start gap-3 rounded-2xl border border-purple-100 bg-white/80 p-3.5 text-sm text-muted-foreground shadow-sm transition-transform hover:-translate-y-0.5">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white"><ShieldCheck className="size-4" /></span>
                    <span className="pt-1 leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-orange-100 bg-gradient-to-br from-white to-[#fff5f0] shadow-[0_16px_40px_-24px_rgba(238,118,95,0.55)]">
            <CardHeader className="border-b border-orange-100/80 pb-5">
              <CardTitle className="flex items-center gap-3 text-lg">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-200">
                  <Lightbulb className="size-5" />
                </span>
                <span><span className="block">Ways to extend device lifespan</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Premium habits for more useful months.</span></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {r.lifespan_extension_tips.map((t, index) => (
                  <li key={t} className="group flex items-start gap-3 rounded-2xl border border-orange-100 bg-white/80 p-3.5 text-sm text-muted-foreground shadow-sm transition-transform hover:-translate-y-0.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-xs font-bold text-orange-700 group-hover:from-orange-400 group-hover:to-rose-500 group-hover:text-white">{index + 1}</span>
                    <span className="pt-1 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-3xl border-purple-200/70 bg-gradient-to-br from-[#f7f2ff] via-white to-[#fff4ef] shadow-[0_18px_48px_-25px_rgba(109,76,170,0.5)]">
          <CardHeader className="border-b border-purple-100/70 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-400 text-white shadow-lg shadow-violet-200"><Sparkles className="size-5" /></span>
              <span><span className="block">Why this recommendation?</span><span className="mt-1 block text-xs font-normal text-muted-foreground">A clear, data-led explanation of your action plan.</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-7">
            <ol className="grid gap-4 md:grid-cols-2">
              {r.reasoning.map((line, i) => (
                <li key={line} className="flex gap-4 rounded-2xl border border-white/80 bg-white/75 p-4 text-sm text-muted-foreground shadow-sm">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-purple-200">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-relaxed">{line}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><Lightbulb className="size-5 text-warning" /> Quick Wins</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.lifespan_extension_tips.slice(0, 3).map((tip) => <div key={tip} className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">{tip}</div>)}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl"><Link to="/analyze">Analyze Another Gadget <ArrowRight className="size-4" /></Link></Button>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/dashboard">View Dashboard</Link></Button>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/e-waste-guide">E-Waste Guide</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
