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
    <section className="surface-card rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <div className="flex gap-4">
        <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/25">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </section>
  );
}
