import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Cpu, Leaf, ListChecks, Target, TriangleAlert } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — EcoLife" },
      {
        name: "description",
        content: "Problem statement, objectives, the multiple linear regression model, input features and technology stack behind EcoLife.",
      },
      { property: "og:title", content: "About the Project — EcoLife" },
      { property: "og:description", content: "How EcoLife predicts gadget lifespan with multiple linear regression." },
    ],
  }),
  component: AboutPage,
});

const features = [
  "Gadget type",
  "Age in years",
  "Daily usage hours",
  "Battery health (%)",
  "Charge cycles",
  "Overheating level (1–5)",
  "Physical condition (1–5)",
  "Maintenance frequency (1–5)",
  "Repair count",
  "Performance score (0–100)",
  "Storage used (%)",
  "Software updated (yes/no)",
  "Environmental stress (1–5)",
  "Expected life (months)",
];

const tech = [
  { group: "Frontend", items: ["React 19", "TanStack Router", "Tailwind CSS", "Recharts", "Lucide Icons"] },
  { group: "Backend (planned)", items: ["Python", "Flask / FastAPI", "REST endpoint POST /predict"] },
  { group: "Machine Learning", items: ["scikit-learn", "pandas", "NumPy", "Multiple Linear Regression"] },
];

function AboutPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About the project</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            EcoLife is an engineering project that applies supervised machine learning to a sustainability problem: how
            long an electronic device can realistically keep serving its owner, and what should happen to it afterwards.
          </p>
        </header>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="size-4 text-warning" /> Problem statement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Consumers replace laptops, phones, tablets and smartwatches long before those devices actually fail, largely
            because they have no objective way to judge remaining useful life. The result is tens of millions of tonnes
            of electronic waste every year, most of it informally handled, with valuable metals lost and hazardous
            substances released into soil and water.
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" /> Project objective
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Build a web application that takes measurable device attributes, predicts remaining lifespan with a trained
            regression model, converts that prediction into an interpretable health score and category, and finally maps
            the result to a responsible e-waste action along the reuse → repair → refurbish → recycle → dispose
            hierarchy.
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="size-4 text-primary" /> Machine learning model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Multiple Linear Regression</strong> models remaining lifespan as a
              weighted linear combination of the input features:
            </p>
            <pre className="overflow-x-auto rounded-xl bg-surface p-4 text-xs text-foreground">
{`ŷ = β0 + β1·battery_health + β2·performance_score
     + β3·physical_condition − β4·overheating_level
     + … + βn·expected_life_months`}
            </pre>
            <p>
              The model is trained offline in Python and served through a REST endpoint. The frontend only sends the form
              payload to <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">POST /predict</code> and
              renders the response, so the ML logic can evolve without touching the interface. Until the backend is
              connected, the API service layer returns a mock response of the same shape.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="size-4 text-primary" /> Input features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <li key={f} className="rounded-xl bg-surface px-3 py-2 text-sm">
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="size-4 text-primary" /> Sustainability objective
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Extending the working life of a device is the single most effective way to reduce its lifetime carbon
            footprint, because most emissions occur during manufacturing. EcoLife encourages that extension first, and
            only recommends recycling once repair, refurbishment, donation, resale and part recovery are genuinely
            exhausted.
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Boxes className="size-4 text-primary" /> Technologies used
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            {tech.map((t) => (
              <div key={t.group}>
                <h3 className="text-sm font-semibold">{t.group}</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {t.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
