/**
 * Stage 3 — Swan sandbox adapter.
 *
 * Validates each provider-neutral command against an explicit Swan schema,
 * calls the mapped sandbox endpoint with the command's idempotency key and
 * normalizes the response back into the runtime's resource-mapping shape.
 * Endpoints and payload fields are aligned once Swan supplies the programme
 * documentation for the Zoryn account.
 */
import type { ProviderCommand } from "@/features/provider-integration/lib/command-worker.server";
import { SwanCommandSchemas, SwanEndpoints, isRetryableStatus, mapSwanStatus } from "./commands";
import type { SwanCommandName } from "./commands";

export class ProviderCommandError extends Error {
  retryable: boolean;
  providerBody: unknown;
  constructor(message: string, retryable: boolean, providerBody: unknown) {
    super(message);
    this.name = "ProviderCommandError";
    this.retryable = retryable;
    this.providerBody = providerBody;
  }
}

export async function executeSwanCommand(command: ProviderCommand) {
  const commandName = command.command_type as SwanCommandName;
  const schema = SwanCommandSchemas[commandName];
  if (!schema) throw new Error(`unsupported_swan_command:${command.command_type}`);

  const payload = schema.parse(command.payload);
  const token = process.env["SWAN_ACCESS_TOKEN"];
  const baseUrl = process.env["SWAN_API_URL"];
  if (!token || !baseUrl) throw new Error("swan_not_configured");

  const response = await fetch(`${baseUrl}${SwanEndpoints[commandName]}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": command.idempotency_key,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new ProviderCommandError(
      `swan_http_${response.status}`,
      isRetryableStatus(response.status),
      body,
    );
  }

  return {
    externalId: (body["id"] ?? body["externalId"]) as string | undefined,
    externalStatus: mapSwanStatus(body["status"] as string | undefined) || "submitted",
    resourceType: command.command_type,
    payload: body,
  };
}