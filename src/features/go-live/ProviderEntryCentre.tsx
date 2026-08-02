import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ProviderEntryCentre() {
  const query = useQuery({
    queryKey: ["provider-entry"],
    queryFn: async () => {
      const [contracts, evidence, health, blockers, reconciliations] = await Promise.all([
        supabase
          .from("platform_provider_contract_versions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("platform_provider_test_evidence")
          .select("*")
          .order("executed_at", { ascending: false })
          .limit(50),
        supabase
          .from("platform_provider_health_checks")
          .select("*")
          .order("checked_at", { ascending: false })
          .limit(20),
        supabase
          .from("platform_launch_blockers")
          .select("*")
          .neq("status", "resolved")
          .order("created_at", { ascending: false }),
        supabase
          .from("platform_reconciliation_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(20),
      ]);

      for (const result of [contracts, evidence, health, blockers, reconciliations]) {
        if (result.error) throw result.error;
      }

      return {
        contracts: contracts.data ?? [],
        evidence: evidence.data ?? [],
        health: health.data ?? [],
        blockers: blockers.data ?? [],
        reconciliations: reconciliations.data ?? [],
      };
    },
    refetchInterval: 30_000,
  });

  if (query.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading provider-entry status…</p>;
  }

  if (query.error) {
    return <p className="p-6 text-sm text-destructive">{(query.error as Error).message}</p>;
  }

  const data = query.data!;
  const passedEvidence = data.evidence.filter((item) => item.status === "passed").length;
  const criticalBlockers = data.blockers.filter((item) => item.severity === "critical").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Final integration stage</p>
        <h1 className="text-3xl font-semibold tracking-tight">Provider entry centre</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Contract versions, sandbox evidence, provider health, reconciliation and launch blockers.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Provider contracts" value={data.contracts.length} />
        <Metric label="Passed scenarios" value={passedEvidence} />
        <Metric label="Critical blockers" value={criticalBlockers} />
        <Metric label="Reconciliation runs" value={data.reconciliations.length} />
      </div>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Provider contracts</h2>
        <div className="mt-4 space-y-2">
          {data.contracts.length === 0 && (
            <p className="text-sm text-muted-foreground">No contract versions recorded yet.</p>
          )}
          {data.contracts.map((contract) => (
            <article
              key={contract.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-4"
            >
              <p className="font-medium">
                {contract.provider} · {contract.contract_name} v{contract.version}
              </p>
              <span className="rounded-full border px-2 py-1 text-xs">
                {contract.environment} · {contract.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Sandbox scenario evidence</h2>
        <div className="mt-4 space-y-2">
          {data.evidence.length === 0 && (
            <p className="text-sm text-muted-foreground">No scenario evidence recorded yet.</p>
          )}
          {data.evidence.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-4"
            >
              <p className="font-medium">
                {item.provider} · {item.scenario}
              </p>
              <span className="rounded-full border px-2 py-1 text-xs">
                {item.environment} · {item.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Provider health checks</h2>
        <div className="mt-4 space-y-2">
          {data.health.length === 0 && (
            <p className="text-sm text-muted-foreground">No health checks recorded yet.</p>
          )}
          {data.health.map((check) => (
            <article
              key={check.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-4"
            >
              <p className="font-medium">
                {check.provider} · {check.environment}
              </p>
              <span className="rounded-full border px-2 py-1 text-xs">
                {check.status}
                {check.latency_ms ? ` · ${check.latency_ms} ms` : ""}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Reconciliation runs</h2>
        <div className="mt-4 space-y-2">
          {data.reconciliations.length === 0 && (
            <p className="text-sm text-muted-foreground">No reconciliation runs yet.</p>
          )}
          {data.reconciliations.map((run) => (
            <article
              key={run.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-4"
            >
              <p className="font-medium">
                {run.provider} · {run.run_type}
              </p>
              <span className="rounded-full border px-2 py-1 text-xs">{run.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-2xl border p-5">
        <h2 className="font-semibold">Outstanding provider blockers</h2>
        <div className="mt-4 space-y-2">
          {data.blockers.length === 0 && (
            <p className="text-sm text-muted-foreground">No open blockers.</p>
          )}
          {data.blockers.map((blocker) => (
            <article key={blocker.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{blocker.title}</p>
                <span className="rounded-full border px-2 py-1 text-xs">
                  {blocker.area} · {blocker.severity}
                </span>
              </div>
              {blocker.details && (
                <p className="mt-2 text-sm text-muted-foreground">{blocker.details}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface-card rounded-2xl border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
