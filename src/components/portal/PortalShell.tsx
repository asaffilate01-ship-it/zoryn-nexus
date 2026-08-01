import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getModuleContent,
  moduleTitles,
  money,
  portalConfigs,
  portalNav,
  providerReadinessByRole,
  recentActivityByRole,
  roleOrder,
  rolePaths,
  type PageKey,
  type Role,
  type Stat,
} from "@/lib/zoryn-data";

function formatStat(stat: Stat) {
  if (typeof stat.value !== "number") return stat.value;
  return stat.format === "money" ? money(stat.value) : stat.value.toLocaleString("de-DE");
}

export function PortalShell({ role }: { role: Role }) {
  const config = portalConfigs[role];
  const items = portalNav[role];
  const recentActivity = recentActivityByRole[role];
  const providerReadiness = providerReadinessByRole[role];
  const [page, setPage] = useState<PageKey>("overview");
  const moduleData = getModuleContent(role, page);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const act = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-sidebar-border bg-sidebar/95 p-6 backdrop-blur transition-transform lg:static lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <Link to="/" className="font-display text-2xl font-bold text-sidebar-foreground">
            Zoryn<span className="text-primary">.</span>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Money. Payments. Rewards.</p>

          <nav className="mt-8 space-y-1">
            {items.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setPage(key);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  page === key
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Switch portal
          </p>
          <div className="grid grid-cols-2 gap-2">
            {roleOrder.map((r) => (
              <Link
                key={r}
                to={rolePaths[r]}
                className={cn(
                  "rounded-lg border border-sidebar-border px-2 py-2 text-center text-xs font-medium transition-colors",
                  r === role
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {portalConfigs[r].name}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main */}
      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {config.name} portal
              </span>
              <h1 className="text-2xl font-semibold sm:text-3xl">{moduleTitles[page]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2">
            <span className="text-sm font-medium">{config.user}</span>
            <Link to="/" aria-label="Exit portal" className="text-muted-foreground hover:text-foreground">
              <LogOut size={16} />
            </Link>
          </div>
        </header>

        {notice && (
          <div className="mt-5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
            {notice}
          </div>
        )}

        {page === "overview" ? (
          <div className="mt-6 space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {config.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-card/70 p-5">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <strong className="mt-2 block font-display text-2xl">{formatStat(stat)}</strong>
                  <small className="text-xs text-muted-foreground">Demo data</small>
                </div>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-accent/10 p-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                  {config.primaryLabel}
                </span>
                <h2 className="mt-2 font-display text-4xl">
                  {role === "admin" ? "Provider operations" : money(config.balance)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{config.primarySubtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => act(config.primaryActionResult)}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {config.primaryAction}
                  </button>
                  <button
                    onClick={() => act("Details copied to clipboard (mock)")}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    View details
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h3 className="font-display text-lg">Provider readiness</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {providerReadiness.map((p) => (
                    <li key={p.label} className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{p.label}</span>
                      <em className="not-italic rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
                        {p.state}
                      </em>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/70 p-6">
              <h3 className="font-display text-lg">Recent activity</h3>
              <div className="mt-4 divide-y divide-border">
                {recentActivity.map((t) => (
                  <div key={t.name} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <b className="block text-sm font-medium">{t.name}</b>
                      <small className="text-xs text-muted-foreground">{t.category}</small>
                    </div>
                    <span
                      className={cn(
                        "font-display text-sm",
                        t.amount > 0 ? "text-primary" : "text-foreground",
                      )}
                    >
                      {t.amount === 0 ? "—" : `${t.amount > 0 ? "+" : ""}${money(t.amount)}`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <section className="mt-6 rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              {config.name} workspace
            </span>
            <h2 className="mt-2 font-display text-2xl">{moduleData.title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{moduleData.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {moduleData.metrics.map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-background/40 p-4">
                  <b className="text-xs font-medium text-muted-foreground">{k}</b>
                  <strong className="mt-1 block font-display text-xl">{v}</strong>
                </div>
              ))}
            </div>
            <button
              onClick={() => act(moduleData.actionResult)}
              className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {moduleData.actionLabel}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}