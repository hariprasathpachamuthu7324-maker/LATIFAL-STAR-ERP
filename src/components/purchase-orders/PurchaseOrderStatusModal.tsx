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
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import type { PurchaseOrderStatus } from "@/lib/purchase-orders/calculations";
import { Send, FileText, Ban } from "lucide-react";

export function PurchaseOrderStatusModal({
  open,
  onOpenChange,
  purchaseOrder,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
  onSave: (poId: string, newStatus: PurchaseOrderStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    React.useState<PurchaseOrderStatus>("ISSUED");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (purchaseOrder) {
      setSelectedStatus(purchaseOrder.status);
    }
  }, [purchaseOrder, open]);

  if (!purchaseOrder) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSave(purchaseOrder.id, selectedStatus);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Purchase Order Status</DialogTitle>
          <DialogDescription>
            Purchase Order{" "}
            <span className="font-semibold text-slate-800 font-numeric">
              {purchaseOrder.purchaseOrderNumber}
            </span>{" "}
            • {purchaseOrder.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-2.5">
          {[
            {
              value: "ISSUED" as PurchaseOrderStatus,
              label: "Issued (Confirmed Order)",
              description:
                "Official procurement order released to vendor/supplier.",
              icon: Send,
            },
            {
              value: "DRAFT" as PurchaseOrderStatus,
              label: "Draft",
              description:
                "Internal requisition under engineering or pricing review.",
              icon: FileText,
            },
            {
              value: "CANCELLED" as PurchaseOrderStatus,
              label: "Cancelled / Void",
              description:
                "Voided order. Preserves history without destructive deletion.",
              icon: Ban,
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
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
                  <span className="font-bold text-xs text-[#0B1F33] block">
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
            onClick={handleSubmit}
            disabled={selectedStatus === purchaseOrder.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
