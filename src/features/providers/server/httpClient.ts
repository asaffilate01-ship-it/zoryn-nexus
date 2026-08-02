export type ProviderHttpError = Error & {
  status?: number;
  retryable?: boolean;
  responseBody?: unknown;
};

export async function providerFetch<T>(input: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 20_000);

  try {
    const response = await fetch(input.url, {
      method: input.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(input.body ? { "Content-Type": "application/json" } : {}),
        ...input.headers,
      },
      ...(input.body ? { body: JSON.stringify(input.body) } : {}),
      signal: controller.signal,
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(`provider_http_${response.status}`) as ProviderHttpError;
      error.status = response.status;
      error.retryable =
        response.status === 408 || response.status === 429 || response.status >= 500;
      error.responseBody = responseBody;
      throw error;
    }

    return responseBody as T;
  } finally {
    clearTimeout(timeout);
  }
}
