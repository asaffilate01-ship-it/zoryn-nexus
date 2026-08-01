import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Operations — Zoryn provider health and webhook states" },
      { name: "description", content: "KYC/KYB queues, risk alerts, complaint SLAs, provider health and webhook retry, failure and duplicate-event states." },
      { property: "og:title", content: "Operations — Zoryn provider health and webhook states" },
      { property: "og:description", content: "KYC/KYB queues, risk alerts, complaint SLAs, provider health and webhook processing states." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">Operations data unavailable: {error.message}</main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No operations data found.</main>,
  component: () => <ProviderReadyCentre initialTab="operations" />,
});