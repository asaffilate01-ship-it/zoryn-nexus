import { statusLabel } from "../lib/format";
import { useT } from "@/lib/i18n";

const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

export function StatusBadge({ status }: { status: string }) {
  const t = useT();
  const tone = has(status, [
    "active",
    "completed",
    "processed",
    "operational",
    "online",
    "approved",
    "booked",
    "captured",
    "won",
    "low",
  ])
    ? "bg-primary/12 text-primary"
    : has(status, [
          "failed",
          "critical",
          "dead",
          "restricted",
          "declined",
          "lost",
          "stolen",
          "outage",
          "offline",
          "returned",
          "chargeback",
          "rejected",
          "suspended",
        ])
      ? "bg-destructive/15 text-destructive"
      : has(status, [
            "pending",
            "review",
            "retry",
            "required",
            "invited",
            "shipped",
            "degraded",
            "frozen",
            "awaiting",
            "high",
            "medium",
            "not_configured",
          ])
        ? "bg-amber-500/15 text-amber-400"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {t(statusLabel(status))}
    </span>
  );
}
