const mode = process.env.PROVIDER_MODE ?? "mock";

const providerRequirements = {
  mock: [],
  sandbox: [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PROVIDER_WORKER_SECRET",
    "SWAN_API_URL",
    "SWAN_PROGRAMME_ID",
    "ADYEN_API_URL",
    "ADYEN_API_KEY",
    "ADYEN_HMAC_KEY",
    "ADYEN_MERCHANT_ACCOUNT",
  ],
  live: [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PROVIDER_WORKER_SECRET",
    "SWAN_API_URL",
    "SWAN_PROGRAMME_ID",
    "SWAN_CARD_PRODUCT_ID",
    "ADYEN_API_URL",
    "ADYEN_API_KEY",
    "ADYEN_HMAC_KEY",
    "ADYEN_MERCHANT_ACCOUNT",
    "ADYEN_BALANCE_PLATFORM_ID",
  ],
};

if (!(mode in providerRequirements)) {
  console.error(`Unsupported PROVIDER_MODE: ${mode}`);
  process.exit(1);
}

const missing = providerRequirements[mode].filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Provider readiness failed for ${mode} mode.`);
  for (const name of missing) console.error(`- Missing ${name}`);
  process.exit(1);
}

const browserUnsafe = Object.keys(process.env).filter(
  (name) =>
    /^VITE_(SWAN|ADYEN|SUPABASE_SERVICE_ROLE)/.test(name) ||
    /^NEXT_PUBLIC_(SWAN|ADYEN)/.test(name),
);

if (browserUnsafe.length) {
  console.error("Browser-exposed provider secrets detected:");
  for (const name of browserUnsafe) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Provider readiness passed in ${mode} mode.`);
