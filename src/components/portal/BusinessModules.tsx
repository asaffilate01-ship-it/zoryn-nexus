import { useState } from "react";
import { Badge, Button, Empty, ErrorText, Field, Panel, Progress, StatCard, inputClass } from "./ui";
import { SupportPanel } from "./SupportPanel";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";

function Overview() {
  const { state } = useDemo();
  const b = state.business;
  const inflow = b.txns.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const outflow = b.txns.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const max = Math.max(inflow, outflow, 1);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Business balance" value={money(b.balance)} hint={b.iban} />
        <StatCard label="Daily sales" value={money(b.todaySales)} hint="ZorynPay + online" />
        <StatCard label="Pending settlement" value={money(b.pendingSettlement)} hint="Settles next batch" />
        <StatCard label="Active staff cards" value={String(b.team.filter((t) => !t.frozen).length)} hint={`${b.team.length} team members`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Cash flow" subtitle="Money in vs money out this period">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Money in</span><span>{money(inflow)}</span></div>
              <div className="mt-1"><Progress value={(inflow / max) * 100} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Money out</span><span>{money(outflow)}</span></div>
              <div className="mt-1"><Progress value={(outflow / max) * 100} /></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Net position <b className="text-foreground">{money(inflow - outflow)}</b>
            </p>
          </div>
        </Panel>
        <Panel title="Recent account activity">
          <div className="divide-y divide-border">
            {b.txns.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <b className="block truncate text-sm">{t.name}</b>
                  <small className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("de-DE")} · {t.category}</small>
                </div>
                <span className={t.amount > 0 ? "font-display text-sm text-primary" : "font-display text-sm"}>
                  {t.amount > 0 ? "+" : ""}{money(t.amount)}
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
  const b = state.business;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Operating account" value={money(b.balance)} hint={b.iban} />
        <StatCard label="Daily sales" value={money(b.todaySales)} />
        <StatCard label="Pending settlements" value={money(b.pendingSettlement)} hint="From ZorynPay" />
      </div>
      <Panel title="Account statement" subtitle="Seeded history plus live demo activity">
        <div className="divide-y divide-border">
          {b.txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <b className="block truncate text-sm">{t.name}</b>
                <small className="text-xs text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("de-DE")} · {t.category}{t.status === "pending" ? " · pending" : ""}
                </small>
              </div>
              <span className={t.amount > 0 ? "font-display text-sm text-primary" : "font-display text-sm"}>
                {t.amount > 0 ? "+" : ""}{money(t.amount)}
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
        <Panel title="Supplier SEPA payment" subtitle={`Debited from ${b.iban}`}>
          <div className="space-y-3">
            <Field label="Supplier">
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
            <Field label="IBAN"><input className={inputClass} value={iban} onChange={(e) => setIban(e.target.value)} /></Field>
            <Field label="Amount (€)"><input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Reference"><input className={inputClass} value={reference} maxLength={140} onChange={(e) => setReference(e.target.value)} /></Field>
            <ErrorText>{error}</ErrorText>
            <Button onClick={() => setError(supplierPayment({ name: supplier, iban, amount: Number(amount), reference }))}>
              Pay {money(Number(amount) || 0)}
            </Button>
          </div>
        </Panel>

        <Panel title="Create payment link" subtitle="Share a hosted checkout link with a customer">
          <div className="space-y-3">
            <Field label="Description"><input className={inputClass} value={linkDesc} maxLength={180} onChange={(e) => setLinkDesc(e.target.value)} /></Field>
            <Field label="Amount (€)"><input className={inputClass} type="number" min="0" step="0.01" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)} /></Field>
            <ErrorText>{linkError}</ErrorText>
            <Button
              onClick={() => {
                const v = Number(linkAmount);
                if (!linkDesc.trim()) return setLinkError("Add a description.");
                if (!(v > 0)) return setLinkError("Enter an amount greater than €0.");
                setLinkError(null);
                createLink("business", { description: linkDesc.trim(), amount: v });
              }}
            >
              Create link
            </Button>
            <div className="divide-y divide-border">
              {b.links.length === 0 ? <Empty>No payment links yet.</Empty> : b.links.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <b className="block truncate text-sm">{l.reference} · {l.description}</b>
                    <small className="block truncate text-xs text-muted-foreground">{l.url}</small>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-sm">{money(l.amount)}</span>
                    <div className="mt-1"><Badge tone={l.status === "paid" ? "good" : "neutral"}>{l.status}</Badge></div>
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
  const b = state.business;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Team members" value={String(b.team.length)} />
        <StatCard label="Active cards" value={String(b.team.filter((t) => !t.frozen).length)} />
        <StatCard label="Combined limits" value={money(b.team.reduce((a, t) => a + t.limit, 0))} />
      </div>
      <Panel title="Team members & staff cards" subtitle="Roles, per-card limits and utilisation">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">Member</th><th className="pb-3">Role</th><th className="pb-3">Card</th>
                <th className="pb-3">Utilisation</th><th className="pb-3">Limit (€)</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {b.team.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 font-medium">{t.name}</td>
                  <td className="py-3 text-muted-foreground">{t.role}</td>
                  <td className="py-3 text-muted-foreground">•••• {t.cardLast4}</td>
                  <td className="py-3">
                    <div className="w-32"><Progress value={(t.spent / t.limit) * 100} /></div>
                    <small className="text-xs text-muted-foreground">{money(t.spent)} of {money(t.limit)}</small>
                  </td>
                  <td className="py-3">
                    <input
                      className={`${inputClass} w-28`}
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={t.limit}
                      onBlur={(e) => setTeamLimit(t.id, Number(e.target.value))}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={t.frozen ? "bad" : "good"}>{t.frozen ? "Frozen" : "Active"}</Badge>
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleTeamCard(t.id)}>
                        {t.frozen ? "Unfreeze" : "Freeze"}
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
  const { state, notify } = useDemo();
  const b = state.business;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Business points" value={b.points.toLocaleString("de-DE")} />
        <StatCard label="Tier" value="Gold" hint="1.5% cashback on card spend" />
        <StatCard label="Cashback value" value={money(Math.floor(b.points / 500) * 5)} hint="500 points = €5" />
      </div>
      <Panel title="Rewards campaigns" subtitle="Team spend automatically earns Zoryn Points">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Supplier spend boost", "2× points on supplier payouts"],
            ["Team card cashback", "1.5% back on staff card spend"],
          ].map(([n, d]) => (
            <div key={n} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-sm">{n}</b>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              <Button variant="ghost" className="mt-3 px-3 py-1.5 text-xs" onClick={() => notify(`${n} activated for the demo organisation.`)}>
                Activate
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function BusinessModules({ page }: { page: PageKey }) {
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
      return <SupportPanel role="business" title="Zoryn Business support" />;
    default:
      return <Overview />;
  }
}
