import { describe, expect, it, vi } from "vitest";
import {
  correlationId,
  writeRuntimeLog,
} from "@/features/provider-integration/lib/runtime-log.server";

function fakeAdmin() {
  const inserted: any[] = [];
  const admin = {
    inserted,
    from: () => ({
      insert: async (row: any) => {
        inserted.push(row);
        return { error: null };
      },
    }),
  };
  return admin as any;
}

describe("provider runtime logging", () => {
  it("builds a stable correlation id per provider interaction", () => {
    expect(correlationId("swan", "cmd_1")).toBe("swan:cmd_1");
    expect(correlationId("adyen", "cmd_1")).not.toBe(correlationId("swan", "cmd_1"));
  });

  it("writes a runtime row with duration and error text", async () => {
    const admin = fakeAdmin();
    await writeRuntimeLog(admin, {
      provider: "adyen",
      direction: "command",
      entityId: "11111111-1111-1111-1111-111111111111",
      operation: "create_payment_link",
      status: "failed",
      correlationId: "adyen:cmd_1",
      durationMs: 42,
      errorMessage: "adyen_503",
    });

    expect(admin.inserted).toHaveLength(1);
    expect(admin.inserted[0]).toMatchObject({
      provider: "adyen",
      direction: "command",
      status: "failed",
      duration_ms: 42,
      error_message: "adyen_503",
    });
  });

  it("drops rows for providers the table does not accept instead of throwing", async () => {
    const admin = fakeAdmin();
    await writeRuntimeLog(admin, {
      provider: "unknown",
      direction: "event",
      entityId: "x",
      operation: "noop",
      status: "failed",
      correlationId: "unknown:x",
    });
    expect(admin.inserted).toHaveLength(0);
  });

  it("never lets a logging failure break the worker loop", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const admin = {
      from: () => ({ insert: async () => ({ error: { message: "boom" } }) }),
    } as any;
    await expect(
      writeRuntimeLog(admin, {
        provider: "swan",
        direction: "command",
        entityId: "1",
        operation: "op",
        status: "started",
        correlationId: "swan:1",
      }),
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe("provider runtime retry policy", () => {
  // Mirrors platform_complete_provider_command in the database.
  const backoffMinutes = (attempt: number) => Math.min(60, Math.max(1, attempt * attempt));

  it("increases retry delay quadratically", () => {
    expect(backoffMinutes(1)).toBe(1);
    expect(backoffMinutes(2)).toBe(4);
    expect(backoffMinutes(3)).toBe(9);
  });

  it("caps retry delay at sixty minutes", () => {
    expect(backoffMinutes(10)).toBe(60);
  });
});
