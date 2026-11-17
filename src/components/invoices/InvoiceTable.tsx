"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatAED, formatDate } from "@/lib/utils";
import type { Invoice } from "@/lib/data/invoices-mock";
import type { InvoiceDocumentStatus, InvoicePaymentStatus } from "@/lib/invoices/calculations";
import {
  Eye,
  Edit,
  Copy,
  RefreshCw,
  CreditCard,
  Receipt,
  AlertCircle,
  FileText,
  Ban,
  Trash2,
} from "lucide-react";

export function InvoiceTable({
  invoices,
  onView,
  onEdit,
  onChangeStatus,
  onUpdatePayment,
  onDelete,
}: {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
  onUpdatePayment: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}) {
  const getDocumentStatusBadge = (status: InvoiceDocumentStatus) => {
    switch (status) {
      case "ISSUED":
        return <Badge variant="navy" size="sm">Issued</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: InvoicePaymentStatus, isOverdue: boolean) => {
    if (status === "PAID") {
      return <Badge variant="success" dot size="sm">Paid</Badge>;
    }
    if (status === "OVERDUE" || isOverdue) {
      return <Badge variant="danger" dot size="sm">Overdue</Badge>;
    }
    if (status === "PARTIALLY_PAID") {
      return <Badge variant="warning" dot size="sm">Partially Paid</Badge>;
    }
    return <Badge variant="info" dot size="sm">Unpaid</Badge>;
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-slate-600 mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#002664]">No Tax Invoices Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No invoices match your search or filter criteria. Try adjusting your filters or create a new commercial tax invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Invoice No.</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Subject & Project</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4 text-right">Grand Total (AED)</th>
              <th className="py-3 px-4 text-right">Outstanding (AED)</th>
              <th className="py-3 px-4 text-center">Payment</th>
              <th className="py-3 px-4 text-center">Doc Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {invoices.map((inv) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastDue =
                new Date(inv.dueDate) < today &&
                inv.outstandingAmount > 0 &&
                inv.status === "ISSUED";

              const isCancelled = inv.status === "CANCELLED";

              return (
                <tr
                  key={inv.id}
                  className={`transition-colors group cursor-pointer ${
                    isCancelled
                      ? "bg-slate-50/40 text-slate-400 hover:bg-slate-50/80"
                      : "hover:bg-slate-50/70"
                  }`}
                  onClick={() => onView(inv)}
                >
                  {/* Invoice Number */}
                  <td className="py-3.5 px-4 font-numeric font-bold whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`hover:underline ${
                          isCancelled
                            ? "line-through text-slate-400"
                            : "text-[#002664] font-semibold"
                        }`}
                      >
                        {inv.invoiceNumber}
                      </span>
                      {inv.quotationNumber && (
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          Ref: {inv.quotationNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div
                      className={`font-semibold truncate ${
                        isCancelled ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {inv.customerName}
                    </div>
                    {inv.customerTrn ? (
                      <div className="text-[10px] text-slate-400 font-numeric truncate">
                        TRN: {inv.customerTrn}
                      </div>
                    ) : inv.attention ? (
                      <div className="text-[11px] text-slate-500 truncate">
                        Attn: {inv.attention}
                      </div>
                    ) : null}
                  </td>

                  {/* Subject & Project */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <div
                      className={`font-medium line-clamp-1 group-hover:text-[#002664] ${
                        isCancelled ? "text-slate-400" : "text-slate-800"
                      }`}
                      title={inv.subject}
                    >
                      {inv.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {inv.projectName}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-700 font-numeric">
                      Inv: {formatDate(inv.invoiceDate)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[11px] font-numeric ${
                        isPastDue
                          ? "text-red-600 font-semibold"
                          : "text-slate-500"
                      }`}
                    >
                      <span>Due: {formatDate(inv.dueDate)}</span>
                      {isPastDue && (
                        <span title="Overdue Payment">
                          <AlertCircle className="w-3 h-3 text-red-500 inline" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Grand Total */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div
                      className={`font-bold font-numeric text-[13px] ${
                        isCancelled ? "text-slate-400" : "text-[#002664]"
                      }`}
                    >
                      {formatAED(inv.grandTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-numeric">
                      Incl. 5% VAT
                    </div>
                  </td>

                  {/* Outstanding Balance */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isCancelled ? (
                      <span className="text-slate-400 font-numeric">AED 0.00</span>
                    ) : inv.outstandingAmount === 0 ? (
                      <span className="font-bold text-emerald-600 font-numeric">
                        Settled
                      </span>
                    ) : (
                      <div>
                        <span
                          className={`font-bold font-numeric ${
                            isPastDue ? "text-red-600" : "text-slate-900"
                          }`}
                        >
                          {formatAED(inv.outstandingAmount)}
                        </span>
                        {inv.amountPaid > 0 && (
                          <div className="text-[10px] text-slate-400 font-numeric">
                            Paid: {formatAED(inv.amountPaid)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {isCancelled ? (
                      <Badge variant="default" size="sm">N/A</Badge>
                    ) : (
                      getPaymentStatusBadge(inv.paymentStatus, isPastDue)
                    )}
                  </td>

                  {/* Document Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getDocumentStatusBadge(inv.status)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="View Tax Invoice"
                        onClick={() => onView(inv)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Edit Invoice"
                        onClick={() => onEdit(inv)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-700"
                        title="Record Payment / Update Balance"
                        onClick={() => onUpdatePayment(inv)}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Update Document Status"
                        onClick={() => onChangeStatus(inv)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Invoice"
                        onClick={() => onDelete?.(inv)}
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
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>
          Showing <strong>{invoices.length}</strong> tax invoices
        </span>
        <div className="flex items-center gap-4 font-numeric">
          <span>
            Total Billed:{" "}
            <strong>
              {formatAED(
                invoices
                  .filter((i) => i.status !== "CANCELLED")
                  .reduce((acc, i) => acc + i.grandTotal, 0)
              )}
            </strong>
          </span>
          <span>
            Total Outstanding:{" "}
            <strong className="text-amber-700">
              {formatAED(
                invoices
                  .filter((i) => i.status !== "CANCELLED")
                  .reduce((acc, i) => acc + i.outstandingAmount, 0)
              )}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
