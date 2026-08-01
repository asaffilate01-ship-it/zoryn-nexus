import { statusLabel } from "../lib/format";
export function StatusBadge({ status }: { status: string }) {
  const tone = status.includes("active") || status.includes("completed") || status.includes("processed") || status.includes("operational") ? "bg-emerald-100 text-emerald-800" : status.includes("failed") || status.includes("critical") || status.includes("dead") || status.includes("restricted") ? "bg-red-100 text-red-800" : status.includes("pending") || status.includes("review") || status.includes("retry") || status.includes("required") ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{statusLabel(status)}</span>;
}
