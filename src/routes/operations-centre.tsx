import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";

export const Route = createFileRoute("/operations-centre")({
  head: () => ({
    meta: [
      { title: "Operations Centre — Zoryn webhook and provider monitoring" },
      { name: "description", content: "Webhook idempotency, retries, ordering and dead-letter visibility across the Zoryn banking and acquiring adapters." },
      { property: "og:title", content: "Operations Centre — Zoryn webhook and provider monitoring" },
      { property: "og:description", content: "Webhook idempotency, retries, ordering and dead-letter visibility across the Zoryn banking and acquiring adapters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProviderReadyCentre initialTab="operations" />,
});
