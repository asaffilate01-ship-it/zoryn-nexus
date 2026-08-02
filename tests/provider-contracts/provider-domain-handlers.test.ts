import { describe, expect, it, vi } from "vitest";
import {
  applyProviderDomainEvent,
  domainTarget,
} from "@/features/providers/server/providerDomainHandlers";
import { requiredProviderOperations } from "@/features/providers/catalogue";
import type { NormalizedProviderEvent } from "@/features/providers/eventHandlerRegistry";

function event(partial: Partial<NormalizedProviderEvent>): NormalizedProviderEvent {
  return {
    provider: "swan",
    eventId: "evt_1",
    eventType: "account.updated",
    externalId: "ext_1",
    payload: {},
    ...partial,
  } as NormalizedProviderEvent;
}

describe("provider catalogue", () => {
  it("declares the full required Swan and Adyen operation sets", () => {
    expect(requiredProviderOperations.swan).toContain("create_transfer");
    expect(requiredProviderOperations.adyen).toContain("refund_payment");
  });
});

describe("domainTarget", () => {
  const cases: Array<[NormalizedProviderEvent["provider"], string, string | null]> = [
    ["swan", "onboarding.updated", "platform_onboarding_cases"],
    ["swan", "account.updated", "platform_accounts"],
    ["swan", "transaction.booked", "platform_transactions"],
    ["swan", "transfer.settled", "platform_transfers"],
    ["swan", "card.issued", "platform_cards"],
    ["swan", "unknown.thing", null],
    ["adyen", "merchant.updated", "platform_merchants"],
    ["adyen", "store.updated", "platform_stores"],
    ["adyen", "payment.captured", "platform_payments"],
    ["adyen", "refund.completed", "platform_refunds"],
    ["adyen", "chargeback.opened", "platform_chargebacks"],
    ["adyen", "settlement.paid", "platform_settlements"],
    ["adyen", "terminal.assigned", "platform_terminals"],
    ["adyen", "unknown.thing", null],
    ["rewards", "points.awarded", null],
  ];

  it.each(cases)("maps %s %s", (provider, eventType, expected) => {
    expect(domainTarget(provider, eventType)).toBe(expected);
  });
});

describe("applyProviderDomainEvent", () => {
  it("rejects events without an external id", async () => {
    await expect(
      applyProviderDomainEvent({} as never, event({ externalId: undefined })),
    ).rejects.toThrow("external_id_missing");
  });

  it("rejects unhandled event types", async () => {
    await expect(
      applyProviderDomainEvent({} as never, event({ eventType: "nope.nope" })),
    ).rejects.toThrow("unhandled_event:swan:nope.nope");
  });

  it("upserts transactions on the provider external id", async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    const admin = { from: vi.fn(() => ({ upsert })) } as never;

    await applyProviderDomainEvent(
      admin,
      event({
        eventType: "transaction.booked",
        status: "booked",
        payload: { direction: "debit", amountMinor: 1200, merchantName: "Rewe" },
      }),
    );

    expect(upsert.mock.calls[0]![0]).toMatchObject({
      provider_external_id: "ext_1",
      status: "booked",
      currency: "EUR",
      transaction_type: "card",
      amount_minor: 1200,
    });
    expect(upsert.mock.calls[0]![1]).toEqual({ onConflict: "provider_external_id" });
  });

  it("propagates transaction upsert failures", async () => {
    const admin = {
      from: () => ({ upsert: async () => ({ error: new Error("db_down") }) }),
    } as never;
    await expect(
      applyProviderDomainEvent(admin, event({ eventType: "transaction.booked" })),
    ).rejects.toThrow("db_down");
  });

  it("updates account balances and drops undefined values", async () => {
    const eq = vi.fn(async () => ({ error: null }));
    const update = vi.fn(() => ({ eq }));
    const admin = { from: vi.fn(() => ({ update })) } as never;

    await applyProviderDomainEvent(
      admin,
      event({
        eventType: "account.updated",
        status: "active",
        payload: { iban: "DE89370400440532013000", availableBalanceMinor: 5000 },
      }),
    );

    expect(update.mock.calls[0]![0]).toEqual({
      status: "active",
      iban: "DE89370400440532013000",
      available_balance_minor: 5000,
    });
    expect(eq).toHaveBeenCalledWith("provider_external_id", "ext_1");
  });

  it("stamps required actions and sync time on onboarding cases", async () => {
    const eq = vi.fn(async () => ({ error: null }));
    const update = vi.fn(() => ({ eq }));
    const admin = { from: () => ({ update }) } as never;

    await applyProviderDomainEvent(
      admin,
      event({ eventType: "onboarding.updated", payload: { status: "action_required" } }),
    );

    const row = update.mock.calls[0]![0] as Record<string, unknown>;
    expect(row["status"]).toBe("action_required");
    expect(row["required_actions"]).toEqual([]);
    expect(typeof row["last_synced_at"]).toBe("string");
  });

  it("records settlement payout timestamps", async () => {
    const eq = vi.fn(async () => ({ error: null }));
    const update = vi.fn(() => ({ eq }));
    const admin = { from: () => ({ update }) } as never;

    await applyProviderDomainEvent(
      admin,
      event({
        provider: "adyen",
        eventType: "settlement.paid",
        status: "paid",
        payload: { paidAt: "2026-08-02T00:00:00.000Z" },
      }),
    );

    expect(update.mock.calls[0]![0]).toMatchObject({
      status: "paid",
      paid_at: "2026-08-02T00:00:00.000Z",
    });
  });

  it("propagates update failures", async () => {
    const admin = {
      from: () => ({ update: () => ({ eq: async () => ({ error: new Error("rls_denied") }) }) }),
    } as never;
    await expect(applyProviderDomainEvent(admin, event({}))).rejects.toThrow("rls_denied");
  });
});
