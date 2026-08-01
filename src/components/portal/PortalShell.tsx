import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { PersonalModules } from "./PersonalModules";
import { BusinessModules } from "./BusinessModules";
import { MerchantModules } from "./MerchantModules";
import { AdminModules } from "./AdminModules";
import { useDemo } from "@/lib/zoryn-store";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
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
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, roles, loading: accountLoading } = useAccount();
  const config = portalConfigs[role];
  const items = portalNav[role];
  const { notice } = useDemo();
  const [page, setPage] = useState<PageKey>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const allowed = accountLoading || roles.includes(role) || roles.includes("admin");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-sidebar-border bg-sidebar p-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <Link
            to="/"
            className="font-display text-2xl font-bold tracking-tight text-sidebar-foreground transition-opacity hover:opacity-80"
          >
            Zoryn<span className="text-primary">.</span>
          </Link>
          <p className="mt-1 text-xs tracking-wide text-sidebar-foreground/60">
            {t("Money. Payments. Rewards.")}
          </p>

          <div className="mt-8 px-3 pb-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sidebar-foreground/40">
              {t("Platform")}
            </p>
          </div>
          <nav className="space-y-1">
            {items.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setPage(key);
                  setMenuOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  page === key
                    ? "border border-primary/20 bg-primary/10 text-primary shadow-[0_10px_26px_-16px_oklch(0.82_0.17_165/0.95)]"
                    : "text-sidebar-foreground/70 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {t(label)}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sidebar-foreground/40">
            {t("Switch portal")}
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-3xl border border-sidebar-border bg-sidebar-accent/40 p-2">
            {roleOrder.map((r) => (
              <Link
                key={r}
                to={rolePaths[r]}
                className={cn(
                  "rounded-2xl px-2 py-2.5 text-center text-xs font-semibold transition-all",
                  r === role
                    ? "border border-primary/20 bg-primary/10 text-primary shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                {t(portalConfigs[r].name)}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          aria-label={t("Close menu")}
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <main className="min-w-0 flex-1 px-5 pb-10 sm:px-8 lg:px-10">
        <header className="sticky top-0 z-20 -mx-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 bg-background/80 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="shrink-0 rounded-xl border border-border p-2 transition-colors hover:bg-secondary lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t("Toggle navigation")}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {t(config.name)} {t("portal")}
              </span>
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{t(moduleTitles[page])}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-3 rounded-full border border-border bg-card/70 py-2 pl-4 pr-3 backdrop-blur">
              <span className="hidden max-w-[16ch] truncate text-sm font-medium sm:inline">
                {profile?.full_name ?? config.user}
              </span>
              <button
                type="button"
                onClick={signOut}
                aria-label={t("Sign out")}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="mt-5 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary shadow-[0_18px_40px_-26px_oklch(0.82_0.17_165/0.8)]"
          >
            {notice}
          </div>
        )}

        <div className="mt-6">
          {!allowed ? (
            <div className="surface-card mx-auto mt-10 max-w-lg rounded-3xl border border-border/70 p-8 text-center">
              <Lock size={22} className="mx-auto text-primary" />
              <h2 className="mt-4 font-display text-xl">{t("Access not granted yet")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Your account does not have access to this portal. LoungeTech grants business, ZorynPay and admin roles.",
                )}
              </p>
              <Link
                to="/personal"
                className="mt-6 inline-flex rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("Go to your personal portal")}
              </Link>
            </div>
          ) : (
            <>
              {role === "personal" && <PersonalModules page={page} />}
              {role === "business" && <BusinessModules page={page} />}
              {role === "merchant" && <MerchantModules page={page} />}
              {role === "admin" && <AdminModules page={page} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
