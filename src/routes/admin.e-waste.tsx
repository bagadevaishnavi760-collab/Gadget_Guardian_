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

  const ewasteData = Object.entries(analytics?.ewaste_recommendation_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  const total = analytics?.total_analyses || 0;

  const recommendationCards = [
    {
      name: "Continue Using",
      count: analytics?.ewaste_recommendation_distribution["Continue Using"] || 0,
      color: "bg-success/10 text-success",
      description: "Device is in good condition and should continue to be used.",
    },
    {
      name: "Repair / Maintain",
      count: analytics?.ewaste_recommendation_distribution["Repair / Maintain"] || 0,
      color: "bg-warning/10 text-warning",
      description: "Device needs repairs but is worth maintaining.",
    },
    {
      name: "Refurbish / Reuse",
      count: analytics?.ewaste_recommendation_distribution["Refurbish / Reuse"] || 0,
      color: "bg-primary/10 text-primary",
      description: "Device can be refurbished and given a second life.",
    },
    {
      name: "Donate / Resell",
      count: analytics?.ewaste_recommendation_distribution["Donate / Resell"] || 0,
      color: "bg-teal/10 text-teal",
      description: "Device can be donated or resold to someone who needs it.",
    },
    {
      name: "Reuse for Parts",
      count: analytics?.ewaste_recommendation_distribution["Reuse for Parts"] || 0,
      color: "bg-accent/10 text-accent-foreground",
      description: "Device components can be harvested for reuse.",
    },
    {
      name: "Authorized E-Waste Recycling",
      count: analytics?.ewaste_recommendation_distribution["Authorized E-Waste Recycling"] || 0,
      color: "bg-destructive/10 text-destructive",
      description: "Device should be recycled through authorized e-waste channels.",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">E-Waste Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of e-waste recommendations and their distribution
        </p>
      </div>

      <Card className="mb-6 rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle>E-Waste Recommendation Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ewasteData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted-foreground)" />
              <YAxis dataKey="name" type="category" width={200} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                }}
              />
              <Bar dataKey="value" fill="var(--color-leaf)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendationCards.map((card) => (
          <Card key={card.name} className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{card.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">{card.count}</div>
                <div className="text-sm text-muted-foreground">
                  {total > 0 ? ((card.count / total) * 100).toFixed(1) : 0}% of total
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
