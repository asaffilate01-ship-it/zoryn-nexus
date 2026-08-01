import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/scenario-lab")({
  head: () => ({
    meta: [
      { title: "Scenario Lab — Zoryn acceptance-test journeys" },
      { name: "description", content: "Successful, failed, restricted and asynchronous Zoryn journeys seeded for demos and acceptance testing." },
      { property: "og:title", content: "Scenario Lab — Zoryn acceptance-test journeys" },
      { property: "og:description", content: "Successful, failed, restricted and asynchronous Zoryn journeys seeded for demos and acceptance testing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">Scenario data unavailable: {error.message}</main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No scenarios found.</main>,
  component: () => <ProviderReadyCentre initialTab="scenarios" />,
});
