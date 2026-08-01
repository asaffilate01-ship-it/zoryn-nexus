import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";

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
  component: () => <ProviderReadyCentre initialTab="scenarios" />,
});
