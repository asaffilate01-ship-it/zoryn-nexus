import { createFileRoute } from "@tanstack/react-router";
import { OnboardingStatus } from "./onboarding-status";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    links: [
      {
        rel: "canonical",
        href: "https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/onboarding-status",
      },
    ],
    meta: [
      { title: "Onboarding — Zoryn personal and business account states" },
      {
        name: "description",
        content:
          "Personal and business onboarding with KYC and KYB required actions, document uploads and regulated-partner reviews.",
      },
      { property: "og:title", content: "Onboarding — Zoryn personal and business account states" },
      {
        property: "og:description",
        content: "KYC and KYB required actions, document uploads and regulated-partner reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">
      Onboarding states unavailable: {error.message}
    </main>
  ),
  notFoundComponent: () => (
    <main className="p-10 text-foreground">No onboarding states found.</main>
  ),
  component: OnboardingStatus,
});
