"use client";

import * as React from "react";
import { Panel } from "@/components/layout/Panel";
import { formatAED } from "@/lib/utils";
import type { ActivityMetric } from "@/lib/data/dashboard-mock";

export function BusinessActivity({ metrics }: { metrics: ActivityMetric[] }) {
  const totalVolume = metrics.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Panel
      title="Commercial & Operational Activity"
      subtitle="Documents processed and active volume this period"
      headerAction={
        <span className="text-xs text-slate-500 font-medium">
          Total: <span className="font-semibold text-slate-800 font-numeric">{formatAED(totalVolume)}</span>
        </span>
      }
    >
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.category}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">{metric.category}</span>
                <span className="text-[10px] text-slate-400 font-numeric">{metric.count} docs</span>
              </div>
              <span className="font-semibold text-slate-800 font-numeric">{formatAED(metric.amount)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-700 transition-all duration-500"
                style={{ width: `${Math.min(metric.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
