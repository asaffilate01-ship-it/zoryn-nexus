export const eur = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
export const statusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
