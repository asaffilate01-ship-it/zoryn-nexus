import type { SupabaseClient } from "@supabase/supabase-js";

export type ProviderOperationMapping = {
  provider: "swan" | "adyen" | "rewards";
  operation: string;
  environment: "mock" | "sandbox" | "live";
  api_family: string | null;
  api_version: string | null;
  http_method: string;
  endpoint_template: string;
  request_mapper_version: string;
  response_mapper_version: string;
  enabled: boolean;
  approved_by_provider: boolean;
  metadata: Record<string, unknown>;
};

/**
 * Stage 11 — database-driven provider endpoint mappings.
 * A non-mock mapping can only be used when it has been explicitly marked as
 * approved by the provider, so guessed endpoints can never be called.
 */
export async function getProviderOperationMapping(
  admin: SupabaseClient,
  input: {
    provider: ProviderOperationMapping["provider"];
    operation: string;
    environment: ProviderOperationMapping["environment"];
  },
): Promise<ProviderOperationMapping> {
  const { data, error } = await admin
    .from("platform_provider_operation_mappings")
    .select("*")
    .eq("provider", input.provider)
    .eq("operation", input.operation)
    .eq("environment", input.environment)
    .eq("enabled", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `provider_mapping_missing:${input.provider}:${input.operation}:${input.environment}`,
    );
  }

  const mapping = data as unknown as ProviderOperationMapping;

  if (input.environment !== "mock" && !mapping.approved_by_provider) {
    throw new Error(`provider_mapping_not_approved:${input.provider}:${input.operation}`);
  }

  return mapping;
}