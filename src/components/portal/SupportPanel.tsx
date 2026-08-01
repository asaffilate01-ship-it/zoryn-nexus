import { useState } from "react";
import { Badge, Button, Empty, ErrorText, Field, Panel, inputClass } from "./ui";
import { useDemo, type RoleKey } from "@/lib/zoryn-store";

const categories = ["account", "card", "payment", "verification", "complaint", "other"];

export function SupportPanel({ role, title }: { role: RoleKey; title: string }) {
  const { state, createCase, resolveCase } = useDemo();
  const cases = state[role].cases;
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("account");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (subject.trim().length < 3) return setError("Subject must be at least 3 characters.");
    if (description.trim().length < 5) return setError("Please describe the issue (min 5 characters).");
    setError(null);
    createCase(role, { subject: subject.trim(), category, description: description.trim() });
    setSubject("");
    setDescription("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Panel title="New support case" subtitle={title}>
        <div className="space-y-3">
          <Field label="Subject">
            <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} placeholder="Card not working" />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea className={inputClass} rows={4} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us what happened" />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button onClick={submit}>Create case</Button>
        </div>
      </Panel>

      <Panel title="Your cases" subtitle="Cases are mirrored to the admin support desk">
        {cases.length === 0 ? (
          <Empty>No cases yet — create one to see the workflow.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {cases.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <b className="block text-sm">{c.ref} · {c.subject}</b>
                  <small className="text-xs text-muted-foreground">
                    {c.category} · {new Date(c.createdAt).toLocaleString("de-DE")}
                  </small>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.status === "resolved" ? "good" : c.status === "open" ? "warn" : "neutral"}>
                    {c.status.replace("_", " ")}
                  </Badge>
                  {c.status !== "resolved" && (
                    <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => resolveCase(role, c.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
