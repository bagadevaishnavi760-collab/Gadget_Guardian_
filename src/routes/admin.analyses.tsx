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
import { getAdminAnalyses, type AnalysisRecord } from "@/services/adminApi";

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
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([]);
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
        const data = await getAdminAnalyses(1000, 0);
        setAnalyses(data.analyses);
        setFilteredAnalyses(data.analyses);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analyses");
      } finally {
        setLoading(false);
      }
    }
    loadAnalyses();
  }, []);

  useEffect(() => {
    let filtered = analyses;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.gadget_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.health_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.ewaste_recommendation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (gadgetTypeFilter !== "all") {
      filtered = filtered.filter((a) => a.gadget_type === gadgetTypeFilter);
    }

    if (healthCategoryFilter !== "all") {
      filtered = filtered.filter((a) => a.health_category === healthCategoryFilter);
    }

    if (ewasteFilter !== "all") {
      filtered = filtered.filter((a) => a.ewaste_recommendation === ewasteFilter);
    }

    setFilteredAnalyses(filtered);
  }, [searchTerm, gadgetTypeFilter, healthCategoryFilter, ewasteFilter, analyses]);

  const gadgetTypes = Array.from(new Set(analyses.map((a) => a.gadget_type)));
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gadget Analyses</h1>
        <p className="mt-2 text-muted-foreground">
          View and search all gadget analysis records
        </p>
      </div>

      <Card className="mb-6 rounded-2xl shadow-card">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <Card className="rounded-2xl shadow-card">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{analysis.gadget_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.age_years} years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{analysis.health_score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.health_category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.remaining_months} months</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{analysis.ewaste_recommendation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAnalyses.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No analyses found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
