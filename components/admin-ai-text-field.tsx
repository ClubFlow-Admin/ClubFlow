"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type AiAction = "expand" | "rewrite" | "shorten" | "improve_headline" | "improve_executive_summary" | "improve_why_it_matters";

const actionLabels: Record<AiAction, string> = {
  expand: "Expand",
  rewrite: "Rewrite",
  shorten: "Shorten",
  improve_headline: "Improve Headline",
  improve_executive_summary: "Improve Summary",
  improve_why_it_matters: "Improve Analysis"
};

export function AdminAiTextField({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  articleTitle,
  actions = [],
  required,
  multiline = true,
  rows = 8
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  articleTitle?: string;
  actions?: AiAction[];
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AiAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: AiAction) {
    setPendingAction(action);
    setError(null);
    try {
      const response = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: value, title: articleTitle })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "AI request failed.");
        return;
      }
      setSuggestion(data.result);
    } catch {
      setError("AI request failed.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {actions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <Button
                key={action}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                disabled={pendingAction !== null}
                onClick={() => runAction(action)}
              >
                {pendingAction === action ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {actionLabels[action]}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {multiline ? (
        <Textarea id={id} name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} required={required} rows={rows} className="text-base leading-7" />
      ) : (
        <Input id={id} name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} required={required} className="text-base" />
      )}

      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}

      {suggestion ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="text-[11px] font-black uppercase tracking-wide text-primary">AI suggestion — review before applying</div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{suggestion}</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => { setValue(suggestion); setSuggestion(null); }}>Apply</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestion(null)}>Discard</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
