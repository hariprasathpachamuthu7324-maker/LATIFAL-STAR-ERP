"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import type { TeamMember } from "@/lib/data/team-mock";
import { Users, Shield, UserCog, UserCheck, ShieldCheck } from "lucide-react";

export function TeamSummary({ members }: { members: TeamMember[] }) {
  const total = members.length;
  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const adminCount = members.filter((m) => m.role === "ADMIN" && m.status === "ACTIVE").length;
  const managerCount = members.filter((m) => m.role === "MANAGER" && m.status === "ACTIVE").length;
  const staffCount = members.filter((m) => m.role === "STAFF" && m.status === "ACTIVE").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatCard
        title="Total Personnel"
        value={total}
        subtitle={`${activeCount} active accounts`}
        icon={<Users className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Administrators"
        value={adminCount}
        subtitle="Full administrative access"
        icon={<ShieldCheck className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Managers"
        value={managerCount}
        subtitle="Operations & Engineering"
        icon={<UserCog className="w-4 h-4" />}
        variant="orange"
      />
      <StatCard
        title="Staff & Technicians"
        value={staffCount}
        subtitle="Field operations access"
        icon={<UserCheck className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Active Rate"
        value={`${Math.round((activeCount / (total || 1)) * 100)}%`}
        subtitle="Security policy compliant"
        icon={<Shield className="w-4 h-4" />}
        variant="navy"
      />
    </div>
  );
}
