import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/operations-centre")({
  head: () => ({
    links: [
      {
        rel: "canonical",
        href: "https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/provider-ready",
      },
    ],
    meta: [
      { title: "Operations Centre — Zoryn webhook and provider monitoring" },
      {
        name: "description",
        content:
          "Webhook idempotency, retries, ordering and dead-letter visibility across the Zoryn banking and acquiring adapters.",
      },
      {
        property: "og:title",
        content: "Operations Centre — Zoryn webhook and provider monitoring",
      },
      {
        property: "og:description",
        content:
          "Webhook idempotency, retries, ordering and dead-letter visibility across the Zoryn banking and acquiring adapters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">
      Operations data unavailable: {error.message}
    </main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No operations data found.</main>,
  component: () => <ProviderReadyCentre initialTab="operations" />,
});
