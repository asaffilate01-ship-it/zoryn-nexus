import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  help,
  icon,
}: {
  label: string;
  value: string;
  help?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <strong className="mt-2 block font-display text-2xl">{value}</strong>
      {help && <small className="text-xs text-muted-foreground">{help}</small>}
    </div>
  );
}
