import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonalModules } from "./PersonalModules";
import { BusinessModules } from "./BusinessModules";
import { MerchantModules } from "./MerchantModules";
import { AdminModules } from "./AdminModules";
import { useDemo } from "@/lib/zoryn-store";
import {
  moduleTitles,
  portalConfigs,
  portalNav,
  rolePaths,
  roleOrder,
  type PageKey,
  type Role,
} from "@/lib/zoryn-data";

export function PortalShell({ role }: { role: Role }) {
  const config = portalConfigs[role];
  const items = portalNav[role];
  const { notice } = useDemo();
  const [page, setPage] = useState<PageKey>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
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
            <Link to="/demo" aria-label="Exit portal" className="text-muted-foreground hover:text-foreground">
              <LogOut size={16} />
            </Link>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
          >
            {notice}
          </div>
        )}

        <div className="mt-6">
          {role === "personal" && <PersonalModules page={page} />}
          {role === "business" && <BusinessModules page={page} />}
          {role === "merchant" && <MerchantModules page={page} />}
          {role === "admin" && <AdminModules page={page} />}
        </div>
      </main>
    </div>
  );
}
