import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics, type AdminAnalytics } from "@/services/adminApi";

const COLORS = [
  "var(--color-primary)",
  "var(--color-teal)",
  "var(--color-leaf)",
  "var(--color-warning)",
  "var(--color-destructive)",
];

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Gadget Guardian" },
      {
        name: "description",
        content: "Detailed analytics and visualizations for gadget analysis data.",
      },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
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
          <p className="text-muted-foreground">Loading analytics...</p>
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

  const gadgetTypeData = Object.entries(analytics?.gadget_type_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  const healthCategoryData = Object.entries(analytics?.health_category_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  const ewasteData = Object.entries(analytics?.ewaste_recommendation_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  const healthScoreData = Object.entries(analytics?.health_score_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Detailed visualizations of gadget analysis data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Gadget Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gadgetTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gadgetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Health Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>E-Waste Recommendation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ewasteData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="name" type="category" width={150} stroke="var(--color-muted-foreground)" />
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

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Health Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-teal)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle>Remaining Lifespan Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-2xl font-bold">{analytics?.remaining_lifespan_stats.min || 0} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="text-2xl font-bold">{analytics?.remaining_lifespan_stats.max || 0} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-bold">{analytics?.remaining_lifespan_stats.avg.toFixed(1) || 0} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Median</p>
              <p className="text-2xl font-bold">{analytics?.remaining_lifespan_stats.median || 0} months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
