"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { PurchaseOrderStatus } from "@/lib/purchase-orders/calculations";

export interface PurchaseOrderFilters {
  search: string;
  status: "ALL" | PurchaseOrderStatus;
  customerId: "ALL" | string;
  sortBy:
    | "newest"
    | "oldest"
    | "highest_amount"
    | "lowest_amount"
    | "delivery_date"
    | "po_number";
}

export function PurchaseOrderToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  customersList,
}: {
  filters: PurchaseOrderFilters;
  onFiltersChange: (newFilters: Partial<PurchaseOrderFilters>) => void;
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
            placeholder="Search PO #, client, quote #, subject, project..."
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
                status: e.target.value as PurchaseOrderFilters["status"],
              })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "ISSUED", label: "Issued" },
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
                sortBy: e.target.value as PurchaseOrderFilters["sortBy"],
              })
            }
            options={[
              { value: "newest", label: "Sort: Newest PO First" },
              { value: "oldest", label: "Sort: Oldest PO First" },
              { value: "delivery_date", label: "Sort: Delivery Date" },
              { value: "highest_amount", label: "Sort: Highest Value" },
              { value: "lowest_amount", label: "Sort: Lowest Value" },
              { value: "po_number", label: "Sort: PO Number" },
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
