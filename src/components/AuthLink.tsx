import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AuthLink({ className }: { className?: string }) {
  const t = useT();
  const { session, loading } = useSession();
  if (loading) return null;
  return session ? (
    <Link to="/personal" className={cn("text-sm font-semibold text-primary", className)}>
      {t("My portal")}
    </Link>
  ) : (
    <Link
      to="/auth"
      className={cn(
        "text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      {t("Sign in")}
    </Link>
  );
}
