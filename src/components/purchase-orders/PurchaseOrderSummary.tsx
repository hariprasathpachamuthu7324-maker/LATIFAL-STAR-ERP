"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { formatAED } from "@/lib/utils";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import {
  ClipboardList,
  CheckCircle2,
  FileCheck,
  Ban,
  TrendingUp,
} from "lucide-react";

export function PurchaseOrderSummary({
  purchaseOrders,
}: {
  purchaseOrders: PurchaseOrder[];
}) {
  const activeOrders = purchaseOrders.filter((po) => po.status !== "CANCELLED");

  const totalCount = purchaseOrders.length;
  const issuedCount = purchaseOrders.filter((po) => po.status === "ISSUED").length;
  const draftCount = purchaseOrders.filter((po) => po.status === "DRAFT").length;
  const cancelledCount = purchaseOrders.filter(
    (po) => po.status === "CANCELLED"
  ).length;

  const totalProcurementValue = activeOrders.reduce(
    (sum, po) => sum + po.grandTotal,
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatCard
        title="Total POs"
        value={totalCount}
        subtitle="All procurement records"
        icon={<ClipboardList className="w-4 h-4" />}
        variant="navy"
      />
      <StatCard
        title="Issued Orders"
        value={issuedCount}
        subtitle="Active material supply"
        icon={<CheckCircle2 className="w-4 h-4" />}
        variant="default"
        trend={{
          value: `${Math.round((issuedCount / (totalCount || 1)) * 100)}% issued`,
          direction: "up",
        }}
      />
      <StatCard
        title="Draft Orders"
        value={draftCount}
        subtitle="Pending approval"
        icon={<FileCheck className="w-4 h-4" />}
        variant="orange"
      />
      <StatCard
        title="Cancelled POs"
        value={cancelledCount}
        subtitle="Voided orders"
        icon={<Ban className="w-4 h-4" />}
        variant="default"
      />
      <StatCard
        title="Total Value"
        value={formatAED(totalProcurementValue)}
        subtitle="Active procurement commitments"
        icon={<TrendingUp className="w-4 h-4" />}
        variant="navy"
      />
    </div>
  );
}
