import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";

export const Route = createFileRoute("/provider-ready")({
  head: () => ({
    meta: [
      { title: "Provider-Ready Centre — Zoryn Nexus" },
      { name: "description", content: "Production-state banking, business, acquiring, rewards and operations journeys behind the Zoryn provider adapter boundaries." },
      { property: "og:title", content: "Provider-Ready Centre — Zoryn Nexus" },
      { property: "og:description", content: "Production-state banking, business, acquiring, rewards and operations journeys behind the Zoryn provider adapter boundaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProviderReadyCentre />,
});
