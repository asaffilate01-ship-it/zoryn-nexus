import { describe, expect, it, vi } from "vitest";
import {
  handleProviderEvent,
  listRegisteredProviderEvents,
  registerProviderEventHandler,
} from "@/features/providers/eventHandlerRegistry";
import { applyNormalizedProviderEvent } from "@/features/providers/domainHandlers";
import { dispatchActivatedProviderCommand } from "@/features/providers/server/activatedProviderDispatcher";
import { getSwanAccessToken } from "@/features/providers/server/swanTokenProvider";

type UpdateCall = { table: string; values: Record<string, unknown>; externalId: string };

function fakeAdmin(mapping?: Record<string, unknown> | null) {
  const updates: UpdateCall[] = [];
  const admin = {
    updates,
    from(table: string) {
      const builder: Record<string, unknown> = {
        update(values: Record<string, unknown>) {
          return {
            eq(_column: string, externalId: string) {
              updates.push({ table, values, externalId });
              return Promise.resolve({ error: null });
            },
          };
        },
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        maybeSingle() {
          return Promise.resolve({ data: mapping ?? null, error: null });
        },
      };
      return builder;
    },
  };
  return admin as unknown as Parameters<typeof applyNormalizedProviderEvent>[0] & {
    updates: UpdateCall[];
  };
}

const mockMapping = {
  provider: "swan",
  operation: "create_transfer",
  environment: "mock",
  http_method: "POST",
  endpoint_template: "/mock/swan/transfers",
  enabled: true,
  approved_by_provider: false,
};

describe("event handler registry", () => {
  it("dispatches registered handlers and lists them", async () => {
    const handler = vi.fn(async () => {});
    registerProviderEventHandler("swan", "test.event", handler);

    await handleProviderEvent({
      provider: "swan",
      eventId: "evt_1",
      eventType: "test.event",
      payload: {},
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(listRegisteredProviderEvents()).toContain("swan:test.event");
  });

  it("rejects unmapped events", async () => {
    await expect(
      handleProviderEvent({
        provider: "adyen",
        eventId: "evt_2",
        eventType: "unknown.event",
        payload: {},
      }),
    ).rejects.toThrow("unmapped_event");
  });
});

describe("provider domain handlers", () => {
  it("applies a Swan transfer event to the transfer record", async () => {
    const admin = fakeAdmin();
    await applyNormalizedProviderEvent(admin, {
      provider: "swan",
      eventId: "evt_3",
      eventType: "transfer.booked",
      externalId: "tr_1",
      status: "booked",
      payload: {},
    });

    expect(admin.updates[0]).toMatchObject({
      table: "platform_transfers",
      externalId: "tr_1",
      values: { status: "booked" },
    });
  });

  it("applies Swan onboarding and card events", async () => {
    const admin = fakeAdmin();
    await applyNormalizedProviderEvent(admin, {
      provider: "swan",
      eventId: "evt_4",
      eventType: "onboarding.updated",
      externalId: "ob_1",
      payload: { requiredActions: ["proof_of_address"] },
    });
    await applyNormalizedProviderEvent(admin, {
      provider: "swan",
      eventId: "evt_5",
      eventType: "card.activated",
      externalId: "card_1",
      status: "active",
      payload: {},
    });

    expect(admin.updates[0]!.table).toBe("platform_onboarding_cases");
    expect(admin.updates[1]!.table).toBe("platform_cards");
  });

  it("applies Adyen payment and settlement events", async () => {
    const admin = fakeAdmin();
    await applyNormalizedProviderEvent(admin, {
      provider: "adyen",
      eventId: "evt_6",
      eventType: "payment.captured",
      externalId: "pay_1",
      status: "captured",
      payload: {},
    });
    await applyNormalizedProviderEvent(admin, {
      provider: "adyen",
      eventId: "evt_7",
      eventType: "settlement.paid",
      externalId: "set_1",
      status: "paid",
      payload: { paidAt: "2026-01-01T00:00:00.000Z" },
    });

    expect(admin.updates[0]!.table).toBe("platform_payments");
    expect(admin.updates[1]!.values).toMatchObject({ paid_at: "2026-01-01T00:00:00.000Z" });
  });

  it("fails loudly when no domain handler exists", async () => {
    await expect(
      applyNormalizedProviderEvent(fakeAdmin(), {
        provider: "rewards",
        eventId: "evt_8",
        eventType: "points.awarded",
        payload: {},
      }),
    ).rejects.toThrow("domain_handler_missing");
  });
});

describe("activated provider dispatcher", () => {
  it("returns a fixture result in mock mode", async () => {
    const result = await dispatchActivatedProviderCommand(fakeAdmin(mockMapping), {
      provider: "swan",
      command_type: "create_transfer",
      payload: {
        transferId: "5b99a72e-6bf8-4ce9-a063-cc25d8f8b003",
        accountExternalId: "account_demo",
        beneficiaryIban: "DE89370400440532013000",
        amountMinor: 1000,
        currency: "EUR",
      },
      idempotency_key: "transfer:1:v1",
    });

    expect(result.externalStatus).toBe("succeeded");
    expect(result.payload).toMatchObject({ fixture: true });
  });

  it("refuses to dispatch when no mapping exists", async () => {
    await expect(
      dispatchActivatedProviderCommand(fakeAdmin(null), {
        provider: "swan",
        command_type: "issue_card",
        payload: {
          cardId: "5b99a72e-6bf8-4ce9-a063-cc25d8f8b004",
          accountExternalId: "account_demo",
          cardType: "virtual",
          cardholderName: "Demo User",
        },
        idempotency_key: "card:1:v1",
      }),
    ).rejects.toThrow("provider_mapping_missing");
  });

  it("rejects an unsupported operation before any provider call", async () => {
    await expect(
      dispatchActivatedProviderCommand(fakeAdmin(mockMapping), {
        provider: "swan",
        command_type: "not_a_real_operation",
        payload: {},
        idempotency_key: "x:1:v1",
      }),
    ).rejects.toThrow("unsupported_operation");
  });
});

describe("swan token provider", () => {
  it("prefers a directly configured access token", async () => {
    process.env["SWAN_ACCESS_TOKEN"] = "direct-token";
    await expect(getSwanAccessToken(fakeAdmin())).resolves.toBe("direct-token");
    delete process.env["SWAN_ACCESS_TOKEN"];
  });

  it("fails when no auth configuration is present", async () => {
    await expect(getSwanAccessToken(fakeAdmin())).rejects.toThrow("swan_auth_not_configured");
  });
});
