"use client";

import * as React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPISection } from "@/components/dashboard/KPISection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BusinessActivity } from "@/components/dashboard/BusinessActivity";
import { OperationalAlerts } from "@/components/dashboard/OperationalAlerts";
import { RecentQuotationsTable } from "@/components/dashboard/RecentQuotationsTable";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { Grid } from "@/components/layout/Grid";
import {
  type DashboardKPI,
  type ActivityMetric,
  type RecentQuotation,
  type RecentInvoice,
  type OperationalAlert,
} from "@/lib/data/dashboard-mock";
import { CustomersRepository } from "@/lib/repositories/customers-repository";
import { QuotationsRepository } from "@/lib/repositories/quotations-repository";
import { InvoicesRepository } from "@/lib/repositories/invoices-repository";
import { PurchaseOrdersRepository } from "@/lib/repositories/purchase-orders-repository";
import { WorkCompletionRepository } from "@/lib/repositories/work-completion-repository";

export default function DashboardPage() {
  const [kpis, setKpis] = React.useState<DashboardKPI[]>([
    {
      id: "kpi-1",
      title: "Total Customers",
      value: "0",
      subtitle: "0 active entities",
      trend: { value: "0%", direction: "neutral" },
      variant: "navy",
    },
    {
      id: "kpi-2",
      title: "Active Quotations",
      value: "0",
      subtitle: "AED 0.00 total value",
      trend: { value: "0 pending", direction: "neutral" },
      variant: "orange",
    },
    {
      id: "kpi-3",
      title: "Outstanding Invoices",
      value: "0",
      subtitle: "AED 0.00 balance due",
      trend: { value: "0 overdue", direction: "neutral" },
      variant: "orange",
    },
    {
      id: "kpi-4",
      title: "Pending Purchase Orders",
      value: "0",
      subtitle: "AED 0.00 committed",
      trend: { value: "0 in transit", direction: "neutral" },
      variant: "navy",
    },
  ]);

  const [activityMetrics, setActivityMetrics] = React.useState<ActivityMetric[]>([
    {
      category: "Quotations",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#2563EB]",
    },
    {
      category: "Tax Invoices Issued",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#0B1F33]",
    },
    {
      category: "Purchase Orders Committed",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#1E293B]",
    },
    {
      category: "Work Completion Reports",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-emerald-600",
    },
  ]);

  const [recentQuotations, setRecentQuotations] = React.useState<RecentQuotation[]>([]);
  const [recentInvoices, setRecentInvoices] = React.useState<RecentInvoice[]>([]);
  const [operationalAlerts, setOperationalAlerts] = React.useState<OperationalAlert[]>([]);

  React.useEffect(() => {
    async function loadDashboardData() {
      try {
        const [customers, quotations, invoices, pos, reports] = await Promise.all([
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
          InvoicesRepository.getAll(),
          PurchaseOrdersRepository.getAll(),
          WorkCompletionRepository.getAll(),
        ]);

        const totalCustomers = customers.length;
        const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;

        const activeQuotations = quotations.filter(
          (q) => q.status === "SENT" || q.status === "DRAFT" || q.status === "ACCEPTED"
        );
        const activeQuotationsValue = activeQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
        const pendingQuotationsCount = quotations.filter((q) => q.status === "SENT" || q.status === "DRAFT").length;

        const outstandingInvoices = invoices.filter(
          (inv) => inv.paymentStatus !== "PAID" && inv.status !== "CANCELLED"
        );
        const outstandingAmountSum = outstandingInvoices.reduce(
          (sum, inv) => sum + (inv.outstandingAmount || inv.grandTotal || 0),
          0
        );
        const overdueInvoicesCount = invoices.filter((inv) => inv.paymentStatus === "OVERDUE").length;

        const pendingPOs = pos.filter((po) => po.status !== "CANCELLED");
        const poCommittedSum = pendingPOs.reduce((sum, po) => sum + (po.grandTotal || 0), 0);

        setKpis([
          {
            id: "kpi-1",
            title: "Total Customers",
            value: totalCustomers.toString(),
            subtitle: `${activeCustomers} active entities`,
            trend: { value: `${totalCustomers}`, direction: "neutral" },
            variant: "navy",
          },
          {
            id: "kpi-2",
            title: "Active Quotations",
            value: activeQuotations.length.toString(),
            subtitle: `AED ${activeQuotationsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total value`,
            trend: { value: `${pendingQuotationsCount} pending`, direction: "neutral" },
            variant: "orange",
          },
          {
            id: "kpi-3",
            title: "Outstanding Invoices",
            value: outstandingInvoices.length.toString(),
            subtitle: `AED ${outstandingAmountSum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} balance due`,
            trend: { value: `${overdueInvoicesCount} overdue`, direction: overdueInvoicesCount > 0 ? "up" : "neutral" },
            variant: "orange",
          },
          {
            id: "kpi-4",
            title: "Pending Purchase Orders",
            value: pendingPOs.length.toString(),
            subtitle: `AED ${poCommittedSum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} committed`,
            trend: { value: `${pendingPOs.length} active`, direction: "neutral" },
            variant: "navy",
          },
        ]);

        const totalDocCount = quotations.length + invoices.length + pos.length + reports.length;
        const qPct = totalDocCount > 0 ? Math.round((quotations.length / totalDocCount) * 100) : 0;
        const invPct = totalDocCount > 0 ? Math.round((invoices.length / totalDocCount) * 100) : 0;
        const poPct = totalDocCount > 0 ? Math.round((pos.length / totalDocCount) * 100) : 0;
        const wcrPct = totalDocCount > 0 ? Math.max(0, 100 - (qPct + invPct + poPct)) : 0;

        const quotesTotalVal = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
        const invTotalVal = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
        const poTotalVal = pos.reduce((sum, p) => sum + (p.grandTotal || 0), 0);

        setActivityMetrics([
          {
            category: "Quotations",
            count: quotations.length,
            amount: quotesTotalVal,
            percentage: qPct,
            color: "bg-[#2563EB]",
          },
          {
            category: "Tax Invoices Issued",
            count: invoices.length,
            amount: invTotalVal,
            percentage: invPct,
            color: "bg-[#0B1F33]",
          },
          {
            category: "Purchase Orders Committed",
            count: pos.length,
            amount: poTotalVal,
            percentage: poPct,
            color: "bg-[#1E293B]",
          },
          {
            category: "Work Completion Reports",
            count: reports.length,
            amount: 0,
            percentage: wcrPct,
            color: "bg-emerald-600",
          },
        ]);

        const topQuotations: RecentQuotation[] = quotations.slice(0, 5).map((q) => {
          let statusLabel: RecentQuotation["status"] = "Draft";
          if (q.status === "SENT") statusLabel = "Sent";
          else if (q.status === "ACCEPTED") statusLabel = "Accepted";
          else if (q.status === "REJECTED") statusLabel = "Rejected";
          else if (q.status === "EXPIRED") statusLabel = "Expired";

          return {
            id: q.id,
            docNumber: q.quotationNumber,
            customerName: q.customerName,
            projectName: q.projectName,
            date: q.quotationDate,
            amount: q.grandTotal,
            status: statusLabel,
          };
        });
        setRecentQuotations(topQuotations);

        const topInvoices: RecentInvoice[] = invoices.slice(0, 5).map((inv) => {
          let statusLabel: RecentInvoice["status"] = "Issued";
          if (inv.status === "DRAFT") statusLabel = "Draft";
          else if (inv.paymentStatus === "PAID") statusLabel = "Paid";
          else if (inv.paymentStatus === "PARTIALLY_PAID") statusLabel = "Partially Paid";
          else if (inv.paymentStatus === "OVERDUE") statusLabel = "Overdue";

          return {
            id: inv.id,
            docNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            projectName: inv.projectName,
            date: inv.invoiceDate,
            amount: inv.grandTotal,
            status: statusLabel,
          };
        });
        setRecentInvoices(topInvoices);

        const dynamicAlerts: OperationalAlert[] = [];
        invoices.forEach((inv) => {
          if (inv.paymentStatus === "OVERDUE") {
            dynamicAlerts.push({
              id: `alert-${inv.id}`,
              type: "Invoice",
              docNumber: inv.invoiceNumber,
              entityName: inv.customerName,
              description: `Payment overdue by due date ${inv.dueDate}`,
              amount: inv.outstandingAmount || inv.grandTotal,
              dueDate: inv.dueDate,
              urgency: "high",
              actionHref: "/invoices",
            });
          }
        });
        setOperationalAlerts(dynamicAlerts);
      } catch {
        // Safe empty fallback
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header with greeting and live UAE status */}
      <DashboardHeader />

      {/* 2. Primary KPI Stat Cards */}
      <KPISection kpis={kpis} />

      {/* 3. Quick Actions Bar */}
      <QuickActions />

      {/* 4. Middle Section: Business Activity Pipeline & Operational Attention Alerts */}
      <Grid cols={2} gap="md">
        <BusinessActivity metrics={activityMetrics} />
        <OperationalAlerts alerts={operationalAlerts} />
      </Grid>

      {/* 5. Bottom Section: Recent Quotations & Recent Tax Invoices */}
      <Grid cols={2} gap="md">
        <RecentQuotationsTable quotations={recentQuotations} />
        <RecentInvoicesTable invoices={recentInvoices} />
      </Grid>
    </div>
  );
}
