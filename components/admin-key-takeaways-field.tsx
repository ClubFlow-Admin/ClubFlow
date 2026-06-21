"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminKeyTakeawaysField({ name, defaultValue = [] }: { name: string; defaultValue?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultValue.length ? defaultValue : [""]);

  function updateItem(index: number, value: string) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeItem(index: number) {
    setItems((current) => (current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : [""]));
  }

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-primary">•</span>
          <Input name={name} value={item} onChange={(event) => updateItem(index, event.target.value)} placeholder="A concrete, skimmable takeaway" />
          <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)} aria-label="Remove takeaway">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" className="w-fit" onClick={() => setItems((current) => [...current, ""])}>
        <Plus className="h-4 w-4" /> Add takeaway
      </Button>
    </div>
  );
}
