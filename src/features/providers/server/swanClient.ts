import { providerFetch } from "./httpClient";

export type SwanClientConfig = {
  baseUrl: string;
  accessToken: string;
  programmeId: string;
};

export class SwanClient {
  constructor(private readonly config: SwanClientConfig) {}

  private headers(idempotencyKey?: string) {
    return {
      Authorization: `Bearer ${this.config.accessToken}`,
      "X-Programme-Id": this.config.programmeId,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    };
  }

  async executeMappedOperation(input: {
    endpoint: string;
    method?: string;
    payload?: unknown;
    idempotencyKey?: string;
  }) {
    return providerFetch<Record<string, unknown>>({
      url: `${this.config.baseUrl}${input.endpoint}`,
      method: input.method ?? "POST",
      headers: this.headers(input.idempotencyKey),
      body: input.payload,
    });
  }

  async health() {
    return providerFetch<Record<string, unknown>>({
      url: `${this.config.baseUrl}/health`,
      headers: this.headers(),
      timeoutMs: 10_000,
    });
  }
}
