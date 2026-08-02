import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Empty,
  ErrorText,
  Field,
  Panel,
  Progress,
  StatCard,
  inputClass,
} from "./ui";
import { SupportPanel } from "./SupportPanel";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";
import { useT } from "@/lib/i18n";

type Stage = "amount" | "waiting" | "reading" | "approved" | "declined";

function TapToPay() {
  const { state, takePayment, notify } = useDemo();
  const t = useT();
  const m = state.merchant;
  const [amount, setAmount] = useState("24.50");
  const [stage, setStage] = useState<Stage>("amount");
  const [error, setError] = useState<string | null>(null);
  const value = Number(amount);

  useEffect(() => {
    if (stage === "reading") {
      const timer = window.setTimeout(() => {
        takePayment(value, "Tap to Pay");
        setStage("approved");
      }, 1200);
      return () => window.clearTimeout(timer);
    }
    if (stage === "approved") {
      const timer = window.setTimeout(() => setStage("amount"), 4000);
      return () => window.clearTimeout(timer);
    }
    return;
  }, [stage]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Panel
        title={t("Tap to Pay")}
        subtitle={t("Enter any amount and simulate a contactless tap")}
      >
        {stage === "amount" && (
          <div className="space-y-3">
            <Field label={t("Amount (€)")}>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[3.5, 12.8, 24.5, 49.9].map((v) => (
                <Button
                  key={v}
                  variant="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setAmount(String(v))}
                >
                  {money(v)}
                </Button>
              ))}
            </div>
            <ErrorText>{error}</ErrorText>
            <Button
              onClick={() => {
                if (!(value > 0)) return setError(t("Enter an amount greater than €0."));
                setError(null);
                setStage("waiting");
              }}
            >
              {t("Charge {amount}", { amount: money(value || 0) })}
            </Button>
          </div>
        )}

        {stage !== "amount" && (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 p-8 text-center">
            <span className="text-[11px] uppercase tracking-widest text-primary">
              ZorynPay {t("terminal")}
            </span>
            <p className="mt-3 font-display text-4xl">{money(value)}</p>
            {stage === "waiting" && (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("Present card or phone to the reader…")}
                </p>
                <Button className="mt-5" onClick={() => setStage("reading")}>
                  {t("Simulate customer tap")}
                </Button>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setStage("amount")}
                  >
                    {t("Cancel")}
                  </Button>
                </div>
              </>
            )}
            {stage === "reading" && (
              <p className="mt-4 animate-pulse text-sm text-muted-foreground">
                {t("Reading card · authorising…")}
              </p>
            )}
            {stage === "approved" && (
              <>
                <p className="mt-4 font-display text-2xl text-primary">{t("Approved")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("Receipt sent · balance and settlement updated")}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 px-3 py-1.5 text-xs"
                  onClick={() => setStage("amount")}
                >
                  {t("New payment")}
                </Button>
              </>
            )}
          </div>
        )}
      </Panel>

      <Panel
        title={t("Today's payments")}
        subtitle={t("Merchant balance {balance} · pending settlement {pending}", {
          balance: money(m.balance),
          pending: money(m.pendingSettlement),
        })}
        action={
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            onClick={() => notify(t("Receipts re-sent to customers (demo)."))}
          >
            {t("Resend receipts")}
          </Button>
        }
      >
        <div className="divide-y divide-border">
          {m.payments.slice(0, 10).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">
                  {money(p.amount)} · {p.scheme}
                </b>
                <small className="text-xs text-muted-foreground">
                  {p.method} ·{" "}
                  {new Date(p.time).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              <Badge tone={p.status === "captured" ? "good" : "bad"}>{t(p.status)}</Badge>
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
  const m = state.merchant;
  const captured = m.payments.filter((p) => p.status === "captured");
  const total = captured.reduce((a, p) => a + p.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("Sales")}
          value={money(total)}
          hint={t("{count} captured payments", { count: captured.length })}
        />
        <StatCard label={t("Merchant balance")} value={money(m.balance)} />
        <StatCard label={t("Pending settlement")} value={money(m.pendingSettlement)} />
        <StatCard
          label={t("Average ticket")}
          value={money(captured.length ? total / captured.length : 0)}
        />
      </div>
      <TapToPay />
    </div>
  );
}

function Settlements() {
  const { state, settleNow, refundPayment } = useDemo();
  const t = useT();
  const m = state.merchant;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Merchant balance")} value={money(m.balance)} />
        <StatCard
          label={t("Pending settlement")}
          value={money(m.pendingSettlement)}
          hint={t("1.5% processing fee")}
        />
        <StatCard
          label={t("Settlements paid")}
          value={String(m.settlements.filter((s) => s.status === "paid").length)}
        />
      </div>
      <Panel
        title={t("Settlement history")}
        subtitle={t("Instant settlement pays out to the business account")}
        action={
          <Button onClick={settleNow}>
            {t("Settle {amount} now", { amount: money(m.pendingSettlement) })}
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">{t("Date")}</th>
                <th className="pb-3">{t("Gross")}</th>
                <th className="pb-3">{t("Fees")}</th>
                <th className="pb-3">{t("Net")}</th>
                <th className="pb-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.settlements.map((s) => (
                <tr key={s.id}>
                  <td className="py-3">{new Date(s.date).toLocaleDateString("de-DE")}</td>
                  <td className="py-3">{money(s.gross)}</td>
                  <td className="py-3 text-muted-foreground">{money(s.fees)}</td>
                  <td className="py-3 font-medium">{money(s.net)}</td>
                  <td className="py-3">
                    <Badge tone={s.status === "paid" ? "good" : "warn"}>
                      {t(s.status.replace("_", " "))}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={t("Transactions")} subtitle={t("Refund any captured payment")}>
        <div className="divide-y divide-border">
          {m.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">
                  {money(p.amount)} · {p.method}
                </b>
                <small className="text-xs text-muted-foreground">
                  {new Date(p.time).toLocaleString("de-DE")} · {p.scheme}
                </small>
              </div>
              {p.status === "captured" ? (
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => refundPayment(p.id)}
                >
                  {t("Refund")}
                </Button>
              ) : (
                <Badge tone="bad">{t("refunded")}</Badge>
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
  const t = useT();
  const m = state.merchant;
  const [desc, setDesc] = useState("Catering order");
  const [amount, setAmount] = useState("120");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("Create payment link")} subtitle={t("Share by QR code, email or chat")}>
        <div className="space-y-3">
          <Field label={t("Description")}>
            <input
              className={inputClass}
              value={desc}
              maxLength={180}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Field>
          <Field label={t("Amount (€)")}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button
            onClick={() => {
              const v = Number(amount);
              if (!desc.trim()) return setError(t("Add a description."));
              if (!(v > 0)) return setError(t("Enter an amount greater than €0."));
              setError(null);
              createLink("merchant", { description: desc.trim(), amount: v });
            }}
          >
            {t("Create link")}
          </Button>
        </div>
      </Panel>
      <Panel title={t("Active links")}>
        {m.links.length === 0 ? (
          <Empty>{t("No links yet.")}</Empty>
        ) : (
          <div className="divide-y divide-border">
            {m.links.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <b className="block truncate text-sm">
                    {l.reference} · {l.description}
                  </b>
                  <small className="block truncate text-xs text-muted-foreground">{l.url}</small>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm">{money(l.amount)}</span>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    onClick={() => notify(t("{ref} copied (demo).", { ref: l.reference }))}
                  >
                    {t("Copy")}
                  </Button>
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
  const t = useT();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {state.merchant.terminals.map((term) => (
        <Panel
          key={term.id}
          title={term.name}
          subtitle={t("{location} · firmware {firmware}", {
            location: term.location,
            firmware: term.firmware,
          })}
        >
          <div className="flex items-center justify-between">
            <Badge
              tone={term.status === "online" ? "good" : term.status === "charging" ? "warn" : "bad"}
            >
              {t(term.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">{term.battery}%</span>
          </div>
          <div className="mt-3">
            <Progress value={term.battery} />
          </div>
          <Button
            variant="ghost"
            className="mt-4 px-3 py-1.5 text-xs"
            onClick={() => notify(t("{name} diagnostics sent (demo).", { name: term.name }))}
          >
            {t("Run diagnostics")}
          </Button>
        </Panel>
      ))}
    </div>
  );
}

function Loyalty() {
  const { state, notify } = useDemo();
  const t = useT();
  const l = state.merchant.loyalty;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Loyalty members")} value={l.members.toLocaleString("de-DE")} />
        <StatCard
          label={t("Stamps issued")}
          value={l.stamps.toLocaleString("de-DE")}
          hint={t("Increases with every Tap to Pay")}
        />
        <StatCard label={t("Redemptions")} value={String(l.redemptions)} />
      </div>
      <Panel title={t("Campaigns")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {l.campaigns.map((c) => (
            <div key={c.name} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <b className="text-sm">{c.name}</b>
                <Badge tone={c.active ? "good" : "neutral"}>
                  {c.active ? t("Active") : t("Paused")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("{reward} · {joined} members joined", { reward: c.reward, joined: c.joined })}
              </p>
              <Button
                variant="ghost"
                className="mt-3 px-3 py-1.5 text-xs"
                onClick={() => notify(t("{name} updated (demo).", { name: c.name }))}
              >
                {t("Edit campaign")}
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function MerchantModules({ page }: { page: PageKey }) {
  const t = useT();
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
      return <SupportPanel role="merchant" title={t("ZorynPay merchant support")} />;
    default:
      return <Overview />;
  }
}
