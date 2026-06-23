import { AlertOctagon, CheckCircle2, Copy, Download, Inbox, XCircle } from "lucide-react";
import type { IntakeDashboardStats } from "@/lib/intake-stats";

export function AdminIntakeDashboard({ stats }: { stats: IntakeDashboardStats }) {
  const tiles = [
    { label: "Imported Today", value: stats.importedToday, icon: Download },
    { label: "Pending Review", value: stats.pendingReview, icon: Inbox },
    { label: "Approved Today", value: stats.approvedToday, icon: CheckCircle2 },
    { label: "Rejected Today", value: stats.rejectedToday, icon: XCircle },
    { label: "Duplicates Flagged", value: stats.duplicates, icon: Copy },
    { label: "Failed Imports Today", value: stats.failedImportsToday, icon: AlertOctagon }
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-white/15 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.label} className="bg-ink p-4 text-white">
            <Icon className="h-4 w-4 text-white/50" />
            <div className="number-tabular mt-2 text-2xl font-black">{tile.value}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/50">{tile.label}</div>
          </div>
        );
      })}
    </div>
  );
}
