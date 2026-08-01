import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  Building2,
  CreditCard,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { providerSnapshotQueryOptions } from "../lib/snapshot-query";
import { dateTime, eur } from "../lib/format";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

type Tab = "overview" | "personal" | "business" | "pay" | "operations" | "scenarios";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
  { id: "pay", label: "ZorynPay" },
  { id: "operations", label: "Operations" },
  { id: "scenarios", label: "Scenario Lab" },
];

export function ProviderReadyCentre({ initialTab = "overview" }: { initialTab?: Tab }) {
  const { data: snapshot } = useSuspenseQuery(providerSnapshotQueryOptions);
  const {
    customer: demoCustomer,
    cards: demoCards,
    merchant: demoMerchant,
    team: demoTeam,
    staffCards,
    transactions: demoTransactions,
    providerHealth,
    scenarios,
    webhookEvents,
    terminals,
    rewards,
    business,
    pay,
  } = snapshot;
  const mainAccount = snapshot.accounts[0] ?? {
    id: "none",
    name: "No account",
    iban: "",
    availableCents: 0,
  };

  const [tab, setTab] = useState<Tab>(initialTab);
  const [pots, setPots] = useState(snapshot.pots);
  const [mainBalance, setMainBalance] = useState(mainAccount.availableCents);
  const [amount, setAmount] = useState("100");
  const [selectedPot, setSelectedPot] = useState(snapshot.pots[0]?.id ?? "");
  const activePot = useMemo(
    () => pots.find((p) => p.id === selectedPot) ?? pots[0],
    [pots, selectedPot],
  );

  const cents = () => Math.round(Number(amount.replace(",", ".")) * 100);
  const moveToPot = () => {
    const c = cents();
    if (!activePot || !Number.isFinite(c) || c <= 0 || c > mainBalance) return;
    setMainBalance((v) => v - c);
    setPots((p) => p.map((x) => (x.id === activePot.id ? { ...x, balanceCents: x.balanceCents + c } : x)));
  };
  const moveFromPot = () => {
    const c = cents();
    if (!activePot || !Number.isFinite(c) || c <= 0 || c > activePot.balanceCents) return;
    setMainBalance((v) => v + c);
    setPots((p) => p.map((x) => (x.id === activePot.id ? { ...x, balanceCents: x.balanceCents - c } : x)));
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Link to="/demo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Product centre
          </Link>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Zoryn Nexus</p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl">Provider-ready product centre</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Production-state UX for banking, business, acquiring, rewards and operations — mapped behind the
                Swan and Adyen adapter boundaries and running in mock mode until sandbox credentials are added.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setTab(x.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === x.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === "overview" && (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Available balance" value={eur(mainBalance)} help={mainAccount.iban} icon={<Landmark className="h-5 w-5 text-primary" />} />
              <MetricCard label="Rewards value" value={eur(rewards.valueCents)} help={`${rewards.points.toLocaleString("de-DE")} points · ${rewards.tier} tier`} icon={<WalletCards className="h-5 w-5 text-primary" />} />
              <MetricCard label="Today's merchant sales" value={eur(demoMerchant.todaySalesCents)} help={`${demoMerchant.terminalsOnline}/${demoMerchant.terminalsTotal} terminals online`} icon={<CreditCard className="h-5 w-5 text-primary" />} />
              <MetricCard
                label="Open review actions"
                value={String(snapshot.onboardingActions.length + webhookEvents.filter((e) => e.status !== "processed").length)}
                help={`${scenarios.filter((s) => s.severity === "critical" || s.severity === "high").length} high priority`}
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl">Account readiness</h2>
                    <p className="text-sm text-muted-foreground">Customer and provider state mapping</p>
                  </div>
                  <StatusBadge status={demoCustomer.status} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Account holder</p>
                    <p className="mt-2 font-semibold">{demoCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">Risk score {demoCustomer.riskScore}/100</p>
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Regulated source</p>
                    <p className="mt-2 font-semibold">Swan adapter</p>
                    <p className="text-sm text-muted-foreground">Mock mode until sandbox keys are added</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {demoCustomer.providerRefs.map((r) => (
                    <div key={r.providerId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3 text-sm">
                      <span className="capitalize">{r.provider} · {r.resourceType}</span>
                      <span className="font-mono text-xs text-muted-foreground">{r.providerId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Provider health</h2>
                <div className="mt-4 space-y-3">
                  {providerHealth.map((p) => (
                    <div key={p.provider} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/50 p-3">
                      <div>
                        <p className="font-semibold capitalize">{p.provider}</p>
                        <p className="text-xs text-muted-foreground">{p.message}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === "personal" && (
          <div className="space-y-8">
            <section className="grid gap-4 lg:grid-cols-3">
              <MetricCard label="Main account" value={eur(mainBalance)} help={mainAccount.iban} />
              <MetricCard label="Pots" value={eur(pots.reduce((a, p) => a + p.balanceCents, 0))} help={`${pots.length} savings goals`} />
              <MetricCard label="Cards" value={`${demoCards.filter((c) => c.status === "active").length} active`} help={`${demoCards.length} total`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Move money between account and pots</h2>
                <label className="mt-5 block text-sm font-semibold">
                  Savings pot
                  <select
                    value={selectedPot}
                    onChange={(e) => setSelectedPot(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm"
                  >
                    {pots.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {eur(p.balanceCents)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Amount
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm"
                  />
                </label>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={moveToPot} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                    Move to pot
                  </button>
                  <button onClick={moveFromPot} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">
                    Move to main
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Mock allocations persist for this session. In production the banking provider remains the ledger
                  source of truth.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Recent transactions</h2>
                <div className="mt-4 divide-y divide-border">
                  {demoTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="font-semibold">{tx.counterparty}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category} · {dateTime(tx.bookedAt)} · {tx.reference}
                        </p>
                        {tx.rewardsPoints != null && (
                          <p className="mt-1 text-xs font-medium text-primary">
                            {tx.rewardsPoints > 0 ? "+" : ""}
                            {tx.rewardsPoints} reward points
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amountCents < 0 ? "text-foreground" : "text-primary"}`}>{eur(tx.amountCents)}</p>
                        <StatusBadge status={tx.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {demoCards.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{c.label}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-10 text-xl tracking-[0.25em]">•••• {c.last4}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Spent {eur(c.spentCents)} of {eur(c.monthlyLimitCents)}
                  </p>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "business" && (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Operating balance" value={eur(business.balanceCents)} help="Business account" />
              <MetricCard label="Pending approvals" value={eur(business.pendingApprovalCents)} help="Held against available balance" />
              <MetricCard label="Card spend" value={eur(business.cardSpendCents)} help={`Across ${demoTeam.length} team members`} />
              <MetricCard label="Team members" value={String(demoTeam.length)} help="Roles and approval limits below" />
            </section>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl">Team and permissions</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {demoTeam.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-4">
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {m.role} · approval limit {eur(m.approvalLimitCents)}
                        </p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Business actions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["Create supplier transfer", "Invite team member", "Issue staff card", "Upload receipt", "Export DATEV data", "Create approval policy"].map((x) => (
                    <Link key={x} to="/business" className="rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm font-semibold hover:bg-secondary/70">
                      {x}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card/70 p-6">
              <h2 className="font-display text-xl">Staff and expense cards</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {staffCards.map((c) => (
                  <div key={c.id} className="rounded-xl bg-secondary/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{c.label}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {c.type} · •••• {c.last4}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Spent {eur(c.spentCents)} of {eur(c.monthlyLimitCents)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "pay" && (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Today's sales" value={eur(pay.todaySalesCents)} help="Settled and pending payments" />
              <MetricCard label="Pending settlement" value={eur(pay.pendingSettlementCents)} help="Expected next banking day" />
              <MetricCard label="Refunds" value={eur(pay.refundsCents)} help="Refunded transactions" />
              <MetricCard label="Rewards balance" value={`${rewards.points.toLocaleString("de-DE")} pts`} help={`${rewards.tier} tier`} />
            </section>
            <section className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Tap to Pay readiness</h2>
                <div className="mt-5 rounded-2xl border border-border bg-background p-6">
                  <p className="text-sm text-muted-foreground">ZorynPay · {demoMerchant.name}</p>
                  <p className="mt-8 text-center font-display text-5xl">€24.90</p>
                  <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10">
                    <Activity className="h-14 w-14 text-primary" />
                  </div>
                  <p className="mt-5 text-center font-semibold">Ready for customer tap</p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    The acquiring provider's Mobile SDK replaces this simulation.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-6">
                <h2 className="font-display text-xl">Terminal estate</h2>
                <div className="mt-4 space-y-3">
                  {terminals.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-4">
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Battery {t.battery}%</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === "operations" && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card/70 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-display text-xl">Webhook event centre</h2>
                  <p className="text-sm text-muted-foreground">
                    Idempotency, retries, ordering and dead-letter visibility.
                  </p>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-3">Provider</th>
                      <th>Event</th>
                      <th>Resource</th>
                      <th>Occurred</th>
                      <th>Attempts</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookEvents.map((e) => (
                      <tr key={e.id} className="border-b border-border/60">
                        <td className="py-4 capitalize">{e.provider}</td>
                        <td className="font-medium">{e.type}</td>
                        <td className="font-mono text-xs">{e.resourceId}</td>
                        <td>{dateTime(e.occurredAt)}</td>
                        <td>{e.attempts}</td>
                        <td>
                          <StatusBadge status={e.status} />
                          {e.error && <p className="mt-1 max-w-xs text-xs text-destructive">{e.error}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Live events are received at <code>/api/public/provider-webhooks</code> and replayed through{" "}
                <code>/api/public/provider-api</code>.
              </p>
            </section>
          </div>
        )}

        {tab === "scenarios" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl">Realistic scenario lab</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Successful, failed, restricted and asynchronous journeys for demos and acceptance testing.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scenarios.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border bg-card/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.group}</span>
                    <StatusBadge status={s.severity} />
                  </div>
                  <h3 className="mt-4 font-display text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.description}</p>
                  <div className="mt-4">
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
