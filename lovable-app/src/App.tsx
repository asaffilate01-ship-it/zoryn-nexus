import { useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
  Gift,
  ReceiptText,
  Send,
  Store,
} from "lucide-react";
type Role = "personal" | "business" | "merchant" | "admin";
type Page =
  "overview" | "accounts" | "cards" | "payments" | "rewards" | "team" | "compliance" | "support";
const money = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
const configs = {
  personal: {
    name: "Personal",
    user: "Amer Saleem",
    balance: 8420.65,
    stats: [
      ["Available balance", 8420.65],
      ["Zoryn Points", 1840],
      ["Spent this month", 1284.2],
      ["Card status", "Active"],
    ],
  },
  business: {
    name: "Business",
    user: "LoungeTech Demo GmbH",
    balance: 48620.4,
    stats: [
      ["Business balance", 48620.4],
      ["Today’s sales", 4230.8],
      ["Pending settlement", 3180.4],
      ["Active cards", 8],
    ],
  },
  merchant: {
    name: "ZorynPay",
    user: "Cafe 1 Demo",
    balance: 3180.4,
    stats: [
      ["Today’s sales", 4230.8],
      ["Transactions", 47],
      ["Average ticket", 28.4],
      ["Refunds", 2],
    ],
  },
  admin: {
    name: "Admin",
    user: "Operations Team",
    balance: 0,
    stats: [
      ["Customers", 12480],
      ["Businesses", 1380],
      ["KYC/KYB review", 28],
      ["Monthly volume", 4280000],
    ],
  },
};
const nav: Record<Role, { p: Page; l: string; i: any }[]> = {
  personal: [
    { p: "overview", l: "Overview", i: LayoutDashboard },
    { p: "accounts", l: "Accounts", i: WalletCards },
    { p: "cards", l: "Cards", i: CreditCard },
    { p: "payments", l: "Transfers", i: Send },
    { p: "rewards", l: "Rewards", i: Gift },
    { p: "support", l: "Support", i: ShieldCheck },
  ],
  business: [
    { p: "overview", l: "Overview", i: LayoutDashboard },
    { p: "accounts", l: "Account", i: WalletCards },
    { p: "payments", l: "Payments", i: ReceiptText },
    { p: "team", l: "Team & cards", i: Users },
    { p: "rewards", l: "Rewards", i: Gift },
    { p: "support", l: "Support", i: ShieldCheck },
  ],
  merchant: [
    { p: "overview", l: "Overview", i: LayoutDashboard },
    { p: "payments", l: "Take payment", i: Smartphone },
    { p: "accounts", l: "Settlements", i: WalletCards },
    { p: "cards", l: "Terminals", i: CreditCard },
    { p: "rewards", l: "Loyalty", i: Gift },
    { p: "support", l: "Support", i: ShieldCheck },
  ],
  admin: [
    { p: "overview", l: "Overview", i: LayoutDashboard },
    { p: "team", l: "Customers", i: Users },
    { p: "compliance", l: "Compliance", i: ShieldCheck },
    { p: "payments", l: "Payments", i: ReceiptText },
    { p: "accounts", l: "Providers", i: Building2 },
    { p: "support", l: "Support", i: Store },
  ],
};
const tx = [
  ["Cafe 1 St Albans", "Hospitality", "-€18.40"],
  ["Salary payment", "Income", "+€3,420.00"],
  ["ZorynPay settlement", "Settlement", "+€1,284.60"],
  ["DB Bahn", "Travel", "-€42.90"],
];
function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("overview");
  const [notice, setNotice] = useState("");
  const c = role ? configs[role] : null;
  const items = useMemo(() => (role ? nav[role] : []), [role]);
  if (!role)
    return (
      <div className="login">
        <div className="loginCard">
          <span className="eyebrow">A LoungeTech platform</span>
          <h1>
            Zoryn<span>.</span>
          </h1>
          <p>Money, payments and rewards in one connected financial experience.</p>
          <div className="roleGrid">
            {(Object.keys(configs) as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}>
                {configs[r].name} demo
              </button>
            ))}
          </div>
          <small>Provider-independent demo prepared for Swan banking and Adyen acquiring.</small>
        </div>
      </div>
    );
  const act = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(""), 2500);
  };
  return (
    <div className="app">
      <aside>
        <div>
          <div className="brand">
            Zoryn<span>.</span>
          </div>
          <div className="muted">Money. Payments. Rewards.</div>
        </div>
        <nav>
          {items.map(({ p, l, i: I }) => (
            <button className={page === p ? "active" : ""} onClick={() => setPage(p)} key={l}>
              <I size={19} />
              {l}
            </button>
          ))}
        </nav>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role);
            setPage("overview");
          }}
        >
          {(Object.keys(configs) as Role[]).map((r) => (
            <option key={r} value={r}>
              {configs[r].name}
            </option>
          ))}
        </select>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">{c?.name} portal</span>
            <h2>{items.find((i) => i.p === page)?.l}</h2>
          </div>
          <div className="user">
            <b>{c?.user}</b>
            <button onClick={() => setRole(null)}>
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {notice && <div className="notice">{notice}</div>}
        {page === "overview" ? (
          <>
            <section className="stats">
              {c?.stats.map(([k, v]) => (
                <div className="card" key={String(k)}>
                  <span>{k}</span>
                  <strong>
                    {typeof v === "number"
                      ? String(k).toLowerCase().includes("balance") ||
                        String(k).toLowerCase().includes("sales") ||
                        String(k).toLowerCase().includes("settlement") ||
                        String(k).toLowerCase().includes("volume") ||
                        String(k).toLowerCase().includes("spent") ||
                        String(k).toLowerCase().includes("ticket")
                        ? money(v)
                        : v.toLocaleString()
                      : v}
                  </strong>
                  <small>Live demo data</small>
                </div>
              ))}
            </section>
            <section className="split">
              <div className="card hero">
                <span className="eyebrow">Primary account</span>
                <h3>{role === "admin" ? "Provider operations" : money(c?.balance || 0)}</h3>
                <p>
                  {role === "personal"
                    ? "DE89 3704 0044 0532 0130 00"
                    : role === "business"
                      ? "DE71 1001 1001 9876 5432 10"
                      : role === "merchant"
                        ? "Next settlement Monday"
                        : "Swan and Adyen adapters operational"}
                </p>
                <div className="actions">
                  <button
                    onClick={() =>
                      act(role === "merchant" ? "Tap to Pay session started" : "Action created")
                    }
                  >
                    {role === "merchant"
                      ? "Take payment"
                      : role === "admin"
                        ? "Review queue"
                        : "Send money"}
                  </button>
                  <button className="ghost" onClick={() => act("Details copied")}>
                    View details
                  </button>
                </div>
              </div>
              <div className="card">
                <h3>Provider readiness</h3>
                <div className="row">
                  <span>Swan banking adapter</span>
                  <em>Ready</em>
                </div>
                <div className="row">
                  <span>Adyen acquiring adapter</span>
                  <em>Ready</em>
                </div>
                <div className="row">
                  <span>Supabase security</span>
                  <em>Configured</em>
                </div>
              </div>
            </section>
            <section className="card tableCard">
              <h3>Recent activity</h3>
              <table>
                <tbody>
                  {tx.map((t) => (
                    <tr key={t[0]}>
                      <td>
                        <b>{t[0]}</b>
                        <small>{t[1]}</small>
                      </td>
                      <td>{t[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <Module page={page} role={role} act={act} />
        )}
      </main>
    </div>
  );
}
function Module({ page, role, act }: { page: Page; role: Role; act: (s: string) => void }) {
  const titles: any = {
    accounts: "Accounts & settlements",
    cards: "Cards & terminals",
    payments: "Payments & transfers",
    rewards: "Zoryn Rewards",
    team: "Team & customers",
    compliance: "Compliance operations",
    support: "Support centre",
  };
  return (
    <section className="card module">
      <span className="eyebrow">{role} workspace</span>
      <h2>{titles[page]}</h2>
      <p>
        This module is connected to the shared Zoryn data model and ready for final Swan or Adyen
        sandbox mapping.
      </p>
      <div className="moduleGrid">
        <div>
          <b>Status</b>
          <strong>Ready</strong>
        </div>
        <div>
          <b>Open items</b>
          <strong>{role === "admin" ? 28 : 3}</strong>
        </div>
        <div>
          <b>Last sync</b>
          <strong>Just now</strong>
        </div>
      </div>
      <button onClick={() => act("Demo workflow completed")}>Run demo action</button>
    </section>
  );
}
export default App;
