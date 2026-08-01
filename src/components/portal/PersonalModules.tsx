import { useState } from "react";
import { Badge, Button, Empty, ErrorText, Field, Panel, Progress, StatCard, inputClass } from "./ui";
import { SupportPanel } from "./SupportPanel";
import { UnifiedWalletCard } from "./UnifiedWalletCard";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";
import { useT } from "@/lib/i18n";

function TxnList({ limit }: { limit?: number }) {
  const { state } = useDemo();
  const t = useT();
  const txns = limit ? state.personal.txns.slice(0, limit) : state.personal.txns;
  return (
    <div className="divide-y divide-border">
      {txns.map((t2) => (
        <div key={t2.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <b className="block truncate text-sm font-medium">{t2.name}</b>
            <small className="text-xs text-muted-foreground">
              {new Date(t2.date).toLocaleDateString("de-DE")} · {t2.category}
              {t2.status === "pending" ? ` · ${t("pending")}` : ""}
            </small>
          </div>
          <span className={t2.amount > 0 ? "font-display text-sm text-primary" : "font-display text-sm"}>
            {t2.amount === 0 ? "—" : `${t2.amount > 0 ? "+" : ""}${money(t2.amount)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function Accounts() {
  const { state, movePersonalFunds } = useDemo();
  const t = useT();
  const p = state.personal;
  const [from, setFrom] = useState("main");
  const [to, setTo] = useState(p.pots[0]?.id ?? "main");
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState<string | null>(null);

  const options = [{ id: "main", name: `${t("Main balance")} — ${money(p.balance)}` }, ...p.pots.map((pot) => ({ id: pot.id, name: `${pot.name} — ${money(pot.balance)}` }))];

  const move = () => setError(movePersonalFunds(from, to, Number(amount)));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Available balance")} value={money(p.balance)} hint={p.iban} />
        <StatCard label={t("Total in pots")} value={money(p.pots.reduce((a, b) => a + b.balance, 0))} hint={t("{count} savings pots", { count: p.pots.length })} />
        <StatCard label={t("BIC")} value={p.bic} hint={t("German IBAN · EUR")} />
      </div>

      <Panel title={t("Savings pots")} subtitle={t("Targets and progress update instantly when you move money")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {p.pots.map((pot) => (
            <div key={pot.id} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-sm">{pot.name}</b>
              <strong className="mt-1 block font-display text-xl">{money(pot.balance)}</strong>
              <small className="text-xs text-muted-foreground">{t("Target {amount}", { amount: money(pot.target) })}</small>
              <div className="mt-3">
                <Progress value={(pot.balance / pot.target) * 100} />
              </div>
              <small className="mt-1 block text-xs text-muted-foreground">
                {t("{percent}% funded", { percent: Math.round((pot.balance / pot.target) * 100) })}
              </small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={t("Move money")} subtitle={t("Main balance → pot, pot → main balance, or pot → pot")}>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <Field label={t("From")}>
            <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t("To")}>
            <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t("Amount (€)")}>
            <input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Button onClick={move}>{t("Move")}</Button>
        </div>
        <ErrorText>{error}</ErrorText>
      </Panel>

      <Panel title={t("Transaction history")} subtitle={t("Seeded demo history plus everything you do here")}>
        <TxnList />
      </Panel>
    </div>
  );
}

function Cards() {
  const { state, toggleCard, setCardLimit } = useDemo();
  const t = useT();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {state.personal.cards.map((c) => (
        <Panel key={c.id} className={c.frozen ? "opacity-80" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <b className="text-sm">{c.label}</b>
              <p className="text-xs text-muted-foreground">{c.type === "physical" ? t("Physical") : t("Virtual")} · •••• {c.last4}</p>
            </div>
            <Badge tone={c.frozen ? "bad" : "good"}>{c.frozen ? t("Frozen") : t("Active")}</Badge>
          </div>
          <div className="mt-4 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 to-accent/10 p-4">
            <span className="text-[11px] uppercase tracking-widest text-primary">Zoryn</span>
            <p className="mt-4 font-display text-lg tracking-widest">•••• •••• •••• {c.last4}</p>
            <p className="mt-2 text-xs text-muted-foreground">{c.holder}</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("Spent {amount}", { amount: money(c.spent) })}</span>
              <span>{t("Limit {amount}", { amount: money(c.limit) })}</span>
            </div>
            <div className="mt-2">
              <Progress value={(c.spent / c.limit) * 100} />
            </div>
            <small className="mt-1 block text-xs text-muted-foreground">
              {t("{percent}% of monthly limit used", { percent: Math.round((c.spent / c.limit) * 100) })}
            </small>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <Button variant={c.frozen ? "primary" : "danger"} className="px-3 py-2 text-xs" onClick={() => toggleCard(c.id)}>
              {c.frozen ? t("Unfreeze card") : t("Freeze card")}
            </Button>
            <Field label={t("Monthly limit (€)")}>
              <input
                className={`${inputClass} w-32`}
                type="number"
                min="0"
                step="50"
                defaultValue={c.limit}
                onBlur={(e) => setCardLimit(c.id, Number(e.target.value))}
              />
            </Field>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Payments() {
  const { state, sepaTransfer } = useDemo();
  const t = useT();
  const p = state.personal;
  const [name, setName] = useState(p.beneficiaries[0]!.name);
  const [iban, setIban] = useState(p.beneficiaries[0]!.iban);
  const [amount, setAmount] = useState("50");
  const [reference, setReference] = useState("Rechnung Juli");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel title={t("New SEPA transfer")} subtitle={t("Debited from {iban}", { iban: p.iban })}>
        <div className="space-y-3">
          <Field label={t("Payee")}>
            <select
              className={inputClass}
              value={name}
              onChange={(e) => {
                const b = p.beneficiaries.find((x) => x.name === e.target.value);
                setName(e.target.value);
                if (b) setIban(b.iban);
              }}
            >
              {p.beneficiaries.map((b) => (
                <option key={b.iban} value={b.name}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t("IBAN")}>
            <input className={inputClass} value={iban} onChange={(e) => setIban(e.target.value)} maxLength={34} />
          </Field>
          <Field label={t("Amount (€)")}>
            <input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label={t("Reference")}>
            <input className={inputClass} value={reference} maxLength={140} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button onClick={() => setError(sepaTransfer({ name, iban, amount: Number(amount), reference }))}>
            {t("Send {amount}", { amount: money(Number(amount) || 0) })}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("Simulated SEPA Credit Transfer — balance is validated before the payment is created.")}
          </p>
        </div>
      </Panel>
      <Panel title={t("Recent transfers")} subtitle={t("Newest first")}>
        <TxnList limit={10} />
      </Panel>
    </div>
  );
}

function Rewards() {
  const { state, redeemPoints } = useDemo();
  const t = useT();
  const p = state.personal;
  const [points, setPoints] = useState("500");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <UnifiedWalletCard role="personal" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Zoryn Points")} value={p.points.toLocaleString("de-DE")} hint={t("Earn 1 point per €10 sent")} />
        <StatCard label={t("Tier")} value={p.tier} hint={t("Next tier at 3,000 points")} />
        <StatCard label={t("Redeemable value")} value={money(Math.floor(p.points / 500) * 5)} hint={t("500 points = €5")} />
      </div>
      <Panel title={t("Convert points to cash")} subtitle={t("500 points converts into €5, credited to your chosen cashback destination")}>
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t("Points to convert")}>
            <input className={`${inputClass} w-40`} type="number" min="500" step="500" value={points} onChange={(e) => setPoints(e.target.value)} />
          </Field>
          <Button onClick={() => setError(redeemPoints(Number(points)))}>
            {t("Convert for {amount}", { amount: money((Math.floor(Number(points) / 500) || 0) * 5) })}
          </Button>
        </div>
        <ErrorText>{error}</ErrorText>
      </Panel>
      <Panel title={t("Partner offers")}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Cafe 1 Demo", t("10th coffee free")],
            ["DB Bahn", t("2× points on tickets")],
            ["REWE Markt", t("1% cashback")],
          ].map(([n, r]) => (
            <div key={n} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-sm">{n}</b>
              <p className="mt-1 text-xs text-muted-foreground">{r}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Overview() {
  const { state } = useDemo();
  const t = useT();
  const p = state.personal;
  const spent = p.txns.filter((t) => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("Available balance")} value={money(p.balance)} hint={p.iban} />
        <StatCard label={t("In savings pots")} value={money(p.pots.reduce((a, b) => a + b.balance, 0))} hint={t("{count} pots", { count: p.pots.length })} />
        <StatCard label={t("Spent this period")} value={money(spent)} hint={t("Across all cards")} />
        <StatCard label={t("Zoryn Points")} value={p.points.toLocaleString("de-DE")} hint={t("{tier} tier", { tier: p.tier })} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title={t("Recent transactions")}>
          <TxnList limit={6} />
        </Panel>
        <div className="space-y-4">
          <Panel title={t("Cards")}>
            <ul className="space-y-3 text-sm">
              {p.cards.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{c.label} · •••• {c.last4}</span>
                  <Badge tone={c.frozen ? "bad" : "good"}>{c.frozen ? t("Frozen") : t("Active")}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("Pots progress")}>
            <ul className="space-y-3">
              {p.pots.map((pot) => (
                <li key={pot.id}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pot.name}</span>
                    <span>{money(pot.balance)} / {money(pot.target)}</span>
                  </div>
                  <div className="mt-1"><Progress value={(pot.balance / pot.target) * 100} /></div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function PersonalModules({ page }: { page: PageKey }) {
  const t = useT();
  switch (page) {
    case "accounts":
      return <Accounts />;
    case "cards":
      return <Cards />;
    case "payments":
      return <Payments />;
    case "rewards":
      return <Rewards />;
    case "support":
      return <SupportPanel role="personal" title={t("Zoryn Personal support")} />;
    default:
      return <Overview />;
  }
}
