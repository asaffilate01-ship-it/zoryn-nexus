import type { SupabaseClient } from "@supabase/supabase-js";
import { validateProviderOperation } from "../operationRegistry";
import { providerFetch } from "./httpClient";
import { getProviderOperationMapping } from "./operationMappingRepository";
import { getSwanAccessToken } from "./swanTokenProvider";

export type ActivatedCommand = {
  provider: "swan" | "adyen" | "rewards";
  command_type: string;
  payload: unknown;
  idempotency_key: string;
};

function normalizeProviderResponse(command: ActivatedCommand, body: Record<string, unknown>) {
  return {
    externalId: (body["id"] ?? body["pspReference"] ?? body["externalId"]) as string | undefined,
    externalStatus: (body["status"] ?? body["resultCode"] ?? "submitted") as string,
    resourceType: command.command_type,
    payload: body,
  };
}

/**
 * Stage 11 — activated dispatcher. Validates the operation, resolves its
 * versioned mapping for the active environment and calls the provider with the
 * command's idempotency key. Mock mode never leaves the platform.
 */
export async function dispatchActivatedProviderCommand(
  admin: SupabaseClient,
  command: ActivatedCommand,
) {
  const environment = (process.env["PROVIDER_MODE"] ?? "mock") as "mock" | "sandbox" | "live";

  const payload = validateProviderOperation(
    command.provider,
    command.command_type,
    command.payload,
  );

  const mapping = await getProviderOperationMapping(admin, {
    provider: command.provider,
    operation: command.command_type,
    environment,
  });

  if (environment === "mock") {
    return {
      externalId: `${command.provider}_${command.command_type}_${crypto.randomUUID()}`,
      externalStatus: "succeeded",
      resourceType: command.command_type,
      payload: { fixture: true, endpoint: mapping.endpoint_template },
    };
  }

  if (command.provider === "swan") {
    const token = await getSwanAccessToken(admin);
    const body = await providerFetch<Record<string, unknown>>({
      url: `${process.env["SWAN_API_URL"]}${mapping.endpoint_template}`,
      method: mapping.http_method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": command.idempotency_key,
      },
      body: payload,
    });
    return normalizeProviderResponse(command, body);
  }

  if (command.provider === "adyen") {
    const body = await providerFetch<Record<string, unknown>>({
      url: `${process.env["ADYEN_API_URL"]}${mapping.endpoint_template}`,
      method: mapping.http_method,
      headers: {
        "X-API-Key": process.env["ADYEN_API_KEY"] ?? "",
        "Idempotency-Key": command.idempotency_key,
      },
      body: {
        merchantAccount: process.env["ADYEN_MERCHANT_ACCOUNT"],
        ...(payload as Record<string, unknown>),
      },
    });
    return normalizeProviderResponse(command, body);
  }

  const body = await providerFetch<Record<string, unknown>>({
    url: `${process.env["REWARDS_API_URL"]}${mapping.endpoint_template}`,
    method: mapping.http_method,
    headers: {
      Authorization: `Bearer ${process.env["REWARDS_SERVICE_TOKEN"] ?? ""}`,
      "Idempotency-Key": command.idempotency_key,
    },
    body: payload,
  });
  return normalizeProviderResponse(command, body);
}