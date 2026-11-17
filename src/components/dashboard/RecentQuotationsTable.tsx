"use client";

import * as React from "react";
import Link from "next/link";
import { Panel } from "@/components/layout/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatAED, formatDate } from "@/lib/utils";
import type { RecentQuotation } from "@/lib/data/dashboard-mock";
import { FileText, ArrowRight, Eye, Plus } from "lucide-react";

export function RecentQuotationsTable({ quotations }: { quotations: RecentQuotation[] }) {
  const getStatusBadge = (status: RecentQuotation["status"]) => {
    switch (status) {
      case "Accepted":
        return <Badge variant="success" dot size="sm">Accepted</Badge>;
      case "Sent":
        return <Badge variant="info" dot size="sm">Sent</Badge>;
      case "Draft":
        return <Badge variant="default" size="sm">Draft</Badge>;
      case "Rejected":
        return <Badge variant="danger" dot size="sm">Rejected</Badge>;
      case "Expired":
        return <Badge variant="warning" dot size="sm">Expired</Badge>;
    }
  };

  return (
    <Panel
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Recent Quotations</span>
        </div>
      }
      subtitle="Latest commercial proposals submitted to clients"
      headerAction={
        <Link href="/quotations">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All
          </Button>
        </Link>
      }
    >
      <div className="overflow-x-auto -mx-5 -my-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-4">Quotation No.</th>
              <th className="py-2.5 px-4">Customer & Scope</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {quotations.length > 0 ? (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                    {q.docNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#1E293B]">{q.customerName}</div>
                    <div className="text-[11px] text-[#64748B] truncate max-w-xs">
                      {q.projectName}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#475569] whitespace-nowrap">
                    {formatDate(q.date)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#0F172A] font-numeric whitespace-nowrap">
                    {formatAED(q.amount)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(q.status)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link href="/quotations">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="View quotation details">
                        <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-6 h-6 text-slate-300" />
                    <span className="text-xs text-slate-500 font-medium">No commercial quotations created yet.</span>
                    <Link href="/quotations">
                      <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Create Quotation
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
