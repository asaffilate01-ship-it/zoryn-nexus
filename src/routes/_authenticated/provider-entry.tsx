import { createFileRoute } from "@tanstack/react-router";
import { ProviderEntryCentre } from "@/features/go-live/ProviderEntryCentre";

export const Route = createFileRoute("/_authenticated/provider-entry")({
  head: () => ({
    meta: [
      { title: "Provider Entry Centre — Zoryn Nexus" },
      {
        name: "description",
        content:
          "Provider contract versions, sandbox scenario evidence, provider health checks, reconciliation runs and critical launch blockers for Swan and Adyen entry.",
      },
      { property: "og:title", content: "Provider Entry Centre — Zoryn Nexus" },
      {
        property: "og:description",
        content:
          "Contracts, sandbox evidence, reconciliation and launch blockers ahead of Swan and Adyen provider entry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderEntryCentre,
});
