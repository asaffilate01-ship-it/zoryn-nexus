import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "surface-card rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            {title && <h3 className="font-display text-lg tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-card flex flex-col justify-between rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-sm",
        emphasis && "surface-accent border-primary/25",
        className,
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <strong
        className={cn(
          "tabular mt-3 block font-display text-2xl leading-tight",
          emphasis && "text-3xl text-primary sm:text-4xl",
        )}
      >
        {value}
      </strong>
      {hint && <small className="mt-1 block text-xs text-muted-foreground">{hint}</small>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "bg-secondary text-muted-foreground ring-1 ring-inset ring-white/10",
    good: "bg-primary/12 text-primary ring-1 ring-inset ring-primary/25",
    warn: "bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-400/25",
    bad: "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/25",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-[0_10px_28px_-14px_oklch(0.82_0.17_165/0.9)] hover:brightness-110 active:translate-y-px",
    ghost: "border border-border bg-card/40 hover:border-white/20 hover:bg-secondary active:translate-y-px",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10 active:translate-y-px",
  } as const;
  return (
    <button
      {...rest}
      className={cn(
        "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground/70 hover:border-white/20 focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary ring-1 ring-inset ring-white/5">
      <div
        className="h-full rounded-full bg-linear-to-r from-primary/70 to-primary transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-destructive">{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
