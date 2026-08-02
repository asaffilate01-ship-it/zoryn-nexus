import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/provider-ready")({
  head: () => ({
    meta: [
      { title: "Provider-Ready Centre — Zoryn Nexus" },
      {
        name: "description",
        content:
          "Production-state banking, business, acquiring, rewards and operations journeys behind the Zoryn provider adapter boundaries.",
      },
      { property: "og:title", content: "Provider-Ready Centre — Zoryn Nexus" },
      {
        property: "og:description",
        content:
          "Production-state banking, business, acquiring, rewards and operations journeys behind the Zoryn provider adapter boundaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">
      Provider data unavailable: {error.message}
    </main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No provider data found.</main>,
  component: () => <ProviderReadyCentre />,
});
