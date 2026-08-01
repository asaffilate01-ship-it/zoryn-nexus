import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeEuro, FileCheck2, ShieldAlert, UserCheck } from "lucide-react";
import { StatePanel } from "@/features/provider-ready/components/StatePanel";
import { providerSnapshotQueryOptions } from "@/features/provider-ready/lib/snapshot-query";
import { useT } from "@/lib/i18n";

const actionIcons: Record<string, React.ReactNode> = {
  verify: <UserCheck className="h-5 w-5" />,
  upload: <FileCheck2 className="h-5 w-5" />,
  review: <ShieldAlert className="h-5 w-5" />,
  fund: <BadgeEuro className="h-5 w-5" />,
  contact_support: <ShieldAlert className="h-5 w-5" />,
};

const actionLabels: Record<string, string | null> = {
  verify: "Continue verification",
  upload: "Upload document",
  review: null,
  fund: "Add funds",
  contact_support: "Contact support",
};

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
  loader: ({ context }) => context.queryClient.ensureQueryData(providerSnapshotQueryOptions),
  errorComponent: ({ error }) => (
    <main role="alert" className="p-10 text-foreground">Onboarding states unavailable: {error.message}</main>
  ),
  notFoundComponent: () => <main className="p-10 text-foreground">No onboarding states found.</main>,
  component: OnboardingStatus,
});

function OnboardingStatus() {
  const t = useT();
  const { data } = useSuspenseQuery(providerSnapshotQueryOptions);
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/provider-ready" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("Provider-ready centre")}
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t("Zoryn onboarding")}</p>
          <h1 className="mt-2 font-display text-3xl">{t("Complete account-state experience")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Provider-independent states that map regulated onboarding and compliance outcomes into clear customer actions.",
            )}
          </p>
        </div>
        {data.onboardingActions.map((a) => {
          const label = actionLabels[a.action];
          return (
            <StatePanel
              key={a.id}
              icon={actionIcons[a.action] ?? <ShieldAlert className="h-5 w-5" />}
              title={t(a.title)}
              description={
                a.dueAt
                  ? t("{description} Due by {date}.", {
                      description: t(a.description),
                      date: new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(a.dueAt)),
                    })
                  : t(a.description)
              }
              {...(label
                ? {
                    action: (
                      <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                        {t(label)}
                      </button>
                    ),
                  }
                : {})}
            />
          );
        })}
      </div>
    </main>
  );
}
