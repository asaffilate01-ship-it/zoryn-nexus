import { createFileRoute } from "@tanstack/react-router";
import { ControlRoom } from "@/features/operations/components/ControlRoom";

export const Route = createFileRoute("/_authenticated/control-room")({
  head: () => ({
    meta: [
      { title: "Operations Control Room — Zoryn platform" },
      {
        name: "description",
        content:
          "Live queue depth for Zoryn provider commands, webhook events, notifications, incidents, support cases and reconciliation runs.",
      },
      { property: "og:title", content: "Operations Control Room — Zoryn platform" },
      {
        property: "og:description",
        content: "Provider command and webhook backlogs, alerts, incidents and reconciliation in one view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ControlRoom,
});
