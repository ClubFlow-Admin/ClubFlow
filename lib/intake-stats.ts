import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export type IntakeDashboardStats = {
  importedToday: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  duplicates: number;
  failedImportsToday: number;
};

/**
 * Read-only rollup for the Intake Queue's newsroom dashboard. Every number comes straight
 * from existing IntakeItem/ImportRun rows — nothing here writes to the database or changes
 * ingestion/approval behavior. "Today" is the server's local day boundary.
 */
export async function getIntakeDashboardStats(): Promise<IntakeDashboardStats> {
  const todayStart = startOfDay(new Date());

  const [importedToday, pendingReview, approvedToday, rejectedToday, duplicates, failedImportsToday] = await Promise.all([
    prisma.intakeItem.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.intakeItem.count({ where: { status: "pending" } }),
    prisma.intakeItem.count({ where: { status: "approved", updatedAt: { gte: todayStart } } }),
    prisma.intakeItem.count({ where: { status: "rejected", updatedAt: { gte: todayStart } } }),
    prisma.intakeItem.count({ where: { duplicateConfidence: { gte: 70 }, status: { in: ["pending", "scheduled"] } } }),
    prisma.importRun.count({ where: { status: "error", startedAt: { gte: todayStart } } })
  ]);

  return { importedToday, pendingReview, approvedToday, rejectedToday, duplicates, failedImportsToday };
}
