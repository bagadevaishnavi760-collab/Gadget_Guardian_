import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  BrainCircuit,
  ClipboardList,
  Cpu,
  FileBarChart,
  Gauge,
  Globe2,
  Leaf,
  Recycle,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gadget Guardian — Smart E-Waste Management and Gadget Lifespan Prediction System" },
      {
        name: "description",
        content:
          "Predict how many months your laptop, phone, tablet or smartwatch has left, get maintenance advice and a smart e-waste decision.",
      },
      { property: "og:title", content: "Gadget Guardian — Smart E-Waste Management and Gadget Lifespan Prediction System" },
      {
        property: "og:description", content: "Know your gadget. Extend its life. Reduce e-waste — powered by a machine learning lifespan model." },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Gauge,
    title: "Predict Lifespan",
    text: "A regression model estimates the remaining useful life of your device in months and years.",
  },
  {
    icon: BatteryCharging,
    title: "Monitor Gadget Health",
    text: "Battery, thermals, performance and physical condition combine into a single 0–100 health score.",
  },
  {
    icon: Wrench,
    title: "Get Maintenance Advice",
    text: "Actionable, prioritised steps that address the exact risk factors detected on your device.",
  },
  {
    icon: Recycle,
    title: "Reduce E-Waste",
    text: "A clear end-of-life decision: keep using, repair, refurbish, donate, harvest parts or recycle safely.",
  },
];

const stats = [
  { value: "62 Mt", label: "E-waste generated worldwide in a single year" },
  { value: "22%", label: "Of that e-waste is formally collected and recycled" },
  { value: "$91 B", label: "Value of recoverable metals lost every year" },
  { value: "1 yr", label: "Extra life per device cuts its carbon footprint sharply" },
];

const steps = [
  { icon: ClipboardList, title: "Enter Gadget Details", text: "Age, usage, battery, thermals and condition." },
  { icon: BrainCircuit, title: "AI Analysis", text: "The model weighs every feature to score device health." },
  { icon: FileBarChart, title: "Health Report", text: "Lifespan, risk factors and maintenance plan." },
  { icon: Recycle, title: "Smart E-Waste Decision", text: "The most sustainable next step for the device." },
];

function Home() {
  return (
    <SiteLayout>
      <section className="eco-soft border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Leaf className="size-3.5 text-primary" /> Sustainable electronics, measured
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Know Your Gadget.
              <br />
              Extend Its Life.
              <br />
              <span className="text-primary">Reduce E-Waste.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Gadget Guardian collects fourteen measurable signals about your device — age, daily usage, battery health, charge
              cycles, heat, physical condition and more — and feeds them to a multiple linear regression model. You get a
              predicted remaining lifespan, a health score and a responsible end-of-life recommendation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/analyze">
                  Analyze My Gadget <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/e-waste-guide">E-Waste Guide</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-3xl border-border/70 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Sample report</p>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Good</span>
              </div>
              <p className="mt-4 text-5xl font-bold tracking-tight">
                74<span className="text-xl text-muted-foreground">/100</span>
              </p>
              <p className="text-sm text-muted-foreground">Gadget health score</p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Battery health", value: 78 },
                  { label: "Performance", value: 71 },
                  { label: "Thermal comfort", value: 60 },
                  { label: "Physical condition", value: 80 },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{b.label}</span>
                      <span>{b.value}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full eco-gradient" style={{ width: `${b.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-surface p-4 text-sm">
                <p className="font-semibold">Recommendation: Repair / Maintain</p>
                <p className="mt-1 text-muted-foreground">~19 months of useful life remaining.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What Gadget Guardian does</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="rounded-2xl border-border/70 shadow-card transition-shadow hover:shadow-soft">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center gap-2 text-primary">
            <Globe2 className="size-5" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Sustainability snapshot</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-background p-6 shadow-card">
                <p className="text-3xl font-bold tracking-tight text-primary">{s.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <Card key={s.title} className="relative rounded-2xl border-border/70 shadow-card">
              <CardContent className="p-6">
                <span className="text-xs font-semibold text-muted-foreground">STEP {idx + 1}</span>
                <span className="mt-3 grid size-11 place-items-center rounded-xl eco-gradient text-primary-foreground">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl eco-gradient p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Cpu className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="text-lg font-semibold">Ready to check your device?</p>
              <p className="text-sm opacity-90">It takes about a minute and no personal data is required.</p>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-xl">
            <Link to="/analyze">Analyze My Gadget</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
