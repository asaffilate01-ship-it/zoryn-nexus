import { MockAdyenProvider, MockSwanProvider } from "./mockProviders";
import type { AcquiringProvider, BankingProvider, ProviderMode } from "./types";

export type ProviderBundle = {
  banking: BankingProvider;
  acquiring: AcquiringProvider;
  mode: ProviderMode;
};

export function createProviderBundle(mode: ProviderMode = "mock"): ProviderBundle {
  if (mode !== "mock") {
    throw new Error(
      `${mode} provider mode must be initialised server-side through the provider API; browser credentials are forbidden.`,
    );
  }

  return {
    banking: new MockSwanProvider(),
    acquiring: new MockAdyenProvider(),
    mode,
  };
}
