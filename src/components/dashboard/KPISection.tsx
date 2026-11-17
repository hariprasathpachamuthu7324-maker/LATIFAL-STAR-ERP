"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import type { DashboardKPI } from "@/lib/data/dashboard-mock";
import { Users, FileText, Receipt, ClipboardList } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  "kpi-1": <Users className="w-4 h-4" />,
  "kpi-2": <FileText className="w-4 h-4" />,
  "kpi-3": <Receipt className="w-4 h-4" />,
  "kpi-4": <ClipboardList className="w-4 h-4" />,
};

export function KPISection({ kpis }: { kpis: DashboardKPI[] }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-slate-200">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={icons[kpi.id]}
          trend={kpi.trend}
          variant={kpi.variant}
        />
      ))}
    </div>
  );
}
