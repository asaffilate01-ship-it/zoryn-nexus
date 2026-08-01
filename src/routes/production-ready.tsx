import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/production-ready")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/provider-ready" }],
    meta: [
      { title: "Production-Ready Platform — Zoryn Nexus" },
      { name: "description", content: "Live production-state platform view: lifecycle statuses, onboarding, banking, acquiring, rewards and operations across the Zoryn adapters." },
      { property: "og:title", content: "Production-Ready Platform — Zoryn Nexus" },
      { property: "og:description", content: "Lifecycle statuses, onboarding, banking, acquiring, rewards and operations across the Zoryn adapters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">Platform data unavailable: {error.message}</main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No platform data found.</main>,
  component: () => <ProviderReadyCentre />,
});