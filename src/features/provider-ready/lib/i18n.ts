export type Locale = "de" | "en";
const messages = {
  de: {
    title: "Provider-Ready Centre",
    balance: "Verfügbares Guthaben",
    actions: "Erforderliche Aktionen",
    personal: "Privat",
    business: "Geschäftlich",
    pay: "ZorynPay",
    operations: "Betrieb",
    scenarios: "Szenarien",
  },
  en: {
    title: "Provider-Ready Centre",
    balance: "Available balance",
    actions: "Required actions",
    personal: "Personal",
    business: "Business",
    pay: "ZorynPay",
    operations: "Operations",
    scenarios: "Scenarios",
  },
} as const;
export const t = (locale: Locale, key: keyof typeof messages.en) => messages[locale][key];
