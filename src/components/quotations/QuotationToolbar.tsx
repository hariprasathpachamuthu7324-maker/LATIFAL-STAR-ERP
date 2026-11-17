"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { QuotationStatus } from "@/lib/data/quotations-mock";

export interface QuotationFilters {
  search: string;
  status: "ALL" | QuotationStatus;
  customerId: "ALL" | string;
  sortBy: "newest" | "oldest" | "highest_value" | "lowest_value" | "doc_number";
}

export function QuotationToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  customersList,
}: {
  filters: QuotationFilters;
  onFiltersChange: (newFilters: Partial<QuotationFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  customersList: { id: string; name: string }[];
}) {
  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full lg:w-96">
          <Input
            placeholder="Search by quote #, client, subject, or project..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 lg:max-w-2xl">
          <Select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ status: e.target.value as QuotationFilters["status"] })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "SENT", label: "Sent to Client" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REJECTED", label: "Rejected" },
              { value: "EXPIRED", label: "Expired" },
            ]}
          />

          <Select
            value={filters.customerId}
            onChange={(e) => onFiltersChange({ customerId: e.target.value })}
            options={[
              { value: "ALL", label: "All Clients" },
              ...customersList.map((c) => ({
                value: c.id,
                label: c.name.length > 22 ? `${c.name.substring(0, 22)}...` : c.name,
              })),
            ]}
          />

          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ sortBy: e.target.value as QuotationFilters["sortBy"] })
            }
            options={[
              { value: "newest", label: "Sort: Newest First" },
              { value: "oldest", label: "Sort: Oldest First" },
              { value: "highest_value", label: "Sort: Highest Value" },
              { value: "lowest_value", label: "Sort: Lowest Value" },
              { value: "doc_number", label: "Sort: Quotation Number" },
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
            className="text-xs shrink-0 self-end lg:self-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
