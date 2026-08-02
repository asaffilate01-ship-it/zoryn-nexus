import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { requiredProviderOperations } from "@/features/providers/catalogue";

const statusTone: Record<string, string> = {
  unmapped: "bg-muted text-muted-foreground",
  mapped: "bg-primary/15 text-primary",
  sandbox_validated: "bg-primary/25 text-primary",
  production_approved: "bg-primary text-primary-foreground",
  deprecated: "bg-destructive/15 text-destructive",
};

export function ProviderGoLiveCentre() {
  const query = useQuery({
    queryKey: ["provider-go-live"],
    queryFn: async () => {
      const [catalogue, scores] = await Promise.all([
        supabase
          .from("platform_provider_operation_catalogue")
          .select("*")
          .order("provider")
          .order("category"),
        supabase
          .from("platform_provider_launch_scores")
          .select("*")
          .order("calculated_at", { ascending: false })
          .limit(20),
      ]);
      if (catalogue.error) throw catalogue.error;
      if (scores.error) throw scores.error;
      return { catalogue: catalogue.data ?? [], scores: scores.data ?? [] };
    },
    refetchInterval: 30_000,
  });

  if (query.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading provider readiness…</p>;
  }
  if (query.error) {
    return <p className="p-6 text-sm text-destructive">{(query.error as Error).message}</p>;
  }

  const data = query.data!;
  const swan = data.scores.find((item) => item.provider === "swan");
  const adyen = data.scores.find((item) => item.provider === "adyen");
  const validated = data.catalogue.filter(
    (item) => item.status === "sandbox_validated" || item.status === "production_approved",
  ).length;
  const totalRequired =
    requiredProviderOperations.swan.length + requiredProviderOperations.adyen.length;

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Final provider activation</p>
        <h1 className="text-3xl font-semibold tracking-tight">Swan and Adyen go-live</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Swan readiness" value={`${swan?.overall_score ?? 0}%`} />
        <Metric label="Adyen readiness" value={`${adyen?.overall_score ?? 0}%`} />
        <Metric label="Required operations" value={String(totalRequired)} />
        <Metric
          label="Validated mappings"
          value={`${validated}/${data.catalogue.length || totalRequired}`}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        {(["swan", "adyen"] as const).map((provider) => (
          <article key={provider} className="rounded-2xl border bg-card p-5">
            <h2 className="text-lg font-semibold capitalize">{provider} operations</h2>
            <ul className="mt-4 space-y-2">
              {data.catalogue
                .filter((item) => item.provider === provider)
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs">{item.operation}</span>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone[item.status] ?? statusTone["unmapped"]}`}
                    >
                      {item.status.replaceAll("_", " ")}
                    </span>
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Latest launch scores</h2>
        {data.scores.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No scores yet — run the provider launch scoring job in mock mode.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {data.scores.map((score) => (
              <li key={score.id} className="rounded-lg border border-border/60 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    {score.provider} · {score.environment}
                  </span>
                  <span>{score.overall_score}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  config {score.configuration_score}% · webhooks {score.webhooks_score}% ·
                  reconciliation {score.reconciliation_score}% · lifecycle {score.lifecycle_score}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}