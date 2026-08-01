import { Badge, Button, Empty, Panel, Progress, StatCard } from "./ui";
import { money, useDemo } from "@/lib/zoryn-store";
import type { PageKey } from "@/lib/zoryn-data";

function Overview() {
  const { state } = useDemo();
  const a = state.admin;
  const open = a.queue.filter((q) => q.status === "IN_REVIEW" || q.status === "ACTION_REQUIRED").length;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers" value={a.customers.toLocaleString("de-DE")} />
        <StatCard label="Organisations" value={a.organisations.toLocaleString("de-DE")} hint={`${a.merchants} merchants`} />
        <StatCard label="Open KYC/KYB" value={String(open)} hint="Review queue" />
        <StatCard label="Monthly volume" value={money(a.volume)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Risk overview">
          {(["high", "medium", "low"] as const).map((r) => {
            const n = a.queue.filter((q) => q.risk === r).length;
            return (
              <div key={r} className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{r} risk</span><span>{n} cases</span>
                </div>
                <div className="mt-1"><Progress value={(n / Math.max(a.queue.length, 1)) * 100} /></div>
              </div>
            );
          })}
        </Panel>
        <Panel title="Audit log" subtitle="Immutable operational trail">
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
  const rows = [
    { name: state.personal.holder, type: "Personal", ref: state.personal.iban, status: "APPROVED", balance: state.personal.balance },
    { name: state.business.name, type: "Business", ref: state.business.iban, status: "APPROVED", balance: state.business.balance },
    { name: state.merchant.name, type: "Merchant", ref: "MID-4471", status: "IN_REVIEW", balance: state.merchant.balance },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Personal customers" value={state.admin.customers.toLocaleString("de-DE")} />
        <StatCard label="Organisations" value={state.admin.organisations.toLocaleString("de-DE")} />
        <StatCard label="Merchants" value={state.admin.merchants.toLocaleString("de-DE")} />
      </div>
      <Panel title="Customer records" subtitle="Live demo records across the platform">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">Name</th><th className="pb-3">Type</th><th className="pb-3">Reference</th><th className="pb-3">Balance</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3 text-muted-foreground">{r.type}</td>
                  <td className="py-3 text-muted-foreground">{r.ref}</td>
                  <td className="py-3">{money(r.balance)}</td>
                  <td className="py-3"><Badge tone={r.status === "APPROVED" ? "good" : "warn"}>{r.status.replace("_", " ")}</Badge></td>
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
  const a = state.admin;
  return (
    <div className="space-y-4">
      <Panel title="KYC / KYB queue" subtitle="Operational review with normalised provider statuses">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">Subject</th><th className="pb-3">Type</th><th className="pb-3">Submitted</th><th className="pb-3">Risk</th><th className="pb-3">Status</th><th className="pb-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {a.queue.map((q) => (
                <tr key={q.id}>
                  <td className="py-3 font-medium">{q.name}</td>
                  <td className="py-3 text-muted-foreground">{q.kind}</td>
                  <td className="py-3 text-muted-foreground">{new Date(q.submitted).toLocaleDateString("de-DE")}</td>
                  <td className="py-3">
                    <Badge tone={q.risk === "high" ? "bad" : q.risk === "medium" ? "warn" : "good"}>{q.risk}</Badge>
                  </td>
                  <td className="py-3"><Badge tone={q.status === "APPROVED" ? "good" : q.status === "RESTRICTED" ? "bad" : "warn"}>{q.status.replace("_", " ")}</Badge></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => decideQueue(q.id, "APPROVED")}>Approve</Button>
                      <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => decideQueue(q.id, "RESTRICTED")}>Restrict</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Compliance case board">
        <div className="grid gap-3 sm:grid-cols-3">
          {(["IN_REVIEW", "ACTION_REQUIRED", "APPROVED"] as const).map((col) => (
            <div key={col} className="rounded-xl border border-border bg-background/40 p-4">
              <b className="text-xs uppercase tracking-wide text-muted-foreground">{col.replace("_", " ")}</b>
              <ul className="mt-3 space-y-2 text-sm">
                {a.queue.filter((q) => q.status === col).map((q) => (
                  <li key={q.id} className="rounded-lg border border-border px-3 py-2">{q.name}</li>
                ))}
                {a.queue.filter((q) => q.status === col).length === 0 && <Empty>Empty</Empty>}
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
  const a = state.admin;
  const merchant = state.merchant;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Monthly volume" value={money(a.volume)} />
        <StatCard label="Live captured payments" value={String(merchant.payments.filter((p) => p.status === "captured").length)} hint="From ZorynPay demo" />
        <StatCard label="Refunds" value={String(merchant.payments.filter((p) => p.status === "refunded").length)} />
      </div>
      <Panel
        title="Webhook events"
        subtitle="Idempotent provider event store"
        action={<Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={replayWebhooks}>Replay failed</Button>}
      >
        <div className="divide-y divide-border">
          {a.webhooks.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <b className="block text-sm">{w.type}</b>
                <small className="text-xs text-muted-foreground">{w.source} · {new Date(w.receivedAt).toLocaleString("de-DE")}</small>
              </div>
              <Badge tone={w.status === "processed" ? "good" : w.status === "queued" ? "warn" : "bad"}>{w.status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Providers() {
  const { state, notify } = useDemo();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.admin.providers.map((p) => (
          <div key={p.key} className="rounded-2xl border border-border bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <b className="text-sm">{p.name}</b>
              <Badge tone={p.status === "operational" ? "good" : "warn"}>{p.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{p.mode}</p>
            <p className="mt-1 text-xs text-muted-foreground">Latency {p.latency}</p>
          </div>
        ))}
      </div>
      <Panel title="Provider configuration" subtitle="Adapters are provider-independent and run in demo mode until sandbox credentials are supplied">
        <div className="space-y-3">
          {state.admin.providers.map((p) => (
            <div key={p.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-4">
              <div>
                <b className="text-sm">{p.name}</b>
                <p className="text-xs text-muted-foreground">Normalised statuses: DRAFT · IN_REVIEW · ACTION_REQUIRED · APPROVED · RESTRICTED · SUSPENDED · CLOSED</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => notify(`${p.name} health check passed (demo).`)}>Health check</Button>
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => notify(`${p.name} credentials are managed server-side.`)}>Configure</Button>
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
  const cases = state.admin.cases;
  return (
    <Panel title="Support & complaints" subtitle="Cases raised from every portal land here">
      {cases.length === 0 ? <Empty>No cases.</Empty> : (
        <ul className="divide-y divide-border">
          {cases.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <b className="block text-sm">{c.ref} · {c.subject}</b>
                <small className="text-xs text-muted-foreground">{c.category} · {new Date(c.createdAt).toLocaleString("de-DE")}</small>
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.status === "resolved" ? "good" : "warn"}>{c.status.replace("_", " ")}</Badge>
                {c.status !== "resolved" && (
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => resolveCase("admin", c.id)}>Resolve</Button>
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
