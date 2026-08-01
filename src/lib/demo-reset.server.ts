/**
 * Demo reset.
 *
 * `demo_baseline` holds a JSON snapshot of every seeded demo row. Resetting
 * deletes the demo rows currently in the database and re-inserts the snapshot,
 * so the sandbox is repeatable for sales demos and end-to-end tests.
 */
import { timingSafeEqual } from "crypto";

export function checkJobsSecret(request: Request): boolean {
  const expected =
    process.env["ZORYN_JOBS_SECRET"] ??
    process.env["SUPABASE_ANON_KEY"] ??
    process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!expected) return false;
  const provided = request.headers.get("x-zoryn-jobs-secret") ?? request.headers.get("apikey") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Child rows first on delete, parents first on insert. */
export const RESET_TABLES = [
  "internal_transfers",
  "loyalty_entries",
  "payment_links",
  "rewards_outbox",
  "transactions",
  "terminals",
  "cards",
  "pots",
  "support_cases",
  "provider_events",
  "audit_logs",
  "merchants",
  "loyalty_accounts",
  "financial_accounts",
] as const;

const NO_DEMO_FLAG = new Set(["internal_transfers"]);

export async function resetDemoData(admin: any) {
  const { data: baseline } = await admin.from("demo_baseline").select("table_name, row_id, data");
  if (!baseline?.length) {
    return { ok: false, error: "No demo baseline captured" };
  }

  const cleared: Record<string, number> = {};
  const restored: Record<string, number> = {};

  for (const table of RESET_TABLES) {
    let query = admin.from(table).delete();
    query = NO_DEMO_FLAG.has(table) ? query.not("id", "is", null) : query.eq("is_demo", true);
    const { data } = await query.select("id");
    cleared[table] = data?.length ?? 0;
  }

  for (const table of [...RESET_TABLES].reverse()) {
    const rows = (baseline as any[]).filter((r) => r.table_name === table);
    if (!rows.length) continue;
    const { error } = await admin.from(table).insert(rows.map((r) => ({ ...(r.data as object), id: r.row_id })));
    if (error) throw new Error(`${table}: ${error.message}`);
    restored[table] = rows.length;
  }

  return { ok: true, cleared, restored };
}
