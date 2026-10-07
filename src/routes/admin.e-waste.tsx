import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics, type AdminAnalytics } from "@/services/adminApi";

export const Route = createFileRoute("/admin/e-waste")({
  head: () => ({
    meta: [
      { title: "E-Waste Insights — Gadget Guardian" },
      {
        name: "description",
        content: "E-waste recommendation insights and statistics.",
      },
    ],
  }),
  component: AdminEWaste,
});

function AdminEWaste() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await getAdminAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading e-waste insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  const recommendationCounts = analytics?.ewaste_recommendation_counts ?? {};
  const total = Object.values(recommendationCounts).reduce((sum, count) => sum + count, 0);
  const recommendationCards = [
    {
      name: "Continue Using",
      count: recommendationCounts["Continue Using"] ?? 0,
      color: "bg-success/10 text-success",
      description: "Continue using devices in healthy condition.",
    },
    {
      name: "Repair",
      count: recommendationCounts["Repair / Maintain"] ?? 0,
      color: "bg-warning/10 text-warning",
      description: "Repair or maintain devices that remain serviceable.",
    },
    {
      name: "Refurbish / Reuse",
      count: (recommendationCounts["Refurbish / Reuse"] ?? 0) + (recommendationCounts["Donate / Resell"] ?? 0),
      color: "bg-primary/10 text-primary",
      description: "Refurbish, donate, or resell for another useful life.",
    },
    {
      name: "Recycle",
      count: (recommendationCounts["Reuse for Parts"] ?? 0) + (recommendationCounts["Authorized E-Waste Recycling"] ?? 0),
      color: "bg-teal/10 text-teal",
      description: "Recover usable components or use authorized recycling.",
    },
    {
      name: "Disposal",
      count: null,
      color: "bg-muted text-muted-foreground",
      description: "No separate disposal recommendation is recorded by the prediction API.",
    },
  ];
  const ewasteData = recommendationCards
    .filter((card): card is typeof card & { count: number } => card.count !== null)
    .map(({ name, count }) => ({ name, count }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">E-Waste Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of e-waste recommendations and their distribution
        </p>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardHeader>
          <CardTitle>E-Waste Recommendation Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={ewasteData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" allowDecimals={false} stroke="var(--color-muted-foreground)" />
              <YAxis dataKey="name" type="category" width={145} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                }}
              />
              <Bar dataKey="count" name="Analyses" fill="var(--color-leaf)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground">
            Groups combine the database recommendations into five outcomes. Disposal is not charted because the prediction API does not record it separately.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {recommendationCards.map((card) => (
          <Card key={card.name} className="rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{card.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">{card.count ?? "Not tracked"}</div>
                <div className="text-sm text-muted-foreground">
                    {card.count === null
                      ? "No separate outcome in API"
                      : `${total > 0 ? ((card.count / total) * 100).toFixed(1) : "0.0"}% of total`}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
