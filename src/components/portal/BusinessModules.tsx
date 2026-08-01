import { useState } from "react";
import { Badge, Button, Empty, ErrorText, Field, Panel, Progress, StatCard, inputClass } from "./ui";
import { SupportPanel } from "./SupportPanel";
import { UnifiedWalletCard } from "./UnifiedWalletCard";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";
import { useT } from "@/lib/i18n";

function Overview() {
  const { state } = useDemo();
  const t = useT();
  const b = state.business;
  const inflow = b.txns.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const outflow = b.txns.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const max = Math.max(inflow, outflow, 1);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("Business balance")} value={money(b.balance)} hint={b.iban} />
        <StatCard label={t("Daily sales")} value={money(b.todaySales)} hint="ZorynPay + online" />
        <StatCard label={t("Pending settlement")} value={money(b.pendingSettlement)} hint={t("Settles next batch")} />
        <StatCard label={t("Active staff cards")} value={String(b.team.filter((t) => !t.frozen).length)} hint={t("{count} team members", { count: b.team.length })} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title={t("Cash flow")} subtitle={t("Money in vs money out this period")}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>{t("Money in")}</span><span>{money(inflow)}</span></div>
              <div className="mt-1"><Progress value={(inflow / max) * 100} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>{t("Money out")}</span><span>{money(outflow)}</span></div>
              <div className="mt-1"><Progress value={(outflow / max) * 100} /></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("Net position")} <b className="text-foreground">{money(inflow - outflow)}</b>
            </p>
          </div>
        </Panel>
        <Panel title={t("Recent account activity")}>
          <div className="divide-y divide-border">
            {b.txns.slice(0, 6).map((t2) => (
              <div key={t2.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <b className="block truncate text-sm">{t2.name}</b>
                  <small className="text-xs text-muted-foreground">{new Date(t2.date).toLocaleDateString("de-DE")} · {t2.category}</small>
                </div>
                <span className={t2.amount > 0 ? "font-display text-sm text-primary" : "font-display text-sm"}>
                  {t2.amount > 0 ? "+" : ""}{money(t2.amount)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AccountModule() {
  const { state } = useDemo();
  const t = useT();
  const b = state.business;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Operating account")} value={money(b.balance)} hint={b.iban} />
        <StatCard label={t("Daily sales")} value={money(b.todaySales)} />
        <StatCard label={t("Pending settlements")} value={money(b.pendingSettlement)} hint="ZorynPay" />
      </div>
      <Panel title={t("Account statement")} subtitle={t("Seeded history plus live demo activity")}>
        <div className="divide-y divide-border">
          {b.txns.map((t2) => (
            <div key={t2.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <b className="block truncate text-sm">{t2.name}</b>
                <small className="text-xs text-muted-foreground">
                  {new Date(t2.date).toLocaleDateString("de-DE")} · {t2.category}{t2.status === "pending" ? ` · ${t("pending")}` : ""}
                </small>
              </div>
              <span className={t2.amount > 0 ? "font-display text-sm text-primary" : "font-display text-sm"}>
                {t2.amount > 0 ? "+" : ""}{money(t2.amount)}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Payments() {
  const { state, supplierPayment, createLink } = useDemo();
  const t = useT();
  const b = state.business;
  const [supplier, setSupplier] = useState(b.suppliers[0]!.name);
  const [iban, setIban] = useState(b.suppliers[0]!.iban);
  const [amount, setAmount] = useState("1200");
  const [reference, setReference] = useState("Rechnung 2026-07");
  const [error, setError] = useState<string | null>(null);
  const [linkDesc, setLinkDesc] = useState("Consulting retainer");
  const [linkAmount, setLinkAmount] = useState("2400");
  const [linkError, setLinkError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Supplier SEPA payment")} subtitle={t("Debited from {iban}", { iban: b.iban })}>
          <div className="space-y-3">
            <Field label={t("Supplier")}>
              <select
                className={inputClass}
                value={supplier}
                onChange={(e) => {
                  const s = b.suppliers.find((x) => x.name === e.target.value);
                  setSupplier(e.target.value);
                  if (s) setIban(s.iban);
                }}
              >
                {b.suppliers.map((s) => (<option key={s.iban} value={s.name}>{s.name}</option>))}
              </select>
            </Field>
            <Field label={t("IBAN")}><input className={inputClass} value={iban} onChange={(e) => setIban(e.target.value)} /></Field>
            <Field label={t("Amount (€)")}><input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label={t("Reference")}><input className={inputClass} value={reference} maxLength={140} onChange={(e) => setReference(e.target.value)} /></Field>
            <ErrorText>{error}</ErrorText>
            <Button onClick={() => setError(supplierPayment({ name: supplier, iban, amount: Number(amount), reference }))}>
              {t("Pay {amount}", { amount: money(Number(amount) || 0) })}
            </Button>
          </div>
        </Panel>

        <Panel title={t("Create payment link")} subtitle={t("Share a hosted checkout link with a customer")}>
          <div className="space-y-3">
            <Field label={t("Description")}><input className={inputClass} value={linkDesc} maxLength={180} onChange={(e) => setLinkDesc(e.target.value)} /></Field>
            <Field label={t("Amount (€)")}><input className={inputClass} type="number" min="0" step="0.01" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)} /></Field>
            <ErrorText>{linkError}</ErrorText>
            <Button
              onClick={() => {
                const v = Number(linkAmount);
                if (!linkDesc.trim()) return setLinkError(t("Add a description."));
                if (!(v > 0)) return setLinkError(t("Enter an amount greater than €0."));
                setLinkError(null);
                createLink("business", { description: linkDesc.trim(), amount: v });
              }}
            >
              {t("Create link")}
            </Button>
            <div className="divide-y divide-border">
              {b.links.length === 0 ? <Empty>{t("No payment links yet.")}</Empty> : b.links.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <b className="block truncate text-sm">{l.reference} · {l.description}</b>
                    <small className="block truncate text-xs text-muted-foreground">{l.url}</small>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-sm">{money(l.amount)}</span>
                    <div className="mt-1"><Badge tone={l.status === "paid" ? "good" : "neutral"}>{t(l.status)}</Badge></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Team() {
  const { state, setTeamLimit, toggleTeamCard } = useDemo();
  const t = useT();
  const b = state.business;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Team members")} value={String(b.team.length)} />
        <StatCard label={t("Active cards")} value={String(b.team.filter((t) => !t.frozen).length)} />
        <StatCard label={t("Combined limits")} value={money(b.team.reduce((a, t) => a + t.limit, 0))} />
      </div>
      <Panel title={t("Team members & staff cards")} subtitle={t("Roles, per-card limits and utilisation")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">{t("Member")}</th><th className="pb-3">{t("Role")}</th><th className="pb-3">{t("Card")}</th>
                <th className="pb-3">{t("Utilisation")}</th><th className="pb-3">{t("Limit (€)")}</th><th className="pb-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {b.team.map((t2) => (
                <tr key={t2.id}>
                  <td className="py-3 font-medium">{t2.name}</td>
                  <td className="py-3 text-muted-foreground">{t2.role}</td>
                  <td className="py-3 text-muted-foreground">•••• {t2.cardLast4}</td>
                  <td className="py-3">
                    <div className="w-32"><Progress value={(t2.spent / t2.limit) * 100} /></div>
                    <small className="text-xs text-muted-foreground">{t("{spent} of {limit}", { spent: money(t2.spent), limit: money(t2.limit) })}</small>
                  </td>
                  <td className="py-3">
                    <input
                      className={`${inputClass} w-28`}
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={t2.limit}
                      onBlur={(e) => setTeamLimit(t2.id, Number(e.target.value))}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={t2.frozen ? "bad" : "good"}>{t2.frozen ? t("Frozen") : t("Active")}</Badge>
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleTeamCard(t2.id)}>
                        {t2.frozen ? t("Unfreeze") : t("Freeze")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Rewards() {
  const { state, notify, redeemBusinessPoints } = useDemo();
  const t = useT();
  const b = state.business;
  const [points, setPoints] = useState("500");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <UnifiedWalletCard role="business" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Business points")} value={b.points.toLocaleString("de-DE")} />
        <StatCard label={t("Tier")} value={b.tier} hint={t("1.5% cashback on card spend")} />
        <StatCard label={t("Cashback value")} value={money(Math.floor(b.points / 500) * 5)} hint={t("500 points = €5")} />
      </div>
      <Panel title={t("Convert points to cash")} subtitle={t("500 points converts into €5, credited to your chosen cashback destination")}>
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t("Points to convert")}>
            <input className={`${inputClass} w-40`} type="number" min="500" step="500" value={points} onChange={(e) => setPoints(e.target.value)} />
          </Field>
          <Button onClick={() => setError(redeemBusinessPoints(Number(points)))}>
            {t("Convert for {amount}", { amount: money((Math.floor(Number(points) / 500) || 0) * 5) })}
          </Button>
        </div>
        <ErrorText>{error}</ErrorText>
      </Panel>
      <Panel title={t("Rewards campaigns")} subtitle={t("Team spend automatically earns Zoryn Points")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [t("Supplier spend boost"), t("2× points on supplier payouts")],
            [t("Team card cashback"), t("1.5% back on staff card spend")],
          ].map(([n, d]) => (
            <div key={n} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-sm">{n}</b>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              <Button variant="ghost" className="mt-3 px-3 py-1.5 text-xs" onClick={() => notify(t("{name} activated for the demo organisation.", { name: n }))}>
                {t("Activate")}
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function BusinessModules({ page }: { page: PageKey }) {
  const t = useT();
  switch (page) {
    case "accounts":
      return <AccountModule />;
    case "payments":
      return <Payments />;
    case "team":
      return <Team />;
    case "rewards":
      return <Rewards />;
    case "support":
      return <SupportPanel role="business" title={t("Zoryn Business support")} />;
    default:
      return <Overview />;
  }
}
