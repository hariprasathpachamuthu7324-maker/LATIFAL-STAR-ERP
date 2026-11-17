"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Ban,
  Activity,
} from "lucide-react";

export function WorkCompletionSummary({
  reports,
}: {
  reports: WorkCompletionReport[];
}) {
  const activeReports = reports.filter((r) => r.status !== "CANCELLED");

  const totalCount = reports.length;
  const completedCount = reports.filter((r) => r.status === "COMPLETED").length;
  const draftCount = reports.filter((r) => r.status === "DRAFT").length;
  const cancelledCount = reports.filter((r) => r.status === "CANCELLED").length;

  const avgCompletion =
    activeReports.length > 0
      ? Math.round(
          activeReports.reduce((sum, r) => sum + r.completionPercentage, 0) /
            activeReports.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatCard
        title="Total Reports"
        value={totalCount}
        subtitle="All site execution records"
        icon={<ClipboardCheck className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Completed & Signed"
        value={completedCount}
        subtitle="Fully handed over"
        icon={<CheckCircle2 className="w-4 h-4" />}
        variant="default"
        trend={{
          value: `${Math.round((completedCount / (totalCount || 1)) * 100)}% signed`,
          direction: "up",
        }}
      />
      <StatCard
        title="Draft / In-Progress"
        value={draftCount}
        subtitle="Active site executions"
        icon={<Clock className="w-4 h-4" />}
        variant="orange"
      />
      <StatCard
        title="Cancelled Reports"
        value={cancelledCount}
        subtitle="Voided records"
        icon={<Ban className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Execution Rate"
        value={`${avgCompletion}%`}
        subtitle="Active scope completion"
        icon={<Activity className="w-4 h-4" />}
        variant="navy"
      />
    </div>
  );
}
