import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ControlRoomSnapshot = {
  commands: {
    status: string;
    provider: string;
    command_type: string;
    attempt_count: number;
    last_error: string | null;
    created_at: string;
    id: string;
  }[];
  events: {
    id: string;
    provider: string;
    event_type: string;
    processing_status: string;
    attempt_count: number;
    last_error: string | null;
    received_at: string;
  }[];
  alerts: {
    id: string;
    provider: string | null;
    severity: string;
    alert_type: string;
    title: string;
    status: string;
    created_at: string;
  }[];
  incidents: {
    id: string;
    reference: string;
    title: string;
    severity: string;
    status: string;
    started_at: string;
  }[];
  outbox: {
    id: string;
    channel: string;
    template_key: string;
    status: string;
    attempt_count: number;
    created_at: string;
  }[];
  supportCases: {
    id: string;
    reference: string;
    subject: string;
    case_type: string;
    status: string;
    priority: string;
    created_at: string;
  }[];
  reconciliation: {
    id: string;
    provider: string;
    run_type: string;
    status: string;
    matched_count: number;
    mismatched_count: number;
    started_at: string;
  }[];
};

export const getControlRoomSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ControlRoomSnapshot> => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [commands, events, alerts, incidents, outbox, supportCases, reconciliation] =
      await Promise.all([
        supabaseAdmin
          .from("platform_provider_commands")
          .select("id, status, provider, command_type, attempt_count, last_error, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
        supabaseAdmin
          .from("platform_provider_events")
          .select(
            "id, provider, event_type, processing_status, attempt_count, last_error, received_at",
          )
          .order("received_at", { ascending: false })
          .limit(40),
        supabaseAdmin
          .from("platform_provider_alerts")
          .select("id, provider, severity, alert_type, title, status, created_at")
          .order("created_at", { ascending: false })
          .limit(25),
        supabaseAdmin
          .from("platform_incidents")
          .select("id, reference, title, severity, status, started_at")
          .order("started_at", { ascending: false })
          .limit(25),
        supabaseAdmin
          .from("platform_notification_outbox")
          .select("id, channel, template_key, status, attempt_count, created_at")
          .order("created_at", { ascending: false })
          .limit(25),
        supabaseAdmin
          .from("platform_support_cases")
          .select("id, reference, subject, case_type, status, priority, created_at")
          .order("created_at", { ascending: false })
          .limit(25),
        supabaseAdmin
          .from("platform_reconciliation_runs")
          .select("id, provider, run_type, status, matched_count, mismatched_count, started_at")
          .order("started_at", { ascending: false })
          .limit(15),
      ]);

    return {
      commands: (commands.data ?? []) as never,
      events: (events.data ?? []) as never,
      alerts: (alerts.data ?? []) as never,
      incidents: (incidents.data ?? []) as never,
      outbox: (outbox.data ?? []) as never,
      supportCases: (supportCases.data ?? []) as never,
      reconciliation: (reconciliation.data ?? []) as never,
    };
  });
