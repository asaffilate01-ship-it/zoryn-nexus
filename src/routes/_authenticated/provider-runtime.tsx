import { createFileRoute } from "@tanstack/react-router";
import { ProviderRuntimeCentre } from "@/features/provider-runtime/ProviderRuntimeCentre";

export const Route = createFileRoute("/_authenticated/provider-runtime")({
  head: () => ({
    meta: [
      { title: "Provider Runtime Operations — Zoryn Nexus" },
      {
        name: "description",
        content:
          "Live provider command queue, webhook event processing, retry attempts, dead letters and correlated runtime logs for Swan, Adyen and Zoryn Rewards.",
      },
      { property: "og:title", content: "Provider Runtime Operations — Zoryn Nexus" },
      {
        property: "og:description",
        content:
          "Command queues, webhook events, processing states and retry attempts across Zoryn's provider runtime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderRuntimeCentre,
});
