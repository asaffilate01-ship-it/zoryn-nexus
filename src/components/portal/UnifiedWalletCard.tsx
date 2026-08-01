import { Badge, Field, Panel, inputClass } from "./ui";
import { money, useDemo } from "@/lib/zoryn-store";
import { useT } from "@/lib/i18n";

/**
 * Unified Zoryn Rewards wallet: universal points balance, pending points, tier
 * and the destination every future cashback payout is routed to.
 */
export function UnifiedWalletCard({ role }: { role: "personal" | "business" }) {
  const t = useT();
  const { state, setCashbackDestination } = useDemo();
  const data = state[role];
  const pots = role === "personal" ? state.personal.pots : [];
  const value = data.points / 100;

  return (
    <Panel
      title={t("Zoryn Rewards wallet")}
      subtitle={t("One universal points balance across Zoryn Personal, Business and ZorynPay")}
      className="bg-gradient-to-br from-primary/12 via-card/70 to-card/70"
      action={<Badge tone="good">{data.tier} {t("tier")}</Badge>}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {t("Universal points")}
          </span>
          <strong className="mt-2 block font-display text-4xl">
            {data.points.toLocaleString("de-DE")}
          </strong>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("{value} value · {pending} pending · {wallet} in rewards wallet", {
              value: money(value),
              pending: data.pendingPoints.toLocaleString("de-DE"),
              wallet: money(data.rewardsWallet),
            })}
          </p>
        </div>

        <Field label={t("Send cashback to")}>
          <select
            className={inputClass}
            value={data.cashbackDestination}
            onChange={(e) => setCashbackDestination(role, e.target.value)}
          >
            <option value="wallet">{t("Rewards wallet")}</option>
            <option value="main">{role === "business" ? t("Business balance") : t("Main balance")}</option>
            {pots.map((p) => (
              <option key={p.id} value={`pot:${p.id}`}>
                {t("{name} pot", { name: p.name })}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Panel>
  );
}
