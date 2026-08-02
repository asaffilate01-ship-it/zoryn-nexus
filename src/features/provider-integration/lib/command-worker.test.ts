import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  dispatchCommand,
  persistCommandResult,
  workerMode,
  type ProviderCommand,
} from "./command-worker.server";

const command: ProviderCommand = {
  id: "c1",
  provider: "swan",
  command_type: "create_account",
  aggregate_type: "account",
  aggregate_id: "a1",
  payload: { amount: 100 },
  idempotency_key: "idem-1",
  attempt_count: 0,
};

describe("provider command worker", () => {
  beforeEach(() => {
    delete process.env["PROVIDER_MODE"];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to mock mode and returns a synthetic external id", async () => {
    expect(workerMode()).toBe("mock");
    const result = await dispatchCommand(command);
    expect(result.externalId).toContain("swan_create_account");
    expect(result.externalStatus).toBe("succeeded");
  });

  it("sends the idempotency key on live dispatch", async () => {
    process.env["PROVIDER_MODE"] = "live";
    process.env["SWAN_API_URL"] = "https://swan.test";
    process.env["SWAN_ACCESS_TOKEN"] = "token";
    const fetchMock = vi.fn(
      async (_input: unknown, _init?: RequestInit) =>
        new Response(JSON.stringify({ externalId: "swan_1" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await dispatchCommand(command);
    expect(result.externalId).toBe("swan_1");
    const headers = fetchMock.mock.calls[0]![1]!.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("idem-1");
  });

  it("fails loudly when live credentials are missing", async () => {
    process.env["PROVIDER_MODE"] = "live";
    delete process.env["ADYEN_API_URL"];
    await expect(dispatchCommand({ ...command, provider: "adyen" })).rejects.toThrow(
      "missing_env_adyen_api_url",
    );
  });

  it("maps the external id onto a provider resource", async () => {
    const upsert = vi.fn(async (_row: Record<string, unknown>, _options?: unknown) => ({
      error: null,
    }));
    const admin = { from: () => ({ upsert }) } as never;
    await persistCommandResult(admin, command, { externalId: "swan_9", externalStatus: "active" });
    expect(upsert.mock.calls[0]![0]).toMatchObject({
      provider: "swan",
      aggregate_id: "a1",
      external_id: "swan_9",
      external_status: "active",
    });
  });

  it("skips resource mapping when the provider returned no id", async () => {
    const upsert = vi.fn((_row: Record<string, unknown>) => ({ error: null }));
    await persistCommandResult({ from: () => ({ upsert }) } as never, command, {});
    expect(upsert).not.toHaveBeenCalled();
  });
});
