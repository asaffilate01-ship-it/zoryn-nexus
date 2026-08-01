import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { de } from "./locales/de";

export type Locale = "en" | "de";

const STORAGE_KEY = "zoryn.locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    const next: Locale =
      stored === "de" || stored === "en"
        ? stored
        : navigator.language?.toLowerCase().startsWith("de")
          ? "de"
          : "en";
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      interpolate(locale === "de" ? (de[key] ?? key) : key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so components can render outside the provider (e.g. error shells).
    return { locale: "en", setLocale: () => {}, t: (k, v) => interpolate(k, v) };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}