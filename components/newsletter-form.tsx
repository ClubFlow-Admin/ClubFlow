"use client";

import type * as React from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setLoading(false);
    if (response.ok) {
      setEmail("");
      setMessage("You are on the ClubFlow list.");
    } else {
      const body = await response.json();
      setMessage(body.error ?? "Unable to subscribe right now.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@club.com"
        aria-label="Email address"
      />
      <Button type="submit" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "Joining" : "Join Newsletter"}
      </Button>
      {message ? <p className="text-sm font-semibold text-primary sm:self-center">{message}</p> : null}
    </form>
  );
}
