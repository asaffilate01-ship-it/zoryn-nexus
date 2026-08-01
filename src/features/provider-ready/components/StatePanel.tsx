import type { ReactNode } from "react";

export function StatePanel({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/70 p-6">
      <div className="flex gap-4">
        <div className="mt-1 text-primary">{icon}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </section>
  );
}
