import type { ReactNode } from "react";
export function StatePanel({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex gap-4"><div className="mt-1">{icon}</div><div className="min-w-0 flex-1"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>{action && <div className="mt-4">{action}</div>}</div></div></section>
}
