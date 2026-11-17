"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatAED } from "@/lib/utils";
import type { Invoice } from "@/lib/data/invoices-mock";
import {
  type InvoiceDocumentStatus,
  type InvoicePaymentStatus,
  roundToTwoDecimals,
} from "@/lib/invoices/calculations";
import {
  FileText,
  Send,
  Ban,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface StatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  mode: "document_status" | "payment";
  onSave: (
    invoiceId: string,
    updates: {
      status?: InvoiceDocumentStatus;
      paymentStatus?: InvoicePaymentStatus;
      amountPaid?: number;
      outstandingAmount?: number;
    }
  ) => void;
}

export function InvoiceStatusModal({
  open,
  onOpenChange,
  invoice,
  mode,
  onSave,
}: StatusModalProps) {
  const [selectedDocStatus, setSelectedDocStatus] =
    React.useState<InvoiceDocumentStatus>("ISSUED");
  const [amountPaid, setAmountPaid] = React.useState<number>(0);
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    React.useState<InvoicePaymentStatus>("UNPAID");
  const [error, setError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (invoice) {
      setSelectedDocStatus(invoice.status);
      setAmountPaid(invoice.amountPaid);
      setSelectedPaymentStatus(invoice.paymentStatus);
      setError("");
    }
  }, [invoice, open]);

  if (!invoice) return null;

  const outstanding = Math.max(
    0,
    roundToTwoDecimals(invoice.grandTotal - (Number(amountPaid) || 0))
  );

  const handleDocStatusSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSave(invoice.id, {
        status: selectedDocStatus,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  const handlePaymentSubmit = () => {
    if (amountPaid < 0) {
      setError("Amount paid cannot be negative");
      return;
    }
    if (amountPaid > invoice.grandTotal) {
      setError(
        `Amount paid cannot exceed Grand Total (AED ${formatAED(invoice.grandTotal)})`
      );
      return;
    }

    let finalPaymentStatus: InvoicePaymentStatus = selectedPaymentStatus;
    if (amountPaid === invoice.grandTotal) {
      finalPaymentStatus = "PAID";
    } else if (amountPaid > 0 && amountPaid < invoice.grandTotal) {
      finalPaymentStatus = "PARTIALLY_PAID";
    } else if (amountPaid === 0) {
      finalPaymentStatus = "UNPAID";
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSave(invoice.id, {
        amountPaid: roundToTwoDecimals(amountPaid),
        outstandingAmount: outstanding,
        paymentStatus: finalPaymentStatus,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "document_status"
              ? "Update Invoice Document Status"
              : "Record Payment / Settle Balance"}
          </DialogTitle>
          <DialogDescription>
            Invoice{" "}
            <span className="font-semibold text-slate-800 font-numeric">
              {invoice.invoiceNumber}
            </span>{" "}
            • {invoice.customerName}
          </DialogDescription>
        </DialogHeader>

        {mode === "document_status" ? (
          <div className="py-3 space-y-2.5">
            {[
              {
                value: "ISSUED" as InvoiceDocumentStatus,
                label: "Issued (Active)",
                description:
                  "Formally issued commercial invoice sent to the client.",
                icon: Send,
              },
              {
                value: "DRAFT" as InvoiceDocumentStatus,
                label: "Draft",
                description:
                  "Internal draft undergoing accounting/scope verification.",
                icon: FileText,
              },
              {
                value: "CANCELLED" as InvoiceDocumentStatus,
                label: "Cancelled / Void",
                description:
                  "Voided invoice. Keeps audit trail without destructive deletion.",
                icon: Ban,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedDocStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedDocStatus(opt.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    isSelected
                      ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/30"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#002664] block">
                      {opt.label}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-3 space-y-4 text-xs">
            {/* Summary card */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Grand Total:</span>
                <span className="font-bold text-slate-900 font-numeric">
                  {formatAED(invoice.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Currently Paid:</span>
                <span className="font-semibold text-emerald-700 font-numeric">
                  {formatAED(invoice.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-amber-700">
                <span>Outstanding:</span>
                <span className="font-numeric">{formatAED(invoice.outstandingAmount)}</span>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <Input
                label="New Total Amount Paid to Date (AED)"
                type="number"
                min="0"
                max={invoice.grandTotal}
                step="0.01"
                value={amountPaid === 0 ? "" : amountPaid}
                placeholder="0.00"
                onChange={(e) => {
                  setAmountPaid(Number(e.target.value) || 0);
                  setError("");
                }}
                error={error}
              />
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 px-2"
                  onClick={() => setAmountPaid(invoice.grandTotal)}
                >
                  Set Paid in Full
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 px-2"
                  onClick={() => setAmountPaid(roundToTwoDecimals(invoice.grandTotal / 2))}
                >
                  Set 50% Advance
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] h-7 px-2 text-slate-500"
                  onClick={() => setAmountPaid(0)}
                >
                  Reset to 0
                </Button>
              </div>
            </div>

            {/* Calculated balance preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Resulting Outstanding Balance
                </span>
                <span className="text-sm font-bold text-amber-700 font-numeric">
                  {formatAED(outstanding)}
                </span>
              </div>
              <Badge
                variant={
                  outstanding === 0
                    ? "success"
                    : amountPaid > 0
                    ? "warning"
                    : "info"
                }
                size="md"
              >
                {outstanding === 0
                  ? "PAID IN FULL"
                  : amountPaid > 0
                  ? "PARTIALLY PAID"
                  : "UNPAID"}
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={
              mode === "document_status"
                ? handleDocStatusSubmit
                : handlePaymentSubmit
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
