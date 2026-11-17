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
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import type { WorkCompletionStatus } from "@/lib/work-completion/calculations";
import { CheckCircle2, Clock, Ban } from "lucide-react";

export function WorkCompletionStatusModal({
  open,
  onOpenChange,
  report,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WorkCompletionReport | null;
  onSave: (reportId: string, newStatus: WorkCompletionStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    React.useState<WorkCompletionStatus>("COMPLETED");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (report) {
      setSelectedStatus(report.status);
    }
  }, [report, open]);

  if (!report) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSave(report.id, selectedStatus);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Work Completion Status</DialogTitle>
          <DialogDescription>
            Report{" "}
            <span className="font-semibold text-slate-800 font-numeric">
              {report.reportNumber}
            </span>{" "}
            • {report.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-2.5">
          {[
            {
              value: "COMPLETED" as WorkCompletionStatus,
              label: "Completed & Handed Over",
              description:
                "Physical execution finished, testing verified, and accepted by client.",
              icon: CheckCircle2,
            },
            {
              value: "DRAFT" as WorkCompletionStatus,
              label: "Draft / In Progress",
              description:
                "Site activities ongoing or pending final punch list verification.",
              icon: Clock,
            },
            {
              value: "CANCELLED" as WorkCompletionStatus,
              label: "Cancelled / Void",
              description:
                "Voided report. Preserves operational history without destructive deletion.",
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
            disabled={selectedStatus === report.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
