import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileCheck2, ShieldAlert, UserCheck } from "lucide-react";
import { StatePanel } from "@/features/provider-ready/components/StatePanel";

export const Route = createFileRoute("/onboarding-status")({
  head: () => ({
    meta: [
      { title: "Onboarding status — Zoryn account states" },
      {
        name: "description",
        content:
          "Plain-language Zoryn onboarding and compliance states: identity checks, document uploads and reviews by the regulated partner.",
      },
      { property: "og:title", content: "Zoryn onboarding and compliance states" },
      {
        property: "og:description",
        content:
          "Provider-independent account states that map regulated onboarding outcomes into clear customer actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingStatus,
});

function OnboardingStatus() {
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/provider-ready" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Provider-ready centre
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Zoryn onboarding</p>
          <h1 className="mt-2 font-display text-3xl">Complete account-state experience</h1>
          <p className="mt-2 text-muted-foreground">
            Provider-independent states that map regulated onboarding and compliance outcomes into clear customer
            actions.
          </p>
        </div>
        <StatePanel
          icon={<UserCheck className="h-5 w-5" />}
          title="Identity check required"
          description="Resume the secure hosted verification process before the account can be opened."
          action={
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Continue verification
            </button>
          }
        />
        <StatePanel
          icon={<FileCheck2 className="h-5 w-5" />}
          title="One document needed"
          description="Upload proof of address issued within the last three months."
          action={<button className="rounded-xl border border-border px-4 py-2 text-sm font-bold">Upload document</button>}
        />
        <StatePanel
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Application under review"
          description="No action is needed. We will notify the customer when the regulated partner completes its review."
        />
      </div>
    </main>
  );
}