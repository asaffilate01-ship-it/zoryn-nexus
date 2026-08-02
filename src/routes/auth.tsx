import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Zoryn — banking, payments and rewards" },
      {
        name: "description",
        content:
          "Sign in or create a Zoryn account to open the personal, business, ZorynPay and LoungeTech admin portals.",
      },
      { property: "og:title", content: "Sign in to Zoryn" },
      {
        property: "og:description",
        content: "Access your Zoryn balances, cards, payments and rewards portals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/personal", replace: true });
  }, [loading, session, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) setInfo(t("Check your email to confirm your Zoryn account."));
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.error) throw result.error;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> {t("Back to zoryn.com")}
        </Link>
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          {t("Zoryn account")}
        </span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          {mode === "signin" ? t("Sign in") : t("Create your account")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("One account for personal banking, business, ZorynPay and admin operations.")}
        </p>

        <div className="surface-card mt-7 rounded-3xl border border-border/70 p-6">
          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            {t("Continue with Google")}
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <label className="block text-sm">
                <span className="text-muted-foreground">{t("Full name")}</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
            )}
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("Email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("Password")}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            {info && (
              <p
                role="status"
                className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary"
              >
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? t("Sign in") : t("Create account")}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin"
              ? t("No account yet? Create one")
              : t("Already have an account? Sign in")}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t(
            "New accounts start with the personal portal. Business, ZorynPay and admin access is granted by LoungeTech.",
          )}
        </p>
      </div>
    </div>
  );
}
