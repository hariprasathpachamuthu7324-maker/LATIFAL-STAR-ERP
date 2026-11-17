"use client";

import * as React from "react";
import Link from "next/link";
import { Panel } from "@/components/layout/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { OperationalAlert } from "@/lib/data/dashboard-mock";
import { AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function OperationalAlerts({ alerts }: { alerts: OperationalAlert[] }) {
  const getUrgencyBadge = (urgency: "high" | "medium" | "low") => {
    switch (urgency) {
      case "high":
        return <Badge variant="danger" dot size="sm">Overdue Action</Badge>;
      case "medium":
        return <Badge variant="warning" dot size="sm">Attention</Badge>;
      case "low":
        return <Badge variant="info" dot size="sm">Pending Signoff</Badge>;
    }
  };

  return (
    <Panel
      title={
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#B45309]" />
          <span>Operational Attention & Action Items</span>
        </div>
      }
      subtitle="Pending tasks requiring approval, followup, or client handover sign-off"
    >
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {alert.docNumber}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-[#334155] truncate">
                    {alert.entityName}
                  </span>
                  {getUrgencyBadge(alert.urgency)}
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {alert.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="text-right hidden md:block">
                  <span className="text-[10px] text-[#64748B] block uppercase font-medium">Target Date</span>
                  <span className="text-xs font-medium text-[#334155]">
                    {formatDate(alert.dueDate)}
                  </span>
                </div>
                <Link href={alert.actionHref}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span className="text-xs text-slate-600 font-medium">All operational workflows are up to date.</span>
              <span className="text-[11px] text-slate-400">No overdue invoices, pending approvals, or urgent follow-ups.</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
