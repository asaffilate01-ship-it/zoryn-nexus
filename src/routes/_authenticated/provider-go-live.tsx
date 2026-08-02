import { createFileRoute } from "@tanstack/react-router";
import { ProviderGoLiveCentre } from "@/features/go-live/ProviderGoLiveCentre";

export const Route = createFileRoute("/_authenticated/provider-go-live")({
  head: () => ({
    meta: [
      { title: "Provider Go-Live — Zoryn Nexus" },
      {
        name: "description",
        content:
          "Swan and Adyen readiness scores, the full required provider operation catalogue and mapping validation progress ahead of go-live.",
      },
      { property: "og:title", content: "Provider Go-Live — Zoryn Nexus" },
      {
        property: "og:description",
        content:
          "Readiness scoring, required operation catalogue and mapping progress for Swan and Adyen activation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderGoLiveCentre,
});
