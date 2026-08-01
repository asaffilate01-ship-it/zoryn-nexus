import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Building2, ShieldCheck, Smartphone, WalletCards } from "lucide-react";
import { portalConfigs, providerReadinessByRole, rolePaths, roleOrder } from "@/lib/zoryn-data";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Interactive Product Centre — Zoryn demo portals" },
      {
        name: "description",
        content:
          "Open a Zoryn demo portal: personal banking with pots and cards, business accounts, ZorynPay Tap to Pay or LoungeTech admin operations.",
      },
      { property: "og:title", content: "Zoryn Interactive Product Centre" },
      {
        property: "og:description",
        content:
          "Move money, take card payments and run operations across four fully interactive Zoryn portals with realistic demo data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoHub,
});

const icons = {
  personal: WalletCards,
  business: Building2,
  merchant: Smartphone,
  admin: ShieldCheck,
} as const;

function DemoHub() {
  return (
    <div className="min-h-screen px-5 py-12 sm:px-8 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to zoryn.com
        </Link>
        <span className="mt-8 block text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          Interactive Product Centre
        </span>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          Pick a Zoryn experience<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Every portal is fully interactive with realistic demo data — move money between pots, send
          SEPA transfers, freeze cards, take contactless payments and run compliance queues.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {roleOrder.map((role) => {
            const config = portalConfigs[role];
            const Icon = icons[role];
            return (
              <Link
                key={role}
                to={rolePaths[role]}
                className="group rounded-2xl border border-border bg-card/70 p-6 transition-colors hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/12 p-3 text-primary">
                    <Icon size={22} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>
                <h2 className="mt-5 font-display text-xl">{config.name} portal</h2>
                <p className="mt-1 text-sm text-muted-foreground">{config.tagline}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {providerReadinessByRole.admin.map((p) => (
            <div key={p.label} className="rounded-xl border border-border bg-card/50 px-4 py-3">
              <span className="block text-xs text-muted-foreground">{p.label}</span>
              <strong className="mt-1 block font-display text-sm text-primary">{p.state}</strong>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Demo mode only. No provider credentials are used in the browser; provider calls run
          server-side once sandbox onboarding is approved.
        </p>
      </div>
    </div>
  );
}