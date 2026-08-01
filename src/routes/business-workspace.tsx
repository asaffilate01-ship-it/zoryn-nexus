import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/business-workspace")({
  head: () => ({
    meta: [
      { title: "Business workspace — Zoryn balances, settlements and staff cards" },
      { name: "description", content: "Business balances, daily sales, pending settlements, payment approvals, staff cards, limits and frozen-card states." },
      { property: "og:title", content: "Business workspace — Zoryn balances, settlements and staff cards" },
      { property: "og:description", content: "Balances, daily sales, settlements, approvals and staff card controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="business" />,
});