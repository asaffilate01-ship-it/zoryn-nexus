import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/zorynpay-workspace")({
  head: () => ({
    meta: [
      { title: "ZorynPay workspace — Tap to Pay, settlements and terminals" },
      { name: "description", content: "Merchant sales dashboard with a working Tap to Pay simulation, customer-entered amounts, settlement breakdown and terminal status." },
      { property: "og:title", content: "ZorynPay workspace — Tap to Pay, settlements and terminals" },
      { property: "og:description", content: "Tap to Pay simulation, settlement breakdown, payment links and terminal readiness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="merchant" />,
});