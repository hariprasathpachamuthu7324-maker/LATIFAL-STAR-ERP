"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { WorkCompletionStatus } from "@/lib/work-completion/calculations";

export interface WorkCompletionFilters {
  search: string;
  status: "ALL" | WorkCompletionStatus;
  customerId: "ALL" | string;
  sortBy:
    | "newest"
    | "oldest"
    | "completion_date"
    | "report_number"
    | "completion_rate";
}

export function WorkCompletionToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  customersList,
}: {
  filters: WorkCompletionFilters;
  onFiltersChange: (newFilters: Partial<WorkCompletionFilters>) => void;
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
            placeholder="Search report #, client, PO #, quote #, project..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          {/* Status Filter */}
          <Select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as WorkCompletionFilters["status"],
              })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "COMPLETED", label: "Completed & Signed" },
              { value: "DRAFT", label: "Draft / In-Progress" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />

          {/* Customer Filter */}
          <Select
            value={filters.customerId}
            onChange={(e) => onFiltersChange({ customerId: e.target.value })}
            options={[
              { value: "ALL", label: "All Clients / Projects" },
              ...customersList.map((c) => ({
                value: c.id,
                label: c.name.length > 22 ? `${c.name.substring(0, 22)}...` : c.name,
              })),
            ]}
          />

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                sortBy: e.target.value as WorkCompletionFilters["sortBy"],
              })
            }
            options={[
              { value: "newest", label: "Sort: Newest Report First" },
              { value: "oldest", label: "Sort: Oldest Report First" },
              { value: "completion_date", label: "Sort: Completion Date" },
              { value: "completion_rate", label: "Sort: Completion %" },
              { value: "report_number", label: "Sort: Report Number" },
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
