import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { portalConfigs } from "@/lib/zoryn-data";

const config = portalConfigs["admin"];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Zoryn ${config.name} portal — ${config.tagline}` },
      { name: "description", content: `${config.name} portal on Zoryn: ${config.tagline}. Demo mode with Swan banking and Adyen acquiring adapters.` },
      { property: "og:title", content: `Zoryn ${config.name} portal` },
      { property: "og:description", content: `${config.name} portal on Zoryn: ${config.tagline}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="admin" />,
});
