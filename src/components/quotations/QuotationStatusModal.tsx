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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Quotation, QuotationStatus } from "@/lib/data/quotations-mock";
import {
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface StatusOption {
  value: QuotationStatus;
  label: string;
  description: string;
  badgeVariant: "default" | "info" | "success" | "danger" | "warning";
  icon: React.ElementType;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Quotation is under internal drafting or technical scope revision.",
    badgeVariant: "default",
    icon: FileText,
  },
  {
    value: "SENT",
    label: "Sent to Client",
    description: "Formally issued and submitted to the client. Awaiting review.",
    badgeVariant: "info",
    icon: Send,
  },
  {
    value: "ACCEPTED",
    label: "Accepted / Approved",
    description: "Client approved scope and price. Ready for LPO/Invoice generation.",
    badgeVariant: "success",
    icon: CheckCircle2,
  },
  {
    value: "REJECTED",
    label: "Rejected / Declined",
    description: "Client declined the quotation or project was cancelled.",
    badgeVariant: "danger",
    icon: XCircle,
  },
  {
    value: "EXPIRED",
    label: "Expired",
    description: "Quotation validity timeframe (e.g. 30 days) has passed.",
    badgeVariant: "warning",
    icon: Clock,
  },
];

export function QuotationStatusModal({
  open,
  onOpenChange,
  quotation,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation | null;
  onStatusChange: (quotationId: string, newStatus: QuotationStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] = React.useState<QuotationStatus>(
    quotation?.status || "DRAFT"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (quotation) {
      setSelectedStatus(quotation.status);
    }
  }, [quotation]);

  if (!quotation) return null;

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onStatusChange(quotation.id, selectedStatus);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Quotation Status</DialogTitle>
          <DialogDescription>
            Change lifecycle state for quotation{" "}
            <span className="font-semibold text-slate-800 font-numeric">
              {quotation.quotationNumber}
            </span>{" "}
            ({quotation.customerName})
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-2.5">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedStatus === opt.value;
            const isCurrent = quotation.status === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/30"
                    : "border-slate-200 bg-white hover:bg-slate-50/80"
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#002664]">
                      {opt.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

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
            onClick={handleSave}
            disabled={selectedStatus === quotation.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
