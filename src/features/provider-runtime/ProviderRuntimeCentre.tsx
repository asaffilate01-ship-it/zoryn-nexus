import { useQuery } from "@tanstack/react-query";
import { AlertOctagon, Clock, ListChecks, Webhook } from "lucide-react";
import { getRuntimeSnapshot } from "./runtimeRepository";
import type { RuntimeLogStatus } from "./types";

function toneFor(status: string) {
  if (status === "dead_letter") return "border-destructive/60 text-destructive";
  if (status === "failed" || status === "retrying") return "border-amber-500/60 text-amber-400";
  if (status === "succeeded" || status === "processed") return "border-primary/60 text-primary";
  return "border-border text-muted-foreground";
}

function relative(iso: string) {
  return new Date(iso).toLocaleString();
}

export function ProviderRuntimeCentre() {
  const query = useQuery({
    queryKey: ["provider-runtime"],
    queryFn: getRuntimeSnapshot,
    refetchInterval: 30_000,
  });

  if (query.isLoading)
    return <p className="p-6 text-sm text-muted-foreground">Loading provider runtime…</p>;
  if (query.error)
    return <p className="p-6 text-sm text-destructive">{(query.error as Error).message}</p>;

  const data = query.data!;
  const deadLetters =
    data.commands.filter((c) => c.status === "dead_letter").length +
    data.events.filter((e) => e.processing_status === "dead_letter").length;
  const inFlight =
    data.commands.filter((c) => ["queued", "processing", "failed"].includes(c.status)).length +
    data.events.filter((e) => ["received", "processing", "retrying"].includes(e.processing_status))
      .length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Platform operations</p>
        <h1 className="text-3xl font-semibold tracking-tight">Provider runtime</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Command dispatch, webhook processing, retry attempts and dead letters for Swan banking,
          Adyen acquiring and Zoryn Rewards. Every line carries a correlation ID so one provider
          interaction can be followed end to end.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={ListChecks} label="Commands shown" value={data.commands.length} />
        <Metric icon={Webhook} label="Events shown" value={data.events.length} />
        <Metric icon={Clock} label="In flight" value={inFlight} />
        <Metric icon={AlertOctagon} label="Dead letters" value={deadLetters} critical />
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Command queue</h2>
        <div className="mt-4 space-y-2">
          {data.commands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No provider commands queued.</p>
          ) : (
            data.commands.map((command) => (
              <div
                key={command.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{command.command_type}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {command.provider} · attempt {command.attempt_count} ·{" "}
                    {relative(command.created_at)}
                  </p>
                  {command.last_error ? (
                    <p className="mt-1 text-xs text-destructive">{command.last_error}</p>
                  ) : null}
                  {command.next_attempt_at ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Retries at {relative(command.next_attempt_at)}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-xs ${toneFor(command.status)}`}
                >
                  {command.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Event processing</h2>
        <div className="mt-4 space-y-2">
          {data.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No provider events received yet.</p>
          ) : (
            data.events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{event.event_type}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {event.provider} · attempt {event.attempt_count} · {relative(event.received_at)}
                  </p>
                  {event.last_error ? (
                    <p className="mt-1 text-xs text-destructive">{event.last_error}</p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-xs ${toneFor(event.processing_status)}`}
                >
                  {event.processing_status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Runtime log</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrator view. Newest first, with dispatch duration and provider error text.
        </p>
        <div className="mt-4 overflow-x-auto">
          {data.logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No runtime entries yet — run the command worker to populate this log.
            </p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Correlation</th>
                  <th className="py-2 pr-3">Direction</th>
                  <th className="py-2 pr-3">Operation</th>
                  <th className="py-2 pr-3">Duration</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id} className="border-t border-border/60">
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {relative(log.created_at)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{log.correlation_id}</td>
                    <td className="py-2 pr-3 text-xs capitalize">{log.direction}</td>
                    <td className="py-2 pr-3 text-xs">
                      {log.operation}
                      {log.error_message ? (
                        <span className="block text-destructive">{log.error_message}</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {log.duration_ms == null ? "—" : `${log.duration_ms} ms`}
                    </td>
                    <td className="py-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs ${toneFor(log.status as RuntimeLogStatus)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  critical,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  critical?: boolean;
}) {
  const alarming = critical && value > 0;
  return (
    <article
      className={`surface-card rounded-2xl border p-5 ${alarming ? "border-destructive/60" : ""}`}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </div>
      <p className={`mt-2 text-2xl font-semibold ${alarming ? "text-destructive" : ""}`}>{value}</p>
    </article>
  );
}
