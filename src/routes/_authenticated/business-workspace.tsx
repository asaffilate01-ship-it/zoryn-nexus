import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/_authenticated/business-workspace")({
  head: () => ({
    links: [
      {
        rel: "canonical",
        href: "https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/business",
      },
    ],
    meta: [
      { title: "Business workspace — Zoryn balances, settlements and staff cards" },
      {
        name: "description",
        content:
          "Business balances, daily sales, pending settlements, payment approvals, staff cards, limits and frozen-card states.",
      },
      {
        property: "og:title",
        content: "Business workspace — Zoryn balances, settlements and staff cards",
      },
      {
        property: "og:description",
        content: "Balances, daily sales, settlements, approvals and staff card controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="business" />,
});
