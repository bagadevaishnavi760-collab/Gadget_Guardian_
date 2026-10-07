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
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics, getAllAdminAnalyses, type AdminAnalytics, type AnalysisRecord } from "@/services/adminApi";

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
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [data, records] = await Promise.all([getAdminAnalytics(), getAllAdminAnalyses()]);
        setAnalytics(data);
        setAnalyses(records);
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

  const gadgetTypeData = Object.entries(analytics?.gadget_type_counts || {}).map(
    ([name, value]) => ({ name, value })
  );

  const healthCategoryData = Object.entries(analytics?.health_category_counts || {}).map(
    ([name, value]) => ({ name, value })
  );

  const ewasteData = Object.entries(analytics?.ewaste_recommendation_counts || {}).map(
    ([name, value]) => ({ name, value })
  );

  const remainingByType = Object.values(
    analyses.reduce<Record<string, { name: string; total: number; count: number }>>((groups, analysis) => {
      const name = analysis.input.gadget_type;
      const group = groups[name] ?? { name, total: 0, count: 0 };
      group.total += analysis.remaining_months;
      group.count += 1;
      groups[name] = group;
      return groups;
    }, {}),
  ).map(({ name, total, count }) => ({ name, average_months: total / count }));
  const healthScoreByAge = analyses.map((analysis) => ({
    age: analysis.input.age_years,
    health_score: analysis.health_score,
    gadget_type: analysis.input.gadget_type,
  }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Detailed visualizations of gadget analysis data
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-xl shadow-card">
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
                  innerRadius={54}
                  outerRadius={92}
                  paddingAngle={3}
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

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Health Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthCategoryData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>E-Waste Recommendation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ewasteData} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--color-border)" />
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
                <Bar dataKey="value" fill="var(--color-leaf)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Average Remaining Lifespan by Gadget Type</CardTitle>
          </CardHeader>
          <CardContent>
            {remainingByType.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={remainingByType} margin={{ top: 8, right: 12, bottom: 8, left: -12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis unit=" mo" tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} months`, "Average remaining"]} />
                  <Bar dataKey="average_months" name="Average months" fill="var(--color-teal)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">No analysis data yet.</div>}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Health Score vs Age</CardTitle>
          </CardHeader>
          <CardContent>
            {healthScoreByAge.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="age" name="Age" unit=" yr" tickLine={false} />
                  <YAxis type="number" dataKey="health_score" name="Health score" domain={[0, 100]} unit="/100" tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={healthScoreByAge} fill="var(--color-primary)" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">No analysis data yet.</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardHeader>
          <CardTitle>Remaining Lifespan Statistics</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Minimum</p>
                <p className="text-2xl font-bold">{analytics?.remaining_lifespan.min_months ?? "--"} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="text-2xl font-bold">{analytics?.remaining_lifespan.max_months ?? "--"} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">{analytics?.remaining_lifespan.average_months?.toFixed(1) ?? "--"} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Median</p>
                <p className="text-2xl font-bold">{analytics?.remaining_lifespan.median_months ?? "--"} months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
