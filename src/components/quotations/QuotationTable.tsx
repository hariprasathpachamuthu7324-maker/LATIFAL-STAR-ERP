"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatAED, formatDate } from "@/lib/utils";
import type { Quotation, QuotationStatus } from "@/lib/data/quotations-mock";
import {
  Eye,
  Edit,
  Copy,
  RefreshCw,
  Trash2,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  MoreVertical,
} from "lucide-react";

export function QuotationTable({
  quotations,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}: {
  quotations: Quotation[];
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onChangeStatus: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
}) {
  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success" dot size="sm">Accepted</Badge>;
      case "SENT":
        return <Badge variant="info" dot size="sm">Sent to Client</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft</Badge>;
      case "REJECTED":
        return <Badge variant="danger" dot size="sm">Rejected</Badge>;
      case "EXPIRED":
        return <Badge variant="warning" dot size="sm">Expired</Badge>;
    }
  };

  if (quotations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-slate-600 mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">No Quotations Found</h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
          No commercial quotations match your search or filter criteria. Try adjusting filters or create a new quotation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              <th className="py-3 px-4">Quotation #</th>
              <th className="py-3 px-4">Client / Contact</th>
              <th className="py-3 px-4">Scope & Project</th>
              <th className="py-3 px-4">Timeline</th>
              <th className="py-3 px-4 text-right">Total (AED)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {quotations.map((q) => {
              const isPastExpiry =
                new Date(q.validUntil) < new Date() && q.status === "SENT";

              return (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onView(q)}
                >
                  {/* Quotation Number */}
                  <td className="py-3.5 px-4 font-numeric font-bold text-[#0F172A] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="hover:text-slate-600 transition-colors">{q.quotationNumber}</span>
                    </div>
                  </td>

                  {/* Customer / Attention */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="font-semibold text-slate-900 truncate">
                      {q.customerName}
                    </div>
                    {q.attention ? (
                      <div className="text-[11px] text-slate-500 truncate">
                        Attn: {q.attention}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        {q.projectLocation}
                      </div>
                    )}
                  </td>

                  {/* Subject & Project */}
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <div
                      className="font-medium text-slate-800 line-clamp-1 group-hover:text-[#002664]"
                      title={q.subject}
                    >
                      {q.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {q.projectName}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-700 font-numeric">
                      {formatDate(q.quotationDate)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-numeric">
                      <span>Valid: {formatDate(q.validUntil)}</span>
                      {isPastExpiry && (
                        <span title="Past validity date">
                          <AlertCircle className="w-3 h-3 text-amber-500 inline" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Grand Total */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-bold text-[#002664] font-numeric text-[13px]">
                      {formatAED(q.grandTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-numeric">
                      Incl. 5% VAT
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(q.status)}
                  </td>

                  {/* Actions Buttons */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="View Commercial Proposal"
                        onClick={() => onView(q)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Edit Quotation"
                        onClick={() => onEdit(q)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Update Status"
                        onClick={() => onChangeStatus(q)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Quotation"
                        onClick={() => onDelete(q)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Showing <strong>{quotations.length}</strong> commercial quotations
        </span>
        <span className="font-numeric">
          Total Val:{" "}
          <strong>
            {formatAED(quotations.reduce((acc, q) => acc + q.grandTotal, 0))}
          </strong>
        </span>
      </div>
    </div>
  );
}
