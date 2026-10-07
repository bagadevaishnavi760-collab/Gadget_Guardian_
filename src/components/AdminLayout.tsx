import { Link, Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  Database,
  Gauge,
  Leaf,
  LineChart,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Gauge },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/analyses", label: "Gadget Analyses", icon: Database },
  { to: "/admin/e-waste", label: "E-Waste Insights", icon: Leaf },
  { to: "/admin/model-performance", label: "Model Performance", icon: LineChart },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 lg:px-6">
          <div className="flex items-center">
            <Leaf className="mr-2 size-5 text-primary" />
            <span className="font-semibold">Gadget Guardian</span>
          </div>
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground lg:hidden">
            User dashboard
          </Link>
        </div>
        <nav className="overflow-x-auto p-3 lg:flex-1 lg:overflow-visible lg:p-4">
          <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
            Admin
          </p>
          <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/admin" }}
                    className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:gap-3"
                    activeProps={{
                      className: "flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 lg:gap-3",
                    }}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden shrink-0 border-t border-border p-4 lg:block">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ShieldCheck className="size-4" />
            Back to User Dashboard
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
