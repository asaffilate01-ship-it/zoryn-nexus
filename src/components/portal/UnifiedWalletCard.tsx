import { Badge, Field, Panel, inputClass } from "./ui";
import { money, useDemo } from "@/lib/zoryn-store";

/**
 * Unified Zoryn Rewards wallet: universal points balance, pending points, tier
 * and the destination every future cashback payout is routed to.
 */
export function UnifiedWalletCard({ role }: { role: "personal" | "business" }) {
  const { state, setCashbackDestination } = useDemo();
  const data = state[role];
  const pots = role === "personal" ? state.personal.pots : [];
  const value = data.points / 100;

  return (
    <Panel
      title="Zoryn Rewards wallet"
      subtitle="One universal points balance across Zoryn Personal, Business and ZorynPay"
      className="bg-gradient-to-br from-primary/12 via-card/70 to-card/70"
      action={<Badge tone="good">{data.tier} tier</Badge>}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Universal points
          </span>
          <strong className="mt-2 block font-display text-4xl">
            {data.points.toLocaleString("de-DE")}
          </strong>
          <p className="mt-2 text-sm text-muted-foreground">
            {money(value)} value · {data.pendingPoints.toLocaleString("de-DE")} pending ·{" "}
            {money(data.rewardsWallet)} in rewards wallet
          </p>
        </div>

        <Field label="Send cashback to">
          <select
            className={inputClass}
            value={data.cashbackDestination}
            onChange={(e) => setCashbackDestination(role, e.target.value)}
          >
            <option value="wallet">Rewards wallet</option>
            <option value="main">{role === "business" ? "Business balance" : "Main balance"}</option>
            {pots.map((p) => (
              <option key={p.id} value={`pot:${p.id}`}>
                {p.name} pot
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Panel>
  );
}