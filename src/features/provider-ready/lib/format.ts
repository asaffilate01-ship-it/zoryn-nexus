export const eur = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
const ACRONYMS = new Set(["sla", "ubo", "kyc", "kyb", "sepa", "iban", "api", "id"]);
export const statusLabel = (status: string) =>
  status
    .replaceAll("_", " ")
    .split(" ")
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.replace(/\b\w/, (c) => c.toUpperCase()),
    )
    .join(" ");
