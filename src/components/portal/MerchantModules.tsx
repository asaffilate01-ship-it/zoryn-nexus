import { useEffect, useState } from "react";
import { Badge, Button, Empty, ErrorText, Field, Panel, Progress, StatCard, inputClass } from "./ui";
import { SupportPanel } from "./SupportPanel";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";

type Stage = "amount" | "waiting" | "reading" | "approved" | "declined";

function TapToPay() {
  const { state, takePayment, notify } = useDemo();
  const m = state.merchant;
  const [amount, setAmount] = useState("24.50");
  const [stage, setStage] = useState<Stage>("amount");
  const [error, setError] = useState<string | null>(null);
  const value = Number(amount);

  useEffect(() => {
    if (stage === "reading") {
      const t = window.setTimeout(() => {
        takePayment(value, "Tap to Pay");
        setStage("approved");
      }, 1200);
      return () => window.clearTimeout(t);
    }
    if (stage === "approved") {
      const t = window.setTimeout(() => setStage("amount"), 4000);
      return () => window.clearTimeout(t);
    }
    return;
  }, [stage]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Panel title="Tap to Pay" subtitle="Enter any amount and simulate a contactless tap">
        {stage === "amount" && (
          <div className="space-y-3">
            <Field label="Amount (€)">
              <input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[3.5, 12.8, 24.5, 49.9].map((v) => (
                <Button key={v} variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAmount(String(v))}>
                  {money(v)}
                </Button>
              ))}
            </div>
            <ErrorText>{error}</ErrorText>
            <Button
              onClick={() => {
                if (!(value > 0)) return setError("Enter an amount greater than €0.");
                setError(null);
                setStage("waiting");
              }}
            >
              Charge {money(value || 0)}
            </Button>
          </div>
        )}

        {stage !== "amount" && (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 p-8 text-center">
            <span className="text-[11px] uppercase tracking-widest text-primary">ZorynPay terminal</span>
            <p className="mt-3 font-display text-4xl">{money(value)}</p>
            {stage === "waiting" && (
              <>
                <p className="mt-4 text-sm text-muted-foreground">Present card or phone to the reader…</p>
                <Button className="mt-5" onClick={() => setStage("reading")}>Simulate customer tap</Button>
                <div className="mt-3">
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setStage("amount")}>Cancel</Button>
                </div>
              </>
            )}
            {stage === "reading" && <p className="mt-4 animate-pulse text-sm text-muted-foreground">Reading card · authorising…</p>}
            {stage === "approved" && (
              <>
                <p className="mt-4 font-display text-2xl text-primary">Approved</p>
                <p className="mt-1 text-sm text-muted-foreground">Receipt sent · balance and settlement updated</p>
                <Button variant="ghost" className="mt-4 px-3 py-1.5 text-xs" onClick={() => setStage("amount")}>New payment</Button>
              </>
            )}
          </div>
        )}
      </Panel>

      <Panel
        title="Today's payments"
        subtitle={`Merchant balance ${money(m.balance)} · pending settlement ${money(m.pendingSettlement)}`}
        action={<Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => notify("Receipts re-sent to customers (demo).")}>Resend receipts</Button>}
      >
        <div className="divide-y divide-border">
          {m.payments.slice(0, 10).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">{money(p.amount)} · {p.scheme}</b>
                <small className="text-xs text-muted-foreground">
                  {p.method} · {new Date(p.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </small>
              </div>
              <Badge tone={p.status === "captured" ? "good" : "bad"}>{p.status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Overview() {
  const { state } = useDemo();
  const m = state.merchant;
  const captured = m.payments.filter((p) => p.status === "captured");
  const total = captured.reduce((a, p) => a + p.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales" value={money(total)} hint={`${captured.length} captured payments`} />
        <StatCard label="Merchant balance" value={money(m.balance)} />
        <StatCard label="Pending settlement" value={money(m.pendingSettlement)} />
        <StatCard label="Average ticket" value={money(captured.length ? total / captured.length : 0)} />
      </div>
      <TapToPay />
    </div>
  );
}

function Settlements() {
  const { state, settleNow, refundPayment } = useDemo();
  const m = state.merchant;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Merchant balance" value={money(m.balance)} />
        <StatCard label="Pending settlement" value={money(m.pendingSettlement)} hint="1.5% processing fee" />
        <StatCard label="Settlements paid" value={String(m.settlements.filter((s) => s.status === "paid").length)} />
      </div>
      <Panel
        title="Settlement history"
        subtitle="Instant settlement pays out to the business account"
        action={<Button onClick={settleNow}>Settle {money(m.pendingSettlement)} now</Button>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">Date</th><th className="pb-3">Gross</th><th className="pb-3">Fees</th><th className="pb-3">Net</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.settlements.map((s) => (
                <tr key={s.id}>
                  <td className="py-3">{new Date(s.date).toLocaleDateString("de-DE")}</td>
                  <td className="py-3">{money(s.gross)}</td>
                  <td className="py-3 text-muted-foreground">{money(s.fees)}</td>
                  <td className="py-3 font-medium">{money(s.net)}</td>
                  <td className="py-3"><Badge tone={s.status === "paid" ? "good" : "warn"}>{s.status.replace("_", " ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Transactions" subtitle="Refund any captured payment">
        <div className="divide-y divide-border">
          {m.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">{money(p.amount)} · {p.method}</b>
                <small className="text-xs text-muted-foreground">{new Date(p.time).toLocaleString("de-DE")} · {p.scheme}</small>
              </div>
              {p.status === "captured" ? (
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => refundPayment(p.id)}>Refund</Button>
              ) : (
                <Badge tone="bad">refunded</Badge>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Links() {
  const { state, createLink, notify } = useDemo();
  const m = state.merchant;
  const [desc, setDesc] = useState("Catering order");
  const [amount, setAmount] = useState("120");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Create payment link" subtitle="Share by QR code, email or chat">
        <div className="space-y-3">
          <Field label="Description"><input className={inputClass} value={desc} maxLength={180} onChange={(e) => setDesc(e.target.value)} /></Field>
          <Field label="Amount (€)"><input className={inputClass} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <ErrorText>{error}</ErrorText>
          <Button
            onClick={() => {
              const v = Number(amount);
              if (!desc.trim()) return setError("Add a description.");
              if (!(v > 0)) return setError("Enter an amount greater than €0.");
              setError(null);
              createLink("merchant", { description: desc.trim(), amount: v });
            }}
          >
            Create link
          </Button>
        </div>
      </Panel>
      <Panel title="Active links">
        {m.links.length === 0 ? <Empty>No links yet.</Empty> : (
          <div className="divide-y divide-border">
            {m.links.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <b className="block truncate text-sm">{l.reference} · {l.description}</b>
                  <small className="block truncate text-xs text-muted-foreground">{l.url}</small>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm">{money(l.amount)}</span>
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => notify(`${l.reference} copied (demo).`)}>Copy</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Terminals() {
  const { state, notify } = useDemo();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {state.merchant.terminals.map((t) => (
        <Panel key={t.id} title={t.name} subtitle={`${t.location} · firmware ${t.firmware}`}>
          <div className="flex items-center justify-between">
            <Badge tone={t.status === "online" ? "good" : t.status === "charging" ? "warn" : "bad"}>{t.status}</Badge>
            <span className="text-sm text-muted-foreground">{t.battery}%</span>
          </div>
          <div className="mt-3"><Progress value={t.battery} /></div>
          <Button variant="ghost" className="mt-4 px-3 py-1.5 text-xs" onClick={() => notify(`${t.name} diagnostics sent (demo).`)}>
            Run diagnostics
          </Button>
        </Panel>
      ))}
    </div>
  );
}

function Loyalty() {
  const { state, notify } = useDemo();
  const l = state.merchant.loyalty;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Loyalty members" value={l.members.toLocaleString("de-DE")} />
        <StatCard label="Stamps issued" value={l.stamps.toLocaleString("de-DE")} hint="Increases with every Tap to Pay" />
        <StatCard label="Redemptions" value={String(l.redemptions)} />
      </div>
      <Panel title="Campaigns">
        <div className="grid gap-3 sm:grid-cols-2">
          {l.campaigns.map((c) => (
            <div key={c.name} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <b className="text-sm">{c.name}</b>
                <Badge tone={c.active ? "good" : "neutral"}>{c.active ? "Active" : "Paused"}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.reward} · {c.joined} members joined</p>
              <Button variant="ghost" className="mt-3 px-3 py-1.5 text-xs" onClick={() => notify(`${c.name} updated (demo).`)}>Edit campaign</Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function MerchantModules({ page }: { page: PageKey }) {
  switch (page) {
    case "payments":
      return <TapToPay />;
    case "accounts":
      return <Settlements />;
    case "cards":
      return <Terminals />;
    case "rewards":
      return <Loyalty />;
    case "team":
      return <Links />;
    case "support":
      return <SupportPanel role="merchant" title="ZorynPay merchant support" />;
    default:
      return <Overview />;
  }
}
