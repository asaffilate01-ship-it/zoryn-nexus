import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Gift,
  Globe2,
  Landmark,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Smartphone,
  WalletCards,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoryn — The LoungeTech money, payments and rewards platform" },
      {
        name: "description",
        content:
          "Zoryn is the LoungeTech financial platform: German-first everyday banking, business accounts, ZorynPay card acceptance and one universal rewards balance, delivered with regulated partners.",
      },
      { property: "og:title", content: "Zoryn — money, payments and rewards by LoungeTech" },
      {
        property: "og:description",
        content:
          "A Germany-first financial platform built for European expansion, with a provider-independent data model and regulated banking and acquiring partners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CorporateHome,
});

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#offer", label: "What we offer" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#europe", label: "Europe" },
  { href: "#trust", label: "Security" },
];

const products = [
  {
    icon: WalletCards,
    name: "Zoryn Personal",
    text: "Everyday German IBAN accounts, savings pots, SEPA transfers and physical or virtual cards.",
  },
  {
    icon: Building2,
    name: "Zoryn Business",
    text: "Business balances, cash-flow insight, supplier payments, payment links and team cards with limits.",
  },
  {
    icon: Smartphone,
    name: "ZorynPay",
    text: "Tap to Pay on iPhone, terminals, settlements and payment links for merchants of every size.",
  },
  {
    icon: Gift,
    name: "Zoryn Rewards",
    text: "One universal points balance shared across personal, business and merchant experiences.",
  },
];

function CorporateHome() {
  const t = useT();
  const [menu, setMenu] = useState(false);

  const heroCards: [string, string][] = [
    [t("Germany first"), t("German IBANs, SEPA rails and local payment habits from day one.")],
    [t("One platform"), t("Personal, business, merchant and operations on shared infrastructure.")],
    [t("Partner powered"), t("Licensed banking and acquiring partners sit behind clean adapters.")],
  ];

  const ecosystemCards: [typeof Globe2, string, string][] = [
    [Landmark, t("Shared identity"), t("A single verified Zoryn identity works across personal, business and merchant products.")],
    [Gift, t("Shared rewards"), t("Points earned anywhere in the ecosystem spend anywhere — cash, pots or partner offers.")],
    [Globe2, t("Shared operations"), t("Compliance queues, provider monitoring and audit logging run centrally at LoungeTech.")],
  ];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <a href="#top" className="font-display text-2xl font-bold">
            Zoryn<span className="text-primary">.</span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t(l.label)}
              </a>
            ))}
            <Link to="/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t("Products")}
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {t("Explore live demo")}
            </Link>
            <LanguageToggle />
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <button aria-label={t("Toggle menu")} className="text-foreground" onClick={() => setMenu((v) => !v)}>
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="flex flex-col gap-4 border-t border-border/60 px-5 py-4 md:hidden">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="text-sm text-muted-foreground">
                {t(l.label)}
              </a>
            ))}
            <Link to="/products" className="text-sm text-muted-foreground">
              {t("Products")}
            </Link>
            <Link to="/demo" className="text-sm font-semibold text-primary">
              {t("Explore live demo")}
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header id="top" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("A LoungeTech company")}</span>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          {t("The financial platform behind modern money in Germany")}<span className="text-primary">.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t(
            "Zoryn unifies everyday banking, business finance, card acceptance and loyalty in a single product family — built on a provider-independent data model and delivered with regulated banking and acquiring partners.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {t("See the products")} <ArrowRight size={16} />
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/60 hover:text-primary"
          >
            {t("Live demo & testing platform")}
          </Link>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {heroCards.map(([hd, d]) => (
            <div key={hd} className="rounded-2xl border border-border bg-card/60 p-6">
              <b className="font-display text-lg">{hd}</b>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </header>

      {/* About */}
      <section id="about" className="border-t border-border/60 bg-card/25">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("About Zoryn")}</span>
          <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">{t("Money, payments and rewards, connected")}</h2>
              <p className="mt-5 text-base text-muted-foreground">
                {t(
                  "Zoryn is the financial platform of LoungeTech. Instead of stitching together a bank app, a card terminal and a loyalty scheme, Zoryn gives people and businesses one account structure, one payments layer and one rewards balance.",
                )}
              </p>
              <p className="mt-4 text-base text-muted-foreground">
                {t(
                  "Everything customers see is Zoryn. Behind the scenes, regulated partners provide accounts, card issuing and acquiring — mapped into the Zoryn data model so a partner can be added or replaced without changing the customer experience.",
                )}
              </p>
            </div>
            <div id="offer" className="scroll-mt-24 rounded-2xl border border-border bg-background/50 p-6">
              <b className="font-display text-lg">{t("What Zoryn offers")}</b>
              <ul className="mt-4 space-y-4">
                {products.map(({ icon: Icon, name, text }) => (
                  <li key={name} className="flex gap-3">
                    <span className="mt-0.5 rounded-lg bg-primary/12 p-2 text-primary">
                      <Icon size={18} />
                    </span>
                    <div>
                      <b className="block text-sm">{name}</b>
                      <p className="text-sm text-muted-foreground">{t(text)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {t("Visit the product website")} <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("LoungeTech ecosystem")}</span>
        <h2 className="mt-4 max-w-2xl font-display text-3xl sm:text-4xl">
          {t("One identity and one rewards balance across the group")}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {ecosystemCards.map(([Icon, hd, d]) => (
            <div key={hd} className="rounded-2xl border border-border bg-card/60 p-6">
              <span className="inline-flex rounded-xl bg-primary/12 p-3 text-primary">
                <Icon size={20} />
              </span>
              <b className="mt-4 block font-display text-lg">{hd}</b>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Europe */}
      <section id="europe" className="border-y border-border/60 bg-card/25">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("Germany first, then Europe")}</span>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/50 p-6">
              <b className="font-display text-lg">{t("Built for Germany")}</b>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "German IBANs, SEPA Credit Transfer and Instant, Girocard acceptance, German-language support and local compliance expectations shape the first release.",
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-6">
              <b className="font-display text-lg">{t("Ready for European expansion")}</b>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Multi-country organisations, currency-aware accounts and per-market provider adapters mean new European markets are a configuration step, not a rebuild.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("Security & regulated partners")}</span>
        <h2 className="mt-4 max-w-2xl font-display text-3xl sm:text-4xl">
          {t("Zoryn is the experience layer. Licensed partners hold the funds.")}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <span className="inline-flex rounded-xl bg-primary/12 p-3 text-primary">
              <ShieldCheck size={20} />
            </span>
            <b className="mt-4 block font-display text-lg">{t("Banking adapter boundary")}</b>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Accounts, IBANs, SEPA transfers and card issuing are executed by a regulated banking partner behind a single adapter interface.",
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <span className="inline-flex rounded-xl bg-primary/12 p-3 text-primary">
              <LockKeyhole size={20} />
            </span>
            <b className="mt-4 block font-display text-lg">{t("Acquiring adapter boundary")}</b>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Tap to Pay, terminals and settlements run through a regulated acquiring partner, with webhook events and audit logs recorded on the Zoryn side.",
              )}
            </p>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          {t(
            "This site and the demo platform are a product environment. They do not hold or move real funds and do not themselves provide regulated financial services.",
          )}
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-bold">
              Zoryn<span className="text-primary">.</span>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">{t("Money. Payments. Rewards. By LoungeTech.")}</p>
          </div>
          <div>
            <b className="text-sm">{t("Company")}</b>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground">{t("About Zoryn")}</a></li>
              <li><a href="#ecosystem" className="hover:text-foreground">{t("LoungeTech ecosystem")}</a></li>
              <li><a href="#europe" className="hover:text-foreground">{t("Germany & Europe")}</a></li>
            </ul>
          </div>
          <div>
            <b className="text-sm">{t("Product website")}</b>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground">{t("Overview")}</Link></li>
              <li><Link to="/products" hash="personal" className="hover:text-foreground">Zoryn Personal</Link></li>
              <li><Link to="/products" hash="business" className="hover:text-foreground">Zoryn Business</Link></li>
              <li><Link to="/products" hash="pay" className="hover:text-foreground">ZorynPay</Link></li>
              <li><Link to="/products" hash="rewards" className="hover:text-foreground">Zoryn Rewards</Link></li>
            </ul>
          </div>
          <div>
            <b className="text-sm">{t("Try Zoryn")}</b>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/demo" className="hover:text-foreground">{t("Live demo & testing platform")}</Link></li>
              <li><Link to="/personal" className="hover:text-foreground">{t("Personal portal")}</Link></li>
              <li><Link to="/business" className="hover:text-foreground">{t("Business portal")}</Link></li>
              <li><Link to="/merchant" className="hover:text-foreground">{t("ZorynPay portal")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 px-5 py-6 text-center text-xs text-muted-foreground sm:px-8">
          {t("© {year} Zoryn — a LoungeTech platform. Demo environment.", { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
