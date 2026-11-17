"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Clock } from "lucide-react";

export function DashboardHeader() {
  const { user, role } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Intl.DateTimeFormat("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const userName = user?.name || "Operations Team";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {userName}
          </h1>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            {role}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Overview of commercial proposals, invoices, purchase orders, and field operations.
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 font-medium self-start md:self-auto shrink-0">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{formattedDate}</span>
        <span className="text-slate-300">·</span>
        <span className="text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
    </div>
  );
}
