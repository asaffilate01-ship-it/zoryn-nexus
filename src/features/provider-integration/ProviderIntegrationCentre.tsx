import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, CloudCog, Link2, Webhook } from "lucide-react";
import { getProviderReadiness } from "./platformRepository";

export function ProviderIntegrationCentre() {
  const query = useQuery({
    queryKey: ["provider-readiness"],
    queryFn: getProviderReadiness,
  });

  if (query.isLoading)
    return <p className="p-6 text-sm text-muted-foreground">Loading provider status…</p>;
  if (query.error)
    return <p className="p-6 text-sm text-destructive">{(query.error as Error).message}</p>;

  const data = query.data!;
  const healthy = data.connections.filter((item) => item.status === "healthy").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Platform operations</p>
        <h1 className="text-3xl font-semibold tracking-tight">Provider integration readiness</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Swan banking, Adyen acquiring and Zoryn Rewards are connected through provider-neutral
          commands, resources and event processing.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          icon={CloudCog}
          label="Configured providers"
          value={String(data.connections.length)}
        />
        <Metric icon={CheckCircle2} label="Healthy providers" value={String(healthy)} />
        <Metric icon={Webhook} label="Recent events" value={String(data.events.length)} />
        <Metric icon={Link2} label="Resource mappings" value={String(data.mappings.length)} />
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Connections</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.connections.map((connection) => (
            <article key={connection.id} className="rounded-xl border p-4">
              <p className="font-medium capitalize">{connection.provider}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {connection.mode} · {connection.status}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Last checked: {new Date(connection.last_checked_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Recent webhook events</h2>
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
                    {event.provider} · attempt {event.attempt_count}
                  </p>
                </div>
                <span className="rounded-full border px-2 py-1 text-xs">
                  {event.processing_status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Provider resource mappings</h2>
        <div className="mt-4 space-y-2">
          {data.mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No provider resources mapped yet — mappings appear once commands or webhooks link a
              Zoryn record to a provider ID.
            </p>
          ) : (
            data.mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {mapping.aggregate_type} → {mapping.resource_type}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{mapping.external_id}</p>
                </div>
                <span className="rounded-full border px-2 py-1 text-xs capitalize">
                  {mapping.provider} · {mapping.external_status ?? "unknown"}
                </span>
              </div>
            ))
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
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <article className="surface-card rounded-2xl border p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </article>
  );
}
