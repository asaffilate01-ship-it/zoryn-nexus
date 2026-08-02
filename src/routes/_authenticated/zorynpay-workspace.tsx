import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/_authenticated/zorynpay-workspace")({
  head: () => ({
    links: [
      {
        rel: "canonical",
        href: "https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/merchant",
      },
    ],
    meta: [
      { title: "ZorynPay workspace — Tap to Pay, settlements and terminals" },
      {
        name: "description",
        content:
          "Merchant sales dashboard with a working Tap to Pay simulation, customer-entered amounts, settlement breakdown and terminal status.",
      },
      {
        property: "og:title",
        content: "ZorynPay workspace — Tap to Pay, settlements and terminals",
      },
      {
        property: "og:description",
        content:
          "Tap to Pay simulation, settlement breakdown, payment links and terminal readiness.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="merchant" />,
});
