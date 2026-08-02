import { providerFetch } from "./httpClient";

export type AdyenClientConfig = {
  baseUrl: string;
  apiKey: string;
  merchantAccount: string;
};

export class AdyenClient {
  constructor(private readonly config: AdyenClientConfig) {}

  private headers(idempotencyKey?: string) {
    return {
      "X-API-Key": this.config.apiKey,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    };
  }

  async executeMappedOperation(input: {
    endpoint: string;
    method?: string;
    payload?: Record<string, unknown>;
    idempotencyKey?: string;
  }) {
    const payload = {
      merchantAccount: this.config.merchantAccount,
      ...(input.payload ?? {}),
    };

    return providerFetch<Record<string, unknown>>({
      url: `${this.config.baseUrl}${input.endpoint}`,
      method: input.method ?? "POST",
      headers: this.headers(input.idempotencyKey),
      body: payload,
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
