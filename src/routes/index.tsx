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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoryn — One place for money, payments and rewards" },
      {
        name: "description",
        content:
          "Zoryn brings everyday banking, business accounts, card acceptance and loyalty together. German IBAN ready, rewards built in, powered by regulated partners.",
      },
      { property: "og:title", content: "Zoryn — Money, payments and rewards" },
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
  const [menu, setMenu] = useState(false);

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
                {l.label}
              </a>
            ))}
            <DemoButton>Explore live demo</DemoButton>
          </div>
          <button
            aria-label="Toggle menu"
            className="text-foreground md:hidden"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
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
                  {l.label}
                </a>
              ))}
              <DemoButton className="w-fit">Explore live demo</DemoButton>
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
          <Eyebrow>Money that works around you</Eyebrow>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            One place for your money, payments and rewards.
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Zoryn brings everyday banking, smarter business tools, card payments and loyalty
            together in one beautifully simple platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <DemoButton>
              Explore the live product <ArrowRight size={17} />
            </DemoButton>
            <a
              href="#business"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground/90 hover:text-primary"
            >
              For businesses <ChevronRight size={16} />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" /> Secure by design
            </span>
            <span className="inline-flex items-center gap-2">
              <Landmark size={15} className="text-primary" /> German IBAN ready
            </span>
            <span className="inline-flex items-center gap-2">
              <Gift size={15} className="text-primary" /> Rewards built in
            </span>
          </div>
        </div>

        {/* Phone mock */}
        <div className="relative mx-auto w-full max-w-[330px]">
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Good morning, Amer</span>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                AS
              </div>
            </div>
            <small className="mt-6 block text-xs text-muted-foreground">Total balance</small>
            <strong className="font-display text-3xl">€8,420.65</strong>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              {[
                { Icon: Send, label: "Send" },
                { Icon: Plus, label: "Add" },
                { Icon: WalletCards, label: "Pots" },
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
              <small className="text-[11px] text-muted-foreground">Everyday</small>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { t: "REWE City", d: "Today", a: "−€62.48", mint: false },
                { t: "Salary payment", d: "Yesterday", a: "+€3,420.00", mint: true },
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
              <b>1,840</b> Zoryn Points
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
            <CheckCircle2 size={15} className="text-primary" />
            <span>
              <b>Payment approved</b> €15.90
            </span>
          </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Built for modern life and growing businesses
          </p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 font-display text-sm text-foreground/80">
            {["Personal money", "Business banking", "Card payments", "Team expenses", "Rewards"].map(
              (s) => (
                <span key={s}>{s}</span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* About Zoryn */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>About Zoryn</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              A modern money platform built by LoungeTech.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Zoryn is the customer-facing money, payments and rewards platform of the LoungeTech
              ecosystem. We bring everyday banking, business finance, in-person card acceptance and
              loyalty into one product experience — designed in Germany, built for Europe, and
              delivered together with regulated banking and acquiring partners.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Germany first", v: "German IBANs, SEPA and local payment habits" },
                { k: "One platform", v: "Personal, business, merchant and rewards" },
                { k: "Partner powered", v: "Regulated banking and acquiring providers" },
              ].map((i) => (
                <div key={i.k} className="rounded-xl border border-border bg-card/60 p-5">
                  <b className="font-display text-sm">{i.k}</b>
                  <p className="mt-1 text-xs text-muted-foreground">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <b className="font-display text-lg">What Zoryn offers</b>
            <div className="mt-5 grid gap-4">
              {[
                {
                  Icon: WalletCards,
                  t: "Zoryn Personal",
                  d: "Everyday account, savings pots, SEPA transfers, cards and rewards.",
                },
                {
                  Icon: Building2,
                  t: "Zoryn Business",
                  d: "Business account, team cards and limits, supplier payments and payment links.",
                },
                {
                  Icon: Smartphone,
                  t: "ZorynPay",
                  d: "Tap to Pay, terminals, payment links and next-day settlements for merchants.",
                },
                {
                  Icon: Gift,
                  t: "Zoryn Rewards",
                  d: "Points, cashback and merchant offers across the LoungeTech network.",
                },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="flex gap-3">
                  <span className="mt-0.5 rounded-lg bg-primary/12 p-2 text-primary">
                    <Icon size={16} />
                  </span>
                  <span>
                    <b className="block font-display text-sm">{t}</b>
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
            Make every euro easier to manage.
          </h2>
          <p className="mt-4 text-muted-foreground">
            See your balance, move money into savings pots, send SEPA transfers, manage cards and
            earn rewards from one clear dashboard.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "German IBAN and instant account overview",
              "Flexible pots for bills, travel and goals",
              "Physical and virtual cards with controls",
              "Built-in rewards and cashback",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check size={17} className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <DemoButton className="mt-8">Open Personal demo</DemoButton>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <small className="text-xs text-muted-foreground">Available balance</small>
            <strong className="mt-1 block font-display text-3xl">€8,420.65</strong>
            <span className="mt-2 block text-xs tracking-widest text-muted-foreground">
              DE89 3704 0044 0532 0130 00
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { e: "☔", n: "Rainy Day", v: "€2,450" },
              { e: "✈️", n: "Travel", v: "€1,240" },
              { e: "💍", n: "Wedding", v: "€3,650" },
            ].map((p) => (
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
              Your finances, sales and team in one place.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Run everyday banking, employee cards, expenses, supplier payments and cash-flow
              reporting without jumping between tools.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: Building2,
                h: "Business account",
                p: "German IBAN, balances, transfers and statements built for day-to-day operations.",
              },
              {
                Icon: Users,
                h: "Team spending",
                p: "Issue staff cards, set limits and see every purchase as it happens.",
              },
              {
                Icon: BadgeEuro,
                h: "Cash-flow clarity",
                p: "Track incoming sales, pending settlements and outgoing payments from one view.",
              },
            ].map(({ Icon, h, p }) => (
              <article key={h} className="rounded-2xl border border-border bg-card p-6">
                <div className="w-fit rounded-xl bg-primary/12 p-3 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg">{h}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p}</p>
              </article>
            ))}
          </div>
          <DemoButton className="mt-10">Explore Business portal</DemoButton>
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
            Get paid wherever business happens.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Accept online, link, QR and contactless payments. Use Tap to Pay on a compatible phone
            or connect a payment terminal when your business needs one.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Tap to Pay and terminal-ready checkout",
              "Payment links and digital receipts",
              "Refunds, settlements and transaction reporting",
              "Loyalty applied automatically",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check size={17} className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <DemoButton className="mt-8">Try Tap to Pay demo</DemoButton>
        </div>
        <div className="order-1 flex flex-col items-center gap-3 rounded-[2rem] border border-border bg-gradient-to-br from-card to-secondary/50 px-6 py-14 text-center lg:order-2">
          <Smartphone size={54} className="text-primary" />
          <span className="text-sm text-muted-foreground">Tap card or phone</span>
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
              More value every time money moves.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Customers earn points across participating LoungeTech services and merchants, while
              businesses create offers that bring people back.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8">
            <Gift size={22} className="text-primary" />
            <span className="mt-4 block text-sm text-muted-foreground">Your points</span>
            <strong className="font-display text-4xl">1,840</strong>
            <small className="mt-2 block text-xs text-muted-foreground">
              Silver member · 160 points to Gold
            </small>
          </div>
        </div>
      </section>

      {/* Security & adapter boundaries */}
*** placeholder
      <section id="security" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr]">
          <div className="w-fit rounded-2xl bg-primary/12 p-5 text-primary">
            <ShieldCheck size={30} />
          </div>
          <div>
            <Eyebrow>Security and trust</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Designed around regulated partners and strong controls.
            </h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              Zoryn's customer experience is separated from the regulated banking and acquiring
              infrastructure. Identity checks, account services, card processing and payments
              connect through approved provider adapters, while Zoryn applies secure access, audit
              trails and clear customer controls.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: LockKeyhole, l: "Strong authentication" },
                { Icon: ShieldCheck, l: "Fraud and risk controls" },
                { Icon: Globe2, l: "European-ready architecture" },
                { Icon: Zap, l: "Real-time notifications" },
              ].map(({ Icon, l }) => (
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
                <b className="font-display text-sm">Banking adapter boundary</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accounts, IBANs, SEPA transfers and card issuing sit behind a single banking
                  adapter — swappable without touching the Zoryn data model.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <b className="font-display text-sm">Acquiring adapter boundary</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap to Pay, terminals, payment links and settlements route through one acquiring
                  adapter with webhook events and full audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-border/60 bg-gradient-to-br from-card to-secondary/40">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <Eyebrow>See the full platform</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Explore every Zoryn experience with realistic demo data.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Move money between pots, send transfers, manage cards, accept payments and explore
            business and operations dashboards.
          </p>
          <DemoButton className="mt-8">
            Launch interactive demo <ArrowRight size={17} />
          </DemoButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <a href="#top" className="font-display text-xl font-bold">
              Zoryn<span className="text-primary">.</span>
            </a>
            <p className="mt-2 text-sm text-muted-foreground">Money. Payments. Rewards.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <b className="text-foreground">Products</b>
            {navLinks.slice(0, 4).map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <b className="text-foreground">Company</b>
            <a href="#security" className="hover:text-foreground">
              Security
            </a>
            <Link to="/demo" className="hover:text-foreground">
              Platform &amp; partner demo
            </Link>
            <span>Operated by LoungeTech</span>
          </div>
        </div>
        <small className="mt-10 block text-xs text-muted-foreground">
          © 2026 Zoryn. Demo product experience. Financial services will be provided by authorised
          partners.
        </small>
      </footer>
    </div>
  );
}
