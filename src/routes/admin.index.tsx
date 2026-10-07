import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Clock3, HeartPulse, Leaf, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics, getAdminStats, type AdminAnalytics, type AdminStats } from "@/services/adminApi";

const chartColors = [
  "var(--color-primary)",
  "var(--color-teal)",
  "var(--color-leaf)",
  "var(--color-warning)",
  "var(--color-destructive)",
];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Gadget Guardian" },
      {
        name: "description",
        content: "Admin dashboard for Gadget Guardian analytics and insights.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<{ stats: AdminStats; analytics: AdminAnalytics } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [stats, analytics] = await Promise.all([getAdminStats(), getAdminAnalytics()]);
        setDashboard({ stats, analytics });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = dashboard?.stats;
  const analytics = dashboard?.analytics;
  const recommendationCounts = stats?.ewaste_recommendation_counts ?? {};
  const reusableCount =
    (recommendationCounts["Continue Using"] ?? 0) +
    (recommendationCounts["Repair / Maintain"] ?? 0) +
    (recommendationCounts["Refurbish / Reuse"] ?? 0) +
    (recommendationCounts["Donate / Resell"] ?? 0);
  const reusablePercentage = stats?.total_analyses
    ? (reusableCount / stats.total_analyses) * 100
    : 0;
  const gadgetData = Object.entries(stats?.gadget_type_counts ?? {}).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(stats?.health_category_counts ?? {}).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
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

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Gadget Guardian / Admin</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">A live view of device health and end-of-life recommendations.</p>
        </div>
        <Link to="/admin/analyses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Browse analyses <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats?.total_analyses ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <HeartPulse className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats?.average_health_score?.toFixed(1) ?? "--"}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Remaining Lifespan</CardTitle>
            <Clock3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{analytics?.remaining_lifespan.average_months?.toFixed(1) ?? "--"}</div>
            <p className="text-xs text-muted-foreground">Months</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reusable/Repairable</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats?.total_analyses ? `${reusablePercentage.toFixed(1)}%` : "--"}</div>
            <p className="text-xs text-muted-foreground">Of total devices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Gadget Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {gadgetData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gadgetData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={92} paddingAngle={3}>
                    {gadgetData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="grid h-full place-items-center text-sm text-muted-foreground">No analysis data yet.</p>}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle>Health Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Analyses" fill="var(--color-teal)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="grid h-full place-items-center text-sm text-muted-foreground">No analysis data yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><Leaf className="size-4 text-primary" /> Recommendation mix</CardTitle>
          <Link to="/admin/e-waste" className="text-sm font-medium text-primary hover:underline">E-waste insights</Link>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(recommendationCounts).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm">{name}</span>
              <span className="font-semibold tabular-nums">{count}</span>
            </div>
          ))}
          {!Object.keys(recommendationCounts).length && <p className="text-sm text-muted-foreground">Recommendations will appear after the first analysis.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
