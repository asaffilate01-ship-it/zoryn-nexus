import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MetricCard } from "@/features/provider-ready/components/MetricCard";
import { StatusBadge } from "@/features/provider-ready/components/StatusBadge";
import { getControlRoomSnapshot } from "../control-room.functions";

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="surface-card rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <header className="mb-4">
        <h2 className="font-display text-lg">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ primary, secondary, status }: { primary: string; secondary: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{primary}</p>
        <p className="truncate text-xs text-muted-foreground">{secondary}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">{label}</p>;
}

export function ControlRoom() {
  const fetchSnapshot = useServerFn(getControlRoomSnapshot);
  const { data, isPending, error } = useQuery({
    queryKey: ["control-room"],
    queryFn: () => fetchSnapshot(),
    refetchInterval: 30_000,
  });

  if (isPending) return <main className="p-10 text-muted-foreground">Loading control room…</main>;
  if (error) {
    return (
      <main role="alert" className="p-10">
        <h1 className="font-display text-2xl">Control room unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message === "forbidden"
            ? "You need the admin role to view platform operations."
            : error.message}
        </p>
      </main>
    );
  }

  const deadCommands = data.commands.filter((c) => c.status === "dead_letter").length;
  const deadEvents = data.events.filter((e) => e.processing_status === "dead_letter").length;
  const openAlerts = data.alerts.filter((a) => a.status === "open").length;
  const openIncidents = data.incidents.filter((i) => i.status !== "resolved").length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-5 py-10">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Stage 3</p>
        <h1 className="font-display text-3xl">Operations control room</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Live queue depth across provider commands, webhook events, notifications, incidents and
          reconciliation. Backlogs and dead letters surface here before customers notice them.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Dead-letter commands" value={String(deadCommands)} help="Need manual replay" />
        <MetricCard label="Dead-letter events" value={String(deadEvents)} help="Unmapped or failing" />
        <MetricCard label="Open alerts" value={String(openAlerts)} help="Provider alerting" />
        <MetricCard label="Open incidents" value={String(openIncidents)} help="Customer-visible" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Provider commands" subtitle="Outbound Swan, Adyen and Rewards work items">
          {data.commands.length === 0 && <Empty label="No commands queued." />}
          {data.commands.map((c) => (
            <Row key={c.id} primary={`${c.provider} · ${c.command_type}`} secondary={`Attempt ${c.attempt_count}${c.last_error ? ` · ${c.last_error}` : ""}`} status={c.status} />
          ))}
        </Panel>

        <Panel title="Webhook events" subtitle="Inbound provider notifications and their processing state">
          {data.events.length === 0 && <Empty label="No events received." />}
          {data.events.map((e) => (
            <Row key={e.id} primary={`${e.provider} · ${e.event_type}`} secondary={`Attempt ${e.attempt_count}${e.last_error ? ` · ${e.last_error}` : ""}`} status={e.processing_status} />
          ))}
        </Panel>

        <Panel title="Alerts" subtitle="Raised automatically when work dead-letters">
          {data.alerts.length === 0 && <Empty label="No alerts raised." />}
          {data.alerts.map((a) => (
            <Row key={a.id} primary={a.title} secondary={`${a.alert_type} · ${a.severity}`} status={a.status} />
          ))}
        </Panel>

        <Panel title="Incidents" subtitle="Declared service incidents and their lifecycle">
          {data.incidents.length === 0 && <Empty label="No open incidents." />}
          {data.incidents.map((i) => (
            <Row key={i.id} primary={`${i.reference} · ${i.title}`} secondary={`Severity ${i.severity}`} status={i.status} />
          ))}
        </Panel>

        <Panel title="Notification outbox" subtitle="Queued customer messaging, delivered out of band">
          {data.outbox.length === 0 && <Empty label="Outbox empty." />}
          {data.outbox.map((n) => (
            <Row key={n.id} primary={n.template_key} secondary={`${n.channel} · attempt ${n.attempt_count}`} status={n.status} />
          ))}
        </Panel>

        <Panel title="Support cases" subtitle="Customer and merchant cases with SLA priority">
          {data.supportCases.length === 0 && <Empty label="No open cases." />}
          {data.supportCases.map((s) => (
            <Row key={s.id} primary={`${s.reference} · ${s.subject}`} secondary={`${s.case_type} · ${s.priority}`} status={s.status} />
          ))}
        </Panel>

        <Panel title="Reconciliation" subtitle="Provider ledger versus Zoryn ledger runs">
          {data.reconciliation.length === 0 && <Empty label="No reconciliation runs." />}
          {data.reconciliation.map((r) => (
            <Row key={r.id} primary={`${r.provider} · ${r.run_type}`} secondary={`${r.matched_count} matched · ${r.mismatched_count} mismatched`} status={r.status} />
          ))}
        </Panel>
      </div>
    </main>
  );
}
