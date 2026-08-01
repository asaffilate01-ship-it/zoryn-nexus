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
    <div className="surface-card rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="shrink-0 text-primary/80">{icon}</span>
      </div>
      <strong className="tabular mt-3 block font-display text-2xl leading-tight">{value}</strong>
      {help && <small className="mt-1 block text-xs text-muted-foreground">{help}</small>}
    </div>
  );
}
