import { createFileRoute } from "@tanstack/react-router";
import { ProviderIntegrationCentre } from "@/features/provider-integration/ProviderIntegrationCentre";

export const Route = createFileRoute("/_authenticated/provider-integration")({
  head: () => ({
    meta: [
      { title: "Provider Integration Readiness — Zoryn Nexus" },
      {
        name: "description",
        content:
          "Swan, Adyen and Rewards connection modes, health, webhook events and provider resource mappings behind Zoryn's provider-neutral boundary.",
      },
      { property: "og:title", content: "Provider Integration Readiness — Zoryn Nexus" },
      {
        property: "og:description",
        content:
          "Swan, Adyen and Rewards connection modes, health, webhook events and provider resource mappings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderIntegrationCentre,
});