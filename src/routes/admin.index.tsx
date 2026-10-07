import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Clock, HeartPulse, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, type AdminStats } from "@/services/adminApi";

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const reusablePercentage = stats
    ? ((stats.ewaste_recommendation_counts["Continue Using"] || 0) +
        (stats.ewaste_recommendation_counts["Repair / Maintain"] || 0) +
        (stats.ewaste_recommendation_counts["Refurbish / Reuse"] || 0)) /
        stats.total_analyses * 100
    : 0;

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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of gadget analysis statistics and insights
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_analyses || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <HeartPulse className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_health_score.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Remaining Lifespan</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_remaining_months.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">Months</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reusable/Repairable</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reusablePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total devices</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Gadget Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.gadget_type_counts || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
              {Object.keys(stats?.gadget_type_counts || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Health Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.health_category_counts || {}).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
              {Object.keys(stats?.health_category_counts || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
