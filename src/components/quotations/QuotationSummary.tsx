"use client";

import * as React from "react";
import { Grid } from "@/components/layout/Grid";
import { StatCard } from "@/components/ui/StatCard";
import { formatAED } from "@/lib/utils";
import type { Quotation } from "@/lib/data/quotations-mock";
import { FileText, Clock, CheckCircle2, FileCheck } from "lucide-react";

export function QuotationSummary({ quotations }: { quotations: Quotation[] }) {
  const total = quotations.length;
  const draft = quotations.filter((q) => q.status === "DRAFT").length;
  const sent = quotations.filter((q) => q.status === "SENT").length;
  const accepted = quotations.filter((q) => q.status === "ACCEPTED").length;
  
  const totalAcceptedValue = quotations
    .filter((q) => q.status === "ACCEPTED")
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);

  return (
    <Grid cols={4} gap="md">
      <StatCard
        title="Total Quotations"
        value={total}
        subtitle={`AED ${formatAED(totalQuotedValue).replace("AED", "").trim()} pipeline`}
        icon={<FileText className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Awaiting Response"
        value={sent}
        subtitle="Proposals with client"
        icon={<Clock className="w-4 h-4" />}
        variant="blue"
        trend={{ value: `${sent} active`, direction: "neutral" }}
      />
      <StatCard
        title="Accepted Proposals"
        value={accepted}
        subtitle={formatAED(totalAcceptedValue)}
        icon={<CheckCircle2 className="w-4 h-4" />}
        variant="default"
        trend={{ value: `${Math.round((accepted / (total || 1)) * 100)}% win rate`, direction: "up" }}
      />
      <StatCard
        title="Draft Quotations"
        value={draft}
        subtitle="Pending scope sign-off"
        icon={<FileCheck className="w-4 h-4" />}
        variant="default"
      />
    </Grid>
  );
}
