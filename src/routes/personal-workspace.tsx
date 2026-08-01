import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/personal-workspace")({
  head: () => ({
    meta: [
      { title: "Personal workspace — Zoryn balances, pots and rewards" },
      { name: "description", content: "German IBAN, balances, savings pots with targets, chosen-amount transfers, cards and rewards with booked, pending and returned states." },
      { property: "og:title", content: "Personal workspace — Zoryn balances, pots and rewards" },
      { property: "og:description", content: "German IBAN, savings pots, transfers, cards and rewards in production-style states." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PortalShell role="personal" />,
});