import { createFileRoute } from "@tanstack/react-router";
import { LaunchBlockersCentre } from "@/features/go-live/LaunchBlockersCentre";

export const Route = createFileRoute("/_authenticated/launch-blockers")({
  head: () => ({
    meta: [
      { title: "Launch Blockers — Zoryn go-live control" },
      {
        name: "description",
        content:
          "Outstanding engineering, security, Swan, Adyen, operations, legal and pilot blockers before Zoryn goes live with real provider credentials.",
      },
      { property: "og:title", content: "Launch Blockers — Zoryn go-live control" },
      {
        property: "og:description",
        content:
          "Open go-live blockers, reconciliation runs and failed provider commands and events in one view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LaunchBlockersCentre,
});
