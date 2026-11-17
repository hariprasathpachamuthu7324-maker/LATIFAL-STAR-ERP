"use client";

import * as React from "react";
import { Grid } from "@/components/layout/Grid";
import { StatCard } from "@/components/ui/StatCard";
import { formatAED } from "@/lib/utils";
import type { Invoice } from "@/lib/data/invoices-mock";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export function InvoiceSummary({ invoices }: { invoices: Invoice[] }) {
  const activeInvoices = invoices.filter((inv) => inv.status !== "CANCELLED");

  const totalCount = invoices.length;
  const issuedCount = invoices.filter((inv) => inv.status === "ISSUED").length;
  const overdueCount = activeInvoices.filter(
    (inv) => inv.paymentStatus === "OVERDUE"
  ).length;
  const paidCount = activeInvoices.filter(
    (inv) => inv.paymentStatus === "PAID"
  ).length;

  const totalInvoicedValue = activeInvoices.reduce(
    (sum, inv) => sum + inv.grandTotal,
    0
  );
  const totalPaidValue = activeInvoices.reduce(
    (sum, inv) => sum + inv.amountPaid,
    0
  );
  const totalOutstandingValue = activeInvoices.reduce(
    (sum, inv) => sum + inv.outstandingAmount,
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatCard
        title="Total Invoices"
        value={totalCount}
        subtitle={`${formatAED(totalInvoicedValue)} billed`}
        icon={<Receipt className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Issued Invoices"
        value={issuedCount}
        subtitle="Active commercial bills"
        icon={<FileCheck className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Total Outstanding"
        value={formatAED(totalOutstandingValue)}
        subtitle="Pending collections"
        icon={<Clock className="w-4 h-4" />}
        variant="orange"
      />
      <StatCard
        title="Overdue Invoices"
        value={overdueCount}
        subtitle={
          overdueCount > 0
            ? "Requires payment follow-up"
            : "No overdue receivables"
        }
        icon={<AlertTriangle className="w-4 h-4" />}
        variant={overdueCount > 0 ? "orange" : "default"}
        trend={
          overdueCount > 0
            ? { value: `${overdueCount} delayed`, direction: "down" }
            : undefined
        }
      />
      <StatCard
        title="Fully Paid"
        value={paidCount}
        subtitle={`${formatAED(totalPaidValue)} collected`}
        icon={<CheckCircle2 className="w-4 h-4" />}
        variant="default"
        trend={{
          value: `${Math.round((paidCount / (activeInvoices.length || 1)) * 100)}% settled`,
          direction: "up",
        }}
      />
    </div>
  );
}
