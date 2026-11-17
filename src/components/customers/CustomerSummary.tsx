"use client";

import * as React from "react";
import { Grid } from "@/components/layout/Grid";
import { StatCard } from "@/components/ui/StatCard";
import type { Customer } from "@/lib/data/customers-mock";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

export function CustomerSummary({ customers }: { customers: Customer[] }) {
  const total = customers.length;
  const active = customers.filter((c) => c.status === "ACTIVE").length;
  const inactive = customers.filter((c) => c.status === "INACTIVE").length;
  // Count added in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
  const recent = customers.filter(
    (c) => new Date(c.createdAt) >= thirtyDaysAgo
  ).length;

  return (
    <Grid cols={4} gap="md">
      <StatCard
        title="Total Customers"
        value={total}
        subtitle="Registered commercial entities"
        icon={<Users className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Active Accounts"
        value={active}
        subtitle="Operational accounts"
        icon={<UserCheck className="w-4 h-4" />}
        variant="default"
        trend={{ value: `${Math.round((active / (total || 1)) * 100)}% active`, direction: "up" }}
      />
      <StatCard
        title="Inactive Accounts"
        value={inactive}
        subtitle="Dormant / archived accounts"
        icon={<UserX className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Recent Onboardings"
        value={recent}
        subtitle="New corporate clients"
        icon={<UserPlus className="w-4 h-4" />}
        variant="blue"
        trend={{ value: "+8 MoM", direction: "up" }}
      />
    </Grid>
  );
}
