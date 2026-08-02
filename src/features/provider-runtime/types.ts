export type ProviderName = "swan" | "adyen" | "rewards";

export type RuntimeDirection = "command" | "event";
export type RuntimeLogStatus = "started" | "succeeded" | "failed" | "dead_letter";

export type RuntimeCommandRow = {
  id: string;
  provider: string;
  command_type: string;
  status: string;
  attempt_count: number;
  last_error: string | null;
  next_attempt_at: string | null;
  created_at: string;
};

export type RuntimeEventRow = {
  id: string;
  provider: string;
  event_id: string;
  event_type: string;
  processing_status: string;
  attempt_count: number;
  last_error: string | null;
  received_at: string;
};

export type RuntimeLogRow = {
  id: string;
  provider: string;
  direction: RuntimeDirection;
  operation: string;
  status: RuntimeLogStatus;
  correlation_id: string;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
};

export type RuntimeSnapshot = {
  commands: RuntimeCommandRow[];
  events: RuntimeEventRow[];
  logs: RuntimeLogRow[];
};
