/**
 * Stage 5 — Adyen test adapter.
 *
 * Validates provider-neutral commands against Adyen schemas, calls the mapped
 * test endpoint with the command's idempotency key and normalizes the response
 * into the runtime's resource-mapping shape. Endpoints are aligned to the Adyen
 * products approved for Zoryn (Platforms, Checkout, Tap to Pay).
 */
import type { ProviderCommand } from "@/features/provider-integration/lib/command-worker.server";
import { isRetryableStatus } from "@/features/swan/commands";
import { ProviderCommandError } from "@/features/swan/swanAdapter.server";
import { AdyenCommandSchemas, AdyenEndpoints, mapAdyenStatus } from "./commands";
import type { AdyenCommandName } from "./commands";

export async function executeAdyenCommand(command: ProviderCommand) {
  const commandName = command.command_type as AdyenCommandName;
  const schema = AdyenCommandSchemas[commandName];
  if (!schema) throw new Error(`unsupported_adyen_command:${command.command_type}`);

  const payload = schema.parse(command.payload);
  const apiKey = process.env["ADYEN_API_KEY"];
  const baseUrl = process.env["ADYEN_API_URL"];
  if (!apiKey || !baseUrl) throw new Error("adyen_not_configured");

  const response = await fetch(`${baseUrl}${AdyenEndpoints[commandName]}`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "Idempotency-Key": command.idempotency_key,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new ProviderCommandError(
      `adyen_http_${response.status}`,
      isRetryableStatus(response.status),
      body,
    );
  }

  return {
    externalId: (body["id"] ?? body["pspReference"] ?? body["externalId"]) as string | undefined,
    externalStatus: mapAdyenStatus(
      (body["status"] ?? body["resultCode"]) as string | undefined,
    ),
    resourceType: command.command_type,
    payload: body,
  };
}