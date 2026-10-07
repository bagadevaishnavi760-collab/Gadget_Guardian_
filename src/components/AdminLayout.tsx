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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Leaf className="mr-2 size-5 text-primary" />
          <span className="font-semibold">Gadget Guardian</span>
        </div>
        <nav className="p-4">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{
                      className: "bg-primary text-primary-foreground hover:bg-primary/90",
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
        <div className="absolute bottom-0 left-0 w-64 border-t border-border bg-surface p-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ShieldCheck className="size-4" />
            Back to User Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
