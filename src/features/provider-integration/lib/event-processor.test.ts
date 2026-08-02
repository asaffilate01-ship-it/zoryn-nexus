import { describe, expect, it, vi } from "vitest";
import { applyEvent, normalizeOnboarding } from "./event-processor.server";

describe("provider event processor", () => {
  it("keeps known onboarding states and falls back to under_review", () => {
    expect(normalizeOnboarding("approved")).toBe("approved");
    expect(normalizeOnboarding("weird")).toBe("under_review");
  });

  it("updates the onboarding case for onboarding events", async () => {
    const eq = vi.fn(async () => ({ error: null }));
    const update = vi.fn((_row: Record<string, unknown>) => ({ eq }));
    const admin = { from: () => ({ update }) } as never;

    const outcome = await applyEvent(admin, {
      id: "e1",
      provider: "swan",
      event_id: "evt_test",
      event_type: "onboarding.updated",
      payload: {
        externalId: "swan_ob_1",
        status: "action_required",
        requiredActions: ["proof_of_address"],
      },
      attempt_count: 0,
    });

    // Stage 9 routes this through the explicit swan:onboarding.updated handler.
    expect(outcome).toBe("handler_applied");
    expect(update.mock.calls[0]![0]).toMatchObject({ status: "action_required" });
    expect(eq).toHaveBeenCalledWith("external_id", "swan_ob_1");
  });

  it("maps resource events onto provider resources", async () => {
    const upsert = vi.fn(async (_row: Record<string, unknown>, _options?: unknown) => ({
      error: null,
    }));
    const admin = { from: () => ({ upsert }) } as never;

    const outcome = await applyEvent(admin, {
      id: "e2",
      provider: "adyen",
      event_id: "evt_test",
      event_type: "card.issued",
      payload: {
        aggregateId: "p1",
        aggregateType: "payment",
        externalId: "psp_1",
        status: "captured",
      },
      attempt_count: 0,
    });

    expect(outcome).toBe("resource_mapped");
    expect(upsert.mock.calls[0]![0]).toMatchObject({ provider: "adyen", external_id: "psp_1" });
  });

  it("throws on an unmapped event so it retries rather than being swallowed", async () => {
    await expect(
      applyEvent({ from: () => ({}) } as never, {
        id: "e3",
        provider: "swan",
        event_id: "evt_test",
        event_type: "something.unknown",
        payload: {},
        attempt_count: 0,
      }),
    ).rejects.toThrow("unmapped_event");
  });
});
