import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, Database, KeyRound, LineChart, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminAnalytics, getAdminRecords, getAdminSummary, getModelMetrics, type AdminSummary, type AnalysisRecordLike, type ModelMetricsResponse } from "@/services/predictionApi";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Gadget Guardian" }] }),
  component: AdminPage,
});

type Tab = "Overview" | "Gadget Analyses" | "Analytics" | "E-Waste Insights" | "Model Performance";

function Distribution({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return <Card className="rounded-2xl shadow-card"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-4">{items.length === 0 ? <p className="text-sm text-muted-foreground">No saved records yet.</p> : items.map((item) => <div key={item.label}><div className="flex justify-between text-sm"><span>{item.label}</span><strong>{item.count}</strong></div><div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</CardContent></Card>;
}

function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("gadget-guardian-admin-token") ?? "");
  const [draftToken, setDraftToken] = useState(token);
  const [tab, setTab] = useState<Tab>("Overview");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [records, setRecords] = useState<AnalysisRecordLike[]>([]);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [lifespan, setLifespan] = useState<{ value: number; count: number }[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterGadget, setFilterGadget] = useState("");
  const [filterHealth, setFilterHealth] = useState("");
  const [sort, setSort] = useState("created_at");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextRecords, nextAnalytics, nextMetrics] = await Promise.all([
        getAdminSummary(activeToken),
        getAdminRecords(activeToken, `?page=${page}&per_page=10&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ""}${filterGadget ? `&gadget_type=${encodeURIComponent(filterGadget)}` : ""}${filterHealth ? `&health_category=${encodeURIComponent(filterHealth)}` : ""}`),
        getAdminAnalytics(activeToken),
        getModelMetrics(activeToken),
      ]);
      setSummary(nextSummary);
      setRecords(nextRecords.records);
      setLifespan(nextAnalytics.lifespan);
      setMetrics(nextMetrics);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) void load();   }, [token, page]);
  const recommendations = useMemo(() => summary?.recommendations ?? [], [summary]);

  const connect = () => {
    const next = draftToken.trim();
    if (!next) return;
    sessionStorage.setItem("gadget-guardian-admin-token", next);
    setToken(next);
  };

  if (!token) {
    return <SiteLayout><div className="mx-auto max-w-xl px-4 py-20"><Card className="rounded-2xl shadow-card"><CardContent className="p-8"><ShieldAlert className="size-10 text-warning" /><h1 className="mt-5 text-3xl font-bold">Admin access</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This dashboard is protected by the Flask server. Enter the administrator token configured as <code>ADMIN_API_TOKEN</code> on the backend. No token is bundled into the frontend.</p><div className="mt-6 flex gap-2"><Input type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} placeholder="Backend admin token" onKeyDown={(event) => { if (event.key === "Enter") connect(); }} /><Button onClick={connect} className="shrink-0 rounded-xl"><KeyRound className="size-4" /> Connect</Button></div></CardContent></Card></div></SiteLayout>;
  }

  return <SiteLayout><div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Gadget Guardian operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Admin dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Persisted prediction records and inferred e-waste opportunities.</p></div><Button variant="outline" className="rounded-xl" onClick={() => void load()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button></div>
    {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
    <div className="flex gap-2 overflow-x-auto border-b border-border pb-2">{(["Overview", "Gadget Analyses", "Analytics", "E-Waste Insights", "Model Performance"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{item}</button>)}</div>
    {!summary ? <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{loading ? "Loading protected admin data…" : "No admin data available."}</CardContent></Card> : <>
      {tab === "Overview" && <><div className="grid gap-4 sm:grid-cols-3"><Stat icon={<Database />} label="Total analyses" value={summary.total_analyses} /><Stat icon={<Sparkles />} label="Total predictions" value={summary.total_predictions} /><Stat icon={<LineChart />} label="Average health score" value={summary.average_health_score === null ? "—" : `${summary.average_health_score}/100`} /></div><div className="grid gap-5 lg:grid-cols-3"><Distribution title="Gadget type distribution" items={summary.gadget_types} /><Distribution title="Health category distribution" items={summary.health_categories} /><Distribution title="Recommendation distribution" items={summary.recommendations} /></div><Records title="Recent analyses" rows={summary.recent} /></>}
      {tab === "Gadget Analyses" && <><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID or gadget" /><select value={filterGadget} onChange={(event) => setFilterGadget(event.target.value)} className="rounded-md border border-input bg-background px-3 text-sm"><option value="">All gadget types</option>{["Laptop", "Smartphone", "Tablet", "Smartwatch"].map((item) => <option key={item}>{item}</option>)}</select><select value={filterHealth} onChange={(event) => setFilterHealth(event.target.value)} className="rounded-md border border-input bg-background px-3 text-sm"><option value="">All health categories</option>{["Excellent", "Good", "Moderate", "Poor", "Critical"].map((item) => <option key={item}>{item}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-input bg-background px-3 text-sm"><option value="created_at">Newest first</option><option value="health_score">Health score</option><option value="remaining_months">Remaining lifespan</option><option value="gadget_type">Gadget type</option></select></div><Button onClick={() => { setPage(1); void load(); }} className="rounded-xl">Apply filters</Button><Records title="Saved prediction records" rows={records} /><div className="flex items-center justify-end gap-3 text-sm"><Button variant="outline" className="rounded-xl" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-muted-foreground">Page {page}</span><Button variant="outline" className="rounded-xl" disabled={records.length < 10} onClick={() => setPage((value) => value + 1)}>Next</Button></div></>}
      {tab === "Analytics" && <div className="grid gap-5 lg:grid-cols-2"><Distribution title="Gadget types" items={summary.gadget_types} /><Distribution title="Health categories" items={summary.health_categories} /><Distribution title="E-waste recommendations" items={summary.recommendations} /><Distribution title="Predicted remaining lifespan (months)" items={lifespan.map((item) => ({ label: `${item.value} months`, count: item.count }))} /></div>}
      {tab === "E-Waste Insights" && <Card className="rounded-2xl shadow-card"><CardHeader><CardTitle className="text-base">Inferred opportunities from recommendations</CardTitle></CardHeader><CardContent><p className="mb-5 text-sm text-muted-foreground">These are recommendation counts, not measured environmental outcomes or kilograms of e-waste avoided.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recommendations.map((item) => <div key={item.label} className="rounded-xl bg-surface p-5"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-3xl font-bold">{item.count}</p><p className="mt-1 text-xs text-muted-foreground">{summary.total_analyses ? `${Math.round((item.count / summary.total_analyses) * 100)}% of analyses` : "No records"}</p></div>)}</div></CardContent></Card>}
      {tab === "Model Performance" && <Card className="rounded-2xl shadow-card"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="size-4 text-primary" /> Verified model evaluation</CardTitle></CardHeader><CardContent>{metrics?.configured && metrics.metrics ? <div className="grid gap-4 sm:grid-cols-4">{Object.entries(metrics.metrics).map(([label, value]) => <Stat key={label} label={label.toUpperCase()} value={value ?? "—"} />)}</div> : <div className="rounded-xl bg-surface p-5 text-sm text-muted-foreground">{metrics?.message ?? "Verified MAE, MSE, RMSE and R² metrics have not been configured. Calculate them in the existing evaluation workflow against a held-out labelled dataset, then save only verified values to backend/model_metrics.json."}</div>}</CardContent></Card>}
    </>}
  </div></SiteLayout>;
}

function Stat({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) { return <Card className="rounded-2xl shadow-card"><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon && <span className="size-4 text-primary">{icon}</span>}{label}</div><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>; }
function Records({ title, rows }: { title: string; rows: AnalysisRecordLike[] }) { return <Card className="overflow-hidden rounded-2xl shadow-card"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="bg-surface text-muted-foreground"><tr><th className="p-4">Date</th><th className="p-4">Gadget</th><th className="p-4">Health</th><th className="p-4">Lifespan</th><th className="p-4">Recommendation</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No saved prediction records.</td></tr> : rows.map((row) => <tr key={row.id} className="border-t border-border"><td className="p-4 text-muted-foreground">{new Date(row.date).toLocaleString()}</td><td className="p-4 font-medium">{row.result.gadget_type}</td><td className="p-4">{row.result.health_score}/100 · {row.result.health_category}</td><td className="p-4">{row.result.remaining_months} months</td><td className="p-4 text-muted-foreground">{row.result.ewaste_recommendation}</td></tr>)}</tbody></table></CardContent></Card>; }
