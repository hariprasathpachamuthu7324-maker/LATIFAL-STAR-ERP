"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { InvoiceDocumentStatus, InvoicePaymentStatus } from "@/lib/invoices/calculations";

export interface InvoiceFilters {
  search: string;
  documentStatus: "ALL" | InvoiceDocumentStatus;
  paymentStatus: "ALL" | InvoicePaymentStatus;
  customerId: "ALL" | string;
  sortBy:
    | "newest"
    | "oldest"
    | "highest_amount"
    | "lowest_amount"
    | "due_date"
    | "invoice_number";
}

export function InvoiceToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  customersList,
}: {
  filters: InvoiceFilters;
  onFiltersChange: (newFilters: Partial<InvoiceFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  customersList: { id: string; name: string }[];
}) {
  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full xl:w-80">
          <Input
            placeholder="Search invoice #, client, quote #, subject..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
          {/* Document Status */}
          <Select
            value={filters.documentStatus}
            onChange={(e) =>
              onFiltersChange({
                documentStatus: e.target.value as InvoiceFilters["documentStatus"],
              })
            }
            options={[
              { value: "ALL", label: "All Doc Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "ISSUED", label: "Issued" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />

          {/* Payment Status */}
          <Select
            value={filters.paymentStatus}
            onChange={(e) =>
              onFiltersChange({
                paymentStatus: e.target.value as InvoiceFilters["paymentStatus"],
              })
            }
            options={[
              { value: "ALL", label: "All Payment Statuses" },
              { value: "UNPAID", label: "Unpaid" },
              { value: "PARTIALLY_PAID", label: "Partially Paid" },
              { value: "PAID", label: "Paid in Full" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
          />

          {/* Customer */}
          <Select
            value={filters.customerId}
            onChange={(e) => onFiltersChange({ customerId: e.target.value })}
            options={[
              { value: "ALL", label: "All Clients" },
              ...customersList.map((c) => ({
                value: c.id,
                label: c.name.length > 20 ? `${c.name.substring(0, 20)}...` : c.name,
              })),
            ]}
          />

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                sortBy: e.target.value as InvoiceFilters["sortBy"],
              })
            }
            options={[
              { value: "newest", label: "Sort: Newest Invoice" },
              { value: "oldest", label: "Sort: Oldest Invoice" },
              { value: "due_date", label: "Sort: Due Date" },
              { value: "highest_amount", label: "Sort: Highest Amount" },
              { value: "lowest_amount", label: "Sort: Lowest Amount" },
              { value: "invoice_number", label: "Sort: Invoice Number" },
            ]}
          />
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            className="text-xs shrink-0 self-end xl:self-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
