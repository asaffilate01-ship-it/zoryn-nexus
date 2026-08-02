import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function LaunchBlockersCentre() {
  const query = useQuery({
    queryKey: ["launch-blockers"],
    queryFn: async () => {
      const [blockers, reconciliations, commands, events] = await Promise.all([
        supabase.from("platform_launch_blockers")
          .select("*").neq("status", "resolved").order("created_at", { ascending: false }),
        supabase.from("platform_reconciliation_runs")
          .select("*").order("started_at", { ascending: false }).limit(20),
        supabase.from("platform_provider_commands")
          .select("id,provider,command_type,status,attempt_count,created_at")
          .in("status", ["failed", "dead_letter"]).limit(50),
        supabase.from("platform_provider_events")
          .select("id,provider,event_type,processing_status,attempt_count,received_at")
          .in("processing_status", ["retrying", "failed", "dead_letter"]).limit(50),
      ]);

      for (const result of [blockers, reconciliations, commands, events]) {
        if (result.error) throw result.error;
      }

      return {
        blockers: blockers.data ?? [],
        reconciliations: reconciliations.data ?? [],
        failedCommands: commands.data ?? [],
        failedEvents: events.data ?? [],
      };
    },
    refetchInterval: 30_000,
  });

  if (query.isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (query.error) return <p className="p-6 text-sm text-destructive">{(query.error as Error).message}</p>;

  const data = query.data!;
  const critical = data.blockers.filter((item) => item.severity === "critical").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Production control</p>
        <h1 className="text-3xl font-semibold tracking-tight">Launch blockers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Engineering, security, Swan, Adyen, operations, legal and pilot gates.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Open blockers" value={data.blockers.length} />
        <Metric label="Critical blockers" value={critical} />
        <Metric label="Failed commands" value={data.failedCommands.length} />
        <Metric label="Failed events" value={data.failedEvents.length} />
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Outstanding blockers</h2>
        <div className="mt-4 space-y-2">
          {data.blockers.map((item) => (
            <article key={item.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <span className="rounded-full border px-2 py-1 text-xs">
                  {item.area} · {item.severity}
                </span>
              </div>
              {item.details && <p className="mt-2 text-sm text-muted-foreground">{item.details}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
