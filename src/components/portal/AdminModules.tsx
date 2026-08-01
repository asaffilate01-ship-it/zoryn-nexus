import { Badge, Button, Empty, Panel, Progress, StatCard } from "./ui";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";
import { useT } from "@/lib/i18n";

function Overview() {
  const { state } = useDemo();
  const t = useT();
  const a = state.admin;
  const open = a.queue.filter((q) => q.status === "IN_REVIEW" || q.status === "ACTION_REQUIRED").length;
  const riskLabels: Record<string, string> = { high: t("high"), medium: t("medium"), low: t("low") };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("Customers")} value={a.customers.toLocaleString("de-DE")} />
        <StatCard label={t("Organisations")} value={a.organisations.toLocaleString("de-DE")} hint={t("{count} merchants", { count: a.merchants })} />
        <StatCard label={t("Open KYC/KYB")} value={String(open)} hint={t("Review queue")} />
        <StatCard label={t("Monthly volume")} value={money(a.volume)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title={t("Risk overview")}>
          {(["high", "medium", "low"] as const).map((r) => {
            const n = a.queue.filter((q) => q.risk === r).length;
            return (
              <div key={r} className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{t("{risk} risk", { risk: riskLabels[r] })}</span><span>{t("{count} cases", { count: n })}</span>
                </div>
                <div className="mt-1"><Progress value={(n / Math.max(a.queue.length, 1)) * 100} /></div>
              </div>
            );
          })}
        </Panel>
        <Panel title={t("Audit log")} subtitle={t("Immutable operational trail")}>
          <ul className="divide-y divide-border text-sm">
            {a.audit.slice(0, 6).map((e) => (
              <li key={e.id} className="py-2.5">
                <b className="block text-sm">{e.action}</b>
                <small className="text-xs text-muted-foreground">{e.actor} · {new Date(e.at).toLocaleString("de-DE")}</small>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Customers() {
  const { state } = useDemo();
  const t = useT();
  const rows = [
    { name: state.personal.holder, type: t("Personal"), ref: state.personal.iban, status: "APPROVED", balance: state.personal.balance },
    { name: state.business.name, type: t("Business"), ref: state.business.iban, status: "APPROVED", balance: state.business.balance },
    { name: state.merchant.name, type: t("Merchant"), ref: "MID-4471", status: "IN_REVIEW", balance: state.merchant.balance },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Personal customers")} value={state.admin.customers.toLocaleString("de-DE")} />
        <StatCard label={t("Organisations")} value={state.admin.organisations.toLocaleString("de-DE")} />
        <StatCard label={t("Merchants")} value={state.admin.merchants.toLocaleString("de-DE")} />
      </div>
      <Panel title={t("Customer records")} subtitle={t("Live demo records across the platform")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">{t("Name")}</th><th className="pb-3">{t("Type")}</th><th className="pb-3">{t("Reference")}</th><th className="pb-3">{t("Balance")}</th><th className="pb-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3 text-muted-foreground">{r.type}</td>
                  <td className="py-3 text-muted-foreground">{r.ref}</td>
                  <td className="py-3">{money(r.balance)}</td>
                  <td className="py-3"><Badge tone={r.status === "APPROVED" ? "good" : "warn"}>{t(r.status.replace("_", " "))}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Compliance() {
  const { state, decideQueue } = useDemo();
  const t = useT();
  const a = state.admin;
  const riskLabels: Record<string, string> = { high: t("high"), medium: t("medium"), low: t("low") };
  return (
    <div className="space-y-4">
      <Panel title={t("KYC / KYB queue")} subtitle={t("Operational review with normalised provider statuses")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">{t("Subject")}</th><th className="pb-3">{t("Type")}</th><th className="pb-3">{t("Submitted")}</th><th className="pb-3">{t("Risk")}</th><th className="pb-3">{t("Status")}</th><th className="pb-3">{t("Decision")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {a.queue.map((q) => (
                <tr key={q.id}>
                  <td className="py-3 font-medium">{q.name}</td>
                  <td className="py-3 text-muted-foreground">{q.kind}</td>
                  <td className="py-3 text-muted-foreground">{new Date(q.submitted).toLocaleDateString("de-DE")}</td>
                  <td className="py-3">
                    <Badge tone={q.risk === "high" ? "bad" : q.risk === "medium" ? "warn" : "good"}>{riskLabels[q.risk]}</Badge>
                  </td>
                  <td className="py-3"><Badge tone={q.status === "APPROVED" ? "good" : q.status === "RESTRICTED" ? "bad" : "warn"}>{t(q.status.replace("_", " "))}</Badge></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => decideQueue(q.id, "APPROVED")}>{t("Approve")}</Button>
                      <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => decideQueue(q.id, "RESTRICTED")}>{t("Restrict")}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={t("Compliance case board")}>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["IN_REVIEW", "ACTION_REQUIRED", "APPROVED"] as const).map((col) => (
            <div key={col} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-xs uppercase tracking-wide text-muted-foreground">{t(col.replace("_", " "))}</b>
              <ul className="mt-3 space-y-2 text-sm">
                {a.queue.filter((q) => q.status === col).map((q) => (
                  <li key={q.id} className="rounded-lg border border-border px-3 py-2">{q.name}</li>
                ))}
                {a.queue.filter((q) => q.status === col).length === 0 && <Empty>{t("Empty")}</Empty>}
              </ul>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PaymentsMonitoring() {
  const { state, replayWebhooks } = useDemo();
  const t = useT();
  const a = state.admin;
  const merchant = state.merchant;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("Monthly volume")} value={money(a.volume)} />
        <StatCard label={t("Live captured payments")} value={String(merchant.payments.filter((p) => p.status === "captured").length)} hint="ZorynPay" />
        <StatCard label={t("Refunds")} value={String(merchant.payments.filter((p) => p.status === "refunded").length)} />
      </div>
      <Panel
        title={t("Webhook events")}
        subtitle={t("Idempotent provider event store")}
        action={<Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={replayWebhooks}>{t("Replay failed")}</Button>}
      >
        <div className="divide-y divide-border">
          {a.webhooks.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">{w.type}</b>
                <small className="text-xs text-muted-foreground">{w.source} · {new Date(w.receivedAt).toLocaleString("de-DE")}</small>
              </div>
              <Badge tone={w.status === "processed" ? "good" : w.status === "queued" ? "warn" : "bad"}>{t(w.status)}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Providers() {
  const { state, notify } = useDemo();
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.admin.providers.map((p) => (
          <div key={p.key} className="rounded-2xl border border-border bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <b className="text-sm">{p.name}</b>
              <Badge tone={p.status === "operational" ? "good" : "warn"}>{t(p.status)}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{p.mode}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("Latency {latency}", { latency: p.latency })}</p>
          </div>
        ))}
      </div>
      <Panel title={t("Provider configuration")} subtitle={t("Adapters are provider-independent and run in demo mode until sandbox credentials are supplied")}>
        <div className="space-y-3">
          {state.admin.providers.map((p) => (
            <div key={p.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-4">
              <div>
                <b className="text-sm">{p.name}</b>
                <p className="text-xs text-muted-foreground">{t("Normalised statuses: DRAFT · IN_REVIEW · ACTION_REQUIRED · APPROVED · RESTRICTED · SUSPENDED · CLOSED")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => notify(t("{name} health check passed (demo).", { name: p.name }))}>{t("Health check")}</Button>
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => notify(t("{name} credentials are managed server-side.", { name: p.name }))}>{t("Configure")}</Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SupportDesk() {
  const { state, resolveCase } = useDemo();
  const t = useT();
  const cases = state.admin.cases;
  return (
    <Panel title={t("Support & complaints")} subtitle={t("Cases raised from every portal land here")}>
      {cases.length === 0 ? <Empty>{t("No cases.")}</Empty> : (
        <ul className="divide-y divide-border">
          {cases.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <b className="block text-sm">{c.ref} · {c.subject}</b>
                <small className="text-xs text-muted-foreground">{c.category} · {new Date(c.createdAt).toLocaleString("de-DE")}</small>
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.status === "resolved" ? "good" : "warn"}>{t(c.status.replace("_", " "))}</Badge>
                {c.status !== "resolved" && (
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => resolveCase("admin", c.id)}>{t("Resolve")}</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function AdminModules({ page }: { page: PageKey }) {
  switch (page) {
    case "team":
      return <Customers />;
    case "compliance":
      return <Compliance />;
    case "payments":
      return <PaymentsMonitoring />;
    case "accounts":
      return <Providers />;
    case "support":
      return <SupportDesk />;
    default:
      return <Overview />;
  }
}
