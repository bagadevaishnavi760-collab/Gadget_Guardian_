import { createFileRoute } from "@tanstack/react-router";
import {
  BatteryWarning,
  Gift,
  HandCoins,
  PackageSearch,
  Recycle,
  RefreshCcw,
  Repeat,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/e-waste-guide")({
  head: () => ({
    meta: [
      { title: "E-Waste Guide — Reuse, Repair, Refurbish, Recycle | Gadget Guardian" },
      {
        name: "description",
        content: "Practical guidance on reusing, repairing, refurbishing, donating, reselling, recovering parts and safely recycling electronics.",
      },
      { property: "og:title", content: "E-Waste Guide — Gadget Guardian" },
      { property: "og:description", content: "The waste hierarchy for electronics: reuse, repair, refurbish, recycle, dispose." },
    ],
  }),
  component: GuidePage,
});

const options = [
  { icon: Repeat, title: "Reuse", text: "Keep the device in service in a lighter role — a media player, a home server, a study tablet or a spare phone. Reuse avoids all manufacturing emissions of a replacement." },
  { icon: Wrench, title: "Repair", text: "Replace the failing part rather than the whole product. Batteries, screens, keyboards, fans and thermal paste are the most common and most cost-effective repairs." },
  { icon: RefreshCcw, title: "Refurbish", text: "A deeper overhaul: clean internals, replace the battery, reinstall the OS, upgrade RAM or SSD. A refurbished laptop can gain three or more extra years." },
  { icon: Gift, title: "Donate", text: "Working devices are valuable to schools, NGOs and community centres. Wipe your data with a factory reset and full-disk erase before handing it over." },
  { icon: HandCoins, title: "Resell", text: "Sell through certified buy-back or trade-in programmes. Even a modest resale value keeps the device in circulation rather than in a drawer." },
  { icon: PackageSearch, title: "Component Recovery", text: "When the device cannot run again, harvest healthy parts — RAM, SSD, screen, camera modules, chargers — as spares for other devices." },
  { icon: Recycle, title: "Recycling", text: "Authorised e-waste recyclers recover gold, copper, aluminium and rare earths, and neutralise hazardous substances such as lead and mercury." },
  { icon: ShieldAlert, title: "Safe Disposal", text: "Never bin electronics or batteries with household waste and never burn them. Use municipal e-waste drives or manufacturer take-back points." },
];

const hierarchy = ["Reuse", "Repair", "Refurbish", "Recycle", "Disposal"];

function GuidePage() {
  return (
    <SiteLayout>
      <section className="eco-soft border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">E-Waste Guide</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every option below keeps material out of landfill. The higher up the hierarchy you can act, the more energy,
            water and raw material you save.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {hierarchy.map((h, i) => (
              <div key={h} className="flex items-center gap-2">
                <span
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    i === hierarchy.length - 1
                      ? "bg-destructive/10 text-destructive"
                      : "eco-gradient text-primary-foreground"
                  }`}
                >
                  {h}
                </span>
                {i < hierarchy.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Most preferred on the left, least preferred on the right.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((o) => (
            <Card key={o.title} className="rounded-2xl shadow-card transition-shadow hover:shadow-soft">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <o.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-semibold">{o.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 rounded-2xl border-warning/40 bg-surface shadow-card">
          <CardContent className="flex gap-4 p-6">
            <BatteryWarning className="size-6 shrink-0 text-warning" />
            <div>
              <h2 className="font-semibold">Battery safety</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Swollen or punctured lithium-ion batteries are a fire hazard. Do not press, pierce or charge them. Store
                the device in a cool, non-flammable place and hand it to an authorised collection point as soon as
                possible.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
