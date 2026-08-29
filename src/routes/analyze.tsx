import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Info, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { predictGadget, type GadgetInput, type GadgetType } from "@/services/predictionApi";
import { saveAnalysis } from "@/services/historyStore";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Your Gadget — EcoLife" },
      {
        name: "description",
        content: "Enter age, usage, battery health and condition details to get an ML-based lifespan prediction.",
      },
      { property: "og:title", content: "Analyze Your Gadget — EcoLife" },
      { property: "og:description", content: "Fourteen inputs, one health report and a smart e-waste decision." },
    ],
  }),
  component: AnalyzePage,
});

const schema = z.object({
  gadget_type: z.enum(["Laptop", "Smartphone", "Tablet", "Smartwatch"]),
  age_years: z.number().min(0, "Age cannot be negative").max(25, "Please enter 25 years or less"),
  daily_usage_hours: z.number().min(0).max(24, "A day only has 24 hours"),
  battery_health: z.number().min(0).max(100),
  charge_cycles: z.number().min(0).max(5000, "Please enter 5000 cycles or less"),
  overheating_level: z.number().min(1).max(5),
  physical_condition: z.number().min(1).max(5),
  maintenance_frequency: z.number().min(1).max(5),
  repair_count: z.number().min(0).max(50),
  performance_score: z.number().min(0).max(100),
  storage_used: z.number().min(0).max(100),
  software_updated: z.boolean(),
  environmental_stress: z.number().min(1).max(5),
  expected_life_months: z.number().min(6, "Expected life must be at least 6 months").max(240),
});

const defaults: GadgetInput = {
  gadget_type: "Laptop",
  age_years: 3,
  daily_usage_hours: 6,
  battery_health: 78,
  charge_cycles: 420,
  overheating_level: 2,
  physical_condition: 4,
  maintenance_frequency: 3,
  repair_count: 1,
  performance_score: 72,
  storage_used: 65,
  software_updated: true,
  environmental_stress: 2,
  expected_life_months: 72,
};

const scaleHints: Record<string, string[]> = {
  overheating_level: ["1 — Never warm", "2 — Rarely warm", "3 — Warm under load", "4 — Often hot", "5 — Hot / shuts down"],
  physical_condition: ["1 — Badly damaged", "2 — Visible damage", "3 — Worn but working", "4 — Minor marks", "5 — Like new"],
  maintenance_frequency: ["1 — Never serviced", "2 — Rarely", "3 — Once a year", "4 — Twice a year", "5 — Regularly"],
  environmental_stress: ["1 — Clean indoor use", "2 — Normal", "3 — Some dust/heat", "4 — Dusty or humid", "5 — Harsh outdoor"],
};

function AnalyzePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<GadgetInput>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof GadgetInput>(key: K, value: GadgetInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await predictGadget(parsed.data as GadgetInput);
      saveAnalysis(parsed.data as GadgetInput, result);
      navigate({ to: "/results" });
    } catch {
      toast.error("Could not reach the prediction service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const numberField = (
    key: keyof GadgetInput,
    label: string,
    hint: string,
    props: { min?: number; max?: number; step?: number } = {},
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type="number"
        value={String(form[key] as number)}
        onChange={(e) => set(key, (e.target.value === "" ? 0 : Number(e.target.value)) as never)}
        {...props}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
      {errors[key] && <p className="text-xs font-medium text-destructive">{errors[key]}</p>}
    </div>
  );

  const sliderField = (
    key: keyof GadgetInput,
    label: string,
    min: number,
    max: number,
    step: number,
    suffix: string,
    hint?: string,
  ) => {
    const value = form[key] as number;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={key}>{label}</Label>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            {value}
            {suffix}
          </span>
        </div>
        <Slider
          id={key}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => set(key, v as never)}
        />
        {(hint || scaleHints[key]) && (
          <p className="text-xs text-muted-foreground">
            {hint ?? scaleHints[key]?.[Math.round(value) - 1]}
          </p>
        )}
        {errors[key] && <p className="text-xs font-medium text-destructive">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analyze your gadget</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Fill in what you know about the device. Every field maps to an input feature of the prediction model — the more
          accurate your answers, the more reliable the estimated lifespan.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Rating scales run from <strong className="text-foreground">1 (worst)</strong> to{" "}
            <strong className="text-foreground">5 (best)</strong>, except overheating and environmental stress where{" "}
            <strong className="text-foreground">5 means the most stress</strong>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Device basics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gadget_type">Gadget type</Label>
                <Select
                  value={form.gadget_type}
                  onValueChange={(v) => set("gadget_type", v as GadgetType)}
                >
                  <SelectTrigger id="gadget_type">
                    <SelectValue placeholder="Select a gadget" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Laptop", "Smartphone", "Tablet", "Smartwatch"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Category of the device being analysed.</p>
              </div>
              {numberField("age_years", "Age (years)", "How long you have owned/used the device.", {
                min: 0,
                max: 25,
                step: 0.5,
              })}
              {sliderField("daily_usage_hours", "Daily usage", 0, 24, 1, " h", "Average hours of active use per day.")}
              {numberField("expected_life_months", "Expected life (months)", "Manufacturer or typical life expectancy.", {
                min: 6,
                max: 240,
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Battery &amp; performance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {sliderField("battery_health", "Battery health", 0, 100, 1, "%", "As reported by the device's battery info.")}
              {numberField("charge_cycles", "Charge cycles", "Number of full charge cycles completed.", {
                min: 0,
                max: 5000,
              })}
              {sliderField("performance_score", "Performance score", 0, 100, 1, "/100", "Perceived or benchmarked speed.")}
              {sliderField("storage_used", "Storage used", 0, 100, 1, "%", "Percentage of internal storage occupied.")}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Condition &amp; care</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {sliderField("overheating_level", "Overheating level", 1, 5, 1, "/5")}
              {sliderField("physical_condition", "Physical condition", 1, 5, 1, "/5")}
              {sliderField("maintenance_frequency", "Maintenance frequency", 1, 5, 1, "/5")}
              {sliderField("environmental_stress", "Environmental stress", 1, 5, 1, "/5")}
              {numberField("repair_count", "Repair count", "How many times the device has been repaired.", {
                min: 0,
                max: 50,
              })}
              <div className="space-y-2">
                <Label htmlFor="software_updated">Software updated</Label>
                <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <Switch
                    id="software_updated"
                    checked={form.software_updated}
                    onCheckedChange={(v) => set("software_updated", v)}
                  />
                  <span className="text-sm">{form.software_updated ? "Yes — up to date" : "No — updates pending"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Running the latest OS and security patches.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" className="rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Analyzing…" : "Analyze Gadget Health"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setForm(defaults);
                setErrors({});
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
