import { describe, expect, it, vi, beforeEach } from "vitest";
import { deliver, notificationMode } from "./notification-worker.server";

describe("notification outbox worker", () => {
  beforeEach(() => {
    delete process.env["NOTIFICATION_MODE"];
  });

  it("is mock by default and never throws", async () => {
    expect(notificationMode()).toBe("mock");
    await expect(deliver({ id: "n1", channel: "email", template_key: "welcome", attempt_count: 0 })).resolves.toBeUndefined();
  });

  it("delivers in_app notifications in live mode without an external provider", async () => {
    process.env["NOTIFICATION_MODE"] = "live";
    await expect(deliver({ id: "n2", channel: "in_app", template_key: "transfer_booked", attempt_count: 0 })).resolves.toBeUndefined();
  });

  it("surfaces unconfigured channels in live mode so they retry", async () => {
    process.env["NOTIFICATION_MODE"] = "live";
    await expect(deliver({ id: "n3", channel: "sms", template_key: "otp", attempt_count: 0 })).rejects.toThrow(
      "provider_not_configured_sms",
    );
  });
});
