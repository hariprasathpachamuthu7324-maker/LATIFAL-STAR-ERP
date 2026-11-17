"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw } from "lucide-react";
import type { TeamRole, TeamMemberStatus } from "@/lib/data/team-mock";

export interface TeamFilters {
  search: string;
  role: "ALL" | TeamRole;
  status: "ALL" | TeamMemberStatus;
  sortBy: "name" | "newest" | "oldest" | "role" | "department";
}

export function TeamToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
}: {
  filters: TeamFilters;
  onFiltersChange: (newFilters: Partial<TeamFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full xl:w-80">
          <Input
            placeholder="Search by name, email, role, department..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          {/* Role Filter */}
          <Select
            value={filters.role}
            onChange={(e) =>
              onFiltersChange({
                role: e.target.value as TeamFilters["role"],
              })
            }
            options={[
              { value: "ALL", label: "All Roles" },
              { value: "ADMIN", label: "Administrators" },
              { value: "MANAGER", label: "Managers" },
              { value: "STAFF", label: "Staff" },
            ]}
          />

          {/* Status Filter */}
          <Select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as TeamFilters["status"],
              })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive / Suspended" },
            ]}
          />

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                sortBy: e.target.value as TeamFilters["sortBy"],
              })
            }
            options={[
              { value: "name", label: "Sort: Full Name" },
              { value: "role", label: "Sort: Role Priority" },
              { value: "department", label: "Sort: Department" },
              { value: "newest", label: "Sort: Recently Added" },
              { value: "oldest", label: "Sort: Oldest Added" },
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
