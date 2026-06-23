"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSourceRefreshButton({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sources/${sourceId}/refresh`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Force refresh failed.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Force refresh failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" variant="ghost" onClick={refresh} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Force Refresh
      </Button>
      {error ? <span className="max-w-[180px] text-right text-[11px] text-red-600">{error}</span> : null}
    </div>
  );
}
