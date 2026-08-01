import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";

const options: { value: Locale; label: string }[] = [
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-1.5 py-1",
        className,
      )}
    >
      <Languages size={14} className="ml-1 text-muted-foreground" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLocale(o.value)}
          aria-pressed={locale === o.value}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            locale === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}