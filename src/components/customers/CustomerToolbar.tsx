"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { CustomerType, CustomerStatus } from "@/lib/data/customers-mock";

export interface CustomerFilters {
  search: string;
  status: "ALL" | CustomerStatus;
  type: "ALL" | CustomerType;
  city: "ALL" | string;
  sortBy: "name" | "recent" | "code";
}

export function CustomerToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
}: {
  filters: CustomerFilters;
  onFiltersChange: (newFilters: Partial<CustomerFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="w-full lg:w-96">
          <Input
            placeholder="Search by company, contact, email, phone, or code..."
            leftIcon={<Search className="w-4 h-4 text-[#64748B]" />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 lg:max-w-2xl">
          <Select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ status: e.target.value as CustomerFilters["status"] })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />

          <Select
            value={filters.type}
            onChange={(e) =>
              onFiltersChange({ type: e.target.value as CustomerFilters["type"] })
            }
            options={[
              { value: "ALL", label: "All Client Types" },
              { value: "Engineering Contractor", label: "Contractor" },
              { value: "Facilities Management", label: "Facilities Mgmt" },
              { value: "Construction Company", label: "Construction" },
              { value: "Property Management", label: "Property Mgmt" },
              { value: "Commercial Building", label: "Commercial" },
              { value: "Hospitality & Hotel", label: "Hospitality" },
              { value: "Residential Client", label: "Residential" },
            ]}
          />

          <Select
            value={filters.city}
            onChange={(e) =>
              onFiltersChange({ city: e.target.value })
            }
            options={[
              { value: "ALL", label: "All Emirates" },
              { value: "Dubai", label: "Dubai" },
              { value: "Abu Dhabi", label: "Abu Dhabi" },
              { value: "Sharjah", label: "Sharjah" },
              { value: "Ajman", label: "Ajman" },
              { value: "Ras Al Khaimah", label: "RAK" },
            ]}
          />

          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ sortBy: e.target.value as CustomerFilters["sortBy"] })
            }
            options={[
              { value: "name", label: "Sort: Name (A-Z)" },
              { value: "recent", label: "Sort: Recently Added" },
              { value: "code", label: "Sort: Customer Code" },
            ]}
          />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-[#64748B] hover:text-[#0F172A] self-end lg:self-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
