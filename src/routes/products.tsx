import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeEuro,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Gift,
  Globe2,
  Landmark,
  LockKeyhole,
  Menu,
  Plus,
  Send,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Zoryn products — Personal, Business, ZorynPay and Rewards" },
      {
        name: "description",
        content:
          "Zoryn brings everyday banking, business accounts, card acceptance and loyalty together. German IBAN ready, rewards built in, powered by regulated partners.",
      },
      { property: "og:title", content: "Zoryn products — banking, payments and rewards" },
      {
        property: "og:description",
        content:
          "Everyday banking, savings pots, business tools, Tap to Pay card acceptance and rewards in one beautifully simple platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicHome,
});

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#personal", label: "Personal" },
  { href: "#business", label: "Business" },
  { href: "#pay", label: "ZorynPay" },
  { href: "#rewards", label: "Rewards" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#security", label: "Security" },
];

function DemoButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to="/demo"
      className={
        "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 " +
        className
      }
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
      {children}
    </span>
  );
}

function PublicHome() {
  const t = useT();
  const [menu, setMenu] = useState(false);

  const aboutStats = [
    { k: t("Germany first"), v: t("German IBANs, SEPA and local payment habits") },
    { k: t("One platform"), v: t("Personal, business, merchant and rewards") },
    { k: t("Partner powered"), v: t("Regulated banking and acquiring providers") },
  ];

  const offerItems = [
    {
      Icon: WalletCards,
      t: "Zoryn Personal",
      d: t("Everyday account, savings pots, SEPA transfers, cards and rewards."),
    },
    {
      Icon: Building2,
      t: "Zoryn Business",
      d: t("Business account, team cards and limits, supplier payments and payment links."),
    },
    {
      Icon: Smartphone,
      t: "ZorynPay",
      d: t("Tap to Pay, terminals, payment links and next-day settlements for merchants."),
    },
    {
      Icon: Gift,
      t: "Zoryn Rewards",
      d: t("Points, cashback and merchant offers across the LoungeTech network."),
    },
  ];

  const personalFeatures = [
    t("German IBAN and instant account overview"),
    t("Flexible pots for bills, travel and goals"),
    t("Physical and virtual cards with controls"),
    t("Built-in rewards and cashback"),
  ];

  const pots = [
    { e: "☔", n: t("Rainy Day"), v: "€2,450" },
    { e: "✈️", n: t("Travel"), v: "€1,240" },
    { e: "💍", n: t("Wedding"), v: "€3,650" },
  ];

  const businessFeatures = [
    {
      Icon: Building2,
      h: t("Business account"),
      p: t("German IBAN, balances, transfers and statements built for day-to-day operations."),
    },
    {
      Icon: Users,
      h: t("Team spending"),
      p: t("Issue staff cards, set limits and see every purchase as it happens."),
    },
    {
      Icon: BadgeEuro,
      h: t("Cash-flow clarity"),
      p: t("Track incoming sales, pending settlements and outgoing payments from one view."),
    },
  ];

  const payFeatures = [
    t("Tap to Pay and terminal-ready checkout"),
    t("Payment links and digital receipts"),
    t("Refunds, settlements and transaction reporting"),
    t("Loyalty applied automatically"),
  ];

  const ecosystemItems = [
    {
      Icon: Landmark,
      t: t("Germany-first positioning"),
      d: t(
        "German IBANs, SEPA Instant, local card habits, German-language support and DE-based operations from day one.",
      ),
    },
    {
      Icon: Globe2,
      t: t("European expansion"),
      d: t(
        "Multi-country IBANs, EEA passporting through partners and a data model built for multi-currency and multi-market growth.",
      ),
    },
    {
      Icon: Users,
      t: t("One connected ecosystem"),
      d: t("Shared accounts, rewards and merchant network across LoungeTech apps and participating businesses."),
    },
  ];

  const trustBadges = [
    { Icon: LockKeyhole, l: t("Strong authentication") },
    { Icon: ShieldCheck, l: t("Fraud and risk controls") },
    { Icon: Globe2, l: t("European-ready architecture") },
    { Icon: Zap, l: t("Real-time notifications") },
  ];

  const proofItems = [
    t("Personal money"),
    t("Business banking"),
    t("Card payments"),
    t("Team expenses"),
    t("Rewards"),
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <a href="#top" className="font-display text-2xl font-bold">
            Zoryn<span className="text-primary">.</span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(l.label)}
              </a>
            ))}
            <DemoButton>{t("Explore live demo")}</DemoButton>
            <LanguageToggle />
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <button
              aria-label={t("Toggle menu")}
              className="text-foreground"
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t border-border/60 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenu(false)}
                  className="text-sm text-muted-foreground"
                >
                  {t(l.label)}
                </a>
              ))}
              <DemoButton className="w-fit">{t("Explore live demo")}</DemoButton>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        id="top"
        className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24"
      >
        <div>
          <Eyebrow>{t("Money that works around you")}</Eyebrow>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            {t("One place for your money, payments and rewards.")}
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            {t(
              "Zoryn brings everyday banking, smarter business tools, card payments and loyalty together in one beautifully simple platform.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <DemoButton>
              {t("Explore the live product")} <ArrowRight size={17} />
            </DemoButton>
            <a
              href="#business"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground/90 hover:text-primary"
            >
              {t("For businesses")} <ChevronRight size={16} />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" /> {t("Secure by design")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Landmark size={15} className="text-primary" /> {t("German IBAN ready")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Gift size={15} className="text-primary" /> {t("Rewards built in")}
            </span>
          </div>
        </div>

        {/* Phone mock */}
        <div className="relative mx-auto w-full max-w-[330px]">
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("Good morning, {name}", { name: "Amer" })}</span>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                AS
              </div>
            </div>
            <small className="mt-6 block text-xs text-muted-foreground">{t("Total balance")}</small>
            <strong className="font-display text-3xl">€8,420.65</strong>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              {[
                { Icon: Send, label: t("Send") },
                { Icon: Plus, label: t("Add") },
                { Icon: WalletCards, label: t("Pots") },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-secondary/70 py-3 text-muted-foreground"
                >
                  <Icon size={16} className="text-primary" />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25 p-4">
              <span className="font-display text-sm">Zoryn.</span>
              <b className="mt-4 block text-sm tracking-widest">•••• 4821</b>
              <small className="text-[11px] text-muted-foreground">{t("Everyday")}</small>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { t: "REWE City", d: t("Today"), a: "−€62.48", mint: false },
                { t: t("Salary payment"), d: t("Yesterday"), a: "+€3,420.00", mint: true },
              ].map((tx) => (
                <div key={tx.t} className="flex items-center justify-between text-sm">
                  <span className="flex flex-col">
                    {tx.t}
                    <small className="text-[11px] text-muted-foreground">{tx.d}</small>
                  </span>
                  <b className={tx.mint ? "text-primary" : ""}>{tx.a}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
            <Gift size={15} className="text-primary" />
            <span>
              <b>1,840</b> {t("Zoryn Points")}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
            <CheckCircle2 size={15} className="text-primary" />
            <span>
              <b>{t("Payment approved")}</b> €15.90
            </span>
          </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("Built for modern life and growing businesses")}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 font-display text-sm text-foreground/80">
            {proofItems.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* About Zoryn */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>{t("About Zoryn")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {t("A modern money platform built by LoungeTech.")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "Zoryn is the customer-facing money, payments and rewards platform of the LoungeTech ecosystem. We bring everyday banking, business finance, in-person card acceptance and loyalty into one product experience — designed in Germany, built for Europe, and delivered together with regulated banking and acquiring partners.",
              )}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {aboutStats.map((i) => (
                <div key={i.k} className="rounded-xl border border-border bg-card/60 p-5">
                  <b className="font-display text-sm">{i.k}</b>
                  <p className="mt-1 text-xs text-muted-foreground">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <b className="font-display text-lg">{t("What Zoryn offers")}</b>
            <div className="mt-5 grid gap-4">
              {offerItems.map(({ Icon, t: name, d }) => (
                <div key={name} className="flex gap-3">
                  <span className="mt-0.5 rounded-lg bg-primary/12 p-2 text-primary">
                    <Icon size={16} />
                  </span>
                  <span>
                    <b className="block font-display text-sm">{name}</b>
                    <small className="text-xs text-muted-foreground">{d}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personal */}
      <section
        id="personal"
        className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2"
      >
        <div>
          <Eyebrow>Zoryn Personal</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            {t("Make every euro easier to manage.")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t(
              "See your balance, move money into savings pots, send SEPA transfers, manage cards and earn rewards from one clear dashboard.",
            )}
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {personalFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check size={17} className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <DemoButton className="mt-8">{t("Open Personal demo")}</DemoButton>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <small className="text-xs text-muted-foreground">{t("Available balance")}</small>
            <strong className="mt-1 block font-display text-3xl">€8,420.65</strong>
            <span className="mt-2 block text-xs tracking-widest text-muted-foreground">
              DE89 3704 0044 0532 0130 00
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {pots.map((p) => (
              <div key={p.n} className="rounded-xl border border-border bg-card/60 p-4">
                <span className="text-lg">{p.e}</span>
                <b className="mt-2 block text-sm">{p.n}</b>
                <strong className="font-display text-primary">{p.v}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business */}
      <section id="business" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <Eyebrow>Zoryn Business</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {t("Your finances, sales and team in one place.")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "Run everyday banking, employee cards, expenses, supplier payments and cash-flow reporting without jumping between tools.",
              )}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {businessFeatures.map(({ Icon, h, p }) => (
              <article key={h} className="rounded-2xl border border-border bg-card p-6">
                <div className="w-fit rounded-xl bg-primary/12 p-3 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg">{h}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p}</p>
              </article>
            ))}
          </div>
          <DemoButton className="mt-10">{t("Explore Business portal")}</DemoButton>
        </div>
      </section>

      {/* ZorynPay */}
      <section
        id="pay"
        className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2"
      >
        <div className="order-2 lg:order-1">
          <Eyebrow>ZorynPay</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            {t("Get paid wherever business happens.")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t(
              "Accept online, link, QR and contactless payments. Use Tap to Pay on a compatible phone or connect a payment terminal when your business needs one.",
            )}
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {payFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check size={17} className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <DemoButton className="mt-8">{t("Try Tap to Pay demo")}</DemoButton>
        </div>
        <div className="order-1 flex flex-col items-center gap-3 rounded-[2rem] border border-border bg-gradient-to-br from-card to-secondary/50 px-6 py-14 text-center lg:order-2">
          <Smartphone size={54} className="text-primary" />
          <span className="text-sm text-muted-foreground">{t("Tap card or phone")}</span>
          <strong className="font-display text-4xl">€15.90</strong>
          <div className="font-display text-2xl tracking-widest text-primary">{")))"}</div>
          <small className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            ZorynPay
          </small>
        </div>
      </section>

      {/* Rewards */}
      <section id="rewards" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <Eyebrow>Zoryn Rewards</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {t("More value every time money moves.")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "Customers earn points across participating LoungeTech services and merchants, while businesses create offers that bring people back.",
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8">
            <Gift size={22} className="text-primary" />
            <span className="mt-4 block text-sm text-muted-foreground">{t("Your points")}</span>
            <strong className="font-display text-4xl">1,840</strong>
            <small className="mt-2 block text-xs text-muted-foreground">
              {t("Silver member · {points} points to Gold", { points: 160 })}
            </small>
          </div>
        </div>
      </section>

      {/* LoungeTech ecosystem & European expansion */}
      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>{t("LoungeTech ecosystem")}</Eyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-3xl sm:text-4xl">
          {t("Germany first, then across Europe.")}
        </h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          {t(
            "Zoryn is part of the wider LoungeTech ecosystem, where customer apps, participating merchants and business services share one identity, one rewards currency and one payments backbone. We start where our roots are — Germany — and expand market by market on the same European-ready architecture.",
          )}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ecosystemItems.map(({ Icon, t: hd, d }) => (
            <article key={hd} className="rounded-2xl border border-border bg-card/60 p-6">
              <Icon size={20} className="text-primary" />
              <h3 className="mt-4 font-display text-lg">{hd}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Security & adapter boundaries */}
      <section id="security" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr]">
          <div className="w-fit rounded-2xl bg-primary/12 p-5 text-primary">
            <ShieldCheck size={30} />
          </div>
          <div>
            <Eyebrow>{t("Security and trust")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {t("Built on Swan for banking and Adyen for payments.")}
            </h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              {t(
                "Zoryn's customer experience is separated from the regulated banking and acquiring infrastructure. Swan handles KYC/KYB, accounts, IBANs, SEPA transfers and card issuing. Adyen handles PCI scope, Tap to Pay, terminals, payment links and settlements. Zoryn applies secure access, audit trails and clear customer controls on top.",
              )}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustBadges.map(({ Icon, l }) => (
                <span
                  key={l}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-xs"
                >
                  <Icon size={15} className="shrink-0 text-primary" />
                  {l}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <b className="font-display text-sm">{t("Banking by Swan")}</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    "Accounts, German IBANs, SEPA transfers and card issuing sit behind the Swan banking adapter. KYC, KYB and AML decisions are made by the licensed partner.",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <b className="font-display text-sm">{t("Payments by Adyen")}</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    "Tap to Pay, terminals, payment links and settlements route through the Adyen acquiring adapter. Card data and PCI DSS compliance stay within Adyen.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-border/60 bg-gradient-to-br from-card to-secondary/40">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <Eyebrow>{t("See the full platform")}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            {t("Explore every Zoryn experience with realistic demo data.")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t(
              "Move money between pots, send transfers, manage cards, accept payments and explore business and operations dashboards.",
            )}
          </p>
          <DemoButton className="mt-8">
            {t("Launch interactive demo")} <ArrowRight size={17} />
          </DemoButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="font-display text-xl font-bold">
              Zoryn<span className="text-primary">.</span>
            </a>
            <p className="mt-2 text-sm text-muted-foreground">{t("Money. Payments. Rewards.")}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <b className="text-foreground">{t("Products")}</b>
            {navLinks.slice(1, 5).map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground">
                {t(l.label)}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <b className="text-foreground">{t("Company")}</b>
            <a href="#about" className="hover:text-foreground">
              {t("About Zoryn")}
            </a>
            <a href="#ecosystem" className="hover:text-foreground">
              {t("LoungeTech ecosystem")}
            </a>
            <a href="#security" className="hover:text-foreground">
              {t("Security & regulated partners")}
            </a>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <b className="text-foreground">{t("Explore")}</b>
            <a href="#top" className="hover:text-foreground">
              {t("Customer product website")}
            </a>
            <Link to="/demo" className="hover:text-foreground">
              {t("Live demo & testing platform")}
            </Link>
            <span>{t("Operated by LoungeTech")}</span>
          </div>
        </div>
        <small className="mt-10 block text-xs text-muted-foreground">
          {t(
            "© 2026 Zoryn. Demo product experience. Financial services will be provided by authorised partners.",
          )}
        </small>
      </footer>
    </div>
  );
}
