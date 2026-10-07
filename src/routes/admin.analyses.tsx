import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllAdminAnalyses, type AnalysisRecord } from "@/services/adminApi";

export const Route = createFileRoute("/admin/analyses")({
  head: () => ({
    meta: [
      { title: "Gadget Analyses — Gadget Guardian" },
      {
        name: "description",
        content: "View and search all gadget analysis records.",
      },
    ],
  }),
  component: AdminAnalyses,
});

function AdminAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gadgetTypeFilter, setGadgetTypeFilter] = useState<string>("all");
  const [healthCategoryFilter, setHealthCategoryFilter] = useState<string>("all");
  const [ewasteFilter, setEwasteFilter] = useState<string>("all");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true);
        const data = await getAllAdminAnalyses();
        setAnalyses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analyses");
      } finally {
        setLoading(false);
      }
    }
    loadAnalyses();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAnalyses = analyses.filter((analysis) => {
    const searchable = [
      String(analysis.id),
      analysis.input.gadget_type,
      analysis.health_category,
      analysis.ewaste_recommendation,
    ].join(" ").toLowerCase();
    return (
      (!normalizedSearch || searchable.includes(normalizedSearch)) &&
      (gadgetTypeFilter === "all" || analysis.input.gadget_type === gadgetTypeFilter) &&
      (healthCategoryFilter === "all" || analysis.health_category === healthCategoryFilter) &&
      (ewasteFilter === "all" || analysis.ewaste_recommendation === ewasteFilter)
    );
  });

  const gadgetTypes = Array.from(new Set(analyses.map((a) => a.input.gadget_type)));
  const healthCategories = Array.from(new Set(analyses.map((a) => a.health_category)));
  const ewasteRecommendations = Array.from(new Set(analyses.map((a) => a.ewaste_recommendation)));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading analyses...</p>
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
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gadget Analyses</h1>
        <p className="mt-2 text-sm text-muted-foreground">{analyses.length} records from the analysis database</p>
      </div>

      <Card className="rounded-xl shadow-card">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={gadgetTypeFilter} onValueChange={setGadgetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gadget Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {gadgetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={healthCategoryFilter} onValueChange={setHealthCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Health Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {healthCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ewasteFilter} onValueChange={setEwasteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="E-Waste Recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                {ewasteRecommendations.map((rec) => (
                  <SelectItem key={rec} value={rec}>
                    {rec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Gadget Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Health Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Health Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Remaining Lifespan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    E-Waste Recommendation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{analysis.input.gadget_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.input.age_years} years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{analysis.health_score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.health_category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.remaining_months} months</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.ewaste_recommendation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      {analyses.length ? "No records match these filters." : "No analyses have been recorded yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
